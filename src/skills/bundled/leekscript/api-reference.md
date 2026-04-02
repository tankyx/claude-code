# LeekScript API Reference

> **Source of truth**: `vendor/leek-wars-generator/src/main/java/com/leekwars/generator/FightFunctions.java`
> and `vendor/leek-wars-generator/src/main/java/com/leekwars/generator/FightConstants.java`
>
> This file is generated from the actual game engine source code.

## Language Syntax

### Variable Declarations
```leekscript
var x = 10              // mutable, turn-local
global state = "IDLE"   // persists across turns
// Note: let/const are reserved keywords but NOT implemented. Do not use them.
```

### Data Types
- integer, real (float), string, boolean, null
- Array, Map, Set, Interval, Function, Object, Class

### Operators
- Arithmetic: `+` `-` `*` `/` `\` (integer division) `%` `**` (power) `++` `--`
- Comparison: `==` `!=` `<` `>` `<=` `>=` `===` `!==`
- Logical: `and` `or` `not` `xor` `&&` `||` `!`
- Bitwise: `&` `|` `^` `~` (bitwise NOT) `<<` `>>` `>>>`
- Null coalescing: `??` `??=`
- Range: `..` (e.g. `1..10` creates an Interval)
- Membership: `in` `not in`
- Type: `instanceof` `is` (alias for `==`) `as` (cast)
- Ternary: `condition ? a : b`
- Assignment: `=` `+=` `-=` `*=` `/=` `\=` `%=` `**=` `&=` `|=` `^=` `<<=` `>>=` `>>>=`
- **Note**: `~~` (map), `<=>` (swap) DO NOT EXIST. Use `arrayMap()` / `arrayFilter()` instead.

### Functions & Lambdas
```leekscript
function name(a, b) { return a + b }
var fn = x -> x ** 2
var add = (x, y) -> x + y
```

### Functional Array Operations
```leekscript
var doubled = arrayMap([1,2,3], x -> x * 2)       // [2,4,6]
var evens = arrayFilter([1,2,3,4], x -> x % 2 == 0) // [2,4]
var sum = arrayFoldLeft([1,2,3], (acc, x) -> acc + x, 0) // 6
```

### Control Flow
```leekscript
if (cond) { } else if (cond) { } else { }
for (var i = 0; i < n; i++) { }
for (var elem in array) { }
for (var key : value in map) { }
while (cond) { }
do { } while (cond)
break   // break N to break out of N loops
continue
```

### Classes
```leekscript
class MyClass {
    var field
    constructor(val) { this.field = val }
    method doSomething() { return this.field }
}
```

### Modules
```leekscript
include('other_ai_name')  // import shared AI script
```

---

## Entity Functions (60)
| Function | Returns | Description |
|----------|---------|-------------|
| `getLife([entity])` | int | Current HP |
| `getTotalLife([entity])` | int | Maximum HP |
| `getTP([entity])` | int | Current turn points |
| `getMP([entity])` | int | Current movement points |
| `getTotalTP([entity])` | int | Maximum turn points |
| `getTotalMP([entity])` | int | Maximum movement points |
| `getCell([entity])` | int|null | Cell position |
| `getLevel([entity])` | int | Level |
| `getName([entity])` | string | Name |
| `getStrength([entity])` | int | Strength stat |
| `getForce([entity])` | int | Strength stat (alias) |
| `getAgility([entity])` | int | Agility stat |
| `getWisdom([entity])` | int | Wisdom stat |
| `getResistance([entity])` | int | Resistance stat |
| `getMagic([entity])` | int | Magic stat |
| `getScience([entity])` | int | Science stat |
| `getFrequency([entity])` | int | Frequency stat |
| `getPower([entity])` | int | Power stat |
| `getAbsoluteShield([entity])` | int | Absolute shield |
| `getRelativeShield([entity])` | int | Relative shield % |
| `getDamageReturn([entity])` | int | Damage return stat |
| `getCores([entity])` | int | Cores stat |
| `getRAM([entity])` | int | RAM stat |
| `getStat([entity,] stat)` | int | Get specific stat by STAT_* constant |
| `getWeapon([entity])` | int|null | Equipped weapon ID |
| `getWeapons([entity])` | int[] | All owned weapon IDs |
| `getChips([entity])` | int[] | All owned chip IDs |
| `getEntity()` | int | Your own entity ID |
| `getLeek()` | int | Your entity ID (legacy, use getEntity) |
| `getLeekID([entity])` | int | Leek ID |
| `getTeamID([entity])` | int | Team ID |
| `getTeamName([entity])` | string | Team name |
| `getFarmerID([entity])` | int | Farmer ID |
| `getFarmerName([entity])` | string | Farmer name |
| `getFarmerCountry([entity])` | string | Farmer country |
| `getAIName([entity])` | string | AI script name |
| `getAIID([entity])` | int | AI script ID |
| `getSide([entity])` | int | Side/team number |
| `getType([entity])` | int | Entity type (ENTITY_* constant) |
| `getBirthTurn([entity])` | int | Turn entity was born/summoned |
| `getEntityTurnOrder([entity])` | int | Position in turn order |
| `isEnemy(entity)` | bool | Is entity an enemy? |
| `isAlly(entity)` | bool | Is entity an ally? |
| `isAlive(entity)` | bool | Is entity alive? |
| `isDead(entity)` | bool | Is entity dead? |
| `isSummon([entity])` | bool | Is entity a summon? |
| `isStatic([entity])` | bool | Is entity static? |
| `getSummoner([entity])` | int | Entity that summoned this one |
| `getSummons([entity])` | int[] | Array of summon IDs |
| `getBulbType([entity])` | int | Bulb type constant |
| `getMobType([entity])` | int | Mob type constant |
| `getEffects([entity])` | array | Active effects on entity |
| `getLaunchedEffects([entity])` | array | Effects launched by entity |
| `getPassiveEffects([entity])` | array | Passive effects on entity |
| `getStates([entity])` | set | Active states (e.g. INVINCIBLE) |
| `getItemUses(item)` | int | Number of uses of item this turn |
| `setWeapon(weapon)` | bool | Equip weapon (costs 1 TP) |
| `say(message)` | bool | Display chat bubble |
| `listen()` | array | Listen for ally messages |
| `lama()` | void | Easter egg |

## Weapon Functions (22)
| Function | Returns | Description |
|----------|---------|-------------|
| `useWeapon(entity)` | int | Attack entity with equipped weapon (USE_* result) |
| `useWeaponOnCell(cell)` | int | Attack cell with equipped weapon |
| `canUseWeapon([weapon,] entity)` | bool | Can weapon hit entity from current position? |
| `canUseWeaponOnCell([weapon,] cell)` | bool | Can weapon hit cell? |
| `getWeaponCost([weapon])` | int | TP cost |
| `getWeaponMinRange([weapon])` | int | Minimum range |
| `getWeaponMaxRange([weapon])` | int | Maximum range |
| `getWeaponEffects([weapon])` | array | Effect list |
| `getWeaponPassiveEffects([weapon])` | array | Passive effect list |
| `getWeaponName([weapon])` | string | Weapon name |
| `getWeaponLaunchType([weapon])` | int | Launch type (LAUNCH_TYPE_* constant) |
| `getWeaponArea(weapon)` | int | Area type (AREA_* constant) |
| `getWeaponEffectiveArea(weapon, cell, [from])` | int[] | Cells in effective area |
| `getWeaponTargets(weapon, [cell])` | int[] | Entities targeted by weapon |
| `getWeaponFailure([weapon])` | int | Failure rate |
| `getWeaponMaxUses([weapon])` | int | Max uses per turn |
| `weaponNeedLos([weapon])` | bool | Does weapon need line of sight? |
| `isInlineWeapon([weapon])` | bool | Is weapon inline? |
| `isWeapon(id)` | bool | Is ID a weapon? |
| `getAllWeapons()` | int[] | All weapon IDs in game |

## Chip Functions (26)
| Function | Returns | Description |
|----------|---------|-------------|
| `useChip(chip, [entity])` | int | Use chip (self-target if 1 param) (USE_* result) |
| `useChipOnCell(chip, cell)` | int | Use chip on cell |
| `canUseChip(chip, entity)` | bool | Can chip hit entity? |
| `canUseChipOnCell(chip, cell)` | bool | Can chip hit cell? |
| `getChipCost(chip)` | int | TP cost |
| `getChipMinRange(chip)` | int | Minimum range |
| `getChipMaxRange(chip)` | int | Maximum range |
| `getChipEffects(chip)` | array | Effect list |
| `getChipName(chip)` | string | Chip name |
| `getChipLaunchType(chip)` | int | Launch type constant |
| `getChipArea(chip)` | int | Area type constant |
| `getChipEffectiveArea(chip, cell, [from])` | int[] | Cells in effective area |
| `getChipTargets(chip, cell)` | int[] | Entities targeted |
| `getChipFailure(chip)` | int | Failure rate |
| `getChipCooldown(chip)` | int | Base cooldown turns |
| `getCooldown(chip, [entity])` | int | Remaining cooldown for entity |
| `getChipMaxUses(chip)` | int | Max uses per turn |
| `chipNeedLos(chip)` | bool | Needs line of sight? |
| `isInlineChip(chip)` | bool | Is chip inline? |
| `isChip(id)` | bool | Is ID a chip? |
| `getAllChips()` | int[] | All chip IDs in game |
| `resurrect(chip, entity)` | int | Resurrect dead entity |
| `summon(chip, cell, ai, [name])` | int | Summon entity (optional name) |

## Field / Map Functions (18)
| Function | Returns | Description |
|----------|---------|-------------|
| `getCellDistance(c1, c2)` | int | Manhattan distance |
| `getDistance(c1, c2)` | real | Euclidean distance |
| `getPathLength(c1, c2, [ignored])` | int|null | Walkable path length (optional ignored cells array) |
| `getPath(c1, c2, [ignored])` | int[]|null | Path cells (optional ignored cells array) |
| `lineOfSight(c1, c2, [ignored])` | bool|null | LoS check (ignored: array of entity IDs or single ID) |
| `getCellContent(cell)` | int | Content type (CELL_* constant) |
| `isEmptyCell(cell)` | bool | Is cell empty? |
| `isObstacle(cell)` | bool | Is cell an obstacle? |
| `isEntity(cell)` | bool | Is there an entity on cell? |
| `isOnSameLine(c1, c2)` | bool | Are cells on same line? |
| `getEntityOnCell(cell)` | int | Entity on cell (0 if empty) |
| `getLeekOnCell(cell)` | int | Legacy alias for getEntityOnCell |
| `getCellX(cell)` | int|null | X coordinate |
| `getCellY(cell)` | int|null | Y coordinate |
| `getCellFromXY(x, y)` | int|null | Cell from coordinates |
| `getObstacles()` | int[] | All obstacle cells |
| `getMapType()` | int | Map type (MAP_* constant) |

## Fight / Combat Functions (56)
| Function | Returns | Description |
|----------|---------|-------------|
| `getTurn()` | int | Current turn number |
| `getFightID()` | int | Current fight ID |
| `getFightType()` | int | Fight type (FIGHT_TYPE_* constant) |
| `getFightContext()` | int | Fight context (FIGHT_CONTEXT_* constant) |
| `getFightBoss()` | int | Boss ID in boss fights |
| `getEnemies()` | int[] | All enemy IDs |
| `getAllies()` | int[] | All ally IDs |
| `getAliveEnemies()` | int[] | Alive enemy IDs |
| `getAliveAllies()` | int[] | Alive ally IDs |
| `getDeadEnemies()` | int[] | Dead enemy IDs |
| `getDeadAllies()` | int[] | Dead ally IDs |
| `getEnemiesCount()` | int | Total enemy count |
| `getAlliesCount()` | int | Total ally count |
| `getAliveEnemiesCount()` | int | Alive enemy count |
| `getAliveAlliesCount()` | int | Alive ally count |
| `getDeadEnemiesCount()` | int | Dead enemy count |
| `getNearestEnemy()` | int | Nearest enemy ID |
| `getNearestAlly()` | int | Nearest ally ID |
| `getFarthestEnemy()` | int | Farthest enemy ID |
| `getFarthestAlly()` | int | Farthest ally ID |
| `getNearestEnemyTo(entity)` | int|null | Nearest enemy to entity |
| `getNearestEnemyToCell(cell)` | int|null | Nearest enemy to cell |
| `getNearestAllyTo(entity)` | int|null | Nearest ally to entity |
| `getNearestAllyToCell(cell)` | int|null | Nearest ally to cell |
| `getNextPlayer([entity])` | int | Next entity in turn order |
| `getPreviousPlayer([entity])` | int | Previous entity in turn order |
| `getEnemiesLife()` | int | Total HP of all enemies |
| `getAlliesLife()` | int | Total HP of all allies |
| `getAlliedTurret()` | int|null | Allied turret entity |
| `getEnemyTurret()` | int|null | Enemy turret entity |
| `getAllEffects()` | array | All active effects in fight |
| `moveToward(entity, [maxMP])` | int | Move toward entity |
| `moveTowardCell(cell, [maxMP])` | int | Move toward cell |
| `moveTowardEntities(entities, [maxMP])` | int | Move toward multiple entities |
| `moveTowardCells(cells, [maxMP])` | int | Move toward multiple cells |
| `moveTowardLine(c1, c2, [maxMP])` | int | Move toward a line |
| `moveAwayFrom(entity, [maxMP])` | int | Move away from entity |
| `moveAwayFromCell(cell, [maxMP])` | int | Move away from cell |
| `moveAwayFromEntities(entities, [maxMP])` | int | Move away from multiple entities |
| `moveAwayFromCells(cells, [maxMP])` | int | Move away from multiple cells |
| `moveAwayFromLine(c1, c2, [maxMP])` | int | Move away from a line |
| `getCellToUseWeapon(entity, [weapon, ignored])` | int | Best cell to use weapon on entity |
| `getCellToUseWeaponOnCell(cell, [weapon, ignored])` | int | Best cell to use weapon on cell |
| `getCellToUseChip(entity, [chip, ignored])` | int | Best cell to use chip on entity |
| `getCellToUseChipOnCell(cell, [chip, ignored])` | int | Best cell to use chip on cell |
| `getCellsToUseWeapon(entity, [weapon, ignored])` | int[] | All valid cells to use weapon |
| `getCellsToUseWeaponOnCell(cell, [weapon, ignored])` | int[] | All valid cells for weapon on cell |
| `getCellsToUseChip(entity, [chip, ignored])` | int[] | All valid cells to use chip |
| `getCellsToUseChipOnCell(cell, [chip, ignored])` | int[] | All valid cells for chip on cell |
| `getBulbChips(bulbType)` | array | Chips of a bulb type |
| `getBulbCharacteristics(bulbType)` | map | Characteristics of bulb type |
| `getBulbStats(bulbType)` | map | Stats of bulb type |

## Network / Messaging Functions (6)
| Function | Returns | Description |
|----------|---------|-------------|
| `sendTo(entity, type, params)` | bool | Send message to entity |
| `sendAll(type, params)` | void | Send message to all allies |
| `getMessages([type])` | array | Get received messages (optional filter by type) |
| `getMessageAuthor(message)` | int | Get message author |
| `getMessageType(message)` | int | Get message type |
| `getMessageParams(message)` | any | Get message params |

## Utility Functions (9)
| Function | Returns | Description |
|----------|---------|-------------|
| `mark(cell_or_cells, [color, duration])` | bool | Mark cell(s) with color |
| `markText(cell_or_cells, [text, color, duration])` | bool | Mark cell(s) with text |
| `clearMarks()` | void | Clear all marks |
| `show(entity, [cell])` | bool | Show entity info |
| `pause()` | void | Pause execution |
| `getRegisters()` | map | Get all persistent registers |
| `getRegister(key)` | string|null | Get a register value |
| `setRegister(key, value)` | void | Set a register value (persists between fights) |
| `deleteRegister(key)` | void | Delete a register |

## Standard Library Functions (not in FightFunctions.java)

These are built into the LeekScript language runtime, not the fight engine:

### Math
`abs`, `acos`, `asin`, `atan`, `atan2`, `cbrt`, `ceil`, `cos`, `exp`, `floor`,
`hypot`, `log`, `log2`, `log10`, `max`, `min`, `pow`, `rand`, `randFloat`, `randInt`,
`round`, `signum`, `sin`, `sqrt`, `tan`, `toDegrees`, `toRadians`

### String
`charAt`, `contains`, `endsWith`, `indexOf`, `length`, `replace`, `split`,
`startsWith`, `string`, `substring`, `toLower`, `toUpper`, `trim`

### Array
`count`, `push`, `pop`, `shift`, `unshift`, `insert`, `remove`, `removeElement`,
`removeKey`, `reverse`, `sort`, `shuffle`, `search`, `inArray`, `isEmpty`, `fill`,
`join`, `subArray`, `sum`, `average`, `arrayConcat`, `arraySort`, `assocSort`, `keySort`

### Functional Array Operations
`arrayMap`, `arrayFilter`, `arrayFlatten`, `arrayFoldLeft`, `arrayFoldRight`,
`arrayIter`, `arrayPartition`, `arrayMin`, `arrayMax`, `arraySome`, `arrayEvery`

### Map
`mapGet`, `mapPut`, `mapSize`, `mapKeys`, `mapValues`, `mapIter`, `mapMap`, `mapFilter`

### Set
`setPut`, `setRemove`, `setContains`, `setSize`, `setUnion`, `setIntersection`, `setDifference`

### JSON
`jsonEncode`, `jsonDecode`

### Color
`color`, `getColor`, `getRed`, `getGreen`, `getBlue`

### System
`getOperations`, `getMaxOperations`, `getUsedRAM`, `getMaxRAM`,
`getDate`, `getTime`, `getTimestamp`, `getInstructionsCount`

### Type
`typeOf`, `number`, `string`, `clone`

### Debug
`debug`, `debugW`, `debugE`, `debugC`

---

## Game Constants

> All constants from `FightConstants.java`

### Cells
`CELL_EMPTY`, `CELL_PLAYER`, `CELL_ENTITY`, `CELL_OBSTACLE`

### Entity Types
`ENTITY_LEEK`, `ENTITY_BULB`, `ENTITY_TURRET`, `ENTITY_CHEST`, `ENTITY_MOB`

### Bulb Types
`BULB_PUNY`, `BULB_FIRE`, `BULB_HEALER`, `BULB_ROCKY`, `BULB_ICED`, `BULB_LIGHTNING`, `BULB_METALLIC`, `BULB_WIZARD`, `BULB_TACTICIAN`, `BULB_SAVANT`

### Effects
`EFFECT_DAMAGE`, `EFFECT_HEAL`, `EFFECT_FORCE`, `EFFECT_AGILITY`, `EFFECT_RELATIVE_SHIELD`, `EFFECT_ABSOLUTE_SHIELD`, `EFFECT_MP`, `EFFECT_TP`, `EFFECT_TELEPORT`, `EFFECT_INVERT`, `EFFECT_RESURRECT`, `EFFECT_BUFF_DAMAGE`, `EFFECT_BUFF_HEAL`, `EFFECT_BUFF_FORCE`, `EFFECT_BUFF_STRENGTH`, `EFFECT_BUFF_AGILITY`, `EFFECT_BUFF_RELATIVE_SHIELD`, `EFFECT_BUFF_ABSOLUTE_SHIELD`, `EFFECT_BUFF_MP`, `EFFECT_BUFF_TP`, `EFFECT_BUFF_DEBUFF`, `EFFECT_BUFF_TELEPORTATION`, `EFFECT_BOOST_MAX_LIFE`, `EFFECT_POISON`, `EFFECT_SUMMON`, `EFFECT_DEBUFF`, `EFFECT_KILL`, `EFFECT_SHACKLE_MP`, `EFFECT_SHACKLE_TP`, `EFFECT_SHACKLE_STRENGTH`, `EFFECT_DAMAGE_RETURN`, `EFFECT_BUFF_RESISTANCE`, `EFFECT_BUFF_WISDOM`, `EFFECT_SHACKLE_MAGIC`, `EFFECT_ANTIDOTE`, `EFFECT_AFTEREFFECT`, `EFFECT_VULNERABILITY`, `EFFECT_ABSOLUTE_VULNERABILITY`, `EFFECT_LIFE_DAMAGE`, `EFFECT_STEAL_ABSOLUTE_SHIELD`, `EFFECT_NOVA_DAMAGE`, `EFFECT_RAW_BUFF_MP`, `EFFECT_RAW_BUFF_TP`, `EFFECT_POISON_TO_SCIENCE`, `EFFECT_DAMAGE_TO_ABSOLUTE_SHIELD`, `EFFECT_DAMAGE_TO_STRENGTH`, `EFFECT_NOVA_DAMAGE_TO_MAGIC`, `EFFECT_RAW_ABSOLUTE_SHIELD`, `EFFECT_RAW_BUFF_STRENGTH`, `EFFECT_RAW_BUFF_MAGIC`, `EFFECT_RAW_BUFF_SCIENCE`, `EFFECT_RAW_BUFF_AGILITY`, `EFFECT_RAW_BUFF_RESISTANCE`, `EFFECT_PROPAGATION`, `EFFECT_RAW_BUFF_WISDOM`, `EFFECT_NOVA_VITALITY`, `EFFECT_SLIDE_TO`, `EFFECT_ATTRACT`, `EFFECT_SHACKLE_AGILITY`, `EFFECT_SHACKLE_WISDOM`, `EFFECT_REMOVE_SHACKLES`, `EFFECT_MOVED_TO_MP`, `EFFECT_PUSH`, `EFFECT_RAW_BUFF_POWER`, `EFFECT_REPEL`, `EFFECT_RAW_RELATIVE_SHIELD`, `EFFECT_ALLY_KILLED_TO_AGILITY`, `EFFECT_KILL_TO_TP`, `EFFECT_RAW_HEAL`, `EFFECT_CRITICAL_TO_HEAL`, `EFFECT_ADD_STATE`, `EFFECT_TOTAL_DEBUFF`, `EFFECT_STEAL_LIFE`

### Effect Targets
`EFFECT_TARGET_ALLIES`, `EFFECT_TARGET_ENEMIES`, `EFFECT_TARGET_CASTER`, `EFFECT_TARGET_NOT_CASTER`, `EFFECT_TARGET_NON_SUMMONS`, `EFFECT_TARGET_SUMMONS`, `EFFECT_TARGET_ALWAYS_CASTER`

### Effect Modifiers
`EFFECT_MODIFIER_STACKABLE`, `EFFECT_MODIFIER_MULTIPLIED_BY_TARGETS`, `EFFECT_MODIFIER_ON_CASTER`, `EFFECT_MODIFIER_NOT_REPLACEABLE`, `EFFECT_MODIFIER_IRREDUCTIBLE`

### States
`STATE_UNHEALABLE`, `STATE_INVINCIBLE`

### Use Results
`USE_CRITICAL`, `USE_SUCCESS`, `USE_FAILED`, `USE_INVALID_TARGET`, `USE_NOT_ENOUGH_TP`, `USE_INVALID_COOLDOWN`, `USE_INVALID_POSITION`, `USE_TOO_MUCH_SUMMONS`, `USE_TOO_MANY_SUMMONS`, `USE_RESURRECT_INVALID_ENTITY`, `USE_MAX_USES`

### Weapons
`WEAPON_PISTOL`, `WEAPON_MACHINE_GUN`, `WEAPON_DOUBLE_GUN`, `WEAPON_SHOTGUN`, `WEAPON_MAGNUM`, `WEAPON_LASER`, `WEAPON_GRENADE_LAUNCHER`, `WEAPON_FLAME_THROWER`, `WEAPON_DESTROYER`, `WEAPON_GAZOR`, `WEAPON_ELECTRISOR`, `WEAPON_M_LASER`, `WEAPON_B_LASER`, `WEAPON_KATANA`, `WEAPON_BROADSWORD`, `WEAPON_AXE`, `WEAPON_J_LASER`, `WEAPON_ILLICIT_GRENADE_LAUNCHER`, `WEAPON_MYSTERIOUS_ELECTRISOR`, `WEAPON_UNBRIDLED_GAZOR`, `WEAPON_REVOKED_M_LASER`, `WEAPON_RIFLE`, `WEAPON_RHINO`, `WEAPON_EXPLORER_RIFLE`, `WEAPON_LIGHTNINGER`, `WEAPON_PROTON_CANON`, `WEAPON_NEUTRINO`, `WEAPON_TASER`, `WEAPON_BAZOOKA`, `WEAPON_DARK_KATANA`, `WEAPON_ENHANCED_LIGHTNINGER`, `WEAPON_UNSTABLE_DESTROYER`, `WEAPON_SWORD`, `WEAPON_HEAVY_SWORD`, `WEAPON_ODACHI`, `WEAPON_EXCALIBUR`, `WEAPON_SCYTHE`, `WEAPON_QUANTUM_RIFLE`

### Chips
`CHIP_BANDAGE`, `CHIP_CURE`, `CHIP_DRIP`, `CHIP_REGENERATION`, `CHIP_VACCINE`, `CHIP_SHOCK`, `CHIP_FLASH`, `CHIP_LIGHTNING`, `CHIP_SPARK`, `CHIP_FLAME`, `CHIP_METEORITE`, `CHIP_PEBBLE`, `CHIP_ROCK`, `CHIP_ROCKFALL`, `CHIP_ICE`, `CHIP_STALACTITE`, `CHIP_ICEBERG`, `CHIP_SHIELD`, `CHIP_HELMET`, `CHIP_ARMOR`, `CHIP_WALL`, `CHIP_RAMPART`, `CHIP_FORTRESS`, `CHIP_PROTEIN`, `CHIP_STEROID`, `CHIP_DOPING`, `CHIP_STRETCHING`, `CHIP_WARM_UP`, `CHIP_REFLEXES`, `CHIP_LEATHER_BOOTS`, `CHIP_WINGED_BOOTS`, `CHIP_SEVEN_LEAGUE_BOOTS`, `CHIP_MOTIVATION`, `CHIP_ADRENALINE`, `CHIP_RAGE`, `CHIP_LIBERATION`, `CHIP_TELEPORTATION`, `CHIP_ARMORING`, `CHIP_INVERSION`, `CHIP_PUNY_BULB`, `CHIP_FIRE_BULB`, `CHIP_HEALER_BULB`, `CHIP_ROCKY_BULB`, `CHIP_ICED_BULB`, `CHIP_LIGHTNING_BULB`, `CHIP_METALLIC_BULB`, `CHIP_REMISSION`, `CHIP_CARAPACE`, `CHIP_RESURRECTION`, `CHIP_DEVIL_STRIKE`, `CHIP_WHIP`, `CHIP_LOAM`, `CHIP_FERTILIZER`, `CHIP_ACCELERATION`, `CHIP_SLOW_DOWN`, `CHIP_BALL_AND_CHAIN`, `CHIP_TRANQUILIZER`, `CHIP_SOPORIFIC`, `CHIP_SOLIDIFICATION`, `CHIP_VENOM`, `CHIP_TOXIN`, `CHIP_PLAGUE`, `CHIP_THORN`, `CHIP_MIRROR`, `CHIP_FEROCITY`, `CHIP_COLLAR`, `CHIP_BARK`, `CHIP_BURNING`, `CHIP_FRACTURE`, `CHIP_ANTIDOTE`, `CHIP_PUNISHMENT`, `CHIP_COVETOUSNESS`, `CHIP_VAMPIRIZATION`, `CHIP_PRECIPITATION`, `CHIP_ALTERATION`, `CHIP_WIZARD_BULB`, `CHIP_PLASMA`, `CHIP_JUMP`, `CHIP_COVID`, `CHIP_ELEVATION`, `CHIP_KNOWLEDGE`, `CHIP_WIZARDRY`, `CHIP_REPOTTING`, `CHIP_THERAPY`, `CHIP_MUTATION`, `CHIP_DESINTEGRATION`, `CHIP_TRANSMUTATION`, `CHIP_GRAPPLE`, `CHIP_BOXING_GLOVE`, `CHIP_CORN`, `CHIP_CHILLI_PEPPER`, `CHIP_TACTICIAN_BULB`, `CHIP_SAVANT_BULB`, `CHIP_SERUM`, `CHIP_CRUSHING`, `CHIP_BRAINWASHING`, `CHIP_ARSENIC`, `CHIP_BRAMBLE`, `CHIP_DOME`, `CHIP_MANUMISSION`, `CHIP_PRISM`, `CHIP_SHURIKEN`, `CHIP_KEMURIDAMA`, `CHIP_FIRE_BALL`, `CHIP_TREBUCHET`, `CHIP_AWEKENING`, `CHIP_THUNDER`, `CHIP_KILL`, `CHIP_APOCALYPSE`, `CHIP_DIVINE_PROTECTION`

### Areas
`AREA_POINT`, `AREA_LASER_LINE`, `AREA_CIRCLE_1`, `AREA_CIRCLE_2`, `AREA_CIRCLE_3`, `AREA_PLUS_1`, `AREA_PLUS_2`, `AREA_PLUS_3`, `AREA_X_1`, `AREA_X_2`, `AREA_X_3`, `AREA_SQUARE_1`, `AREA_SQUARE_2`, `AREA_FIRST_INLINE`, `AREA_ENEMIES`, `AREA_ALLIES`

### Launch Types
`LAUNCH_TYPE_LINE`, `LAUNCH_TYPE_DIAGONAL`, `LAUNCH_TYPE_STAR`, `LAUNCH_TYPE_STAR_INVERTED`, `LAUNCH_TYPE_DIAGONAL_INVERTED`, `LAUNCH_TYPE_LINE_INVERTED`, `LAUNCH_TYPE_CIRCLE`

### Messages
`MESSAGE_HEAL`, `MESSAGE_ATTACK`, `MESSAGE_DEBUFF`, `MESSAGE_SHIELD`, `MESSAGE_BUFF_MP`, `MESSAGE_BUFF_TP`, `MESSAGE_BUFF_FORCE`, `MESSAGE_BUFF_STRENGTH`, `MESSAGE_BUFF_AGILITY`, `MESSAGE_MOVE_TOWARD`, `MESSAGE_MOVE_AWAY`, `MESSAGE_MOVE_TOWARD_CELL`, `MESSAGE_MOVE_AWAY_CELL`, `MESSAGE_CUSTOM`

### Maps
`MAP_NEXUS`, `MAP_FACTORY`, `MAP_DESERT`, `MAP_FOREST`, `MAP_GLACIER`, `MAP_BEACH`, `MAP_TEMPLE`, `MAP_TEIEN`, `MAP_CASTLE`, `MAP_CEMETERY`

### Fight Types
`FIGHT_TYPE_SOLO`, `FIGHT_TYPE_FARMER`, `FIGHT_TYPE_TEAM`, `FIGHT_TYPE_BATTLE_ROYALE`, `FIGHT_TYPE_BOSS`

### Fight Contexts
`FIGHT_CONTEXT_TEST`, `FIGHT_CONTEXT_GARDEN`, `FIGHT_CONTEXT_CHALLENGE`, `FIGHT_CONTEXT_TOURNAMENT`, `FIGHT_CONTEXT_BATTLE_ROYALE`

### Bosses
`BOSS_NASU_SAMOURAI`, `BOSS_NASU_SAMURAI`, `BOSS_FENNEL_KING`, `BOSS_EVIL_PUMPKIN`

### Mobs
`MOB_NASU_SAMURAI`, `MOB_NASU_SEITO`, `MOB_NASU_WARRIOR`, `MOB_NASU_RONIN`, `MOB_FENNEL_KING`, `MOB_FENNEL_KNIGHT`, `MOB_FENNEL_SQUIRE`, `MOB_FENNEL_SCRIBE`, `MOB_EVIL_PUMPKIN`, `MOB_GRAAL`, `MOB_RED_CRYSTAL`, `MOB_GREEN_CRYSTAL`, `MOB_BLUE_CRYSTAL`, `MOB_YELLOW_CRYSTAL`, `MOB_TURBAN`, `MOB_WARTY`, `MOB_HUBBARD`, `MOB_OFFSPRING`

### Stats
`STAT_LIFE`, `STAT_TP`, `STAT_MP`, `STAT_STRENGTH`, `STAT_AGILITY`, `STAT_FREQUENCY`, `STAT_WISDOM`, `STAT_ABSOLUTE_SHIELD`, `STAT_RELATIVE_SHIELD`, `STAT_RESISTANCE`, `STAT_SCIENCE`, `STAT_MAGIC`, `STAT_DAMAGE_RETURN`, `STAT_POWER`, `STAT_CORES`, `STAT_RAM`

### Misc
`MAX_TURNS`, `SUMMON_LIMIT`, `CRITICAL_FACTOR`

