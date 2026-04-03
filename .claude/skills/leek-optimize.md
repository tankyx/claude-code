---
name: leek-optimize
description: >
  Optimize LeekScript AI code for competitive play. Analyzes operations efficiency, TP/MP usage, and strategy.
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
  - Agent
---

# LeekScript AI Optimization

Analyze and optimize LeekScript AI code for competitive play.

## Phase 1: Read the Code

Find and read all .lk / .leekscript files in the current directory.

## Phase 2: Launch Analysis Agents

Use the Agent tool to launch three review agents in parallel.
Pass each agent the full AI source code.

**Ground truth reference**: If you need to verify function signatures, operations costs, or constant values, Read from:
- `vendor/leek-wars-generator/src/main/java/com/leekwars/generator/FightFunctions.java` (API functions)
- `vendor/leek-wars-generator/data/functions.json` (operations cost per function)
- `vendor/leek-wars-generator/src/main/java/com/leekwars/generator/FightConstants.java` (constants)

### Agent 1: Operations Efficiency
Review for computational efficiency (operations limit):
1. Loop complexity — O(n^2) or worse nested loops
2. Redundant calculations — same value computed multiple times per turn
3. Unnecessary function calls — calling `getEnemies()` multiple times
4. Debug overhead — `debug()` calls left in production
5. String operations in loops

### Agent 2: TP/MP Efficiency
Review for action point optimization:
1. Wasted TP — actions attempted without checking `getTP()` or `canUseWeapon()`
2. Suboptimal weapon choice
3. Unnecessary weapon switches — `setWeapon()` costs 1 TP
4. Movement waste
5. Chip cooldown ignoring
6. Action ordering — buff/shield before attacking, attack before moving away

### Agent 3: Strategy & Tactics
Review for competitive effectiveness:
1. Target selection — focus-firing, prioritizing threats
2. Positioning — terrain/obstacles, optimal range
3. State management — `global` state used effectively?
4. Adaptation — different enemy types/counts?
5. Team synergy
6. Edge cases — alone, surrounded, low HP, summons?

## Phase 3: Apply Optimizations

After all agents report, fix each issue directly in the code.
