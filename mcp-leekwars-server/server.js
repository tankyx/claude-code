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

const API_BASE = 'https://leekwars.com/api'
let authToken = process.env.LEEKWARS_TOKEN || null

async function apiRequest(method, path, body = null) {
  const url = `${API_BASE}${path}`
  const headers = {}
  const options = { method, headers }

  if (method === 'POST') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    const params = new URLSearchParams()
    // Inject auth token into POST body (LeekWars v2.31+ convention)
    if (authToken) {
      params.append('token', authToken)
    }
    if (body) {
      for (const [key, value] of Object.entries(body)) {
        params.append(key, String(value))
      }
    }
    options.body = params.toString()
  } else {
    // GET requests: append token as query param if needed
    const separator = path.includes('?') ? '&' : '/'
    // Some GET endpoints accept token as last path segment
  }

  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`)
  }
  return response.json()
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
      const result = await apiRequest('POST', '/farmer/login', {
        login: args.login,
        password: args.password,
      })
      if (result.token) {
        authToken = result.token
        return `Login successful. Token stored for this session. Farmer: ${result.farmer?.name || 'unknown'}`
      }
      return `Login failed: ${JSON.stringify(result)}`
    }

    case 'leekwars_list_ais': {
      const result = await apiRequest('POST', '/ai/get-farmer-ais')
      const ais = result.ais || []
      if (ais.length === 0) return 'No AIs found.'
      return ais
        .map((ai) => `[${ai.id}] ${ai.name} (${ai.valid ? 'valid' : 'invalid'})`)
        .join('\n')
    }

    case 'leekwars_get_ai': {
      const result = await apiRequest('POST', '/ai/get', { ai_id: args.ai_id })
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
      const result = await apiRequest('POST', '/leek/get', { leek_id: args.leek_id })
      const leek = result.leek || result
      return [
        `# ${leek.name} (ID: ${leek.id})`,
        `Level: ${leek.level}`,
        `Talent: ${leek.talent}`,
        `Life: ${leek.life}`,
        `Strength: ${leek.strength}`,
        `Agility: ${leek.agility}`,
        `Wisdom: ${leek.wisdom}`,
        `Resistance: ${leek.resistance}`,
        `Magic: ${leek.magic}`,
        `Science: ${leek.science}`,
        `Frequency: ${leek.frequency}`,
        `AI: ${leek.ai_name || 'none'} (ID: ${leek.ai_id || 'none'})`,
        `Weapons: ${JSON.stringify(leek.weapons || [])}`,
        `Chips: ${JSON.stringify(leek.chips || [])}`,
      ].join('\n')
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
      const result = await apiRequest('POST', '/fight/get', { fight_id: args.fight_id })
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
      const result = await apiRequest('POST', '/garden/get')
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
      const body = args.farmer_id ? { farmer_id: args.farmer_id } : {}
      const result = await apiRequest('POST', '/farmer/get', body)
      const farmer = result.farmer || result
      return [
        `# ${farmer.name} (ID: ${farmer.id})`,
        `Level: ${farmer.total_level}`,
        `Talent: ${farmer.talent}`,
        `Leeks: ${(farmer.leeks || []).map((l) => `${l.name} (lvl ${l.level})`).join(', ')}`,
      ].join('\n')
    }

    case 'leekwars_get_constants': {
      const result = await apiRequest('POST', '/constant/get-all')
      return JSON.stringify(result, null, 2).slice(0, 5000) + '\n...(truncated)'
    }

    case 'leekwars_get_ranking': {
      const page = args.page || 1
      const result = await apiRequest('POST', '/ranking/get', {
        type: args.type,
        order: args.order,
        page,
      })
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

const transport = new StdioServerTransport()
await server.connect(transport)
