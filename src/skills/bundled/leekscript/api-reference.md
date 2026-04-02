# LeekScript API Reference

## Language Syntax

### Variable Declarations
```leekscript
var x = 10              // mutable, turn-local
global state = "IDLE"   // persists across turns
```

### Data Types
- Number (int/float), String, Boolean, Array, Map, null, Function

### Operators
- Arithmetic: `+ - * / % **`
- Comparison: `== != < > <= >= === !==`
- Logical: `and or not ! && ||`
- Functional: `~~` (map), `\` (filter), `->` (lambda)
- Type: `is`, `instanceof`
- Ternary: `condition ? a : b`

### Control Flow
```leekscript
if (cond) { } else if (cond) { } else { }
for (var i = 0; i < n; i++) { }
for (var elem in array) { }
for (var key : value in map) { }
while (cond) { }
do { } while (cond)
```

### Functions & Lambdas
```leekscript
function name(a, b) { return a + b }
var fn = x -> x ** 2
var mapped = [1,2,3] ~~ x -> x * 2    // [2,4,6]
var filtered = [1,2,3,4] \ x -> x > 2  // [3,4]
```

### Classes
```leekscript
class MyClass {
    var field
    constructor(val) { this.field = val }
    function method() { return this.field }
}
```

## Movement Functions
| Function | Params | Returns | Description |
|----------|--------|---------|-------------|
| moveToward | (entity) or (entity, maxMP) | cells moved | Move toward entity |
| moveAwayFrom | (entity) or (entity, maxMP) | cells moved | Move away from entity |
| moveTowardCell | (cell) or (cell, maxMP) | cells moved | Move toward cell |
| moveAwayFromCell | (cell) or (cell, maxMP) | cells moved | Move away from cell |
| forward | (steps) | null | Move forward |
| backward | (steps) | null | Move backward |

## Combat Functions
| Function | Params | Returns | Description |
|----------|--------|---------|-------------|
| useWeapon | (entity) | USE_* constant | Attack with equipped weapon |
| useWeaponOnCell | (cell) | USE_* constant | Attack cell with weapon |
| useChip | (chip, entity) | USE_* constant | Use chip on entity |
| useChipOnCell | (chip, cell) | USE_* constant | Use chip on cell |
| setWeapon | (weapon) | null | Equip weapon (1 TP cost) |

## Entity Info (self or pass entity ID)
| Function | Description |
|----------|-------------|
| getLife([entity]) | Current HP |
| getTotalLife([entity]) | Maximum HP |
| getTP([entity]) | Current turn points |
| getMP([entity]) | Current movement points |
| getCell([entity]) | Cell position |
| getLevel([entity]) | Level |
| getName([entity]) | Name |
| getStrength([entity]) | Strength stat |
| getAgility([entity]) | Agility stat |
| getWisdom([entity]) | Wisdom stat |
| getResistance([entity]) | Resistance stat |
| getMagic([entity]) | Magic stat |
| getScience([entity]) | Science stat |
| getFrequency([entity]) | Frequency stat |
| getAbsoluteShield([entity]) | Absolute shield |
| getRelativeShield([entity]) | Relative shield % |

## Targeting Functions
| Function | Returns | Description |
|----------|---------|-------------|
| getEnemies() | array | All enemy IDs |
| getAllies() | array | All ally IDs (incl. self) |
| getAliveEnemies() | array | Alive enemy IDs |
| getAliveAllies() | array | Alive ally IDs |
| getDeadEnemies() | array | Dead enemy IDs |
| getDeadAllies() | array | Dead ally IDs |
| getNearestEnemy() | entity/null | Nearest enemy |
| getNearestAlly() | entity/null | Nearest ally |
| getFarthestEnemy() | entity/null | Farthest enemy |
| getFarthestAlly() | entity/null | Farthest ally |
| getWeakestEnemy() | entity/null | Lowest HP enemy |
| getStrongestEnemy() | entity/null | Highest HP enemy |
| getWeakestAlly() | entity/null | Lowest HP ally |
| getLeekOnCell(cell) | entity/null | Entity on cell |
| getEntityOnCell(cell) | entity/null | Entity on cell |
| isEnemy(entity) | boolean | Is enemy? |
| isAlly(entity) | boolean | Is ally? |
| isDead(entity) | boolean | Is dead? |
| isAlive(entity) | boolean | Is alive? |

## Map & Cell Functions
| Function | Returns | Description |
|----------|---------|-------------|
| getCellDistance(c1, c2) | number | Manhattan distance |
| getDistance(c1, c2) | number | Euclidean distance |
| getPathLength(c1, c2) | number | Walkable path length |
| getPath(c1, c2) | array | Path cells array |
| lineOfSight(c1, c2) | boolean | Line of sight check |
| isObstacle(cell) | boolean | Is cell an obstacle? |
| getObstacles() | array | All obstacle cells |
| getMapType() | number | Map type constant |
| getCellX(cell) | number | X coordinate |
| getCellY(cell) | number | Y coordinate |
| getCellFromXY(x, y) | cell | Cell from coordinates |

## Weapon & Chip Info
| Function | Returns | Description |
|----------|---------|-------------|
| getWeapon() | weapon | Equipped weapon ID |
| getWeapons() | array | Owned weapon IDs |
| getChips() | array | Owned chip IDs |
| getWeaponCost(w) | number | TP cost |
| getChipCost(c) | number | TP cost |
| getWeaponMinRange(w) | number | Min range |
| getWeaponMaxRange(w) | number | Max range |
| getChipMinRange(c) | number | Min range |
| getChipMaxRange(c) | number | Max range |
| getWeaponEffects(w) | array | Effect list |
| getChipEffects(c) | array | Effect list |
| canUseWeapon(w, entity) | boolean | Can hit entity? |
| canUseWeaponOnCell(w, cell) | boolean | Can hit cell? |
| canUseChip(c, entity) | boolean | Can hit entity? |
| canUseChipOnCell(c, cell) | boolean | Can hit cell? |
| getChipCooldown(c) | number | Turns remaining |

## Effects & Summons
| Function | Returns | Description |
|----------|---------|-------------|
| getEffects([entity]) | array | Active effects |
| getLaunchedEffects() | array | Effects you launched |
| summon(chip, cell, ai) | entity | Summon entity |
| getSummons([entity]) | array | Summon IDs |
| isSummon([entity]) | boolean | Is a summon? |
| getSummoner([entity]) | entity | Who summoned? |

## Communication & Debug
| Function | Description |
|----------|-------------|
| say(msg) | Chat bubble |
| mark(cell, color) | Mark cell |
| markText(cell, text, color) | Mark with text |
| debug(val) | Debug log |
| debugW(val) | Warning log |
| debugE(val) | Error log |
| debugC(val, color) | Colored log |

## Utility Functions
| Function | Description |
|----------|-------------|
| getTurn() | Current turn number |
| getEntity() | Your entity ID |
| count(arr) | Array length |
| contains(arr, v) | Array contains? |
| push(arr, v) | Add to array |
| pushAll(arr, items) | Add all to array |
| pop(arr) | Remove last |
| sort(arr, [key]) | Sort array |
| reverse(arr) | Reverse array |
| search(arr, v) | Find index |
| remove(arr, i) | Remove at index |
| join(arr, sep) | Join to string |
| abs(n), min(a,b), max(a,b) | Math |
| floor(n), ceil(n), round(n) | Rounding |
| sqrt(n), pow(b,e) | Powers |
| cos(n), sin(n), tan(n) | Trig |
| random() | Float 0-1 |
| randInt(min, max) | Random int |
| string(v), number(v) | Conversion |
| charAt(s, i) | Char at index |
| length(s) | String length |
| substring(s, start, len) | Substring |
| indexOf(s, search) | Find in string |
| replace(s, old, new) | Replace |
| split(s, sep) | Split string |
| toLower(s), toUpper(s) | Case change |

## Key Constants
- Weapons: `WEAPON_PISTOL`, `WEAPON_MACHINE_GUN`, `WEAPON_SHOTGUN`, `WEAPON_MAGNUM`, `WEAPON_LASER`, `WEAPON_GRENADE_LAUNCHER`, `WEAPON_FLAME_THROWER`, `WEAPON_DESTROYER`, `WEAPON_ELECTRISOR`, `WEAPON_M_LASER`, `WEAPON_B_LASER`, `WEAPON_KATANA`, `WEAPON_BROADSWORD`, `WEAPON_RIFLE`, `WEAPON_GAZOR`, `WEAPON_NEUTRINO`, `WEAPON_GRAVITON`, `WEAPON_ENIGMA`
- Effects: `EFFECT_DAMAGE`, `EFFECT_HEAL`, `EFFECT_BUFF_STRENGTH`, `EFFECT_BUFF_AGILITY`, `EFFECT_BUFF_WISDOM`, `EFFECT_BUFF_RESISTANCE`, `EFFECT_BUFF_MP`, `EFFECT_BUFF_TP`, `EFFECT_POISON`, `EFFECT_SHACKLE_MP`, `EFFECT_SHACKLE_TP`, `EFFECT_ABSOLUTE_SHIELD`, `EFFECT_RELATIVE_SHIELD`, `EFFECT_TELEPORT`, `EFFECT_SUMMON`
- Colors: `COLOR_RED`, `COLOR_GREEN`, `COLOR_BLUE`, `COLOR_WHITE`, `COLOR_BLACK`
- Cells: `CELL_EMPTY`, `CELL_OBSTACLE`, `CELL_PLAYER`
- Use results: `USE_SUCCESS`, `USE_FAILED`, `USE_INVALID_POSITION`, `USE_NOT_ENOUGH_TP`
