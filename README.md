# SGEP Copilot Hub 
 
A professional, Netflix-like documentation site for collaborative AI adoption at Société Générale.  
Hosted on GitHub Pages. All contributions via PR.

## Features
- Card-based navigation (Netflix-style)
- Search & tags
- Bug tracker & known issues section
- Custom Copilot instructions & prompt files
- Contributors, sponsors, events
- Internal/public resources, with clear tags
- 100% editable by PR

## Local Development

```sh
npm install
npm run start
```

## Fallout RPG (Page de démo)

La page RPG est disponible à l’URL suivante une fois le serveur lancé :

```
http://localhost:3000/test/fallout-rpg
```

### Démarrage rapide (VS Code)

1. Ouvrir le dossier dans VS Code.
2. Installer les dépendances :

```sh
npm install
```

3. Lancer le serveur :

```sh
npm run start -- --host 0.0.0.0 --port 3000
```

## Build for GitHub Pages

```sh
npm run build
GIT_USER=<your-gh-user> USE_SSH=true npm run deploy
```
