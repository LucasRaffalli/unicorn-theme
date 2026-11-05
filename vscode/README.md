# Unicorn Theme pour VS Code

Thèmes aux couleurs de l'accent « Unicorn » : rose bonbon et violet, avec des fonds aubergine en sombre. Une traînée de paillettes suit le pointeur.

- **Unicorn Dark** : fonds aubergine, accent rose.
- **Unicorn Light** : neutres gris froids, accent rose plus profond pour le contraste sur blanc.
- **Paillettes** : petits éclats à quatre branches derrière le pointeur, aux couleurs du thème actif.

## Installation

1. Récupérer `unicorn-theme-<version>.vsix`.
2. Dans VS Code : palette de commandes (`Cmd/Ctrl+Shift+P`) > **Extensions: Install from VSIX...**, ou en terminal : `code --install-extension unicorn-theme-<version>.vsix`.
3. `Cmd/Ctrl+K Cmd/Ctrl+T`, puis choisir **Unicorn Dark** ou **Unicorn Light**.

## Activer les paillettes

Le thème s'utilise seul. Pour la traînée :

1. Palette de commandes > **Unicorn: Activer les paillettes**.
2. Saisir le mot de passe administrateur si demandé (macOS et Linux).
3. Quitter complètement VS Code (`Cmd+Q`) puis le relancer.

Pour les retirer : **Unicorn: Désactiver les paillettes**, puis relancer.

> **À faire avant de désinstaller l'extension.** Désinstaller l'extension ne retire pas les paillettes de VS Code : le patch reste en place. Lance d'abord **Unicorn: Désactiver les paillettes**, relance VS Code, puis désinstalle. Si c'est déjà fait dans le mauvais ordre, depuis le dépôt : `cd vscode/sparkles && sudo ./install.sh uninstall` (macOS), puis `Cmd+Q`.

### Ce qu'il faut savoir

VS Code n'offre aucune API pour dessiner par-dessus l'éditeur. L'extension ajoute donc un script au fichier `workbench.html` de VS Code (le même principe que « Custom CSS and JS Loader ») et met à jour l'empreinte correspondante dans `product.json`. Conséquences :

- Une **mise à jour de VS Code** efface le patch. L'extension le détecte au démarrage et propose de le réactiver.
- Selon la version, VS Code peut afficher un avis **« L'installation semble corrompue »**. Il est sans danger : cliquer sur « Ne plus afficher ».
- Si le dossier de VS Code n'est pas modifiable (Windows, installation système), relancer VS Code **en administrateur** avant d'activer.
- Les sauvegardes des fichiers d'origine sont gardées à côté (`*.unicorn-bak`) et restaurées par la commande de désactivation.
- Désactiver sans désinstaller, depuis la console des outils de développement : `localStorage.setItem('unicorn-sparkles', 'off')`.

Le dossier `sparkles/install.sh` fait la même chose en ligne de commande sur macOS (`sudo ./install.sh install`), sans l'extension.

## Terminal en couleur

Le thème fournit la palette ANSI, mais c'est le shell qui décide quoi colorer. À la première ouverture, l'extension propose de colorer le prompt (nom en rose, dossier en bleu, branche git, flèche verte ou rouge) en ajoutant un bloc balisé à `~/.zshrc` (ou `~/.bashrc`). `ls` est coloré automatiquement dans les terminaux de VS Code, sans modifier aucun fichier.

- **Unicorn: Colorer le prompt du terminal** : ajoute ou remet le bloc.
- **Unicorn: Retirer les couleurs du prompt** : le supprime.

## Construire

```
npx @vscode/vsce package
```
