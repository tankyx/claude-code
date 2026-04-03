#!/usr/bin/env bash
set -e

# ============================================================
# LeekWars Code — One-Command Setup
# ============================================================
# Sets up Claude Code with full LeekWars/LeekScript integration:
#   1. Installs MCP server dependencies
#   2. Configures LeekWars credentials
#   3. Registers MCP server in Claude Code settings
#   4. Installs LeekScript skill globally
#   5. Optionally initializes current directory as a LeekScript project
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MCP_DIR="$SCRIPT_DIR/mcp-leekwars-server"
CLAUDE_HOME="${CLAUDE_CONFIG_DIR:-$HOME/.lwcode}"
SKILLS_DIR="$HOME/.claude/skills"
SETTINGS_FILE="$CLAUDE_HOME/settings.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}============================================${NC}"
echo -e "${BOLD}  lwcode — LeekWars Code Setup${NC}"
echo -e "${BOLD}============================================${NC}"
echo ""

# -----------------------------------------------------------
# Step 1: Check prerequisites
# -----------------------------------------------------------
echo -e "${BLUE}[1/5]${NC} Checking prerequisites..."

if ! command -v node &>/dev/null; then
    echo -e "${RED}  ✗ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓${NC} Node.js $(node -v)"

if ! command -v claude &>/dev/null; then
    echo -e "${YELLOW}  ⚠ Claude Code CLI not found in PATH.${NC}"
    echo -e "    Install it with: npm install -g @anthropic-ai/claude-code"
    echo -e "    lwcode uses Claude Code as its base — you need it installed."
else
    echo -e "${GREEN}  ✓${NC} Claude Code CLI found (base for lwcode)"
fi

if ! command -v curl &>/dev/null; then
    echo -e "${RED}  ✗ curl not found. Required for LeekWars API calls.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓${NC} curl found"

# -----------------------------------------------------------
# Step 2: Install MCP server
# -----------------------------------------------------------
echo ""
echo -e "${BLUE}[2/5]${NC} Installing MCP server dependencies..."

cd "$MCP_DIR"
npm install --silent 2>/dev/null
echo -e "${GREEN}  ✓${NC} MCP server ready at $MCP_DIR/server.js"

# -----------------------------------------------------------
# Step 3: Configure LeekWars credentials
# -----------------------------------------------------------
echo ""
echo -e "${BLUE}[3/5]${NC} LeekWars credentials"

# Check for existing credentials
CRED_FILE="$CLAUDE_HOME/leekwars-credentials.json"

if [ -f "$CRED_FILE" ]; then
    EXISTING_LOGIN=$(python3 -c "import json; print(json.load(open('$CRED_FILE'))['login'])" 2>/dev/null || echo "")
    if [ -n "$EXISTING_LOGIN" ]; then
        echo -e "  Found existing credentials for: ${BOLD}$EXISTING_LOGIN${NC}"
        if [ -t 0 ]; then
            read -p "  Keep these? [Y/n] " -n 1 -r
            echo
        else
            REPLY="Y"
        fi
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            echo -e "${GREEN}  ✓${NC} Keeping existing credentials"
            LW_LOGIN="$EXISTING_LOGIN"
            LW_PASSWORD=$(python3 -c "import json; print(json.load(open('$CRED_FILE'))['password'])" 2>/dev/null)
        fi
    fi
fi

if [ -z "$LW_LOGIN" ]; then
    # Check if passed as arguments
    if [ -n "$1" ] && [ -n "$2" ]; then
        LW_LOGIN="$1"
        LW_PASSWORD="$2"
        echo -e "  Using credentials from arguments: ${BOLD}$LW_LOGIN${NC}"
    else
        echo "  Enter your LeekWars credentials (https://leekwars.com)"
        read -p "  Username: " LW_LOGIN
        read -sp "  Password: " LW_PASSWORD
        echo ""
    fi

    if [ -z "$LW_LOGIN" ] || [ -z "$LW_PASSWORD" ]; then
        echo -e "${YELLOW}  ⚠ No credentials provided. Skipping credential setup.${NC}"
        echo "    You can run this script again later, or login via the MCP tool."
    else
        # Test credentials
        echo "  Testing credentials..."
        TEST_RESULT=$(curl -s --max-time 10 'https://leekwars.com/api/farmer/login-token' \
            -d "login=$LW_LOGIN&password=$LW_PASSWORD" 2>/dev/null || echo '{"error":"network"}')

        if echo "$TEST_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'farmer' in d else 1)" 2>/dev/null; then
            FARMER_NAME=$(echo "$TEST_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['farmer']['login'])" 2>/dev/null)
            FARMER_LEEKS=$(echo "$TEST_RESULT" | python3 -c "
import sys,json
f=json.load(sys.stdin)['farmer']
leeks=f.get('leeks',{})
print(', '.join(f\"{v['name']} (Lvl {v['level']})\" for v in leeks.values()))
" 2>/dev/null)
            echo -e "${GREEN}  ✓${NC} Login successful! Farmer: ${BOLD}$FARMER_NAME${NC}"
            echo -e "    Leeks: $FARMER_LEEKS"

            # Save credentials
            mkdir -p "$CLAUDE_HOME"
            cat > "$CRED_FILE" << CREDEOF
{
  "login": "$LW_LOGIN",
  "password": "$LW_PASSWORD"
}
CREDEOF
            chmod 600 "$CRED_FILE"
            echo -e "${GREEN}  ✓${NC} Credentials saved to $CRED_FILE (mode 600)"
        else
            echo -e "${RED}  ✗ Login failed. Check your credentials.${NC}"
            echo "    You can re-run this script or login via the leekwars_login MCP tool."
        fi
    fi
fi

# -----------------------------------------------------------
# Step 4: Register MCP server + skill in Claude Code settings
# -----------------------------------------------------------
echo ""
echo -e "${BLUE}[4/5]${NC} Configuring Claude Code..."

mkdir -p "$CLAUDE_HOME"
mkdir -p "$SKILLS_DIR"

# Copy all LeekWars skills
for skill in "$SCRIPT_DIR"/.claude/skills/*.md; do
    cp "$skill" "$SKILLS_DIR/"
done
SKILL_COUNT=$(ls "$SCRIPT_DIR"/.claude/skills/*.md | wc -l)
echo -e "${GREEN}  ✓${NC} $SKILL_COUNT skills installed to $SKILLS_DIR/ (leekscript, leek-test, leek-optimize, leek-sync)"

# Build the MCP server config with credentials
# Use a Python script to safely merge into existing settings.json
python3 << PYEOF
import json
import os

settings_file = "$SETTINGS_FILE"
mcp_server_js = "$MCP_DIR/server.js"
cred_file = "$CRED_FILE"

# Load existing settings or create new
settings = {}
if os.path.exists(settings_file):
    try:
        with open(settings_file) as f:
            settings = json.load(f)
    except:
        pass

# Ensure mcpServers section exists
if "mcpServers" not in settings:
    settings["mcpServers"] = {}

# Build env vars for the MCP server
env = {}
if os.path.exists(cred_file):
    try:
        with open(cred_file) as f:
            creds = json.load(f)
            env["LEEKWARS_LOGIN"] = creds.get("login", "")
            env["LEEKWARS_PASSWORD"] = creds.get("password", "")
    except:
        pass

# Register the LeekWars MCP server
settings["mcpServers"]["leekwars"] = {
    "command": "node",
    "args": [mcp_server_js],
    "env": env
}

# Write back
with open(settings_file, 'w') as f:
    json.dump(settings, f, indent=2)

print(f"  MCP server registered in {settings_file}")
PYEOF
echo -e "${GREEN}  ✓${NC} LeekWars MCP server configured"

# Install lwcode command
LWCODE_BIN="/usr/local/bin/lwcode"
NEEDS_SUDO=""
if [ -w "$(dirname "$LWCODE_BIN")" ]; then
    NEEDS_SUDO=""
else
    NEEDS_SUDO="sudo"
fi

echo -e "  Installing lwcode command..."
# Check if built binary exists, otherwise fall back to claude wrapper
if [ -f "$SCRIPT_DIR/dist/lwcode.js" ] && [ -f "$SCRIPT_DIR/dist/lwcode" ]; then
    # Install the custom-built lwcode (Node.js CJS bundle with custom UI/prompts/skills)
    $NEEDS_SUDO cp "$SCRIPT_DIR/dist/lwcode" "$SCRIPT_DIR/dist/lwcode.js" "$(dirname "$LWCODE_BIN")/"
    $NEEDS_SUDO chmod +x "$LWCODE_BIN"
    echo -e "${GREEN}  ✓${NC} lwcode (custom build) installed to $LWCODE_BIN"
else
    # Fall back to wrapper around stock claude
    $NEEDS_SUDO bash -c "cat > $LWCODE_BIN" << 'LWEOF'
#!/usr/bin/env bash
export CLAUDE_CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.lwcode}"
exec claude "$@"
LWEOF
    $NEEDS_SUDO chmod +x "$LWCODE_BIN"
    echo -e "${GREEN}  ✓${NC} lwcode (claude wrapper) installed to $LWCODE_BIN"
    echo -e "${YELLOW}    Run ./build.sh first for the full custom lwcode experience${NC}"
fi

# -----------------------------------------------------------
# Step 5: Initialize current project (optional)
# -----------------------------------------------------------
echo ""
echo -e "${BLUE}[5/5]${NC} Project setup"

ORIG_DIR="$(pwd)"
cd "$ORIG_DIR"

if [ -f "CLAUDE.md" ]; then
    echo -e "  CLAUDE.md already exists in current directory. Skipping."
elif ls *.lk *.leek *.ls *.lks 2>/dev/null | head -1 > /dev/null 2>&1; then
    echo "  LeekScript files detected in current directory."
    if [ -t 0 ]; then
        read -p "  Create CLAUDE.md for this project? [Y/n] " -n 1 -r
        echo
    else
        REPLY="Y"
    fi
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        cp "$SCRIPT_DIR/templates/CLAUDE.md.leekscript" "$ORIG_DIR/CLAUDE.md"
        echo -e "${GREEN}  ✓${NC} Created CLAUDE.md"
    fi
else
    echo "  No LeekScript files in current directory. Skipping project init."
    echo "  To set up a LeekScript project later, copy the template:"
    echo "    cp $SCRIPT_DIR/templates/CLAUDE.md.leekscript ./CLAUDE.md"
fi

# -----------------------------------------------------------
# Done!
# -----------------------------------------------------------
echo ""
echo -e "${BOLD}============================================${NC}"
echo -e "${GREEN}${BOLD}  Setup complete!${NC}"
echo -e "${BOLD}============================================${NC}"
echo ""
echo "  What's configured:"
echo "    ✓ MCP server with 17 LeekWars API tools"
echo "    ✓ LeekScript skill (auto-triggers on .lk files)"
echo "    ✓ LeekWars credentials (if provided)"
echo ""
echo "  Usage:"
echo "    claude                        # Start lwcode (via Claude Code)"
echo "    > Write me a kiter AI         # Ask for LeekScript code"
echo "    > /leekscript                 # Open full API reference"
echo "    > Show my leeks               # Uses MCP server"
echo "    > Pull my AI code             # Download from LeekWars"
echo ""
echo "  To reconfigure credentials:"
echo "    $0 <username> <password>"
echo "    # or edit: $CRED_FILE"
echo ""
