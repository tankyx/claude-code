# LeekScript Project - CLAUDE.md

This project contains LeekScript AI scripts for [LeekWars](https://leekwars.com).

## Project Structure

- `*.lk` / `*.leek` / `*.ls` / `*.lks` - LeekScript AI source files
- Each file is a standalone AI script that controls a leek in combat

## Language: LeekScript

LeekScript is a dynamically typed language with JavaScript-like syntax.
Key differences from JavaScript:
- `var` for mutable variables, `global` for cross-turn state. `let`/`const` are reserved but NOT usable.
- `and` / `or` / `not` / `xor` logical operators (in addition to `&&` / `||` / `!`)
- `\` is INTEGER DIVISION (not filter). Use `arrayFilter()` for filtering.
- `~` is BITWISE NOT (not pipe). Use `arrayMap()` for mapping.
- `~~` (map operator) and `<=>` (swap) DO NOT EXIST in production LeekScript.
- `->` creates lambdas: `x -> x + 1`
- `..` creates intervals: `1..10`
- `??` null coalescing operator
- `include('other_ai')` to import shared AI scripts
- Semicolons are optional
- `getOperations()` / `getMaxOperations()` to check operations budget

## Game Constraints

- **20 million operations** limit per turn
- **TP (Turn Points)**: action budget per turn (attacks, chip usage, weapon switching)
- **MP (Movement Points)**: movement budget per turn
- AI runs once per turn, all actions must complete within that turn
- `global` variables persist between turns for state management

## Development Commands

```bash
# Sync AI from LeekWars (if using leekwars-cli or MCP server)
# Pull: Download AI code from the platform
# Push: Upload local .lk files to LeekWars
# Test: Start a fight against garden opponents
```

## Code Style

- Structure each AI as: observe -> decide -> act
- Always null-check targeting functions (`getNearestEnemy()` can return `null`)
- Check `getTP()` before costly actions
- Use `debug()` during development, remove for production
- Prefer `global` state machines for complex multi-turn strategies
- Document strategy intent, not code mechanics

## LeekWars API Token

Set `LEEKWARS_TOKEN` environment variable for API access.
Login: `POST https://leekwars.com/api/farmer/login`
