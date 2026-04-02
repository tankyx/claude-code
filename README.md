# LeekWars Code — AI Programming Assistant for LeekWars

> A specialized fork of Claude Code, stripped down and rebuilt to be a **LeekScript-only programming assistant** for the [LeekWars](https://leekwars.com) turn-based combat game.

---

## What is this?

LeekWars Code is a CLI tool that connects you to Claude for writing, debugging, optimizing, and deploying **LeekScript AI scripts** — the language used in LeekWars to program autonomous fighting leeks.

This is **not** a general-purpose coding assistant. Every prompt, skill, and integration is laser-focused on LeekWars.

### What it does

- **Writes LeekScript AI** — from simple fighters to advanced state-machine strategies with team coordination
- **Knows the full LeekWars API** — 200+ functions across movement, combat, targeting, map, effects, summons, and utility categories
- **Understands game mechanics** — TP/MP budgets, operations limits, turn order, stat scaling, weapon/chip ranges, cooldowns, line of sight
- **Optimizes for competitive play** — TP efficiency, operations budget, target selection, positioning, team composition
- **Syncs with LeekWars** — pull/push AI code, start test fights, get fight results (via MCP server)

---

## Quick Start

```bash
# Run LeekWars Code in your AI scripts directory
claude

# Use built-in skills
/leekscript          # Full API reference and language guide
/leek-test           # Static analysis of your AI code
/leek-optimize       # 3-agent parallel optimization review
/leek-sync           # Sync code with LeekWars platform

# Ask naturally
> Write me a kiter AI that maintains max weapon range and retreats after attacking
> My AI is wasting TP — can you optimize the attack loop?
> Add a healing mode that triggers when HP drops below 30%
> Explain what getNearestEnemy() vs getWeakestEnemy() does
```

---

## LeekScript Skills

| Skill | Command | Description |
|-------|---------|-------------|
| **LeekScript Expert** | `/leekscript` | Full language reference, API docs, 8 AI pattern templates |
| **AI Tester** | `/leek-test` | Static analysis for null safety, TP waste, operations budget, dead code |
| **AI Optimizer** | `/leek-optimize` | Parallel 3-agent review: operations efficiency, TP/MP optimization, strategy & tactics |
| **Platform Sync** | `/leek-sync` | Pull/push AI code between local `.lk` files and LeekWars platform |
| **Debug** | `/debug` | Debug session issues |
| **Verify** | `/verify` | Verify task completion |
| **Remember** | `/remember` | Save project context to memory |

---

## LeekWars MCP Server

The included MCP server (`mcp-leekwars-server/`) connects Claude directly to the LeekWars REST API.

### Setup

```bash
cd mcp-leekwars-server && npm install
```

Add to your settings (`.claude/settings.json`):

```json
{
  "mcpServers": {
    "leekwars": {
      "command": "node",
      "args": ["./mcp-leekwars-server/server.js"],
      "env": {
        "LEEKWARS_TOKEN": "your-token-here"
      }
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `leekwars_login` | Authenticate with LeekWars |
| `leekwars_list_ais` | List all your AI scripts |
| `leekwars_get_ai` | Get AI source code by ID |
| `leekwars_save_ai` | Save/update AI code |
| `leekwars_new_ai` | Create a new AI |
| `leekwars_delete_ai` | Delete an AI |
| `leekwars_rename_ai` | Rename an AI |
| `leekwars_get_leek` | Get leek stats and equipment |
| `leekwars_set_leek_ai` | Assign AI to a leek |
| `leekwars_start_fight` | Start a solo fight |
| `leekwars_start_farmer_fight` | Start a farmer fight |
| `leekwars_get_fight` | Get fight results and replay |
| `leekwars_get_garden` | Browse available opponents |
| `leekwars_get_farmer` | Get farmer profile |
| `leekwars_get_constants` | Get all game constants |
| `leekwars_get_ranking` | Get rankings |

---

## Project Structure

```
├── src/
│   ├── main.tsx                          # CLI entrypoint
│   ├── QueryEngine.ts                    # LLM query engine (Anthropic API)
│   ├── constants/
│   │   └── prompts.ts                    # System prompts (LeekWars-focused)
│   ├── skills/bundled/
│   │   ├── index.ts                      # Skill registry (LeekWars + utility only)
│   │   ├── leekscript.ts                 # /leekscript skill
│   │   ├── leekscriptContent.ts          # API reference content loader
│   │   ├── leekscript/
│   │   │   ├── SKILL.md                  # Skill prompt
│   │   │   ├── api-reference.md          # Full LeekWars API reference
│   │   │   └── patterns.md              # 8 AI strategy patterns
│   │   ├── leekTest.ts                   # /leek-test skill
│   │   ├── leekSync.ts                   # /leek-sync skill
│   │   └── leekOptimize.ts              # /leek-optimize skill
│   ├── tools/                            # Tool implementations (Bash, Read, Edit, etc.)
│   ├── services/mcp/                     # MCP client
│   └── ...                               # Core infrastructure (unchanged)
├── mcp-leekwars-server/
│   ├── server.js                         # MCP server for LeekWars REST API
│   ├── package.json
│   └── README.md
├── .claude/skills/
│   └── leekscript.md                     # Disk-based auto-trigger skill
├── templates/
│   └── CLAUDE.md.leekscript             # CLAUDE.md template for LeekScript projects
└── README.md
```

---

## What Was Changed from Base Claude Code

### System Prompt (src/constants/prompts.ts)

| Section | Change |
|---------|--------|
| **Identity** | "LeekWars Code" — LeekScript specialist, not general SE assistant |
| **Intro** | Includes LeekScript language overview (syntax, operators, types, constraints) |
| **Doing tasks** | LeekScript-specific: TP/MP budgets, null-checking, `global` state, operations limits, AI structure, team composition |
| **Actions** | Scoped to LeekWars risks: overwriting live AI, starting ranked fights, deleting scripts |
| **Tone/style** | Exact API function names, `leekscript` code fences, game mechanic precision |
| **Output** | Code-first responses, strategy-focused |
| **Environment** | LeekWars documentation URLs, file extension recognition |

### Skills (src/skills/bundled/index.ts)

**Added:** `leekscript`, `leek-test`, `leek-sync`, `leek-optimize`

**Removed:** batch, simplify, skillify, keybindings, loremIpsum, claudeInChrome, claudeApi, dream, hunter, loop, scheduleRemoteAgents, runSkillGenerator

**Kept:** debug, verify, stuck, remember, updateConfig (utility skills still useful)

### New Files

- **4 bundled skills** with full LeekScript API reference (200+ functions), 8 AI pattern templates, optimization framework
- **MCP server** with 16 tools for LeekWars REST API
- **Disk-based skill** (`.claude/skills/leekscript.md`) for automatic LeekScript detection
- **CLAUDE.md template** for LeekScript projects

---

## LeekScript at a Glance

```leekscript
// Variables
var x = 10              // mutable
let y = 20              // constant
global state = "ATTACK" // persists across turns

// Functional operators
var doubled = [1, 2, 3] ~~ x -> x * 2      // map: [2, 4, 6]
var evens = [1, 2, 3, 4] \ x -> x % 2 == 0 // filter: [2, 4]
var result = 3 ~ x -> x ** x                // pipe: 27

// Basic AI
var enemy = getNearestEnemy()
if (enemy != null) {
    moveToward(enemy)
    while (getTP() >= getWeaponCost(getWeapon()) and canUseWeapon(getWeapon(), enemy)) {
        useWeapon(enemy)
    }
}
```

File extensions: `.lk`, `.leek`, `.ls`, `.lks`, `.leekscript`

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | [Bun](https://bun.sh) |
| Language | TypeScript (strict) |
| Terminal UI | [React](https://react.dev) + [Ink](https://github.com/vadimdemedes/ink) |
| LLM API | [Anthropic SDK](https://docs.anthropic.com) |
| Protocols | [MCP SDK](https://modelcontextprotocol.io), LSP |
| Schema Validation | [Zod v4](https://zod.dev) |
| Game Platform | [LeekWars](https://leekwars.com) |

---

## Links

- **LeekWars**: https://leekwars.com
- **LeekScript Docs**: https://leekwars.com/help/documentation
- **LeekScript Encyclopedia**: https://leekwars.com/encyclopedia/en/LeekScript
- **LeekWars API**: https://leekwars.com/help/api
- **LeekWars GitHub**: https://github.com/leek-wars
- **LeekScript (Java)**: https://github.com/leek-wars/leekscript
- **LeekScript-next (C++/LLVM)**: https://github.com/leek-wars/leekscript-next

---

## Base Source

This project is built on top of the Claude Code source (leaked 2026-03-31 via npm source map). The core infrastructure (QueryEngine, tools, MCP client, permissions, UI) is from the original codebase. All LeekWars-specific additions are in the files listed above.
