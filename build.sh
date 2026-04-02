#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

VERSION="${1:-1.0.0}"
OUTFILE="${2:-dist/lwcode}"

echo "Building lwcode v${VERSION}..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    bun install
fi

mkdir -p dist

# Step 1: Bundle to JS
echo "Bundling (3900+ modules)..."
bun build src/entrypoints/cli.tsx --outfile dist/lwcode.js \
  --target bun \
  --define "MACRO.VERSION=\"${VERSION}\"" \
  --define 'MACRO.PACKAGE_URL="lwcode"' \
  --define 'MACRO.ISSUES_EXPLAINER="report at https://github.com/tankyx/claude-code/issues"' \
  --define 'process.env.USER_TYPE="external"'

# Step 2: Fix Bun 1.x bundler bug (empty dynamic import expression)
sed -i 's/then(() => )/then(() => null)/g' dist/lwcode.js

# Step 3: Compile to standalone binary
echo "Compiling binary..."
bun build dist/lwcode.js --compile --outfile "$OUTFILE" --target bun

# Cleanup intermediate JS
rm -f dist/lwcode.js

echo ""
echo "Build complete: $OUTFILE"
ls -lh "$OUTFILE"
echo ""
echo "Test: $OUTFILE --version"
"$OUTFILE" --version
