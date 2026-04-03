# lwcode — LeekWars Code

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
./patch-claude.sh
./setup.sh
```

`patch-claude.sh` copies your installed `claude` binary and patches it with:
- Separate config directory (`~/.lwcode/`) so it doesn't touch your regular `claude`
- Green color theme (instead of orange)
- "lwcode" / "LeekWars Code" branding

`setup.sh` then configures:
1. LeekWars credentials (tested against the live API)
2. MCP server with 17 LeekWars API tools (auto-login on startup)
3. LeekScript skills installed to `~/.claude/skills/`
4. `CLAUDE.md` template in your project directory

### Use

```bash
cd ~/my-leek-scripts
lwcode                                 # Interactive session
lwcode -p "Write me a kiter AI"        # Non-interactive
```

> **Note:** Your regular `claude` stays untouched at `~/.claude/`. lwcode uses `~/.lwcode/` for its auth, settings, and session data.

---

## What can it do?

**Write AI from scratch:**
```
> Write me a kiter AI that maintains max weapon range and retreats after attacking
```

**Debug and optimize:**
```
> Analyze my LeekScript code for bugs and optimization issues
> Optimize my AI for competitive play — focus on TP/MP efficiency
```

**Manage your LeekWars account (via MCP):**
```
> Show my leeks and their stats
> List my AI scripts
> Pull the source code for main.lk
> Start a test fight against my garden opponents
```

---

## Skills

Skills are auto-triggered based on context (when you're in a directory with `.lk` files). Ask naturally:

| Ask for | What happens |
|---------|-------------|
| "Analyze my code for bugs" | Static analysis: null safety, TP waste, non-existent functions, invalid syntax |
| "Optimize my AI" | 3-agent parallel review: operations efficiency, TP/MP usage, strategy & tactics |
| "Sync my code with LeekWars" | Pull/push AI code between local `.lk` files and the platform |
| "Write a healer AI" | Full LeekScript API reference (197 functions, 400+ constants) loaded as context |

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
├── patch-claude.sh                       # Create lwcode from stock claude binary
├── setup.sh                              # Configure credentials + MCP + skills
├── mcp-leekwars-server/
│   └── server.js                         # MCP server (17 LeekWars API tools)
├── .claude/skills/
│   ├── leekscript.md                     # LeekScript API reference + language guide
│   ├── leek-test.md                      # Static analysis skill
│   ├── leek-optimize.md                  # 3-agent optimization review
│   └── leek-sync.md                      # Platform sync skill
├── templates/
│   └── CLAUDE.md.leekscript              # Project template
├── vendor/                               # Ground-truth references (git submodules)
│   ├── leekscript/                       # LeekScript compiler source (Java)
│   └── leek-wars-generator/              # Fight engine + game data
└── README.md
```

---

## Reference Submodules

The API reference is verified against the actual game engine source:

| Submodule | Key files | What it provides |
|-----------|-----------|------------------|
| `vendor/leekscript` | `src/.../compiler/` | Definitive syntax reference (lexer, parser) |
| `vendor/leek-wars-generator` | `FightFunctions.java` | All 197 API functions with exact signatures |
| `vendor/leek-wars-generator` | `FightConstants.java` | All 400+ game constants |
| `vendor/leek-wars-generator` | `data/weapons.json` | Weapon stats |
| `vendor/leek-wars-generator` | `data/chips.json` | Chip stats |
| `vendor/leek-wars-generator` | `data/functions.json` | Operations cost per function |

---

## Reconfigure

```bash
# Re-patch after claude updates
./patch-claude.sh && sudo cp dist/lwcode.js /usr/local/bin/lwcode

# Change LeekWars credentials
./setup.sh NewUsername NewPassword

# Full reinstall
./patch-claude.sh && ./setup.sh
```

---

## Links

- [LeekWars](https://leekwars.com) — the game
- [LeekScript Docs](https://leekwars.com/help/documentation) — official function reference
- [LeekScript Encyclopedia](https://leekwars.com/encyclopedia/en/LeekScript) — language overview
- [LeekWars API](https://leekwars.com/help/api) — REST API docs
- [leek-wars/leekscript](https://github.com/leek-wars/leekscript) — compiler source
- [leek-wars/leek-wars-generator](https://github.com/leek-wars/leek-wars-generator) — fight engine
