#!/usr/bin/env bash
set -euo pipefail

echo "=== AviationPro Local Desktop Build (Wails) ==="
bun run build
if command -v wails >/dev/null 2>&1; then
  (cd platforms/desktop && wails build)
  echo "✅ Wails desktop binary built in platforms/desktop/build/bin/"
else
  echo "⚠️ 'wails' CLI not found in PATH. Web assets are ready in dist/ for Wails embedding."
fi
