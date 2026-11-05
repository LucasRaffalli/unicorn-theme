'use strict';
const vscode = require('vscode');
const path = require('path');
const cp = require('child_process');
const fs = require('fs');
const os = require('os');
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


// ---- Couleurs du terminal (prompt et ls) ----------------------------------
const PROMPT_KEY = 'unicorn.terminal.asked';
const BEGIN = '# >>> unicorn prompt >>>';
const END = '# <<< unicorn prompt <<<';

const ZSH_SNIPPET = [
  'setopt PROMPT_SUBST',
  'autoload -Uz vcs_info',
  'precmd() { vcs_info }',
  "zstyle ':vcs_info:git:*' formats ' %F{magenta}(%b)%f'",
  "PROMPT='%F{magenta}%n%f %F{blue}%~%f${vcs_info_msg_0_} %(?.%F{green}.%F{red})❯%f '"
].join('\n');

const BASH_SNIPPET = [
  "__unicorn_branch() { local b; b=$(git branch --show-current 2>/dev/null); [ -n \"$b\" ] && printf ' (%s)' \"$b\"; }",
  "PS1='\\[\\e[35m\\]\\u\\[\\e[0m\\] \\[\\e[34m\\]\\w\\[\\e[35m\\]$(__unicorn_branch)\\[\\e[0m\\] \\[\\e[32m\\]❯\\[\\e[0m\\] '"
].join('\n');

function shellRc() {
  const sh = path.basename(process.env.SHELL || '');
  if (sh === 'zsh') { return { file: path.join(os.homedir(), '.zshrc'), snippet: ZSH_SNIPPET }; }
  if (sh === 'bash') {
    const file = path.join(os.homedir(), process.platform === 'darwin' ? '.bash_profile' : '.bashrc');
    return { file, snippet: BASH_SNIPPET };
  }
  return null;
}

function stripBlock(text) {
  const re = new RegExp('\\n?' + BEGIN.replace(/[>]/g, '\\$&') + '[\\s\\S]*?' + END.replace(/[<]/g, '\\$&') + '\\n?', 'g');
  return text.replace(re, '\n');
}

function enablePrompt() {
  const rc = shellRc();
  if (!rc) { throw new Error('Shell non pris en charge (zsh et bash seulement).'); }
  const current = fs.existsSync(rc.file) ? fs.readFileSync(rc.file, 'utf8') : '';
  const clean = stripBlock(current).replace(/\s+$/, '');
  fs.writeFileSync(rc.file, (clean ? clean + '\n\n' : '') + BEGIN + '\n' + rc.snippet + '\n' + END + '\n');
  return rc.file;
}

function disablePrompt() {
  const rc = shellRc();
  if (!rc || !fs.existsSync(rc.file)) { return; }
  fs.writeFileSync(rc.file, stripBlock(fs.readFileSync(rc.file, 'utf8')).replace(/\s+$/, '') + '\n');
}

// ls en couleur dans les terminaux de VS Code, sans toucher aux fichiers de l'utilisateur.
function applyTerminalEnv(context) {
  const env = context.environmentVariableCollection;
  env.description = 'Unicorn : ls en couleur';
  if (process.platform !== 'win32') {
    env.replace('CLICOLOR', '1');
    env.replace('LSCOLORS', 'exfxcxdxbxegedabagacad');
  }
}

async function askPrompt(context) {
  if (process.platform === 'win32' || context.globalState.get(PROMPT_KEY) || !shellRc()) { return; }
  await context.globalState.update(PROMPT_KEY, true);
  const pick = await vscode.window.showInformationMessage(
    'Unicorn : colorer le prompt du terminal (nom en rose, dossier en bleu, branche git, flèche verte ou rouge) ? Ajoute un bloc à ton fichier de configuration du shell.',
    'Oui', 'Non merci');
  if (pick === 'Oui') { runEnablePrompt(); }
}

function runEnablePrompt() {
  try {
    const file = enablePrompt();
    vscode.window.showInformationMessage('Prompt coloré ajouté à ' + file + '. Ouvre un nouveau terminal pour le voir.');
  } catch (e) {
    vscode.window.showErrorMessage('Unicorn : ' + e.message);
  }
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('unicorn.sparkles.enable', () => toggle(context, 'install')),
    vscode.commands.registerCommand('unicorn.sparkles.disable', () => toggle(context, 'uninstall')),
    vscode.commands.registerCommand('unicorn.terminal.enable', runEnablePrompt),
    vscode.commands.registerCommand('unicorn.terminal.disable', () => {
      disablePrompt();
      vscode.window.showInformationMessage('Prompt coloré retiré. Ouvre un nouveau terminal.');
    })
  );
  applyTerminalEnv(context);
  checkAfterUpdate(context);
  askPrompt(context);
}

function deactivate() {}

module.exports = { activate, deactivate };
