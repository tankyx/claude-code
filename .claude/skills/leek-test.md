---
name: leek-test
description: >
  Test and debug LeekScript AI code. Runs static analysis and optionally executes test fights.
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
  - Agent
---

# LeekWars AI Test & Debug

Test your LeekScript AI by running static analysis and optionally test fights.

## Step 1: Identify the AI Code

Find .lk or .leekscript files in the current directory. Read the AI code to understand what it does.

## Step 2: Static Analysis

Analyze the code for common issues:
1. **Null safety**: Check that `getNearestEnemy()` etc. results are null-checked. Note: `getWeakestEnemy()`/`getWeakestAlly()` DO NOT EXIST — if code uses them, that's a bug
2. **TP management**: Verify TP is checked before actions (`getTP() >= cost`)
3. **Operations budget**: Look for potential infinite loops or O(n^3) patterns that might hit the operations limit
4. **Global state**: Check that `global` is used for cross-turn state, not `var`
5. **Dead code**: Functions defined but never called
6. **Missing cooldown checks**: `useChip()` calls without `getChipCooldown()` checks
7. **Invalid syntax**: `~~` (map), `<=>` (swap), `let`/`const` declarations — these don't work in production LeekScript
8. **Non-existent functions**: `forward()`, `backward()`, `random()`, `getWeakestEnemy()`, `getStrongestEnemy()`, `getWeakestAlly()` — these don't exist

When verifying function existence, check `vendor/leek-wars-generator/src/main/java/com/leekwars/generator/FightFunctions.java` as the source of truth.

## Step 3: Suggest Improvements

Based on the analysis, suggest specific code changes:
- Fix any bugs found
- Optimize TP usage
- Improve targeting logic
- Better positioning strategy
- Add missing edge case handling
