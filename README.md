# LeekWars Code

> Claude Code + LeekWars. Write, debug, optimize, and deploy LeekScript AI — all from the terminal.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI (`npm install -g @anthropic-ai/claude-code`)
- A [LeekWars](https://leekwars.com) account

### Install

```bash
git clone --recurse-submodules https://github.com/tankyx/claude-code.git
cd claude-code
./setup.sh
```

The script will ask for your LeekWars username and password, test them against the live API, and configure everything automatically. You can also pass them directly:

```bash
./setup.sh YourUsername YourPassword
```

### What `setup.sh` does

1. Installs MCP server dependencies (`mcp-leekwars-server/`)
2. Tests your LeekWars credentials against the live API
3. Saves credentials to `~/.claude/leekwars-credentials.json` (mode 600, local only)
4. Registers the MCP server in `~/.claude/settings.json` (auto-login on startup)
5. Installs the LeekScript skill to `~/.claude/skills/leekscript.md`
6. Creates a `CLAUDE.md` in your project directory if `.lk` files are detected

### Use

```bash
cd ~/my-leek-scripts
claude
```

That's it. Claude now knows LeekScript, has access to your LeekWars account, and can read/write `.lk` files.

---

## What can it do?

**Write AI from scratch:**
```
> Write me a kiter AI that maintains max weapon range and retreats after attacking
```

**Debug existing scripts:**
```
> My AI is wasting TP — can you find the bug in main.lk?
```

**Manage your account:**
```
> Show my leeks and their stats
> List my AI scripts
> Pull the source code for main.lk
> Save this AI and start a test fight against my garden opponents
```

**Optimize for competition:**
```
> /leek-optimize      # 3-agent parallel review of your AI
> /leek-test          # Static analysis for common bugs
```

---

## Available Skills

| Command | What it does |
|---------|-------------|
| `/leekscript` | Full LeekScript API reference (197 functions, 400+ constants from source) |
| `/leek-test` | Static analysis: null safety, TP waste, invalid syntax, non-existent functions |
| `/leek-optimize` | Parallel optimization: operations efficiency, TP/MP usage, strategy review |
| `/leek-sync` | Pull/push AI code between local `.lk` files and LeekWars |

---

## MCP Tools (17)

Automatically available after setup. No manual configuration needed.

| Tool | Description |
|------|-------------|
| `leekwars_login` | Authenticate (auto-runs on startup) |
| `leekwars_list_ais` | List all your AI scripts |
| `leekwars_get_ai` | Get AI source code by ID |
| `leekwars_save_ai` | Save/update AI code |
| `leekwars_new_ai` | Create a new AI |
| `leekwars_delete_ai` | Delete an AI |
| `leekwars_rename_ai` | Rename an AI |
| `leekwars_get_leek` | Get leek stats and equipment |
| `leekwars_set_leek_ai` | Assign AI to a leek |
| `leekwars_get_leek_opponents` | Get matchmaking opponents for a leek |
| `leekwars_start_fight` | Start a solo fight |
| `leekwars_start_farmer_fight` | Start a farmer fight |
| `leekwars_get_fight` | Get fight results and replay |
| `leekwars_get_garden` | Browse available opponents |
| `leekwars_get_farmer` | Get farmer profile |
| `leekwars_get_constants` | Get all game constants |
| `leekwars_get_ranking` | Get rankings |

---

## LeekScript at a Glance

```leekscript
// Variables: only var and global work (let/const are reserved but broken)
var x = 10              // mutable, turn-local
global state = "ATTACK" // persists across turns

// Lambdas
var square = x -> x ** 2

// Functional ops (no ~~ or \ operators — use functions)
var doubled = arrayMap([1, 2, 3], x -> x * 2)         // [2, 4, 6]
var evens = arrayFilter([1, 2, 3, 4], x -> x % 2 == 0) // [2, 4]

// Basic AI — observe, decide, act
var enemy = getNearestEnemy()
if (enemy != null) {
    moveToward(enemy)
    while (getTP() >= getWeaponCost(getWeapon()) and canUseWeapon(getWeapon(), enemy)) {
        useWeapon(enemy)
    }
    moveAwayFrom(enemy)
}
```

File extensions: `.lk`, `.leek`, `.ls`, `.lks`, `.leekscript`

---

## Project Layout

```
claude-code/
├── setup.sh                              # One-command setup
├── mcp-leekwars-server/
│   └── server.js                         # MCP server (17 LeekWars API tools)
├── .claude/skills/
│   └── leekscript.md                     # Auto-trigger skill (installed globally by setup.sh)
├── templates/
│   └── CLAUDE.md.leekscript              # Project template
├── vendor/                               # Ground-truth references (git submodules)
│   ├── leekscript/                       # LeekScript compiler source (Java)
│   └── leek-wars-generator/              # Fight engine + game data (weapons, chips, constants)
├── src/
│   ├── constants/prompts.ts              # System prompts (LeekWars-focused)
│   ├── skills/bundled/
│   │   ├── leekscript.ts                 # /leekscript skill
│   │   ├── leekscript/
│   │   │   ├── api-reference.md          # 197 functions, 400+ constants (from source)
│   │   │   └── patterns.md              # 8 AI strategy patterns
│   │   ├── leekTest.ts                   # /leek-test
│   │   ├── leekSync.ts                   # /leek-sync
│   │   └── leekOptimize.ts              # /leek-optimize
│   └── utils/cliHighlight.ts             # LeekScript syntax highlighting
└── README.md
```

---

## Reference Submodules

The API reference is generated from the actual game engine source, included as git submodules:

| Submodule | Key files | What it provides |
|-----------|-----------|------------------|
| `vendor/leekscript` | `src/.../compiler/` | Definitive syntax reference (lexer, parser, token types) |
| `vendor/leekscript` | `src/test/resources/ai/` | Example `.leek` test scripts |
| `vendor/leek-wars-generator` | `src/.../FightFunctions.java` | All 197 API functions with exact signatures |
| `vendor/leek-wars-generator` | `src/.../FightConstants.java` | All 400+ game constants |
| `vendor/leek-wars-generator` | `data/weapons.json` | Weapon stats |
| `vendor/leek-wars-generator` | `data/chips.json` | Chip stats |
| `vendor/leek-wars-generator` | `data/functions.json` | Operations cost per function |

Claude reads these files directly when it needs to verify a function signature or constant value.

---

## Reconfigure

```bash
# Change credentials
./setup.sh NewUsername NewPassword

# Or edit directly
nano ~/.claude/leekwars-credentials.json

# Manual MCP server test
cd mcp-leekwars-server
echo '{}' | LEEKWARS_LOGIN=You LEEKWARS_PASSWORD=Pass node server.js
```

---

## Links

- [LeekWars](https://leekwars.com) — the game
- [LeekScript Docs](https://leekwars.com/help/documentation) — official function reference
- [LeekScript Encyclopedia](https://leekwars.com/encyclopedia/en/LeekScript) — language overview
- [LeekWars API](https://leekwars.com/help/api) — REST API docs
- [leek-wars/leekscript](https://github.com/leek-wars/leekscript) — compiler source
- [leek-wars/leek-wars-generator](https://github.com/leek-wars/leek-wars-generator) — fight engine
