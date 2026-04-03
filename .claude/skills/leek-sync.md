---
name: leek-sync
description: >
  Sync LeekScript AI code between local files and LeekWars platform. Requires LeekWars MCP server.
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
---

# LeekWars AI Sync

Synchronize LeekScript AI code between local files and the LeekWars platform.

## Prerequisites

This skill requires the LeekWars MCP server to be configured. If it's not available,
instruct the user to set up the MCP server with their LeekWars authentication token.

## Operations

### Pull (Download from LeekWars)
1. Use `leekwars_list_ais` to get all the user's AIs
2. For each AI, use `leekwars_get_ai` to fetch the source code
3. Write each AI to a local .lk file (use the AI name as filename)
4. Report which files were created/updated

### Push (Upload to LeekWars)
1. Find all .lk / .leekscript files in the current directory
2. For each file, read its content
3. Match filenames to existing AIs on the platform (by name)
4. Use `leekwars_save_ai` to upload the code
5. Report which AIs were updated

### Diff (Compare local vs remote)
1. List local .lk files and remote AIs
2. For each matching pair, compare the code
3. Report differences

## Important
- Always confirm with the user before overwriting code in either direction
- Use the AI name (not ID) for filename matching
