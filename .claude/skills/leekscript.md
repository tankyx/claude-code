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
let y = 20           // constant (cannot be reassigned)
const z = 30         // constant, accessible everywhere
var name = "Leek"    // string
var arr = [1, 2, 3]  // array
var map = ["a": 1, "b": 2]  // map (associative array)
global myGlobal = 0  // persists across turns
```

### Data Types
- **Number**: integers and floats (`42`, `3.14`)
- **String**: text (`"hello"`, `'world'`)
- **Boolean**: `true`, `false`
- **Array**: ordered list (`[1, 2, 3]`)
- **Map**: key-value pairs (`["key": value]`)
- **null**: absence of value
- **Function**: first-class functions

### Operators
```leekscript
// Arithmetic: + - * / % ** ++ --
// Comparison: == != < > <= >= === !==
// Logical: and or not xor ! && ||
// Bitwise: & | ^ ~ << >>
// String: + (concatenation)
// Functional: ~~ (map), \ (filter), -> (lambda), ~ (pipe)
// Type: is, instanceof
// Swap: <=> (swap two variables)
// Null coalescing: ??
// Ternary: condition ? a : b
// Absolute/length: |expr| (e.g., |-5| or |array|)
// Membership: x in array
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

// Functional operators
var doubled = [1, 2, 3] ~~ x -> x * 2       // map: [2, 4, 6]
var evens = [1, 2, 3, 4] \ x -> x % 2 == 0  // filter: [2, 4]
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
- `var` for mutable, `let`/`const` for constants, `global` for cross-turn persistence
- The `~~` operator maps a function over an array
- The `\` operator filters an array
- The `~` operator pipes a value into a function: `3 ~ x -> x ** x`
- `->` creates lambda functions
- `<=>` swaps two variables: `a <=> b`
- `??` null coalescing: `value ?? default`
- `getOperations()` returns current operations count (budget is ~20M per turn)
- `include('name')` imports shared AI scripts
- Parentheses in `if`/`while`/`for` are optional
- Array comprehension: `[for var i = 0; i < 5; ++i { i }]`

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
| `forward(steps)` | Move forward by steps cells |
| `backward(steps)` | Move backward by steps cells |

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
| `getWeakestEnemy()` | ID of enemy with lowest HP |
| `getStrongestEnemy()` | ID of enemy with highest HP |
| `getWeakestAlly()` | ID of ally with lowest HP |
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

### Communication & Debug
| Function | Description |
|----------|-------------|
| `say(message)` | Display message in chat bubble |
| `mark(cell, color)` | Mark a cell with a color |
| `markText(cell, text, color)` | Mark cell with text and color |
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
| `contains(array, val)` | True if array contains val |
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
| `random()` | Random float 0-1 |
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

### Key Constants
```leekscript
// Colors
COLOR_RED, COLOR_GREEN, COLOR_BLUE, COLOR_WHITE, COLOR_BLACK

// Effect types
EFFECT_DAMAGE, EFFECT_HEAL, EFFECT_BUFF_STRENGTH, EFFECT_BUFF_AGILITY,
EFFECT_BUFF_WISDOM, EFFECT_BUFF_RESISTANCE, EFFECT_BUFF_MP, EFFECT_BUFF_TP,
EFFECT_POISON, EFFECT_SHACKLE_MP, EFFECT_SHACKLE_TP, EFFECT_SHACKLE_STRENGTH,
EFFECT_ABSOLUTE_SHIELD, EFFECT_RELATIVE_SHIELD, EFFECT_TELEPORT,
EFFECT_ANTIDOTE, EFFECT_SUMMON

// Cell content types
CELL_EMPTY, CELL_OBSTACLE, CELL_PLAYER

// Weapon IDs: WEAPON_PISTOL, WEAPON_MACHINE_GUN, WEAPON_SHOTGUN,
// WEAPON_MAGNUM, WEAPON_LASER, WEAPON_GRENADE_LAUNCHER,
// WEAPON_FLAME_THROWER, WEAPON_DESTROYER, WEAPON_ELECTRISOR,
// WEAPON_M_LASER, WEAPON_B_LASER, WEAPON_KATANA, WEAPON_BROADSWORD,
// WEAPON_RIFLE, WEAPON_GAZOR, WEAPON_NEUTRINO, WEAPON_GRAVITON,
// WEAPON_ENIGMA

// Chip IDs: CHIP_SPARK, CHIP_CURE, CHIP_SHIELD, CHIP_HELMET,
// CHIP_FLASH, CHIP_PROTEIN, CHIP_MOTIVATION, CHIP_ADRENALINE,
// CHIP_WALL, CHIP_RAMPART, CHIP_FORTRESS, CHIP_LEATHER_BOOTS,
// CHIP_REGENERATION, CHIP_STALACTITE, CHIP_ICEBERG, CHIP_METEORITE,
// CHIP_ROCK, CHIP_ROCKFALL, CHIP_EARTHQUAKE, ...
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
// Heal weakest ally, attack if no healing needed
var weakestAlly = getWeakestAlly()
var healChip = CHIP_CURE

if (weakestAlly != null and getLife(weakestAlly) < getTotalLife(weakestAlly) * 0.7) {
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
LeekScript files use `.lk` or `.leekscript` extensions.

## When Writing LeekScript Code

1. Always write syntactically valid LeekScript (not JavaScript - note differences like `and`/`or` keywords, `~~` map operator, `\` filter operator)
2. Use `global` for persistent state, `var` for turn-local variables
3. Consider TP/MP budget constraints in every decision
4. Structure code as: **observe -> decide -> act** each turn
5. Handle edge cases: dead enemies, empty arrays, null returns from targeting functions
6. Test with `debug()` before removing debug statements for production
