#!/usr/bin/env bash
# Usage : ./release.sh [nouvelle_version]
# Sans argument, utilise la version de build.gradle.kts.
# Commit, push, tag vX.Y.Z et push du tag -> GitHub Actions publie la release.
set -euo pipefail
cd "$(dirname "$0")"

if [ $# -ge 1 ]; then
  sed -i.bak -E "s/^version = \".*\"/version = \"$1\"/" build.gradle.kts && rm build.gradle.kts.bak
fi

VERSION=$(sed -n -E 's/^version = "(.*)"/\1/p' build.gradle.kts)
# Garde l'extension VS Code sur la même version
(cd vscode && npm version "$VERSION" --no-git-tag-version --allow-same-version >/dev/null)
TAG="v$VERSION"

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Le tag $TAG existe déjà. Donne une nouvelle version : ./release.sh 1.2.0" >&2
  exit 1
fi

git add -A
git diff --cached --quiet || git commit -m "release: $TAG"
git push origin HEAD
git tag "$TAG"
git push origin "$TAG"

echo "✔ $TAG poussé. Release : https://github.com/LucasRaffalli/unicorn-theme/releases"
