'use strict';
// Active ou retire le script de paillettes dans le workbench de VS Code.
// Utilisable en module (extension.js) ou en CLI :
//   node patcher.js install|uninstall|status <dossier app de VS Code>
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SCRIPT_NAME = 'unicorn-sparkles.js';
const TAG = '<script src="./' + SCRIPT_NAME + '"></script>';
const ANCHOR = '<script src="./workbench.js" type="module"></script>';
const BAK = '.unicorn-bak';
// VS Code a déplacé le workbench selon les versions.
const CANDIDATES = [
  'vs/code/electron-browser/workbench/workbench.html',
  'vs/code/electron-sandbox/workbench/workbench.html'
];

function locate(appRoot) {
  for (const key of CANDIDATES) {
    const file = path.join(appRoot, 'out', key);
    if (fs.existsSync(file)) { return { key, html: file, dir: path.dirname(file) }; }
  }
  throw new Error('workbench.html introuvable dans ' + appRoot);
}

function checksum(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('base64').replace(/=+$/, '');
}

// Met à jour l'empreinte dans product.json, sinon VS Code affiche « installation corrompue ».
function setChecksum(appRoot, key, html) {
  const product = path.join(appRoot, 'product.json');
  const text = fs.readFileSync(product, 'utf8');
  const re = new RegExp('("' + key.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '"\\s*:\\s*")[^"]*(")');
  if (!re.test(text)) { return; } // pas de contrôle d'intégrité sur cette version
  fs.writeFileSync(product, text.replace(re, '$1' + checksum(html) + '$2'));
}

function status(appRoot) {
  const { html } = locate(appRoot);
  return fs.readFileSync(html, 'utf8').includes(TAG);
}

function install(appRoot, sourceScript) {
  const { key, html, dir } = locate(appRoot);
  const product = path.join(appRoot, 'product.json');
  if (!fs.existsSync(html + BAK)) { fs.copyFileSync(html, html + BAK); }
  if (!fs.existsSync(product + BAK)) { fs.copyFileSync(product, product + BAK); }
  fs.copyFileSync(sourceScript, path.join(dir, SCRIPT_NAME));
  let s = fs.readFileSync(html, 'utf8');
  if (!s.includes(TAG)) {
    if (!s.includes(ANCHOR)) { throw new Error("point d'insertion introuvable dans workbench.html"); }
    fs.writeFileSync(html, s.replace(ANCHOR, ANCHOR + '\n\t' + TAG));
  }
  setChecksum(appRoot, key, html);
}

function uninstall(appRoot) {
  const { html, dir } = locate(appRoot);
  const product = path.join(appRoot, 'product.json');
  if (fs.existsSync(html + BAK)) { fs.renameSync(html + BAK, html); }
  else {
    // Pas de sauvegarde (VS Code mis à jour entre-temps) : on retire simplement la balise.
    const s = fs.readFileSync(html, 'utf8');
    fs.writeFileSync(html, s.replace('\n\t' + TAG, '').replace(TAG, ''));
  }
  if (fs.existsSync(product + BAK)) { fs.renameSync(product + BAK, product); }
  else { const { key } = locate(appRoot); setChecksum(appRoot, key, html); }
  fs.rmSync(path.join(dir, SCRIPT_NAME), { force: true });
}

module.exports = { install, uninstall, status, locate };

if (require.main === module) {
  const [action, appRoot] = process.argv.slice(2);
  try {
    if (action === 'install') { install(appRoot, path.join(__dirname, 'sparkles', SCRIPT_NAME)); }
    else if (action === 'uninstall') { uninstall(appRoot); }
    else if (action === 'status') { console.log(status(appRoot) ? 'on' : 'off'); }
    else { throw new Error('usage : node patcher.js install|uninstall|status <app>'); }
  } catch (e) {
    console.error(e.message);
    process.exit(e.code === 'EACCES' || e.code === 'EPERM' ? 13 : 1);
  }
}
