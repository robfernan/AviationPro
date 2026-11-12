#!/usr/bin/env bash
set -euo pipefail

export PATH="/usr/local/go/bin:$HOME/go/bin:$PATH"

echo "=== AviationPro Local Desktop Build (Wails) ==="
bun run build
mkdir -p platforms/desktop/wails/frontend/dist
cp -r dist/* platforms/desktop/wails/frontend/dist/
if command -v wails >/dev/null 2>&1; then
  (cd platforms/desktop/wails && wails build -s)
  echo "✅ Wails desktop binary built in platforms/desktop/wails/build/bin/"
else
  echo "⚠️ 'wails' CLI not found in PATH. Web assets are ready in dist/ for Wails embedding."
fi
