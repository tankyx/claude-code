# LeekWars MCP Server

MCP (Model Context Protocol) server for integrating Claude Code with the LeekWars platform.

## Setup

1. Install dependencies:
   ```bash
   cd mcp-leekwars-server
   npm install
   ```

2. Get your LeekWars token by logging in at https://leekwars.com or use the `leekwars_login` tool.

3. Configure in your Claude Code settings (`.claude/settings.json` or global settings):
   ```json
   {
     "mcpServers": {
       "leekwars": {
         "command": "node",
         "args": ["./mcp-leekwars-server/server.js"],
         "env": {
           "LEEKWARS_TOKEN": "your-token-here"
         }
       }
     }
   }
   ```

## Available Tools

| Tool | Description |
|------|-------------|
| `leekwars_login` | Authenticate with LeekWars (username/password) |
| `leekwars_list_ais` | List all your AI scripts |
| `leekwars_get_ai` | Get AI source code by ID |
| `leekwars_save_ai` | Save/update AI code |
| `leekwars_new_ai` | Create a new AI |
| `leekwars_delete_ai` | Delete an AI |
| `leekwars_rename_ai` | Rename an AI |
| `leekwars_get_leek` | Get leek stats and equipment |
| `leekwars_set_leek_ai` | Assign AI to a leek |
| `leekwars_start_fight` | Start a solo fight |
| `leekwars_start_farmer_fight` | Start a farmer fight |
| `leekwars_get_fight` | Get fight results |
| `leekwars_get_garden` | Browse available opponents |
| `leekwars_get_farmer` | Get farmer profile |
| `leekwars_get_constants` | Get game constants |
| `leekwars_get_ranking` | Get rankings |

## Usage with Claude Code

Once configured, you can use natural language:
- "Show me my leeks and their AIs"
- "Pull my AI code from LeekWars"
- "Save this AI and start a test fight"
- "What are my available opponents?"
- "Show the fight results for fight 12345"
