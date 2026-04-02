# LeekScript AI Patterns & Strategies

## Pattern 1: Basic Fighter
The simplest AI - move to nearest enemy and attack.
```leekscript
var enemy = getNearestEnemy()
if (enemy != null) {
    moveToward(enemy)
    while (getTP() >= getWeaponCost(getWeapon()) and canUseWeapon(getWeapon(), enemy)) {
        useWeapon(enemy)
    }
}
```

## Pattern 2: Kiter (Ranged)
Maintain optimal distance and attack from range.
```leekscript
var enemy = getNearestEnemy()
if (enemy != null) {
    var weapon = getWeapon()
    var maxRange = getWeaponMaxRange(weapon)
    var minRange = getWeaponMinRange(weapon)
    var dist = getCellDistance(getCell(), getCell(enemy))

    // Position at max range
    if (dist > maxRange) {
        moveToward(enemy)
    } else if (dist < minRange) {
        moveAwayFrom(enemy)
    }

    // Attack while possible
    while (getTP() >= getWeaponCost(weapon) and canUseWeapon(weapon, enemy)) {
        useWeapon(enemy)
    }

    // After attacking, back away with remaining MP
    if (getMP() > 0) {
        moveAwayFrom(enemy)
    }
}
```

## Pattern 3: Healer Support
Prioritize healing allies, fall back to attacking.
```leekscript
var healChip = CHIP_CURE

function getMostHurtAlly() {
    var allies = getAliveAllies()
    var worst = null
    var worstRatio = 1.0

    for (var ally in allies) {
        var ratio = getLife(ally) / getTotalLife(ally)
        if (ratio < worstRatio) {
            worstRatio = ratio
            worst = ally
        }
    }
    return worst
}

var target = getMostHurtAlly()

// Heal if an ally is below 70% HP
if (target != null and getLife(target) < getTotalLife(target) * 0.7) {
    moveToward(target)
    while (getTP() >= getChipCost(healChip) and canUseChip(healChip, target)) {
        useChip(healChip, target)
    }
} else {
    // Otherwise attack
    var enemy = getNearestEnemy()
    if (enemy != null) {
        moveToward(enemy)
        while (getTP() >= getWeaponCost(getWeapon()) and canUseWeapon(getWeapon(), enemy)) {
            useWeapon(enemy)
        }
    }
}
```

## Pattern 4: Tank with Shields
Buff self, absorb damage, position to protect allies.
```leekscript
global shieldChip = CHIP_SHIELD

// Apply shields first
if (getChipCooldown(shieldChip) == 0 and canUseChip(shieldChip, getEntity())) {
    useChip(shieldChip, getEntity())
}

// Find nearest enemy
var enemy = getNearestEnemy()
if (enemy != null) {
    // Move to engage
    moveToward(enemy)

    // Attack with remaining TP
    while (getTP() >= getWeaponCost(getWeapon()) and canUseWeapon(getWeapon(), enemy)) {
        useWeapon(enemy)
    }
}
```

## Pattern 5: State Machine
Multi-turn strategy using global state variables.
```leekscript
global state = "ENGAGE"
global targetId = null
global retreatTurns = 0

var hpRatio = getLife() / getTotalLife()

// State transitions
if (hpRatio < 0.25 and state != "RETREAT") {
    state = "RETREAT"
    retreatTurns = 3
}
if (state == "RETREAT") {
    retreatTurns--
    if (retreatTurns <= 0 or hpRatio > 0.6) {
        state = "ENGAGE"
    }
}

// State actions
if (state == "ENGAGE") {
    var enemy = getWeakestEnemy()
    if (enemy != null) {
        targetId = enemy
        moveToward(enemy)
        while (getTP() >= getWeaponCost(getWeapon()) and canUseWeapon(getWeapon(), enemy)) {
            useWeapon(enemy)
        }
    }
} else if (state == "RETREAT") {
    var enemy = getNearestEnemy()
    if (enemy != null) {
        moveAwayFrom(enemy)
    }
    // Heal self if possible
    for (var chip in getChips()) {
        var effects = getChipEffects(chip)
        for (var effect in effects) {
            if (effect[0] == EFFECT_HEAL and canUseChip(chip, getEntity())) {
                useChip(chip, getEntity())
            }
        }
    }
}
```

## Pattern 6: Smart Target Selection
Score-based targeting considering multiple factors.
```leekscript
function scoreTarget(enemy) {
    var score = 0
    var dist = getCellDistance(getCell(), getCell(enemy))
    var hpRatio = getLife(enemy) / getTotalLife(enemy)

    // Low HP = high priority (finish off)
    score += (1 - hpRatio) * 50

    // Closer = easier to reach
    score += max(0, 30 - dist) * 2

    // Can we hit them right now?
    if (canUseWeapon(getWeapon(), enemy)) {
        score += 40
    }

    // Summons are lower priority
    if (isSummon(enemy)) {
        score -= 20
    }

    return score
}

var enemies = getAliveEnemies()
var bestTarget = null
var bestScore = -999

for (var enemy in enemies) {
    var s = scoreTarget(enemy)
    if (s > bestScore) {
        bestScore = s
        bestTarget = enemy
    }
}

if (bestTarget != null) {
    moveToward(bestTarget)
    while (getTP() >= getWeaponCost(getWeapon()) and canUseWeapon(getWeapon(), bestTarget)) {
        useWeapon(bestTarget)
    }
}
```

## Pattern 7: Weapon Switching
Choose optimal weapon based on distance and TP.
```leekscript
function getBestWeapon(enemy) {
    var dist = getCellDistance(getCell(), getCell(enemy))
    var weapons = getWeapons()
    var best = null
    var bestDps = 0

    for (var w in weapons) {
        var cost = getWeaponCost(w)
        if (cost > getTP()) continue

        var minR = getWeaponMinRange(w)
        var maxR = getWeaponMaxRange(w)

        // Check if distance is in range (or close to it)
        if (dist >= minR and dist <= maxR) {
            var effects = getWeaponEffects(w)
            var damage = 0
            for (var e in effects) {
                if (e[0] == EFFECT_DAMAGE) {
                    damage += (e[1] + e[2]) / 2  // avg of min/max
                }
            }
            var dps = damage / cost
            if (dps > bestDps) {
                bestDps = dps
                best = w
            }
        }
    }
    return best
}

var enemy = getNearestEnemy()
if (enemy != null) {
    moveToward(enemy)

    var weapon = getBestWeapon(enemy)
    if (weapon != null and weapon != getWeapon()) {
        setWeapon(weapon)
    }

    while (getTP() >= getWeaponCost(getWeapon()) and canUseWeapon(getWeapon(), enemy)) {
        useWeapon(enemy)
    }
}
```

## Pattern 8: Team Coordination
Role-based AI for team compositions.
```leekscript
global myRole = null

// Determine role on first turn
if (myRole == null) {
    var allies = getAllies()
    var allyCount = count(allies)

    // Simple role assignment based on position in team
    var myIndex = search(allies, getEntity())
    if (myIndex == 0) {
        myRole = "TANK"
    } else if (myIndex == allyCount - 1) {
        myRole = "HEALER"
    } else {
        myRole = "DPS"
    }
}

if (myRole == "TANK") {
    // Move toward enemies, use shields, absorb
    var enemy = getNearestEnemy()
    if (enemy != null) {
        moveToward(enemy)
        useWeapon(enemy)
    }
} else if (myRole == "HEALER") {
    // Heal most hurt ally
    var weakest = getWeakestAlly()
    if (weakest != null and getLife(weakest) < getTotalLife(weakest) * 0.8) {
        moveToward(weakest)
        for (var chip in getChips()) {
            if (canUseChip(chip, weakest)) {
                var effects = getChipEffects(chip)
                for (var e in effects) {
                    if (e[0] == EFFECT_HEAL) {
                        useChip(chip, weakest)
                    }
                }
            }
        }
    }
} else if (myRole == "DPS") {
    // Focus fire weakest enemy
    var enemy = getWeakestEnemy()
    if (enemy != null) {
        moveToward(enemy)
        while (getTP() >= getWeaponCost(getWeapon()) and canUseWeapon(getWeapon(), enemy)) {
            useWeapon(enemy)
        }
    }
}
```

## Anti-Patterns to Avoid

1. **Attacking without checking TP**: Always verify `getTP() >= cost` before actions
2. **Moving after all TP spent**: Move BEFORE attacking to get in range
3. **Ignoring null returns**: `getNearestEnemy()` returns `null` if all enemies dead
4. **Not using `global`**: Turn-local `var` resets each turn; use `global` for strategy state
5. **Deep recursion**: Hits 20M operation limit fast; prefer iterative approaches
6. **Excessive debug()**: Each call costs operations; remove in production
7. **Hardcoded weapon IDs**: Use `getWeapons()` dynamically in case equipment changes
8. **Attacking out of range**: Always check `canUseWeapon()` or `canUseChip()` first
9. **Wasting TP on setWeapon()**: Switching costs 1 TP; only switch when it provides a clear advantage
10. **Not checking cooldowns**: `getChipCooldown(chip)` before attempting `useChip()`
