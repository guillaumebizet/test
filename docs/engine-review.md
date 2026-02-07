# Revue moteur — recommandations

Résumé rapide

- Extraire la logique de jeu (`reducer`, règles de combat, loot tables) dans un module `src/game/engine.js` pour faciliter les tests et la maintenance.
- Introduire un RNG seedable pour tests reproductibles et débogage (ex: `seedrandom`).
- Ajouter des tests unitaires sur les règles critiques : combat, loot, consommation de ressources, AP.
- Implémenter une API de persistance (save/load via `localStorage` puis endpoint serveur si besoin).
- Documenter clairement les hooks de l'engine (actions, événements, états attendus).

Améliorations de gameplay proposées

- AP/tours : actions coûtent AP, réinitialisation à la fin du tour (implémentation prototype incluse).
- Couverture/ligne de vue : ajout de modificateurs de précision sur les tuiles (couverture légère/forte).
- Loot tables par zone : séparation des tables par `zone.type` avec poids et rareté.
- Faim/Soif : réduire vitesse d'augmentation pour rendre exploration plus tactique, ajouter alarmes et consommables spécifiques.
- Évènements narratifs : possibilités de missions secondaires liées aux reliques/artefacts.

Performance & architecture

- Séparer rendu (React) et engine pour permettre une UI native (Electron) ou serveur headless.
- Cacher calculs coûteux (pathfinding, L.O.S.) et recalculer seulement au besoin.
- Prévoir data-driven content (zones/enemies/loot) en JSON pour itération rapide.

Roadmap courte

1. Extraire engine et tests unitaires (2–3 jours).
2. Implémenter couverture/ligne de vue + pathfinding (A* léger) (3–4 jours).
3. Itérer équilibrage loot / faim / soif et ajouter outils de tuning (tables + telemetry) (2–3 jours).

Notes finales

Le prototype intégré aujourd'hui couvre : grille de mouvement / AP / HUD repositionné / loot par zone / tips. Pour industrialiser le système, commencer par l'extraction de l'engine et l'écriture de tests est la priorité.
