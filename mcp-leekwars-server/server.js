#!/usr/bin/env node

/**
 * MCP Server for LeekWars API
 *
 * Provides tools for interacting with the LeekWars platform:
 * - Manage AI scripts (list, get, save, create, delete)
 * - Manage leeks (get info, assign AI)
 * - Run fights (solo, farmer, team)
 * - Get fight results and replays
 * - Browse garden opponents
 * - Get game constants
 *
 * Authentication: Set LEEKWARS_TOKEN env var, or use leekwars_login tool.
 *
 * Configuration in .claude/settings.json:
 * {
 *   "mcpServers": {
 *     "leekwars": {
 *       "command": "node",
 *       "args": ["./mcp-leekwars-server/server.js"],
 *       "env": { "LEEKWARS_TOKEN": "your-token-here" }
 *     }
 *   }
 * }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { execSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, unlinkSync } from 'node:fs'
import { join as pathJoin } from 'node:path'

const API_BASE = 'https://leekwars.com/api'
let authToken = null
let currentFarmer = null  // cached from /farmer/login-token (has id, login, leeks, etc.)

// Cached name maps for weapons, chips, components (loaded lazily on first use)
let weaponNameByItem = null      // item_template_id → human name
let weaponNameByWeaponId = null  // weapon_id → human name (for SET_WEAPON actions)
let chipNameById = null          // chip_id → human name (for leek equipment)
let chipNameByTemplate = null    // chip_template → human name (for fight actions)
let componentNameByTemplate = null  // component_template_id → { name, stats }

const LEEKWARS_CLIENT_PATH = '/home/ubuntu/leek-wars'

function loadItemNames() {
  if (weaponNameByItem) return  // already loaded

  // Load English locale files for human-readable names
  let enChip = {}, enComp = {}
  try {
    enChip = JSON.parse(readFileSync(`${LEEKWARS_CLIENT_PATH}/src/lang/en/chip.json`, 'utf-8'))
  } catch { /* fallback to raw names */ }
  try {
    enComp = JSON.parse(readFileSync(`${LEEKWARS_CLIENT_PATH}/src/lang/en/component.json`, 'utf-8'))
  } catch { /* fallback to raw names */ }

  // Weapons: fetch from API, build item_id → name and weapon_id → name maps
  weaponNameByItem = {}
  weaponNameByWeaponId = {}
  try {
    const weapData = apiRequest('GET', '/weapon/get-all')
    const weapons = weapData.weapons || weapData
    for (const [, w] of Object.entries(weapons)) {
      const name = w.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      weaponNameByItem[w.item] = name
      weaponNameByWeaponId[w.id] = name
    }
  } catch (e) {
    process.stderr.write(`[leekwars-mcp] Failed to load weapons: ${e.message}\n`)
  }

  // Chips: fetch from API, build chip_id → name and template → name maps
  chipNameById = {}
  chipNameByTemplate = {}
  try {
    const chipData = apiRequest('GET', '/chip/get-all')
    const chips = chipData.chips || chipData
    for (const [cid, c] of Object.entries(chips)) {
      const name = enChip[c.name] || c.name.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())
      chipNameById[Number(cid)] = name
      if (c.template !== undefined) {
        chipNameByTemplate[c.template] = name
      }
    }
  } catch (e) {
    process.stderr.write(`[leekwars-mcp] Failed to load chips: ${e.message}\n`)
  }

  // Components: parse from leek-wars client source (no API endpoint available)
  componentNameByTemplate = {}
  try {
    const compSrc = readFileSync(`${LEEKWARS_CLIENT_PATH}/src/model/components.ts`, 'utf-8')
    const regex = /name: '(\w+)',\s*stats:\s*(\[.*?\]),.*?template:\s*(\d+)/g
    let match
    while ((match = regex.exec(compSrc)) !== null) {
      const [, nameKey, statsRaw, templateStr] = match
      const statPairs = [...statsRaw.matchAll(/\[\s*'(\w+)',\s*(-?\d+)\s*\]/g)]
        .map(m => `${m[1]}:${m[2]}`)
        .join(', ')
      componentNameByTemplate[Number(templateStr)] = {
        name: enComp[nameKey] || nameKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        stats: statPairs,
      }
    }
  } catch (e) {
    process.stderr.write(`[leekwars-mcp] Failed to load components: ${e.message}\n`)
  }

  process.stderr.write(
    `[leekwars-mcp] Loaded ${Object.keys(weaponNameByItem).length} weapons, ` +
    `${Object.keys(chipNameById).length} chips, ` +
    `${Object.keys(componentNameByTemplate).length} components\n`
  )
}

function resolveWeaponName(itemTemplate) {
  return weaponNameByItem?.[itemTemplate] || `Unknown(${itemTemplate})`
}

function resolveChipName(chipId) {
  return chipNameById?.[chipId] || `Unknown(${chipId})`
}

function resolveComponentName(template) {
  const c = componentNameByTemplate?.[template]
  return c ? `${c.name} (${c.stats})` : `Unknown(${template})`
}

// ── SQLite helpers for fight history database ──

const FIGHT_DB_DIR = '/home/ubuntu/LeekWars-AI/tools'

function sqliteQuery(dbPath, sql) {
  try {
    const escaped = sql.replace(/'/g, "'\\''")
    const result = execSync(`sqlite3 -json '${dbPath}' '${escaped}'`, {
      timeout: 5000, encoding: 'utf-8',
    })
    return result.trim() ? JSON.parse(result) : []
  } catch {
    return []
  }
}

function sqliteRun(dbPath, sql) {
  try {
    const escaped = sql.replace(/'/g, "'\\''")
    execSync(`sqlite3 '${dbPath}' '${escaped}'`, { timeout: 5000 })
  } catch { /* ignore write errors */ }
}

function getOpponentStats(dbPath, opponentId) {
  const rows = sqliteQuery(dbPath,
    `SELECT * FROM opponent_stats WHERE opponent_id = ${opponentId}`)
  if (rows.length === 0) return null
  const r = rows[0]
  const total = r.total_fights || 0
  const winRate = r.win_rate || 0
  let status = 'unknown'
  if (total >= 2 && winRate >= 0.7) status = 'beatable'
  else if (total >= 2 && winRate <= 0.3) status = 'dangerous'
  else if (total >= 2) status = 'even'
  return { ...r, status }
}

function categorizeOpponents(opponents, dbPath) {
  const beatable = [], dangerous = [], even = [], unknown = []
  for (const opp of opponents) {
    const stats = getOpponentStats(dbPath, opp.id)
    if (!stats || stats.total_fights < 2) unknown.push(opp)
    else if (stats.status === 'beatable') beatable.push(opp)
    else if (stats.status === 'dangerous') dangerous.push(opp)
    else even.push(opp)
  }
  return { beatable, dangerous, even, unknown }
}

function selectOpponent(categorized, strategy) {
  let pool
  const { beatable, dangerous, even, unknown } = categorized
  switch (strategy) {
    case 'safe':
      pool = [...beatable, ...unknown]
      break
    case 'aggressive':
      pool = [...beatable, ...unknown, ...even, ...dangerous]
      break
    case 'adaptive':
    case 'smart':
    default:
      pool = [...beatable, ...unknown, ...even.slice(0, Math.ceil(even.length / 2))]
      break
  }
  if (pool.length === 0) pool = [...beatable, ...unknown, ...even, ...dangerous]
  if (pool.length === 0) return null
  // Weighted random: prefer earlier entries (better matchups)
  const weights = pool.map((_, i) => Math.max(1, pool.length - i))
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * totalWeight
  for (let i = 0; i < pool.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

function ensureFightDbSchema(dbPath) {
  // Idempotent: creates tables if missing. Used by the farmer-fight DB which
  // has no Python script seeding it on first use.
  sqliteRun(dbPath, `CREATE TABLE IF NOT EXISTS fight_history (fight_id INTEGER PRIMARY KEY, opponent_id INTEGER, opponent_name TEXT, opponent_level INTEGER, result TEXT, fight_url TEXT, timestamp TEXT)`)
  sqliteRun(dbPath, `CREATE TABLE IF NOT EXISTS opponent_stats (opponent_id INTEGER PRIMARY KEY, opponent_name TEXT, opponent_level INTEGER, wins INTEGER DEFAULT 0, losses INTEGER DEFAULT 0, draws INTEGER DEFAULT 0, total_fights INTEGER DEFAULT 0, win_rate REAL DEFAULT 0.0, last_fought TEXT, last_updated TEXT)`)
  sqliteRun(dbPath, `CREATE INDEX IF NOT EXISTS idx_opponent_id ON fight_history(opponent_id)`)
}

function recordFight(dbPath, fightId, opponentId, opponentName, opponentLevel, result, fightUrl) {
  const now = new Date().toISOString()
  const safeName = opponentName.replace(/'/g, "''")
  // Insert fight record
  sqliteRun(dbPath,
    `INSERT OR REPLACE INTO fight_history (fight_id, opponent_id, opponent_name, opponent_level, result, fight_url, timestamp) VALUES (${fightId}, ${opponentId}, '${safeName}', ${opponentLevel}, '${result}', '${fightUrl}', '${now}')`)
  // Recalculate opponent stats
  sqliteRun(dbPath,
    `INSERT OR REPLACE INTO opponent_stats (opponent_id, opponent_name, opponent_level, wins, losses, draws, total_fights, win_rate, last_fought, last_updated)
     SELECT ${opponentId}, '${safeName}', ${opponentLevel},
       SUM(CASE WHEN result='WIN' THEN 1 ELSE 0 END),
       SUM(CASE WHEN result='LOSS' THEN 1 ELSE 0 END),
       SUM(CASE WHEN result='DRAW' THEN 1 ELSE 0 END),
       COUNT(*),
       CAST(SUM(CASE WHEN result='WIN' THEN 1 ELSE 0 END) AS REAL) / COUNT(*),
       '${now}', '${now}'
     FROM fight_history WHERE opponent_id = ${opponentId}`)
}

function waitForFight(fightId) {
  for (let i = 0; i < 15; i++) {
    execSync('sleep 2')
    try {
      const data = apiRequest('GET', `/fight/get/${fightId}`)
      const fight = data.fight || data
      if (fight.status === 2) return fight
    } catch { /* retry */ }
  }
  return null
}

function determineFightResult(fight, leekId) {
  const team1 = fight.leeks1 || []
  const team2 = fight.leeks2 || []
  const inTeam1 = team1.some(l => l.id === leekId)
  if (fight.winner === 0) return 'DRAW'
  if (inTeam1 && fight.winner === 1) return 'WIN'
  if (!inTeam1 && fight.winner === 2) return 'WIN'
  return 'LOSS'
}

// Cookie jar file — the LeekWars API uses session cookies for auth.
// curl's --cookie-jar / --cookie flags maintain session automatically,
// matching the working Python `requests.Session()` approach.
const COOKIE_JAR = '/tmp/leekwars-cookies.txt'

let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 350  // ms between API calls

function apiRequest(method, path, body = null) {
  // Throttle: ensure at least 350ms between requests
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < MIN_REQUEST_INTERVAL) {
    const waitMs = MIN_REQUEST_INTERVAL - elapsed
    execSync(`sleep ${(waitMs / 1000).toFixed(2)}`)
  }
  lastRequestTime = Date.now()

  const url = `${API_BASE}${path}`

  // Build curl command
  const args = [
    'curl', '-s', '--max-time', '15',
    '-b', COOKIE_JAR,   // send cookies
    '-c', COOKIE_JAR,   // save cookies
  ]

  let bodyFile = null
  if (method === 'POST') {
    args.push('-X', 'POST')
    if (body) {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(body)) {
        params.append(key, String(value))
      }
      const encoded = params.toString()
      // Large bodies (e.g. uploading big .lk files) exceed argv size limit (E2BIG).
      // Write to a temp file and use curl --data-binary @file instead.
      if (encoded.length > 100000) {
        bodyFile = `/tmp/leekwars-body-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`
        writeFileSync(bodyFile, encoded)
        args.push('--data-binary', `@${bodyFile}`)
      } else {
        args.push('-d', encoded)
      }
    }
  }

  args.push(url)

  try {
    // Shell-escape and execute
    const cmd = args.map(a => `'${a.replace(/'/g, "'\\''")}'`).join(' ')
    const result = execSync(cmd, { timeout: 30000, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 })

    try {
      return JSON.parse(result)
    } catch {
      throw new Error(`Invalid JSON response from ${method} ${path}: ${result.slice(0, 200)}`)
    }
  } finally {
    if (bodyFile) {
      try { unlinkSync(bodyFile) } catch { /* best-effort cleanup */ }
    }
  }
}

const TOOLS = [
  {
    name: 'leekwars_login',
    description:
      'Login to LeekWars and get an authentication token. Required before other operations if LEEKWARS_TOKEN is not set.',
    inputSchema: {
      type: 'object',
      properties: {
        login: { type: 'string', description: 'LeekWars username' },
        password: { type: 'string', description: 'LeekWars password' },
      },
      required: ['login', 'password'],
    },
  },
  {
    name: 'leekwars_list_ais',
    description: 'List all AI scripts owned by the authenticated farmer.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'leekwars_get_ai',
    description: 'Get the source code and metadata of an AI script by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        ai_id: { type: 'number', description: 'AI script ID' },
      },
      required: ['ai_id'],
    },
  },
  {
    name: 'leekwars_save_ai',
    description: 'Save/update the source code of an existing AI script.',
    inputSchema: {
      type: 'object',
      properties: {
        ai_id: { type: 'number', description: 'AI script ID' },
        code: { type: 'string', description: 'LeekScript source code' },
      },
      required: ['ai_id', 'code'],
    },
  },
  {
    name: 'leekwars_new_ai',
    description: 'Create a new AI script.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name for the new AI' },
        folder_id: {
          type: 'number',
          description: 'Folder ID (0 for root)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'leekwars_delete_ai',
    description: 'Delete an AI script by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        ai_id: { type: 'number', description: 'AI script ID to delete' },
      },
      required: ['ai_id'],
    },
  },
  {
    name: 'leekwars_rename_ai',
    description: 'Rename an AI script.',
    inputSchema: {
      type: 'object',
      properties: {
        ai_id: { type: 'number', description: 'AI script ID' },
        name: { type: 'string', description: 'New name' },
      },
      required: ['ai_id', 'name'],
    },
  },
  {
    name: 'leekwars_get_leek',
    description:
      'Get leek information including stats, level, equipment, and assigned AI.',
    inputSchema: {
      type: 'object',
      properties: {
        leek_id: { type: 'number', description: 'Leek ID' },
      },
      required: ['leek_id'],
    },
  },
  {
    name: 'leekwars_set_leek_ai',
    description: 'Assign an AI script to a leek.',
    inputSchema: {
      type: 'object',
      properties: {
        leek_id: { type: 'number', description: 'Leek ID' },
        ai_id: { type: 'number', description: 'AI script ID to assign' },
      },
      required: ['leek_id', 'ai_id'],
    },
  },
  {
    name: 'leekwars_get_leek_opponents',
    description:
      'Get available solo opponents for a specific leek. Returns a list of opponent leeks you can fight.',
    inputSchema: {
      type: 'object',
      properties: {
        leek_id: { type: 'number', description: 'Your leek ID' },
      },
      required: ['leek_id'],
    },
  },
  {
    name: 'leekwars_start_fight',
    description:
      'Start a solo fight against an opponent leek. Returns fight ID.',
    inputSchema: {
      type: 'object',
      properties: {
        leek_id: { type: 'number', description: 'Your leek ID' },
        target_id: { type: 'number', description: 'Opponent leek ID' },
      },
      required: ['leek_id', 'target_id'],
    },
  },
  {
    name: 'leekwars_start_farmer_fight',
    description:
      'Start a farmer fight (all your leeks vs all opponent leeks).',
    inputSchema: {
      type: 'object',
      properties: {
        target_id: {
          type: 'number',
          description: 'Target farmer ID',
        },
      },
      required: ['target_id'],
    },
  },
  {
    name: 'leekwars_get_fight',
    description:
      'Get fight results including winner, actions log, and statistics.',
    inputSchema: {
      type: 'object',
      properties: {
        fight_id: { type: 'number', description: 'Fight ID' },
      },
      required: ['fight_id'],
    },
  },
  {
    name: 'leekwars_get_garden',
    description:
      'Get available opponents from the garden (matchmaking). Returns a list of opponent leeks/farmers you can fight.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'leekwars_get_farmer',
    description: 'Get farmer profile information.',
    inputSchema: {
      type: 'object',
      properties: {
        farmer_id: {
          type: 'number',
          description: 'Farmer ID (omit for self)',
        },
      },
    },
  },
  {
    name: 'leekwars_get_constants',
    description:
      'Get all game constants (weapon stats, chip stats, effect types, etc.).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'leekwars_solo_fight',
    description:
      'Run N solo garden fights for a leek with smart opponent selection based on fight history database. Picks opponents you can beat and avoids dangerous ones.',
    inputSchema: {
      type: 'object',
      properties: {
        leek_id: { type: 'number', description: 'Your leek ID' },
        num_fights: { type: 'number', description: 'Number of fights to run (default 5)' },
        strategy: {
          type: 'string',
          description: 'Opponent selection strategy',
          enum: ['safe', 'smart', 'aggressive', 'adaptive'],
        },
      },
      required: ['leek_id'],
    },
  },
  {
    name: 'leekwars_farmer_fights',
    description:
      'Run N farmer-vs-farmer team fights (all your leeks vs another farmer\'s whole team in one fight credit) with smart opponent selection based on per-farmer history DB. Stored separately from solo fights at farmer_fight_history_<farmer_id>.db.',
    inputSchema: {
      type: 'object',
      properties: {
        num_fights: { type: 'number', description: 'Number of fights to run (default 5)' },
        strategy: {
          type: 'string',
          description: 'Opponent selection strategy',
          enum: ['safe', 'smart', 'aggressive', 'adaptive'],
        },
      },
    },
  },
  {
    name: 'leekwars_test_fight',
    description:
      'Run a test fight against a built-in bot (Domingo, Betalpha, Tisma, Guj, Hachess, Rex). Creates a test scenario, runs the fight, and returns results.',
    inputSchema: {
      type: 'object',
      properties: {
        leek_id: { type: 'number', description: 'Your leek ID' },
        ai_id: { type: 'number', description: 'AI script ID to use' },
        bot: {
          type: 'string',
          description: 'Bot opponent name',
          enum: ['domingo', 'betalpha', 'tisma', 'guj', 'hachess', 'rex'],
        },
      },
      required: ['leek_id', 'ai_id', 'bot'],
    },
  },
  {
    name: 'leekwars_upload_v8',
    description:
      'Upload the V8 modular AI to LeekWars (creates 8.0/V8 folder structure, uploads all .lk modules and strategy/ subfolder, then re-saves main.lk to force server recompile). If "account" is provided, logs in fresh using credentials from /home/ubuntu/LeekWars-AI/tools/config.json; otherwise uses current session.',
    inputSchema: {
      type: 'object',
      properties: {
        account: {
          type: 'string',
          description: 'Account to upload to (reads tools/config.json). Omit to use current session.',
          enum: ['main', 'cure'],
        },
        v8_dir: {
          type: 'string',
          description: 'Path to V8_modules directory (default: /home/ubuntu/LeekWars-AI/V8_modules)',
        },
      },
    },
  },
  {
    name: 'leekwars_get_ranking',
    description: 'Get rankings.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Ranking type: "leek", "farmer", or "team"',
          enum: ['leek', 'farmer', 'team'],
        },
        order: {
          type: 'string',
          description: 'Order: "talent", "name", or "total_level"',
          enum: ['talent', 'name', 'total_level'],
        },
        page: {
          type: 'number',
          description: 'Page number (default 1)',
        },
      },
      required: ['type', 'order'],
    },
  },
]

async function handleToolCall(name, args) {
  switch (name) {
    case 'leekwars_login': {
      // Uses /farmer/login-token (matches working Python code)
      const result = await apiRequest('POST', '/farmer/login-token', {
        login: args.login,
        password: args.password,
      })
      if (result.token) {
        authToken = result.token
        const farmer = result.farmer || {}
        currentFarmer = farmer
        return [
          `Login successful!`,
          `Farmer: ${farmer.login || 'unknown'} (ID: ${farmer.id || '?'})`,
          `Habs: ${farmer.habs || 0}`,
          `Stats: ${farmer.victories || 0}V / ${farmer.draws || 0}D / ${farmer.defeats || 0}L`,
          `Available fights: ${farmer.fights || 0}`,
          `Leeks: ${Object.values(farmer.leeks || {}).map(l => `${l.name} (Lvl ${l.level})`).join(', ') || 'none'}`,
        ].join('\n')
      }
      return `Login failed: ${JSON.stringify(result)}`
    }

    case 'leekwars_list_ais': {
      // GET with session cookies (matches working Python code)
      const result = await apiRequest('GET', '/ai/get-farmer-ais')
      const ais = result.ais || []
      if (ais.length === 0) return 'No AIs found.'
      return ais
        .map((ai) => `[${ai.id}] ${ai.name} (folder: ${ai.folder}, ${ai.valid ? 'valid' : 'invalid'})`)
        .join('\n')
    }

    case 'leekwars_get_ai': {
      const result = await apiRequest('GET', `/ai/get/${args.ai_id}`)
      const ai = result.ai || result
      return `# AI: ${ai.name} (ID: ${ai.id})\nValid: ${ai.valid}\nVersion: ${ai.version || 'unknown'}\n\n## Code:\n\`\`\`leekscript\n${ai.code || '(empty)'}\n\`\`\``
    }

    case 'leekwars_save_ai': {
      const result = await apiRequest('POST', '/ai/save', {
        ai_id: args.ai_id,
        code: args.code,
      })
      return result.success !== false
        ? `AI ${args.ai_id} saved successfully.`
        : `Save failed: ${JSON.stringify(result)}`
    }

    case 'leekwars_new_ai': {
      const result = await apiRequest('POST', '/ai/new', {
        name: args.name,
        folder_id: args.folder_id || 0,
      })
      return `AI created: ID=${result.ai?.id || 'unknown'}, name="${args.name}"`
    }

    case 'leekwars_delete_ai': {
      const result = await apiRequest('POST', '/ai/delete', {
        ai_id: args.ai_id,
      })
      return result.success !== false
        ? `AI ${args.ai_id} deleted.`
        : `Delete failed: ${JSON.stringify(result)}`
    }

    case 'leekwars_rename_ai': {
      const result = await apiRequest('POST', '/ai/rename', {
        ai_id: args.ai_id,
        name: args.name,
      })
      return result.success !== false
        ? `AI ${args.ai_id} renamed to "${args.name}".`
        : `Rename failed: ${JSON.stringify(result)}`
    }

    case 'leekwars_get_leek': {
      loadItemNames()
      const result = await apiRequest('GET', `/leek/get/${args.leek_id}`)
      const leek = result.leek || result

      const weaponNames = (leek.weapons || []).map(w => resolveWeaponName(w.template))
      const chipNames = (leek.chips || []).map(c => resolveChipName(c.template))
      const compNames = (leek.components || []).map(c => resolveComponentName(c.template))

      const lines = [
        `# ${leek.name} (ID: ${leek.id})`,
        `Level: ${leek.level}`,
        `Talent: ${leek.talent}`,
        `Ranking: ${leek.ranking ?? '?'}`,
        ``,
        `## Stats (base → total)`,
        `Life: ${leek.life} → ${leek.total_life ?? leek.life}`,
        `TP: ${leek.tp ?? '?'} → ${leek.total_tp ?? leek.tp ?? '?'}`,
        `MP: ${leek.mp ?? '?'} → ${leek.total_mp ?? leek.mp ?? '?'}`,
        `Strength: ${leek.strength} → ${leek.total_strength ?? leek.strength}`,
        `Agility: ${leek.agility} → ${leek.total_agility ?? leek.agility}`,
        `Wisdom: ${leek.wisdom} → ${leek.total_wisdom ?? leek.wisdom}`,
        `Resistance: ${leek.resistance} → ${leek.total_resistance ?? leek.resistance}`,
        `Magic: ${leek.magic} → ${leek.total_magic ?? leek.magic}`,
        `Science: ${leek.science} → ${leek.total_science ?? leek.science}`,
        `Frequency: ${leek.frequency} → ${leek.total_frequency ?? leek.frequency}`,
        `Cores: ${leek.cores ?? '?'} → ${leek.total_cores ?? leek.cores ?? '?'}`,
        `RAM: ${leek.ram ?? '?'} → ${leek.total_ram ?? leek.ram ?? '?'}`,
        ``,
        `AI: ${leek.ai?.name || 'none'} (ID: ${leek.ai?.id || 'none'})`,
        ``,
        `## Weapons`,
        ...weaponNames.map(n => `- ${n}`),
        ``,
        `## Chips`,
        chipNames.join(', '),
        ``,
        `## Components`,
        ...compNames.map(n => `- ${n}`),
      ]
      return lines.join('\n')
    }

    case 'leekwars_set_leek_ai': {
      const result = await apiRequest('POST', '/leek/set-ai', {
        leek_id: args.leek_id,
        ai_id: args.ai_id,
      })
      return result.success !== false
        ? `Leek ${args.leek_id} now uses AI ${args.ai_id}.`
        : `Failed: ${JSON.stringify(result)}`
    }

    case 'leekwars_get_leek_opponents': {
      // GET with path param (matches working Python: /garden/get-leek-opponents/{leek_id})
      const result = await apiRequest('GET', `/garden/get-leek-opponents/${args.leek_id}`)
      const opponents = result.opponents || []
      if (opponents.length === 0) return 'No opponents available.'
      return opponents
        .map(
          (o) =>
            `[${o.id}] ${o.name} - Level ${o.level}, Talent ${o.talent || '?'}`,
        )
        .join('\n')
    }

    case 'leekwars_start_fight': {
      const result = await apiRequest('POST', '/garden/start-solo-fight', {
        leek_id: args.leek_id,
        target_id: args.target_id,
      })
      return `Fight started! ID: ${result.fight || result.id || JSON.stringify(result)}`
    }

    case 'leekwars_start_farmer_fight': {
      const result = await apiRequest('POST', '/garden/start-farmer-fight', {
        target_id: args.target_id,
      })
      return `Farmer fight started! ID: ${result.fight || result.id || JSON.stringify(result)}`
    }

    case 'leekwars_get_fight': {
      // GET with path param (matches working Python code)
      const result = await apiRequest('GET', `/fight/get/${args.fight_id}`)
      const fight = result.fight || result
      return [
        `# Fight ${fight.id}`,
        `Winner: ${fight.winner === 1 ? 'Team 1' : fight.winner === 2 ? 'Team 2' : 'Draw'}`,
        `Duration: ${fight.turns || 'unknown'} turns`,
        `Type: ${fight.type || 'unknown'}`,
        `Date: ${fight.date || 'unknown'}`,
        fight.leeks1
          ? `\nTeam 1: ${fight.leeks1.map((l) => `${l.name} (lvl ${l.level})`).join(', ')}`
          : '',
        fight.leeks2
          ? `Team 2: ${fight.leeks2.map((l) => `${l.name} (lvl ${l.level})`).join(', ')}`
          : '',
        fight.report ? `\nReport: ${JSON.stringify(fight.report).slice(0, 2000)}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }

    case 'leekwars_get_garden': {
      // GET with session cookies (matches working Python code)
      const result = await apiRequest('GET', '/garden/get')
      const opponents = result.enemies || result.solos || []
      if (opponents.length === 0) return 'No opponents available.'
      return opponents
        .slice(0, 20)
        .map(
          (o) =>
            `[${o.id}] ${o.name} - Level ${o.level}, Talent ${o.talent || '?'}`,
        )
        .join('\n')
    }

    case 'leekwars_get_farmer': {
      // GET with session cookies (matches working Python code)
      const path = args.farmer_id
        ? `/farmer/get/${args.farmer_id}`
        : '/farmer/get'
      const result = await apiRequest('GET', path)
      const farmer = result.farmer || result
      return [
        `# ${farmer.name} (ID: ${farmer.id})`,
        `Level: ${farmer.total_level}`,
        `Talent: ${farmer.talent}`,
        `Leeks: ${(farmer.leeks || []).map((l) => `${l.name} (lvl ${l.level})`).join(', ')}`,
      ].join('\n')
    }

    case 'leekwars_get_constants': {
      const result = await apiRequest('GET', '/constant/get-all')
      return JSON.stringify(result, null, 2).slice(0, 5000) + '\n...(truncated)'
    }

    case 'leekwars_solo_fight': {
      const leekId = args.leek_id
      const numFights = args.num_fights || 5
      const strategy = args.strategy || 'smart'
      const dbPath = `${FIGHT_DB_DIR}/fight_history_${leekId}.db`

      // Get leek name for display
      let leekName = `Leek ${leekId}`
      try {
        const leekData = apiRequest('GET', `/leek/get/${leekId}`)
        const leek = leekData.leek || leekData
        leekName = leek.name || leekName
      } catch { /* use fallback name */ }

      // Get DB stats before
      const statsBefore = sqliteQuery(dbPath,
        `SELECT SUM(CASE WHEN result='WIN' THEN 1 ELSE 0 END) as wins, SUM(CASE WHEN result='LOSS' THEN 1 ELSE 0 END) as losses, SUM(CASE WHEN result='DRAW' THEN 1 ELSE 0 END) as draws, COUNT(*) as total FROM fight_history`)
      const before = statsBefore[0] || { wins: 0, losses: 0, draws: 0, total: 0 }

      const results = []
      let wins = 0, losses = 0, draws = 0, errors = 0
      let consecutiveFailures = 0

      for (let i = 0; i < numFights && consecutiveFailures < 5; i++) {
        // 1. Get opponents
        let opponents
        try {
          const oppData = apiRequest('GET', `/garden/get-leek-opponents/${leekId}`)
          opponents = oppData.opponents || []
        } catch {
          consecutiveFailures++
          continue
        }

        if (opponents.length === 0) {
          consecutiveFailures++
          execSync('sleep 3')
          continue
        }

        // 2. Smart selection
        const categorized = categorizeOpponents(opponents, dbPath)
        const target = selectOpponent(categorized, strategy)
        if (!target) {
          consecutiveFailures++
          continue
        }

        // 3. Start fight
        let fightId
        for (let retry = 0; retry < 3; retry++) {
          try {
            const fightResult = apiRequest('POST', '/garden/start-solo-fight', {
              leek_id: leekId,
              target_id: target.id,
            })
            if (fightResult.fight) {
              fightId = fightResult.fight
              break
            }
            if (fightResult.error === 'too_many_fights' || fightResult.error === 'no_more_fights') {
              return [
                `# Solo Fights: ${leekName}`,
                `Stopped after ${i} fights: no more fights available`,
                `Session: ${wins}W / ${losses}L / ${draws}D`,
              ].join('\n')
            }
            if (fightResult.error === 'rate_limit') {
              execSync(`sleep ${(fightResult.retry_after || 2) + 1}`)
              continue
            }
          } catch { /* retry */ }
          execSync('sleep 2')
        }

        if (!fightId) {
          errors++
          consecutiveFailures++
          continue
        }

        // 4. Wait for result
        const fight = waitForFight(fightId)
        if (!fight) {
          errors++
          consecutiveFailures++
          continue
        }

        // 5. Determine result
        const result = determineFightResult(fight, leekId)
        const fightUrl = `https://leekwars.com/fight/${fightId}`

        if (result === 'WIN') wins++
        else if (result === 'LOSS') losses++
        else draws++

        // 6. Record to DB
        recordFight(dbPath, fightId, target.id, target.name, target.level || 0, result, fightUrl)

        // 7. Track for summary
        const oppStats = getOpponentStats(dbPath, target.id)
        const histStr = oppStats ? `[${oppStats.wins}W-${oppStats.losses}L, ${(oppStats.win_rate * 100).toFixed(0)}%]` : ''
        results.push(`${result === 'WIN' ? 'W' : result === 'LOSS' ? 'L' : 'D'} vs ${target.name} (Lvl ${target.level || '?'}) ${histStr}`)

        consecutiveFailures = 0
      }

      // Build summary
      const total = wins + losses + draws
      const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0'

      // Get updated global stats
      const statsAfter = sqliteQuery(dbPath,
        `SELECT SUM(CASE WHEN result='WIN' THEN 1 ELSE 0 END) as wins, COUNT(*) as total FROM fight_history`)
      const after = statsAfter[0] || { wins: 0, total: 0 }
      const globalWinRate = after.total > 0 ? ((after.wins / after.total) * 100).toFixed(1) : '0.0'

      const beatableCount = sqliteQuery(dbPath,
        `SELECT COUNT(*) as c FROM opponent_stats WHERE win_rate >= 0.7 AND total_fights >= 2`)
      const dangerousCount = sqliteQuery(dbPath,
        `SELECT COUNT(*) as c FROM opponent_stats WHERE win_rate <= 0.3 AND total_fights >= 2`)
      const trackedCount = sqliteQuery(dbPath,
        `SELECT COUNT(*) as c FROM opponent_stats`)

      const lines = [
        `# Solo Fights: ${leekName}`,
        `Strategy: ${strategy}`,
        ``,
        `## Session Results`,
        `Fights: ${total}/${numFights}`,
        `Record: ${wins}W / ${losses}L / ${draws}D (${winRate}% win rate)`,
        errors > 0 ? `Errors: ${errors}` : '',
        ``,
        `## Fight Log`,
        ...results,
        ``,
        `## Database Stats`,
        `Total fights tracked: ${after.total}`,
        `Global win rate: ${globalWinRate}%`,
        `Opponents tracked: ${trackedCount[0]?.c || 0}`,
        `Beatable opponents: ${beatableCount[0]?.c || 0}`,
        `Dangerous opponents: ${dangerousCount[0]?.c || 0}`,
      ]

      return lines.filter(l => l !== '').join('\n')
    }

    case 'leekwars_farmer_fights': {
      const numFights = args.num_fights || 5
      const strategy = args.strategy || 'smart'

      // Use the farmer info cached at login time. /farmer/get is unreliable
      // (the existing leekwars_get_farmer handler also returns undefined),
      // so we depend on currentFarmer being populated by login/auto-login.
      if (!currentFarmer || !currentFarmer.id) {
        return `Error: no cached farmer info. Run leekwars_login or leekwars_upload_v8 first to authenticate.`
      }
      const farmerId = currentFarmer.id
      const farmerName = currentFarmer.login || currentFarmer.name || `Farmer ${farmerId}`
      // Pick any owned leek ID — determineFightResult uses it to figure out which side we're on
      const myLeeks = currentFarmer.leeks
        ? (Array.isArray(currentFarmer.leeks) ? currentFarmer.leeks : Object.values(currentFarmer.leeks))
        : []
      const myLeekId = myLeeks[0]?.id
      if (!myLeekId) {
        return `Error: farmer ${farmerName} has no leeks (cannot determine fight result side).`
      }

      const dbPath = `${FIGHT_DB_DIR}/farmer_fight_history_${farmerId}.db`
      ensureFightDbSchema(dbPath)

      const results = []
      let wins = 0, losses = 0, draws = 0, errors = 0
      let consecutiveFailures = 0

      for (let i = 0; i < numFights && consecutiveFailures < 5; i++) {
        // 1. Get farmer opponents
        let opponents
        try {
          const oppData = await apiRequest('GET', '/garden/get-farmer-opponents')
          opponents = oppData.opponents || []
        } catch {
          consecutiveFailures++
          continue
        }

        if (opponents.length === 0) {
          consecutiveFailures++
          execSync('sleep 3')
          continue
        }

        // 2. Smart selection (reuses opp.id as the categorization key — here it's a farmer_id)
        const categorized = categorizeOpponents(opponents, dbPath)
        const target = selectOpponent(categorized, strategy)
        if (!target) {
          consecutiveFailures++
          continue
        }

        // 3. Start fight
        let fightId
        for (let retry = 0; retry < 3; retry++) {
          try {
            const fightResult = await apiRequest('POST', '/garden/start-farmer-fight', {
              target_id: target.id,
            })
            if (fightResult.fight) {
              fightId = fightResult.fight
              break
            }
            if (fightResult.error === 'too_many_fights' || fightResult.error === 'no_more_fights') {
              return [
                `# Farmer Fights: ${farmerName}`,
                `Stopped after ${i} fights: no more fights available`,
                `Session: ${wins}W / ${losses}L / ${draws}D`,
              ].join('\n')
            }
            if (fightResult.error === 'rate_limit') {
              execSync(`sleep ${(fightResult.retry_after || 2) + 1}`)
              continue
            }
          } catch { /* retry */ }
          execSync('sleep 2')
        }

        if (!fightId) {
          errors++
          consecutiveFailures++
          continue
        }

        // 4. Wait for the fight to finish
        const fight = waitForFight(fightId)
        if (!fight) {
          errors++
          consecutiveFailures++
          continue
        }

        // 5. Determine result via any of our leek IDs
        const result = determineFightResult(fight, myLeekId)
        const fightUrl = `https://leekwars.com/fight/${fightId}`

        if (result === 'WIN') wins++
        else if (result === 'LOSS') losses++
        else draws++

        // 6. Record to DB (opponent_id == farmer_id here)
        recordFight(dbPath, fightId, target.id, target.name, target.level || 0, result, fightUrl)

        // 7. Build log line
        const oppStats = getOpponentStats(dbPath, target.id)
        const histStr = oppStats ? `[${oppStats.wins}W-${oppStats.losses}L, ${(oppStats.win_rate * 100).toFixed(0)}%]` : ''
        results.push(`${result === 'WIN' ? 'W' : result === 'LOSS' ? 'L' : 'D'} vs ${target.name} (Lvl ${target.level || '?'}) ${histStr}`)

        consecutiveFailures = 0
      }

      // Summary
      const total = wins + losses + draws
      const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0'

      const statsAfter = sqliteQuery(dbPath,
        `SELECT SUM(CASE WHEN result='WIN' THEN 1 ELSE 0 END) as wins, COUNT(*) as total FROM fight_history`)
      const after = statsAfter[0] || { wins: 0, total: 0 }
      const globalWinRate = after.total > 0 ? ((after.wins / after.total) * 100).toFixed(1) : '0.0'

      const beatableCount = sqliteQuery(dbPath,
        `SELECT COUNT(*) as c FROM opponent_stats WHERE win_rate >= 0.7 AND total_fights >= 2`)
      const dangerousCount = sqliteQuery(dbPath,
        `SELECT COUNT(*) as c FROM opponent_stats WHERE win_rate <= 0.3 AND total_fights >= 2`)
      const trackedCount = sqliteQuery(dbPath,
        `SELECT COUNT(*) as c FROM opponent_stats`)

      const lines = [
        `# Farmer Fights: ${farmerName}`,
        `Strategy: ${strategy}`,
        ``,
        `## Session Results`,
        `Fights: ${total}/${numFights}`,
        `Record: ${wins}W / ${losses}L / ${draws}D (${winRate}% win rate)`,
        errors > 0 ? `Errors: ${errors}` : '',
        ``,
        `## Fight Log`,
        ...results,
        ``,
        `## Database Stats (farmer-vs-farmer)`,
        `Total fights tracked: ${after.total}`,
        `Global win rate: ${globalWinRate}%`,
        `Opponents tracked: ${trackedCount[0]?.c || 0}`,
        `Beatable opponents: ${beatableCount[0]?.c || 0}`,
        `Dangerous opponents: ${dangerousCount[0]?.c || 0}`,
      ]

      return lines.filter(l => l !== '').join('\n')
    }

    case 'leekwars_test_fight': {
      const BOTS = {
        domingo:  { id: -1, name: 'Domingo' },
        betalpha: { id: -2, name: 'Betalpha' },
        tisma:    { id: -3, name: 'Tisma' },
        guj:      { id: -4, name: 'Guj' },
        hachess:  { id: -5, name: 'Hachess' },
        rex:      { id: -6, name: 'Rex' },
      }
      const bot = BOTS[args.bot]
      if (!bot) throw new Error(`Unknown bot: ${args.bot}`)

      // 1. Check for existing scenario with this AI + bot combo
      const allScenarios = apiRequest('GET', '/test-scenario/get-all')
      const scenarios = allScenarios.scenarios || {}
      let scenarioId = null

      for (const [sid, sc] of Object.entries(scenarios)) {
        if (sc.ai === args.ai_id) {
          const team2 = sc.team2 || []
          if (team2.length > 0 && team2[0].id === bot.id) {
            scenarioId = sid
            break
          }
        }
      }

      // 2. Create scenario if none exists
      if (!scenarioId) {
        const newResult = apiRequest('POST', '/test-scenario/new', {
          name: `MCP_${args.ai_id}_vs_${bot.name}`,
        })
        scenarioId = newResult.id
        if (!scenarioId) throw new Error(`Failed to create scenario: ${JSON.stringify(newResult)}`)

        // Configure scenario
        apiRequest('POST', '/test-scenario/update', {
          id: scenarioId,
          data: JSON.stringify({ type: 0, map: null, ai: args.ai_id }),
        })

        // Add player leek to team 1
        apiRequest('POST', '/test-scenario/add-leek', {
          scenario_id: scenarioId,
          leek: args.leek_id,
          team: 0,
          ai: args.ai_id,
        })

        // Add bot to team 2
        apiRequest('POST', '/test-scenario/add-leek', {
          scenario_id: scenarioId,
          leek: bot.id,
          team: 1,
          ai: -2,  // normal bot AI
        })
      }

      // 3. Run the fight (with retry for rate limits)
      let fightId = null
      for (let attempt = 0; attempt < 5; attempt++) {
        const fightResult = apiRequest('POST', '/ai/test-scenario', {
          scenario_id: scenarioId,
          ai_id: args.ai_id,
        })
        if (fightResult.fight) {
          fightId = fightResult.fight
          break
        }
        if (fightResult.error === 'rate_limit') {
          const wait = (fightResult.retry_after || 2) + 1
          execSync(`sleep ${wait}`)
          continue
        }
        throw new Error(`Failed to start fight: ${JSON.stringify(fightResult)}`)
      }
      if (!fightId) throw new Error('Failed to start fight after retries (rate limited)')

      // 4. Wait for fight to complete and fetch results
      let fight = null
      for (let i = 0; i < 10; i++) {
        // Small delay via a sync sleep
        execSync('sleep 1.5')
        const fightData = apiRequest('GET', `/fight/get/${fightId}`)
        fight = fightData.fight || fightData
        if (fight.status === 2) break  // status 2 = finished
      }

      if (!fight || fight.status !== 2) {
        return `Fight ${fightId} started but not yet finished. Check later with get_fight.`
      }

      // 5. Format results
      const report = fight.report || {}
      const data = fight.data || {}
      const actions = data.actions || []
      const entityList = data.leeks || []

      // Build entity index → name map
      const entityName = {}
      for (const e of entityList) {
        entityName[e.id] = e.name
      }

      const duration = report.duration ?? '?'
      const winner = fight.winner === 1 ? 'Team 1 (You)' : fight.winner === 2 ? 'Team 2 (Bot)' : 'Draw'
      const lines = [
        `# Test Fight: ${fight.id}`,
        `Result: **${winner}**`,
        `Duration: ${duration} turns`,
        ``,
      ]

      // Starting stats for each entity
      if (entityList.length > 0) {
        lines.push(`## Fighters`)
        for (const e of entityList) {
          const team = e.team === 1 ? 'You' : 'Bot'
          lines.push(`- ${e.name} (${team}): HP=${e.life}, STR=${e.strength}, AGI=${e.agility}, WIS=${e.wisdom}, RES=${e.resistance}, MAG=${e.magic}, SCI=${e.science}, TP=${e.tp}, MP=${e.mp}`)
        }
        lines.push(``)
      }

      // Report: who died, who survived
      if (report.leeks1 || report.leeks2) {
        lines.push(`## Outcome`)
        for (const l of [...(report.leeks1 || []), ...(report.leeks2 || [])]) {
          const status = l.dead ? 'DEAD' : 'ALIVE'
          lines.push(`- ${l.name}: ${status}`)
        }
        lines.push(``)
      }

      // Parse actions into a per-turn log
      if (actions.length > 0) {
        loadItemNames()

        // weaponNameByWeaponId and chipNameByTemplate are loaded by loadItemNames() above

        // Aggregate stats
        const totalDamageDealt = {}
        const totalDamageTaken = {}
        const totalHealing = {}
        const totalShielding = {}

        // Track equipped weapon per entity
        const equippedWeapon = {}

        // Per-turn log
        let turnNum = 1
        let currentEntity = null
        const turnLog = []
        let currentTurnLines = []

        for (const a of actions) {
          const type = a[0]

          if (type === 6) {
            // NEW_TURN [6, turn_number]
            if (currentTurnLines.length > 0) {
              turnLog.push({ turn: turnNum, lines: currentTurnLines })
            }
            turnNum = a[1] ?? (turnNum + 1)
            currentTurnLines = []
          } else if (type === 7) {
            // LEEK_TURN [7, entity_id]
            currentEntity = a[1]
            currentTurnLines.push(`  [${entityName[currentEntity] ?? currentEntity}]`)
          } else if (type === 10) {
            // MOVE [10, entity, dest_cell, [path]]
            const steps = (a[3] || []).length
            currentTurnLines.push(`    Move → cell ${a[2]} (${steps} steps)`)
          } else if (type === 13) {
            // SET_WEAPON [13, weapon_template_id]
            const wName = weaponNameByWeaponId[a[1]] || `weapon(${a[1]})`
            if (currentEntity !== null) equippedWeapon[currentEntity] = wName
            currentTurnLines.push(`    Equip ${wName}`)
          } else if (type === 16) {
            // USE_WEAPON [16, target_cell, hit_count]
            const wName = equippedWeapon[currentEntity] || 'weapon'
            currentTurnLines.push(`    Attack cell ${a[1]} with ${wName} (${a[2] ?? '?'} hits)`)
          } else if (type === 12) {
            // USE_CHIP [12, chip_template, target_cell, success]
            const cName = chipNameByTemplate?.[a[1]] || resolveChipName(a[1]) || `chip(${a[1]})`
            const success = a[3] === 2 ? '' : a[3] === 1 ? ' (crit!)' : ' (failed)'
            currentTurnLines.push(`    Use ${cName} on cell ${a[2] ?? '?'}${success}`)
          } else if (type === 101) {
            // LIFE_LOST [101, entity, amount, ???]
            const target = entityName[a[1]] ?? a[1]
            const amount = a[2] ?? 0
            totalDamageTaken[a[1]] = (totalDamageTaken[a[1]] || 0) + amount
            if (currentEntity !== undefined && currentEntity !== a[1]) {
              totalDamageDealt[currentEntity] = (totalDamageDealt[currentEntity] || 0) + amount
            }
            currentTurnLines.push(`    ${target} lost ${amount} HP`)
          } else if (type === 104) {
            // HEAL [104, entity, amount]
            const target = entityName[a[1]] ?? a[1]
            const amount = a[2] ?? 0
            totalHealing[a[1]] = (totalHealing[a[1]] || 0) + amount
            currentTurnLines.push(`    ${target} healed ${amount} HP`)
          } else if (type === 103) {
            // LIFE_STEAL [103, entity, amount]
            const target = entityName[a[1]] ?? a[1]
            const amount = a[2] ?? 0
            totalHealing[a[1]] = (totalHealing[a[1]] || 0) + amount
            currentTurnLines.push(`    ${target} stole ${amount} HP`)
          } else if (type === 108) {
            // SHIELD [108, entity, amount, ???]
            const target = entityName[a[1]] ?? a[1]
            const amount = a[2] ?? 0
            totalShielding[a[1]] = (totalShielding[a[1]] || 0) + amount
            currentTurnLines.push(`    ${target} shielded ${amount}`)
          } else if (type === 110) {
            // POISON_DAMAGE [110, entity, amount]
            const target = entityName[a[1]] ?? a[1]
            const amount = a[2] ?? 0
            totalDamageTaken[a[1]] = (totalDamageTaken[a[1]] || 0) + amount
            currentTurnLines.push(`    ${target} took ${amount} poison damage`)
          } else if (type === 5) {
            // PLAYER_DEAD [5, entity, killer]
            const target = entityName[a[1]] ?? a[1]
            currentTurnLines.push(`    ** ${target} DIED **`)
          } else if (type === 203) {
            // SAY [203, message]
            currentTurnLines.push(`    "${a[1]}"`)
          } else if (type === 200) {
            // SUMMON [200, ...]
            currentTurnLines.push(`    Summoned a bulb`)
          } else if (type === 1002) {
            currentTurnLines.push(`    ⚠ BUG/CRASH`)
          }
          // Silently skip: 0(START), 8(END_TURN), 302(BUFF), 303(BUFF_EXPIRE)
        }
        // Push last turn
        if (currentTurnLines.length > 0) {
          turnLog.push({ turn: turnNum, lines: currentTurnLines })
        }

        // Summary stats
        lines.push(`## Combat Stats`)
        for (const e of entityList) {
          const dmgDealt = totalDamageDealt[e.id] || 0
          const dmgTaken = totalDamageTaken[e.id] || 0
          const healed = totalHealing[e.id] || 0
          const shielded = totalShielding[e.id] || 0
          lines.push(`- ${e.name}: Dealt=${dmgDealt}, Taken=${dmgTaken}, Healed=${healed}, Shielded=${shielded}`)
        }
        lines.push(``)

        // Full turn-by-turn log
        lines.push(`## Turn-by-Turn Log`)
        for (const t of turnLog) {
          lines.push(`--- Turn ${t.turn} ---`)
          lines.push(...t.lines)
        }
      }

      return lines.join('\n')
    }

    case 'leekwars_upload_v8': {
      const v8Dir = args.v8_dir || '/home/ubuntu/LeekWars-AI/V8_modules'
      if (!existsSync(v8Dir)) {
        return `Error: V8_modules directory not found at ${v8Dir}`
      }

      // Optional account switch — login fresh from tools/config.json
      if (args.account) {
        const cfgPath = '/home/ubuntu/LeekWars-AI/tools/config.json'
        if (!existsSync(cfgPath)) {
          return `Error: config.json not found at ${cfgPath}`
        }
        const cfg = JSON.parse(readFileSync(cfgPath, 'utf-8'))
        const acc = cfg.accounts?.[args.account]
        if (!acc) {
          return `Error: account "${args.account}" not found in config.json`
        }
        const loginRes = await apiRequest('POST', '/farmer/login-token', {
          login: acc.email,
          password: acc.password,
        })
        if (!loginRes.token) {
          return `Login failed for account "${args.account}": ${JSON.stringify(loginRes)}`
        }
        authToken = loginRes.token
        currentFarmer = loginRes.farmer || null
      }

      // Fetch existing folder/AI tree
      const existing = await apiRequest('GET', '/ai/get-farmer-ais')
      const existingFolders = existing.folders || []
      const existingAis = existing.ais || []

      const findFolder = (name, parentId) =>
        existingFolders.find(f => f.name === name && f.folder === parentId)?.id || null
      const findAi = (name, folderId) =>
        existingAis.find(a => a.name === name && a.folder === folderId)?.id || null

      const ensureFolder = async (name, parentId) => {
        const existingId = findFolder(name, parentId)
        if (existingId) return { id: existingId, created: false }
        const res = await apiRequest('POST', '/ai-folder/new-name', {
          folder_id: parentId,
          name,
        })
        const newId = res.id
        if (!newId) throw new Error(`Failed to create folder "${name}"`)
        // Track locally so subsequent lookups work
        existingFolders.push({ id: newId, name, folder: parentId })
        return { id: newId, created: true }
      }

      const uploadFile = async (filename, code, folderId) => {
        const aiId = findAi(filename, folderId)
        if (aiId) {
          await apiRequest('POST', '/ai/save', { ai_id: aiId, code })
          return { id: aiId, action: 'updated' }
        }
        // Create with retry on rate-limit
        let createRes = null
        for (let attempt = 0; attempt < 3; attempt++) {
          createRes = await apiRequest('POST', '/ai/new-name', {
            folder_id: folderId,
            version: 4,
            name: filename,
          })
          if (createRes.ai?.id) break
          // brief backoff before retry
          execSync('sleep 2')
        }
        const newId = createRes?.ai?.id
        if (!newId) throw new Error(`Failed to create "${filename}": ${JSON.stringify(createRes)}`)
        await apiRequest('POST', '/ai/save', { ai_id: newId, code })
        existingAis.push({ id: newId, name: filename, folder: folderId })
        return { id: newId, action: 'created' }
      }

      const stats = { created: 0, updated: 0, failed: 0, files: [] }
      const errors = []

      // 1. Setup folders: 8.0/V8/[strategy, math]
      const root80 = await ensureFolder('8.0', 0)
      const v8Folder = await ensureFolder('V8', root80.id)

      // 2. Upload all root-level .lk files (excluding .ga_backup)
      const rootEntries = readdirSync(v8Dir)
      const rootFiles = rootEntries
        .filter(name => name.endsWith('.lk') && !name.includes('BACKUP'))
        .sort()

      for (const filename of rootFiles) {
        const fullPath = pathJoin(v8Dir, filename)
        if (!statSync(fullPath).isFile()) continue
        try {
          const code = readFileSync(fullPath, 'utf-8')
          const r = await uploadFile(filename, code, v8Folder.id)
          stats[r.action]++
          stats.files.push(`  ${r.action === 'created' ? '+' : '~'} ${filename}`)
        } catch (e) {
          stats.failed++
          errors.push(`${filename}: ${e.message}`)
        }
      }

      // 3. Upload strategy/ subfolder
      const strategyDir = pathJoin(v8Dir, 'strategy')
      if (existsSync(strategyDir) && statSync(strategyDir).isDirectory()) {
        const strategyFolder = await ensureFolder('strategy', v8Folder.id)
        const stratFiles = readdirSync(strategyDir)
          .filter(name => name.endsWith('.lk') && !name.includes('BACKUP'))
          .sort()
        for (const filename of stratFiles) {
          try {
            const code = readFileSync(pathJoin(strategyDir, filename), 'utf-8')
            const r = await uploadFile(filename, code, strategyFolder.id)
            stats[r.action]++
            stats.files.push(`  ${r.action === 'created' ? '+' : '~'} strategy/${filename}`)
          } catch (e) {
            stats.failed++
            errors.push(`strategy/${filename}: ${e.message}`)
          }
        }
      }

      // 4. Upload math/ subfolder if it exists
      const mathDir = pathJoin(v8Dir, 'math')
      if (existsSync(mathDir) && statSync(mathDir).isDirectory()) {
        const mathFolder = await ensureFolder('math', v8Folder.id)
        const mathFiles = readdirSync(mathDir)
          .filter(name => name.endsWith('.lk'))
          .sort()
        for (const filename of mathFiles) {
          try {
            const code = readFileSync(pathJoin(mathDir, filename), 'utf-8')
            const r = await uploadFile(filename, code, mathFolder.id)
            stats[r.action]++
            stats.files.push(`  ${r.action === 'created' ? '+' : '~'} math/${filename}`)
          } catch (e) {
            stats.failed++
            errors.push(`math/${filename}: ${e.message}`)
          }
        }
      }

      // 5. Re-save main.lk with build timestamp to force server recompile
      // (the generator caches compiled .lk and only checks the root file's mtime,
      //  so we append a comment to guarantee the code differs)
      let recompileMsg = ''
      const mainPath = pathJoin(v8Dir, 'main.lk')
      if (existsSync(mainPath)) {
        const mainCode = readFileSync(mainPath, 'utf-8')
        const ts = new Date().toISOString().replace(/[:.]/g, '-')
        const stamped = mainCode.replace(/\s*$/, '') + `\n// build: ${ts}\n`
        const mainAiId = findAi('main.lk', v8Folder.id)
        if (mainAiId) {
          await apiRequest('POST', '/ai/save', { ai_id: mainAiId, code: stamped })
          recompileMsg = `\nRecompiled main.lk (id ${mainAiId}, build ${ts})`
        }
      }

      const farmerInfo = args.account ? ` [account: ${args.account}]` : ''
      const summary = [
        `V8 upload complete${farmerInfo}`,
        `Created: ${stats.created}, Updated: ${stats.updated}, Failed: ${stats.failed}`,
        recompileMsg,
        '',
        ...stats.files,
      ]
      if (errors.length > 0) {
        summary.push('', 'Errors:', ...errors.map(e => `  ${e}`))
      }
      return summary.join('\n')
    }

    case 'leekwars_get_ranking': {
      const page = args.page || 1
      const result = await apiRequest('GET', `/ranking/get/${args.type}/${args.order}/${page}`)
      const rankings = result.rankings || []
      return rankings
        .slice(0, 20)
        .map(
          (r, i) =>
            `${(page - 1) * 20 + i + 1}. ${r.name} - Talent: ${r.talent}`,
        )
        .join('\n')
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

// Create and start MCP server
const server = new Server(
  {
    name: 'leekwars',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  try {
    const result = await handleToolCall(name, args || {})
    return {
      content: [{ type: 'text', text: result }],
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    }
  }
})

// Auto-login if credentials are provided via environment variables
// (set by setup.sh in ~/.claude/settings.json mcpServers.leekwars.env)
if (process.env.LEEKWARS_LOGIN && process.env.LEEKWARS_PASSWORD) {
  try {
    const result = apiRequest('POST', '/farmer/login-token', {
      login: process.env.LEEKWARS_LOGIN,
      password: process.env.LEEKWARS_PASSWORD,
    })
    if (result.token) {
      authToken = result.token
      const farmer = result.farmer || {}
      currentFarmer = farmer
      process.stderr.write(
        `[leekwars-mcp] Auto-logged in as ${farmer.login || 'unknown'} ` +
        `(${Object.keys(farmer.leeks || {}).length} leeks)\n`
      )
    }
  } catch {
    process.stderr.write('[leekwars-mcp] Auto-login failed. Use leekwars_login tool.\n')
  }
}

const transport = new StdioServerTransport()
await server.connect(transport)
