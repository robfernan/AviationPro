#!/usr/bin/env bash
set -euo pipefail

echo "=== AviationPro Local Mobile Sync (Capacitor) ==="
bun run build
npx cap sync
echo "✅ Web assets synced to Capacitor mobile project."
