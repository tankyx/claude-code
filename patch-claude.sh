#!/usr/bin/env bash
set -e

# patch-claude.sh — Creates lwcode by patching the stock claude binary
# Copies the working claude binary and applies LeekWars customizations.
# The original claude is never modified.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_BIN=$(which claude 2>/dev/null)

if [ -z "$CLAUDE_BIN" ]; then
    echo "Error: claude not found in PATH. Install it first:"
    echo "  npm install -g @anthropic-ai/claude-code"
    exit 1
fi

echo "Patching claude binary into lwcode..."
echo "  Source: $CLAUDE_BIN ($(wc -c < "$CLAUDE_BIN" | tr -d ' ') bytes)"

mkdir -p dist
rm -f dist/package.json  # Remove any leftover ESM/CJS config

# Step 1: Copy the stock binary
cp "$CLAUDE_BIN" dist/lwcode.js

# Step 2: Apply patches using sed

# 2a: Inject CLAUDE_CONFIG_DIR at the very start (after shebang)
# Uses import() since the stock binary is ESM
sed -i '2i\
// lwcode patch: use separate config directory\
import{homedir as __lwH}from"os";import{join as __lwJ}from"path";if(!process.env.CLAUDE_CONFIG_DIR)process.env.CLAUDE_CONFIG_DIR=__lwJ(__lwH(),".lwcode");' dist/lwcode.js

# 2b: Change program name from "claude" to "lwcode" (Commander.js)
sed -i 's/\.name("claude")/\.name("lwcode")/g' dist/lwcode.js

# 2c: Change process title
sed -i "s/process\.title=\"claude\"/process.title=\"lwcode\"/g" dist/lwcode.js
sed -i "s/process\.title='claude'/process.title='lwcode'/g" dist/lwcode.js

# 2d: Change version string
sed -i 's/(Claude Code)/(LeekWars Code)/g' dist/lwcode.js

# 2e: Change description
sed -i 's/Claude Code - starts an interactive/LeekWars Code - starts an interactive/g' dist/lwcode.js

# 2f: Change brand color from orange to green (rgb values in theme)
# Claude orange: rgb(215,119,87) -> LeekWars green: rgb(76,175,80)
sed -i 's/rgb(215,119,87)/rgb(76,175,80)/g' dist/lwcode.js
sed -i 's/rgb(245,149,117)/rgb(129,199,132)/g' dist/lwcode.js

# 2g: Change ANSI fallback color
sed -i 's/claude:"ansi:redBright"/claude:"ansi:greenBright"/g' dist/lwcode.js

# 2h: Change welcome text
sed -i 's/Welcome to Claude Code/Welcome to lwcode/g' dist/lwcode.js

# 2i: Change hex color in heatmap
sed -i 's/#da7756/#4CAF50/g' dist/lwcode.js

# Step 3: Make it directly executable (no wrapper needed)
# The patched JS already has #!/usr/bin/env node shebang and
# the CLAUDE_CONFIG_DIR injection at line 2
chmod +x dist/lwcode.js

# Create a convenience symlink name
ln -sf lwcode.js dist/lwcode

echo ""
echo "Patch complete!"
ls -lh dist/lwcode dist/lwcode.js
echo ""
echo "Test:"
dist/lwcode --version
echo ""
echo "Install:"
echo "  sudo rm -f /usr/local/bin/lwcode /usr/local/bin/lwcode-node /usr/local/bin/lwcode.mjs /usr/local/bin/lwcode.js"
echo "  sudo cp dist/lwcode.js /usr/local/bin/lwcode && sudo chmod +x /usr/local/bin/lwcode"
echo '  echo '"'"'{"type":"module"}'"'"' | sudo tee /usr/local/bin/package.json > /dev/null'
echo "  lwcode --version"
