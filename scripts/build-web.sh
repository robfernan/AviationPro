#!/usr/bin/env bash
set -euo pipefail

echo "=== AviationPro Local Web Build ==="
bun run build
echo "✅ Production web assets built in dist/"
