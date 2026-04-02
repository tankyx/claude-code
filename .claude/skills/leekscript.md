---
name: leekscript
description: >
  LeekScript language expert for LeekWars AI programming.
  TRIGGER when: files have .lk or .leekscript extension, code uses LeekWars API functions
  (useWeapon, useChip, getEnemies, moveToward, etc.), or user mentions LeekWars/LeekScript.
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
  - WebFetch
---

# LeekScript & LeekWars Programming Expert

You are an expert LeekScript programmer for the LeekWars online game (https://leekwars.com).
LeekWars is a turn-based programming game where players write AI scripts in LeekScript
to control virtual leeks in combat arenas.

## LeekScript Language Reference

### Overview
LeekScript is a dynamically typed language with JavaScript-like syntax. It runs inside
the LeekWars game engine with a **20 million operations limit** per turn.

### Variable Declarations
```leekscript
var x = 10           // mutable variable
var name = "Leek"    // string
var arr = [1, 2, 3]  // array
var map = ["a": 1, "b": 2]  // map (associative array)
global myGlobal = 0  // persists across turns
// Note: let/const are reserved keywords but NOT implemented. Only use var and global.
```

### Data Types
- **integer** / **real**: numbers (`42`, `3.14`)
- **string**: text (`"hello"`, `'world'`)
- **boolean**: `true`, `false`
- **Array**: ordered list (`[1, 2, 3]`)
- **Map**: key-value pairs (`["key": value]`)
- **Set**: unique values (`<1, 2, 3>`)
- **Interval**: range (`1..10`)
- **null**: absence of value
- **Function**: first-class functions
- **Object**: anonymous objects
- **Class**: class values

### Operators
```leekscript
// Arithmetic: + - * / \ (integer division) % ** (power) ++ --
// Comparison: == != < > <= >= === !==
// Logical: and or not xor ! && ||
// Bitwise: & | ^ ~ (bitwise NOT) << >> >>>
// String: + (concatenation)
// Lambda: -> (e.g., x -> x * 2)
// Null coalescing: ?? ??=
// Range: .. (e.g., 1..10 creates Interval)
// Membership: in, not in
// Type: instanceof, is (alias for ==), as (cast)
// Ternary: condition ? a : b
// NOTE: ~~ (map) and <=> (swap) DO NOT EXIST. Use arrayMap()/arrayFilter().
```

### Control Flow
```leekscript
// If/else
if (condition) { ... }
else if (other) { ... }
else { ... }

// For loop
for (var i = 0; i < 10; i++) { ... }

// For-in (arrays)
for (var element in array) { ... }

// For-in (maps)
for (var key : value in map) { ... }

// While
while (condition) { ... }

// Do-while
do { ... } while (condition)

// Break / continue
break
continue
```

### Functions
```leekscript
function myFunction(a, b) {
    return a + b
}

// Lambda / anonymous
var add = function(a, b) { return a + b }
var square = x -> x ** 2

// Functional operations (use functions, not operators)
var doubled = arrayMap([1, 2, 3], x -> x * 2)       // [2, 4, 6]
var evens = arrayFilter([1, 2, 3, 4], x -> x % 2 == 0)  // [2, 4]
```

### Classes
```leekscript
class Fighter {
    var name
    var hp

    constructor(name, hp) {
        this.name = name
        this.hp = hp
    }

    function isAlive() {
        return this.hp > 0
    }
}
```

### Module System
```leekscript
include('shared_utilities')  // import another AI script by name
```

### Important Notes
- Semicolons are optional (newlines act as statement terminators)
- Only `var` and `global` for declarations. `let`/`const` are reserved but NOT implemented.
- `->` creates lambda functions: `x -> x * 2`
- `\` is integer division (NOT filter). Use `arrayFilter()` for filtering.
- `~` is bitwise NOT (NOT pipe). Use `arrayMap()` for mapping.
- `~~` (map operator) and `<=>` (swap) DO NOT EXIST in production LeekScript.
- `??` null coalescing: `value ?? default`
- `..` range operator: `1..10` creates an Interval
- `getOperations()` returns current operations count
- `include('name')` imports shared AI scripts
- Parentheses in `if`/`while`/`for` are optional
- Refer to `vendor/leekscript/` and `vendor/leek-wars-generator/` for ground truth

## LeekWars API - Complete Function Reference

### Movement Functions
| Function | Description |
|----------|-------------|
| `moveToward(entity)` | Move toward an entity, returns cells moved |
| `moveToward(entity, maxMP)` | Move toward entity using at most maxMP movement points |
| `moveAwayFrom(entity)` | Move away from an entity |
| `moveAwayFrom(entity, maxMP)` | Move away using at most maxMP |
| `moveTowardCell(cell)` | Move toward a specific cell |
| `moveTowardCell(cell, maxMP)` | Move toward cell using at most maxMP |
| `moveAwayFromCell(cell)` | Move away from a specific cell |
| `moveAwayFromCell(cell, maxMP)` | Move away from cell using at most maxMP |
| `moveTowardEntities(entities)` | Move toward multiple entities |
| `moveTowardCells(cells)` | Move toward multiple cells |
| `moveAwayFromEntities(entities)` | Move away from multiple entities |
| `moveAwayFromCells(cells)` | Move away from multiple cells |
| `moveTowardLine(c1, c2, [maxMP])` | Move toward a line |
| `moveAwayFromLine(c1, c2, [maxMP])` | Move away from a line |

### Combat Functions
| Function | Description |
|----------|-------------|
| `useWeapon(entity)` | Attack entity with equipped weapon, returns attack result |
| `useWeaponOnCell(cell)` | Attack a cell with equipped weapon |
| `useChip(chip, entity)` | Use a chip on an entity |
| `useChipOnCell(chip, cell)` | Use a chip on a cell |
| `setWeapon(weapon)` | Equip a weapon (costs 1 TP) |

### Entity Information
| Function | Description |
|----------|-------------|
| `getLife()` | Current HP of your leek |
| `getTotalLife()` | Maximum HP of your leek |
| `getTP()` | Current turn points (action points) |
| `getMP()` | Current movement points |
| `getCell()` | Cell position of your leek |
| `getLevel()` | Level of your leek |
| `getName()` | Name of your leek |
| `getStrength()` | Strength stat |
| `getAgility()` | Agility stat |
| `getWisdom()` | Wisdom stat |
| `getResistance()` | Resistance stat |
| `getMagic()` | Magic stat |
| `getScience()` | Science stat |
| `getFrequency()` | Frequency stat |
| `getAbsoluteShield()` | Absolute shield value |
| `getRelativeShield()` | Relative shield percentage |

### Entity Information (Other Entities)
| Function | Description |
|----------|-------------|
| `getLife(entity)` | HP of specified entity |
| `getTotalLife(entity)` | Max HP of specified entity |
| `getTP(entity)` | TP of specified entity |
| `getMP(entity)` | MP of specified entity |
| `getCell(entity)` | Cell position of specified entity |
| `getLevel(entity)` | Level of specified entity |
| `getName(entity)` | Name of specified entity |

### Targeting Functions
| Function | Description |
|----------|-------------|
| `getEnemies()` | Array of all enemy entity IDs |
| `getAllies()` | Array of all ally entity IDs (including self) |
| `getAliveEnemies()` | Array of alive enemy entity IDs |
| `getAliveAllies()` | Array of alive ally entity IDs |
| `getDeadEnemies()` | Array of dead enemy entity IDs |
| `getDeadAllies()` | Array of dead ally entity IDs |
| `getNearestEnemy()` | ID of nearest enemy |
| `getNearestAlly()` | ID of nearest ally |
| `getFarthestEnemy()` | ID of farthest enemy |
| `getFarthestAlly()` | ID of farthest ally |
| `getNearestEnemyTo(entity)` | Nearest enemy to another entity |
| `getNearestEnemyToCell(cell)` | Nearest enemy to a cell |
| `getNearestAllyTo(entity)` | Nearest ally to another entity |
| `getNearestAllyToCell(cell)` | Nearest ally to a cell |
| `getLeekOnCell(cell)` | Entity on a cell (or null) |
| `getEntityOnCell(cell)` | Entity on a cell (or null) |
| `isEnemy(entity)` | True if entity is an enemy |
| `isAlly(entity)` | True if entity is an ally |
| `isDead(entity)` | True if entity is dead |
| `isAlive(entity)` | True if entity is alive |

### Map & Cell Functions
| Function | Description |
|----------|-------------|
| `getCellDistance(cell1, cell2)` | Manhattan distance between cells |
| `getDistance(cell1, cell2)` | Euclidean distance between cells |
| `getPathLength(cell1, cell2)` | Path length (walkable) between cells |
| `getPath(cell1, cell2)` | Array of cells forming path |
| `lineOfSight(cell1, cell2)` | True if line of sight exists |
| `lineOfSight(cell1, cell2, ignored)` | LoS ignoring specified entities |
| `isObstacle(cell)` | True if cell is an obstacle |
| `getObstacles()` | Array of all obstacle cells |
| `getMapType()` | Map type constant |
| `getCellX(cell)` | X coordinate of cell |
| `getCellY(cell)` | Y coordinate of cell |
| `getCellFromXY(x, y)` | Cell from coordinates |
| `getCellContent(cell)` | Content type on cell |

### Weapon & Chip Info
| Function | Description |
|----------|-------------|
| `getWeapon()` | Currently equipped weapon ID |
| `getWeapons()` | Array of all owned weapon IDs |
| `getChips()` | Array of all owned chip IDs |
| `getWeaponCost(weapon)` | TP cost of a weapon |
| `getChipCost(chip)` | TP cost of a chip |
| `getWeaponMinRange(weapon)` | Minimum range of weapon |
| `getWeaponMaxRange(weapon)` | Maximum range of weapon |
| `getChipMinRange(chip)` | Minimum range of chip |
| `getChipMaxRange(chip)` | Maximum range of chip |
| `getWeaponEffects(weapon)` | Effect list of weapon |
| `getChipEffects(chip)` | Effect list of chip |
| `canUseWeapon(weapon, entity)` | True if weapon can hit entity |
| `canUseWeaponOnCell(weapon, cell)` | True if weapon can hit cell |
| `canUseChip(chip, entity)` | True if chip can hit entity |
| `canUseChipOnCell(chip, cell)` | True if chip can hit cell |
| `getChipCooldown(chip)` | Remaining cooldown turns |
| `weaponNeedLos(weapon)` | True if weapon needs line of sight |
| `chipNeedLos(chip)` | True if chip needs line of sight |

### Effects
| Function | Description |
|----------|-------------|
| `getEffects()` | Active effects on your leek |
| `getEffects(entity)` | Active effects on entity |
| `getLaunchedEffects()` | Effects launched by your leek |

### Summons
| Function | Description |
|----------|-------------|
| `summon(chip, cell, ai)` | Summon entity at cell with AI |
| `getSummons()` | Array of your summon IDs |
| `getSummons(entity)` | Summons of specified entity |
| `isSummon()` | True if your leek is a summon |
| `isSummon(entity)` | True if entity is a summon |
| `getSummoner()` | Entity that summoned you |
| `getSummoner(entity)` | Entity that summoned entity |

### Network / Messaging (for team coordination)
| Function | Description |
|----------|-------------|
| `sendTo(entity, type, params)` | Send message to an ally entity |
| `sendAll(type, params)` | Send message to all allies |
| `getMessages([type])` | Get received messages (optional type filter) |
| `getMessageAuthor(message)` | Get message author entity ID |
| `getMessageType(message)` | Get message type constant |
| `getMessageParams(message)` | Get message parameters |

### Registers (persistent data between fights)
| Function | Description |
|----------|-------------|
| `getRegisters()` | Get all persistent registers as map |
| `getRegister(key)` | Get a register value by key |
| `setRegister(key, value)` | Set a register value (persists between fights!) |
| `deleteRegister(key)` | Delete a register |

### Communication & Debug
| Function | Description |
|----------|-------------|
| `say(message)` | Display message in chat bubble |
| `mark(cell_or_cells, [color, duration])` | Mark cell(s) with a color |
| `markText(cell_or_cells, [text, color, duration])` | Mark cell(s) with text |
| `clearMarks()` | Clear all cell marks |
| `debug(value)` | Log to debug console |
| `debugW(value)` | Log warning to debug console |
| `debugE(value)` | Log error to debug console |
| `debugC(value, color)` | Log with color to debug console |

### Utility Functions
| Function | Description |
|----------|-------------|
| `getTurn()` | Current turn number |
| `getEntity()` | Your own entity ID |
| `getOperations()` | Current operations count |
| `include(name)` | Import another AI script |
| `listen()` | Listen for messages from allies |
| `clone(value)` | Deep clone a value |
| `getType(value)` | Type of value as number |
| `typeOf(value)` | Type of value as string |
| `count(array)` | Length of array |
| `inArray(array, val)` | True if array contains val |
| `contains(str, substr)` | True if string contains substring |
| `pushAll(array, items)` | Add all items to array |
| `sort(array)` | Sort array in place |
| `sort(array, key)` | Sort array by key function |
| `reverse(array)` | Reverse array in place |
| `search(array, val)` | Index of val in array (-1 if not found) |
| `remove(array, index)` | Remove element at index |
| `join(array, sep)` | Join array into string |
| `abs(n)` | Absolute value |
| `min(a, b)` | Minimum of two values |
| `max(a, b)` | Maximum of two values |
| `floor(n)` | Floor |
| `ceil(n)` | Ceiling |
| `round(n)` | Round |
| `sqrt(n)` | Square root |
| `pow(base, exp)` | Power |
| `cos(n)` / `sin(n)` / `tan(n)` | Trigonometry |
| `rand()` | Random float 0-1 |
| `randFloat(min, max)` | Random float in range |
| `randInt(min, max)` | Random integer in range |
| `string(val)` | Convert to string |
| `number(val)` | Convert to number |
| `charAt(str, i)` | Character at index |
| `length(str)` | String length |
| `substring(str, start, len)` | Substring |
| `indexOf(str, search)` | Index of substring |
| `replace(str, old, new)` | Replace in string |
| `split(str, sep)` | Split string |
| `toLower(str)` | To lowercase |
| `toUpper(str)` | To uppercase |

### Key Constants (from FightConstants.java — see vendor/leek-wars-generator/)
```leekscript
// Cells
CELL_EMPTY, CELL_PLAYER, CELL_ENTITY, CELL_OBSTACLE

// Entity types
ENTITY_LEEK, ENTITY_BULB, ENTITY_TURRET, ENTITY_CHEST, ENTITY_MOB

// Bulb types
BULB_PUNY, BULB_FIRE, BULB_HEALER, BULB_ROCKY, BULB_ICED,
BULB_LIGHTNING, BULB_METALLIC, BULB_WIZARD, BULB_TACTICIAN, BULB_SAVANT

// Effects (73+ total — most common listed)
EFFECT_DAMAGE, EFFECT_HEAL, EFFECT_BUFF_STRENGTH, EFFECT_BUFF_AGILITY,
EFFECT_BUFF_WISDOM, EFFECT_BUFF_RESISTANCE, EFFECT_BUFF_MP, EFFECT_BUFF_TP,
EFFECT_POISON, EFFECT_SUMMON, EFFECT_SHACKLE_MP, EFFECT_SHACKLE_TP,
EFFECT_SHACKLE_STRENGTH, EFFECT_SHACKLE_MAGIC, EFFECT_SHACKLE_AGILITY,
EFFECT_SHACKLE_WISDOM, EFFECT_ABSOLUTE_SHIELD, EFFECT_RELATIVE_SHIELD,
EFFECT_TELEPORT, EFFECT_ANTIDOTE, EFFECT_KILL, EFFECT_RESURRECT,
EFFECT_DAMAGE_RETURN, EFFECT_VULNERABILITY, EFFECT_DEBUFF, EFFECT_INVERT,
EFFECT_AFTEREFFECT, EFFECT_LIFE_DAMAGE, EFFECT_NOVA_DAMAGE, EFFECT_PUSH,
EFFECT_ATTRACT, EFFECT_REPEL, EFFECT_STEAL_LIFE, EFFECT_ADD_STATE ...

// States
STATE_UNHEALABLE, STATE_INVINCIBLE

// Use results
USE_CRITICAL, USE_SUCCESS, USE_FAILED, USE_INVALID_TARGET,
USE_NOT_ENOUGH_TP, USE_INVALID_COOLDOWN, USE_INVALID_POSITION,
USE_TOO_MANY_SUMMONS, USE_RESURRECT_INVALID_ENTITY, USE_MAX_USES

// Weapons (38 total)
WEAPON_PISTOL, WEAPON_MACHINE_GUN, WEAPON_DOUBLE_GUN, WEAPON_SHOTGUN,
WEAPON_MAGNUM, WEAPON_LASER, WEAPON_GRENADE_LAUNCHER, WEAPON_FLAME_THROWER,
WEAPON_DESTROYER, WEAPON_GAZOR, WEAPON_ELECTRISOR, WEAPON_M_LASER,
WEAPON_B_LASER, WEAPON_KATANA, WEAPON_BROADSWORD, WEAPON_AXE,
WEAPON_J_LASER, WEAPON_RIFLE, WEAPON_RHINO, WEAPON_EXPLORER_RIFLE,
WEAPON_LIGHTNINGER, WEAPON_PROTON_CANON, WEAPON_NEUTRINO, WEAPON_TASER,
WEAPON_BAZOOKA, WEAPON_DARK_KATANA, WEAPON_SWORD, WEAPON_HEAVY_SWORD,
WEAPON_ODACHI, WEAPON_EXCALIBUR, WEAPON_SCYTHE, WEAPON_QUANTUM_RIFLE ...

// Chips (110 total — see FightConstants.java for full list)
CHIP_BANDAGE, CHIP_CURE, CHIP_DRIP, CHIP_REGENERATION, CHIP_VACCINE,
CHIP_SHOCK, CHIP_FLASH, CHIP_LIGHTNING, CHIP_SPARK, CHIP_FLAME,
CHIP_METEORITE, CHIP_ROCK, CHIP_ROCKFALL, CHIP_ICE, CHIP_STALACTITE,
CHIP_ICEBERG, CHIP_SHIELD, CHIP_HELMET, CHIP_ARMOR, CHIP_WALL,
CHIP_RAMPART, CHIP_FORTRESS, CHIP_PROTEIN, CHIP_STEROID, CHIP_DOPING,
CHIP_LEATHER_BOOTS, CHIP_WINGED_BOOTS, CHIP_SEVEN_LEAGUE_BOOTS,
CHIP_MOTIVATION, CHIP_ADRENALINE, CHIP_RAGE, CHIP_TELEPORTATION,
CHIP_INVERSION, CHIP_RESURRECTION, CHIP_ANTIDOTE, CHIP_PUNY_BULB,
CHIP_FIRE_BULB, CHIP_HEALER_BULB, CHIP_ROCKY_BULB ...

// Areas
AREA_POINT, AREA_LASER_LINE, AREA_CIRCLE_1, AREA_CIRCLE_2, AREA_CIRCLE_3,
AREA_PLUS_1, AREA_PLUS_2, AREA_PLUS_3, AREA_X_1, AREA_X_2, AREA_X_3,
AREA_SQUARE_1, AREA_SQUARE_2, AREA_FIRST_INLINE, AREA_ENEMIES, AREA_ALLIES

// Launch types
LAUNCH_TYPE_LINE, LAUNCH_TYPE_DIAGONAL, LAUNCH_TYPE_STAR,
LAUNCH_TYPE_CIRCLE, LAUNCH_TYPE_STAR_INVERTED ...

// Messages (for sendTo/sendAll)
MESSAGE_HEAL, MESSAGE_ATTACK, MESSAGE_DEBUFF, MESSAGE_SHIELD,
MESSAGE_BUFF_MP, MESSAGE_BUFF_TP, MESSAGE_BUFF_STRENGTH,
MESSAGE_BUFF_AGILITY, MESSAGE_MOVE_TOWARD, MESSAGE_MOVE_AWAY,
MESSAGE_MOVE_TOWARD_CELL, MESSAGE_MOVE_AWAY_CELL, MESSAGE_CUSTOM

// Maps
MAP_NEXUS, MAP_FACTORY, MAP_DESERT, MAP_FOREST, MAP_GLACIER,
MAP_BEACH, MAP_TEMPLE, MAP_TEIEN, MAP_CASTLE, MAP_CEMETERY

// Fight types
FIGHT_TYPE_SOLO, FIGHT_TYPE_FARMER, FIGHT_TYPE_TEAM,
FIGHT_TYPE_BATTLE_ROYALE, FIGHT_TYPE_BOSS

// Fight contexts
FIGHT_CONTEXT_TEST, FIGHT_CONTEXT_GARDEN, FIGHT_CONTEXT_CHALLENGE,
FIGHT_CONTEXT_TOURNAMENT, FIGHT_CONTEXT_BATTLE_ROYALE

// Stats (for getStat())
STAT_LIFE, STAT_TP, STAT_MP, STAT_STRENGTH, STAT_AGILITY,
STAT_FREQUENCY, STAT_WISDOM, STAT_RESISTANCE, STAT_SCIENCE,
STAT_MAGIC, STAT_POWER, STAT_DAMAGE_RETURN, STAT_CORES, STAT_RAM

// Misc
MAX_TURNS, SUMMON_LIMIT, CRITICAL_FACTOR
```

## Common AI Patterns

### Basic Fighter
```leekscript
// Simple aggressive AI - move toward nearest enemy and attack
var enemy = getNearestEnemy()
if (enemy != null) {
    moveToward(enemy)
    useWeapon(enemy)
}
```

### Kiter (Ranged)
```leekscript
// Keep distance and attack from range
var enemy = getNearestEnemy()
if (enemy != null) {
    var dist = getCellDistance(getCell(), getCell(enemy))
    var range = getWeaponMaxRange(getWeapon())

    if (dist < range) {
        moveAwayFrom(enemy)
    } else if (dist > range) {
        moveToward(enemy)
    }

    if (canUseWeapon(getWeapon(), enemy)) {
        useWeapon(enemy)
    }
}
```

### Healer Support
```leekscript
// Heal most hurt ally, attack if no healing needed
var healChip = CHIP_CURE

// Find most hurt ally (no built-in function for this)
var weakestAlly = null
var minRatio = 1.0
for (var ally in getAliveAllies()) {
    var ratio = getLife(ally) / getTotalLife(ally)
    if (ratio < minRatio) {
        minRatio = ratio
        weakestAlly = ally
    }
}

if (weakestAlly != null and minRatio < 0.7) {
    moveToward(weakestAlly)
    if (canUseChip(healChip, weakestAlly)) {
        useChip(healChip, weakestAlly)
    }
} else {
    var enemy = getNearestEnemy()
    if (enemy != null) {
        moveToward(enemy)
        useWeapon(enemy)
    }
}
```

### Smart Target Selection
```leekscript
// Select best target based on multiple criteria
function getBestTarget() {
    var enemies = getAliveEnemies()
    var best = null
    var bestScore = -1

    for (var enemy in enemies) {
        var score = 0
        var dist = getCellDistance(getCell(), getCell(enemy))
        var life = getLife(enemy)
        var totalLife = getTotalLife(enemy)

        // Prefer low HP targets
        score += (1 - life / totalLife) * 50

        // Prefer closer targets
        score += max(0, 20 - dist) * 2

        // Prefer targets we can actually hit
        if (canUseWeapon(getWeapon(), enemy)) {
            score += 30
        }

        if (score > bestScore) {
            bestScore = score
            best = enemy
        }
    }
    return best
}
```

### State Machine with Global Variables
```leekscript
// Use global variables to maintain state across turns
global state = "AGGRESSIVE"
global lowHpThreshold = 0.3

var myLife = getLife() / getTotalLife()

// State transitions
if (myLife < lowHpThreshold and state == "AGGRESSIVE") {
    state = "DEFENSIVE"
} else if (myLife > 0.7 and state == "DEFENSIVE") {
    state = "AGGRESSIVE"
}

var enemy = getNearestEnemy()

if (state == "AGGRESSIVE") {
    if (enemy != null) {
        moveToward(enemy)
        useWeapon(enemy)
    }
} else if (state == "DEFENSIVE") {
    // Use shields and heal, maintain distance
    useChip(CHIP_SHIELD, getEntity())
    if (enemy != null) {
        moveAwayFrom(enemy)
        if (canUseWeapon(getWeapon(), enemy)) {
            useWeapon(enemy)
        }
    }
}
```

## Best Practices

1. **TP Management**: Always check `getTP()` before actions. Don't waste TP on actions that will fail.
2. **MP Management**: Use `moveToward(entity, maxMP)` to control movement precisely.
3. **Global Variables**: Use `global` for state that must persist between turns (strategy state, target tracking).
4. **Operations Limit**: Stay under 20M operations. Avoid deep recursion and O(n^3) loops.
5. **Line of Sight**: Check `lineOfSight()` before ranged attacks. Position around obstacles.
6. **Cooldowns**: Track chip cooldowns with `getChipCooldown()` before attempting to use chips.
7. **Summons**: Factor summoned entities into targeting logic (`isSummon()`).
8. **Team Play**: In team fights, coordinate roles (tank, healer, DPS) using ally information.
9. **Debug**: Use `debug()` liberally during development, remove for production to save operations.
10. **Weapon Switching**: `setWeapon()` costs 1 TP - only switch when beneficial.

## LeekWars REST API

The LeekWars platform provides a REST API at `https://leekwars.com/api/`:

### Authentication
- `POST /api/farmer/login` - Login with `login` + `password`, returns auth token
- `POST /api/farmer/login-token` - Login with token

### AI Management
- `GET /api/ai/get/{id}` - Get AI source code and metadata
- `POST /api/ai/save` - Save AI code (params: `ai_id`, `code`)
- `GET /api/ai/get-farmer-ais` - List all your AIs
- `POST /api/ai/new` - Create new AI
- `POST /api/ai/delete` - Delete an AI
- `POST /api/ai/rename` - Rename an AI
- `POST /api/ai/test` - Test an AI

### Leek Management
- `GET /api/leek/get/{id}` - Get leek info (stats, equipment, level)
- `POST /api/leek/set-ai` - Assign AI to leek

### Fights
- `POST /api/fight/start-solo-fight` - Start a solo fight
- `POST /api/fight/start-farmer-fight` - Start a farmer fight
- `POST /api/fight/start-team-fight` - Start a team fight
- `GET /api/fight/get/{id}` - Get fight details and replay data

### Garden (Matchmaking)
- `GET /api/garden/get` - Get available opponents
- `GET /api/garden/get-composition-opponents/{id}` - Get team opponents

### Rankings
- `GET /api/ranking/get/{type}/{order}` - Get rankings

### File Extensions
LeekScript files use `.lk`, `.leek`, `.ls`, `.lks`, or `.leekscript` extensions.

## When Writing LeekScript Code

1. Always write syntactically valid LeekScript (not JavaScript - note: `and`/`or` keywords, `\` is integer division not filter, use `arrayMap()`/`arrayFilter()` for functional ops)
2. Use `global` for persistent state, `var` for turn-local variables. Do NOT use `let`/`const`.
3. Consider TP/MP budget constraints in every decision
4. Structure code as: **observe -> decide -> act** each turn
5. Handle edge cases: dead enemies, empty arrays, null returns from targeting functions
6. Test with `debug()` before removing debug statements for production
