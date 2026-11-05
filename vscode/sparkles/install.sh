#!/usr/bin/env bash
# Active ou retire les paillettes du pointeur dans VS Code.
#   sudo ./install.sh install     (ajoute la traînée)
#   sudo ./install.sh uninstall   (restaure les fichiers d'origine)
# À relancer après chaque mise à jour de VS Code. Redémarrer VS Code avec Cmd+Q ensuite.
# Variable VSCODE_APP : dossier "app" de VS Code si installé ailleurs.
set -euo pipefail

APP="${VSCODE_APP:-/Applications/Visual Studio Code.app/Contents/Resources/app}"
DIR="$APP/out/vs/code/electron-browser/workbench"
HTML="$DIR/workbench.html"
PRODUCT="$APP/product.json"
KEY="vs/code/electron-browser/workbench/workbench.html"
TAG='<script src="./unicorn-sparkles.js"></script>'
SRC="$(cd "$(dirname "$0")" && pwd)/unicorn-sparkles.js"

[ -f "$HTML" ] || { echo "workbench.html introuvable dans $DIR" >&2; exit 1; }

checksum() { openssl dgst -sha256 -binary "$1" | openssl base64 -A | tr -d '='; }

set_checksum() {
  python3 - "$PRODUCT" "$KEY" "$(checksum "$HTML")" <<'PY'
import re, sys
path, key, value = sys.argv[1:4]
s = open(path, encoding='utf-8').read()
s, n = re.subn(r'("' + re.escape(key) + r'"\s*:\s*")[^"]*(")', r'\g<1>' + value + r'\g<2>', s)
if n != 1:
    sys.exit("clé de checksum introuvable dans product.json")
open(path, 'w', encoding='utf-8').write(s)
PY
}

case "${1:-}" in
  install)
    [ -f "$HTML.unicorn-bak" ] || cp "$HTML" "$HTML.unicorn-bak"
    [ -f "$PRODUCT.unicorn-bak" ] || cp "$PRODUCT" "$PRODUCT.unicorn-bak"
    cp "$SRC" "$DIR/unicorn-sparkles.js"
    if ! grep -qF "$TAG" "$HTML"; then
      python3 - "$HTML" "$TAG" <<'PY'
import sys
path, tag = sys.argv[1:3]
s = open(path, encoding='utf-8').read()
anchor = '<script src="./workbench.js" type="module"></script>'
if anchor not in s:
    sys.exit("point d'insertion introuvable dans workbench.html")
open(path, 'w', encoding='utf-8').write(s.replace(anchor, anchor + "\n\t" + tag, 1))
PY
    fi
    set_checksum
    echo "✔ Paillettes installées. Quitte VS Code (Cmd+Q) et relance-le."
    ;;
  uninstall)
    [ -f "$HTML.unicorn-bak" ] && mv "$HTML.unicorn-bak" "$HTML"
    [ -f "$PRODUCT.unicorn-bak" ] && mv "$PRODUCT.unicorn-bak" "$PRODUCT"
    rm -f "$DIR/unicorn-sparkles.js"
    echo "✔ Paillettes retirées. Quitte VS Code (Cmd+Q) et relance-le."
    ;;
  *)
    echo "Usage : sudo $0 install|uninstall" >&2
    exit 1
    ;;
esac
