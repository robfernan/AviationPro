#!/usr/bin/env bash
set -euo pipefail

echo "=== 1. TypeScript Check (tsc --noEmit) ==="
npx tsc --noEmit
echo "✓ TypeScript clean"

echo "=== 2. Forbidden Strings Audit ==="
if grep -rni "instrument\|garmin" src/; then
  echo "❌ Forbidden string detected in src/"
  exit 1
fi
echo "✓ Zero forbidden strings in src/"

echo "=== 3. Mathematical & Store Unit Tests (bun test) ==="
bun test

echo "=== 4. Production Bundle Build (bun run build) ==="
bun run build
echo "✅ All verification checks passed."
