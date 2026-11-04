# Unicorn Theme

Thème pour les IDE JetBrains (WebStorm, PhpStorm, IntelliJ IDEA, etc.), aux couleurs de l'accent caché « Unicorn » de l'app Kairos : rose bonbon et violet, avec des fonds aubergine en sombre. Il inclut des paillettes qui suivent le pointeur, désactivables.

## Contenu

- **Unicorn Dark** : la variante principale. Fonds teintés aubergine, accent rose.
- **Unicorn Light** : neutres gris froids, accent rose plus profond pour garder le contraste sur blanc.
- **Paillettes** : de petits éclats à quatre branches naissent derrière le pointeur, aux couleurs de la variante active.

Chaque variante comprend le thème d'interface (barres, onglets, boutons, popups, arbres) et un jeu de couleurs d'éditeur pour la syntaxe, la console et les inspections.

## Compatibilité

IDE JetBrains en version 2024.3 (build 243) ou plus récente. Testé sur WebStorm 2026.2.

## Installation

### Depuis un zip

1. Récupérer `unicorn-theme-<version>.zip` (page des releases du dépôt, ou voir « Construire » ci-dessous).
2. Dans l'IDE : `Settings > Plugins`, roue crantée, **Install Plugin from Disk...**, choisir le zip.
3. Redémarrer l'IDE. Le redémarrage est nécessaire : sans lui, les paillettes peuvent ne pas se lancer.
4. Choisir le thème dans `Settings > Appearance & Behavior > Appearance > Theme` : **Unicorn Dark** ou **Unicorn Light**. Le jeu de couleurs de l'éditeur suit automatiquement.

Si l'IDE repasse de lui-même en clair ou en sombre, décocher **Sync with OS** sous le menu Theme.

### Construire

Prérequis : un JDK 17 ou plus et [Gradle](https://gradle.org/).

```bash
gradle buildPlugin
```

Le zip est produit dans `build/distributions/`. Le dépôt ne contient pas de wrapper Gradle ; `gradle wrapper` en génère un si besoin.

## Paillettes

- Un éclat naît tous les 22 px parcourus par le pointeur, 34 au maximum à l'écran.
- Chaque éclat tourne lentement, tombe avec une légère gravité, rétrécit et s'éteint en 40 à 80 images.
- Rien n'est animé quand le pointeur est immobile.
- Les couleurs suivent la variante : rose, violet et lilas en sombre ; teintes plus profondes en clair.

Pour les désactiver ou les réactiver :

- `Settings > Appearance & Behavior > Appearance > Unicorn Sparkles`, ou
- le menu `Tools > Unicorn Sparkles` (à la volée, sans redémarrer).

Le réglage « réduire les animations » de macOS n'est pas pris en compte : seul l'interrupteur coupe l'effet.

## Image ou icône de fond

Cette fonction est native dans les IDE JetBrains, le thème n'en impose aucune :

1. `Cmd + Shift + A` (ou `Ctrl + Shift + A`), puis **Set Background Image**.
2. Choisir une image (un PNG transparent se pose sans cadre sur le fond aubergine).
3. Régler l'opacité (10 à 20 % garde le code lisible), la position et la zone d'application, puis **Apply**.

Pour retirer l'image : même action, puis **Clear and Close**.

## Palette

Les valeurs viennent de `_tokens.scss` de Kairos.

| Rôle | Sombre | Clair |
| --- | --- | --- |
| Fond de l'app | `#150d18` | `#eceef1` |
| Panneaux et popups | `#1e1324` | `#ffffff` |
| Surface | `#281a30` | `#f3f4f6` |
| Bordure | `#4a2d58` | `#d6d9de` |
| Texte principal | `#f2e7f7` | `#15141b` |
| Accent (remplissage) | `#e0559f` | `#e0559f` |
| Accent texte (liens, éléments actifs) | `#f480c1` | `#b83a7e` |

Syntaxe en sombre : mots-clés `#f480c1`, chaînes `#74c496`, nombres et constantes `#bd93f9`, fonctions `#7da3cc`, types `#7ecdb3`, paramètres `#e39b8f`, commentaires `#83688f` en italique. Kairos ne définit pas de couleurs de syntaxe : ces correspondances sont une transposition. En clair, les verts, bleus, jades et corail sont des versions assombries des teintes du sombre, car `#74c496` est illisible sur blanc.

## Structure

```
src/main/resources/
  META-INF/plugin.xml          déclaration des thèmes, des jeux de couleurs et des paillettes
  themes/unicorn-*.theme.json  interface (palette nommée en tête de fichier)
  themes/Unicorn*.xml          couleurs de l'éditeur et de la syntaxe
src/main/java/com/lucasraffalli/unicorn/sparkles/
                               moteur des paillettes, réglage et action on/off
```

## Limites connues

- La variante contraste de Kairos n'est pas reprise.
- Les paillettes sont dessinées sur le thread d'interface : sur une grosse machine chargée ou un très gros fichier, une baisse de fluidité est possible. L'interrupteur existe pour ça.
