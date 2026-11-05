'use strict';
const vscode = require('vscode');
const path = require('path');
const cp = require('child_process');
const patcher = require('./patcher');

const STATE_KEY = 'unicorn.sparkles.wanted';
const SOURCE = path.join(__dirname, 'sparkles', 'unicorn-sparkles.js');
const PATCHER = path.join(__dirname, 'patcher.js');

function appRoot() { return vscode.env.appRoot; }

function run(args) {
  return new Promise((resolve, reject) => {
    cp.execFile(process.execPath, [PATCHER, ...args],
      { env: Object.assign({}, process.env, { ELECTRON_RUN_AS_NODE: '1' }) },
      (err, _out, stderr) => err ? reject(Object.assign(new Error(stderr.trim() || err.message), { code: err.code })) : resolve());
  });
}

// Relance le patcher avec les droits administrateur (le dossier de VS Code appartient à root sur macOS et Linux).
function runElevated(action) {
  const q = (s) => "'" + s.replace(/'/g, "'\\''") + "'";
  const cmd = ['env', 'ELECTRON_RUN_AS_NODE=1', process.execPath, PATCHER, action, appRoot()].map(q).join(' ');
  return new Promise((resolve, reject) => {
    let child;
    if (process.platform === 'darwin') {
      const script = 'do shell script ' + JSON.stringify(cmd) + ' with administrator privileges';
      child = cp.execFile('osascript', ['-e', script], done);
    } else if (process.platform === 'linux') {
      child = cp.execFile('pkexec', ['sh', '-c', cmd], done);
    } else {
      return reject(new Error('Relance VS Code en administrateur puis réessaie.'));
    }
    function done(err, _o, stderr) { err ? reject(new Error((stderr || err.message).trim())) : resolve(); }
    return child;
  });
}

async function apply(action) {
  try {
    if (action === 'install') { patcher.install(appRoot(), SOURCE); } else { patcher.uninstall(appRoot()); }
  } catch (e) {
    if (e.code !== 'EACCES' && e.code !== 'EPERM') { throw e; }
    await runElevated(action);
  }
}

async function offerRestart(message) {
  const pick = await vscode.window.showInformationMessage(message, 'Redémarrer maintenant');
  if (pick) { vscode.commands.executeCommand('workbench.action.quit'); }
}

async function toggle(context, action) {
  try {
    await apply(action);
    await context.globalState.update(STATE_KEY, action === 'install');
    await offerRestart(action === 'install'
      ? '✨ Paillettes activées. Quitte puis relance VS Code pour les voir (VS Code peut afficher un avis « installation corrompue » : ignore-le ou choisis « Ne plus afficher »).'
      : 'Paillettes retirées. Quitte puis relance VS Code.');
  } catch (e) {
    vscode.window.showErrorMessage('Unicorn : ' + e.message);
  }
}

async function checkAfterUpdate(context) {
  if (!context.globalState.get(STATE_KEY)) { return; }
  let active;
  try { active = patcher.status(appRoot()); } catch (e) { return; }
  if (active) { return; }
  const pick = await vscode.window.showInformationMessage(
    'Unicorn : les paillettes ont disparu (VS Code a sans doute été mis à jour). Les réactiver ?', 'Réactiver', 'Plus tard');
  if (pick === 'Réactiver') { await toggle(context, 'install'); }
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('unicorn.sparkles.enable', () => toggle(context, 'install')),
    vscode.commands.registerCommand('unicorn.sparkles.disable', () => toggle(context, 'uninstall'))
  );
  checkAfterUpdate(context);
}

function deactivate() {}

module.exports = { activate, deactivate };
