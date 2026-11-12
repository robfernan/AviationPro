#!/usr/bin/env bash
set -euo pipefail

echo "=== AviationPro Local GitHub Pages Deployment (gh-pages) ==="
bun run build

# Ensure SPA fallback and bypass Jekyll processing on GitHub Pages
cp dist/index.html dist/404.html
touch dist/.nojekyll

ASSETS_TMP=$(mktemp -d)
WT_TMP=$(mktemp -d)
cp -r dist/* dist/.nojekyll "$ASSETS_TMP/"

git worktree prune
git branch -D gh-pages 2>/dev/null || true
git worktree add --detach "$WT_TMP"
(
  cd "$WT_TMP"
  git checkout --orphan gh-pages
  git rm -rf . >/dev/null 2>&1 || true
  cp -r "$ASSETS_TMP"/* "$ASSETS_TMP/.nojekyll" .
  git add -A
  git commit -m "deploy(pages): publish production PWA bundle to GitHub Pages"
  git push -f origin gh-pages
)
git worktree remove --force "$WT_TMP"
rm -rf "$ASSETS_TMP" "$WT_TMP"

if command -v gh >/dev/null 2>&1; then
  gh api --method PUT repos/robfernan/AviationPro/pages \
    -f build_type=legacy \
    -f "source[branch]=gh-pages" \
    -f "source[path]=/" >/dev/null 2>&1 || true
  gh api --method POST repos/robfernan/AviationPro/pages/builds >/dev/null 2>&1 || true
fi

echo "✅ Published latest build to https://robfernan.github.io/AviationPro/"
