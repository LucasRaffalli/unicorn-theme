# Unicorn Theme

Thème JetBrains issu de l'app Kairos : rose bonbon et violet, fonds aubergine en sombre. Deux variantes, **Unicorn Dark** et **Unicorn Light**, pour toute la suite (WebStorm, PhpStorm, IntelliJ, etc., build 243 et plus).

## Construire le plugin

```bash
gradle buildPlugin
```

Le zip est produit dans `build/distributions/`. Pas de wrapper Gradle dans le dépôt : `gradle wrapper` en génère un si besoin.

## Installer

`Settings > Plugins > roue crantée > Install Plugin from Disk...`, choisir le zip, redémarrer, puis `Settings > Appearance & Behavior > Appearance > Theme`.

## Paillettes

Des éclats à quatre branches suivent le pointeur (un tous les 22 px, 34 au maximum, 40 à 80 images de vie). Les couleurs suivent la variante active. Désactivation : `Settings > Appearance & Behavior > Appearance > Unicorn Sparkles`, ou le menu `Tools > Unicorn Sparkles`. Le code est dans `src/main/java/com/lucasraffalli/unicorn/sparkles/`. Le réglage « réduire les animations » de macOS n'est pas pris en compte : seul l'interrupteur coupe l'effet.

## Structure

- `src/main/resources/META-INF/plugin.xml` : déclaration des deux thèmes et des deux jeux de couleurs
- `src/main/resources/themes/unicorn-*.theme.json` : interface (palette nommée en tête de fichier, issue de `_tokens.scss` de Kairos)
- `src/main/resources/themes/Unicorn*.xml` : couleurs de l'éditeur et de la syntaxe

## Choix propres à la transposition

Kairos ne définit pas de couleurs de syntaxe : elles viennent des suggestions du document de référence. En clair, les verts, bleus, jades et corail sont des versions assombries des teintes du sombre (`#74c496` sur blanc est illisible), et l'éditeur est blanc avec des panneaux gris froids.
