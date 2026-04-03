#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

VERSION="${1:-2.1.91}"
OUTFILE="${2:-dist/lwcode}"

echo "Building lwcode v${VERSION}..."

# Step 0: Install/update dependencies
echo "Installing dependencies..."
bun install

# Step 1: Create stub modules for Anthropic-internal and optional packages
# These packages are behind feature() flags or dynamic imports and will never
# execute in external builds, but Bun's bundler still tries to resolve them.
echo "Creating stub modules..."

create_stub() {
    local pkg="$1"
    local dir="node_modules/$pkg"
    if [ ! -d "$dir" ] || [ ! -f "$dir/index.js" ]; then
        mkdir -p "$dir"
        echo '{"name":"'"$pkg"'","version":"0.0.0","main":"index.js","type":"commonjs"}' > "$dir/package.json"
        echo 'module.exports = new Proxy({}, { get: (t,p) => p === "__esModule" ? true : typeof p === "string" ? (() => {}) : undefined });' > "$dir/index.js"
    fi
}

# Anthropic internal packages
create_stub "@ant/claude-for-chrome-mcp"
create_stub "@anthropic-ai/bedrock-sdk"
create_stub "@anthropic-ai/foundry-sdk"
create_stub "@anthropic-ai/mcpb"
create_stub "@anthropic-ai/vertex-sdk"

# Sandbox runtime needs real class stubs
SANDBOX_DIR="node_modules/@anthropic-ai/sandbox-runtime"
if [ ! -d "$SANDBOX_DIR" ] || ! grep -q "SandboxManager" "$SANDBOX_DIR/index.js" 2>/dev/null; then
    mkdir -p "$SANDBOX_DIR"
    echo '{"name":"@anthropic-ai/sandbox-runtime","version":"0.0.0","main":"index.js","type":"commonjs"}' > "$SANDBOX_DIR/package.json"
    cat > "$SANDBOX_DIR/index.js" << 'STUBEOF'
class SandboxManager {
  static getFsReadConfig() { return {} }
  static getFsWriteConfig() { return {} }
  static getNetworkConfig() { return {} }
  static setSandboxSettings() {}
  static getExcludedCommands() { return [] }
  static wrapWithSandbox(fn) { return fn }
  static refreshConfig() {}
  static reset() {}
}
module.exports = { SandboxManager };
module.exports.default = module.exports;
STUBEOF
fi

# Cloud provider SDKs (behind dynamic imports, never called in external builds)
create_stub "@aws-sdk/client-bedrock"
create_stub "@aws-sdk/client-bedrock-runtime"
create_stub "@aws-sdk/client-sts"
create_stub "@aws-sdk/credential-provider-node"
create_stub "@azure/identity"
create_stub "@smithy/core"
create_stub "@smithy/node-http-handler"
create_stub "google-auth-library"

# OpenTelemetry exporters (behind dynamic imports)
create_stub "@opentelemetry/exporter-logs-otlp-grpc"
create_stub "@opentelemetry/exporter-logs-otlp-http"
create_stub "@opentelemetry/exporter-logs-otlp-proto"
create_stub "@opentelemetry/exporter-metrics-otlp-grpc"
create_stub "@opentelemetry/exporter-metrics-otlp-http"
create_stub "@opentelemetry/exporter-metrics-otlp-proto"
create_stub "@opentelemetry/exporter-prometheus"
create_stub "@opentelemetry/exporter-trace-otlp-grpc"
create_stub "@opentelemetry/exporter-trace-otlp-http"
create_stub "@opentelemetry/exporter-trace-otlp-proto"

# Optional native/misc packages
create_stub "color-diff-napi"
create_stub "fflate"
create_stub "modifiers-napi"
create_stub "sharp"
create_stub "turndown"
create_stub "yaml"

# React compiler runtime — needed by all React Compiler-compiled .tsx files
REACT_CR="node_modules/react/compiler-runtime"
if [ ! -f "$REACT_CR/index.js" ]; then
    mkdir -p "$REACT_CR"
    echo 'export function c(n) { return new Array(n).fill(undefined); }' > "$REACT_CR/index.js"
    echo '{"name":"react-compiler-runtime","main":"index.js","module":"index.js","type":"module"}' > "$REACT_CR/package.json"
fi

# Patch react package.json exports to include compiler-runtime
python3 -c "
import json, sys
with open('node_modules/react/package.json') as f:
    pkg = json.load(f)
exports = pkg.get('exports', {})
if isinstance(exports, dict) and './compiler-runtime' not in exports:
    exports['./compiler-runtime'] = './compiler-runtime/index.js'
    pkg['exports'] = exports
    with open('node_modules/react/package.json', 'w') as f:
        json.dump(pkg, f, indent=2)
" 2>/dev/null || true

echo "  Stubs ready."

# Step 2: Bundle to JS
mkdir -p dist
echo "Bundling (3900+ modules)..."
bun build src/entrypoints/cli.tsx --outfile dist/lwcode.js \
  --target bun \
  --define "MACRO.VERSION=\"${VERSION}\"" \
  --define 'MACRO.PACKAGE_URL="lwcode"' \
  --define 'MACRO.ISSUES_EXPLAINER="report at https://github.com/tankyx/claude-code/issues"' \
  --define 'process.env.USER_TYPE="external"'

# Step 3: Fix Bun 1.x bundler bug (empty dynamic import expression)
sed -i 's/then(() => )/then(() => null)/g' dist/lwcode.js

# Step 4: Compile to standalone binary
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
