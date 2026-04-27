# Proposition de refactorisation — ConjuMaster UK

## Objectif
Rendre le code plus maintenable, testable et évolutif sans changer le comportement utilisateur.

## Constats après étude du projet

1. **`app.js` concentre de nombreuses responsabilités** (sécurité, état, moteur d'exercice, rendu UI, notifications, persistance), ce qui rend les changements risqués et les tests unitaires plus difficiles.
2. **Le couplage DOM ↔ logique métier est fort** : plusieurs fonctions métier appellent directement des effets d'UI (`showToast`, `updateUI`, etc.).
3. **La persistance (`localStorage`) est implicite et dispersée** : plusieurs actions sauvegardent directement l'état au fil de l'eau.
4. **Les tests utilisent `eval` et des remplacements textuels** pour exposer des objets globaux, signe que l'architecture actuelle n'est pas encore modulaire.
5. **`data.js` est très volumineux** et mélange structure pédagogique et contenu, ce qui complique la navigation.

## Cible d'architecture (progressive, sans Big Bang)

### 1) Découper `app.js` en modules ES

Proposition de structure :

- `src/core/state/store.js` : état applicatif pur + mutations.
- `src/core/state/selectors.js` : calculs dérivés (`getWeakPoints`, queue de révision).
- `src/core/persistence/storage.js` : lecture/écriture `localStorage` et migration de schéma.
- `src/core/exercises/conjugation.js` : règles de conjugaison.
- `src/core/exercises/generator.js` : génération des exercices.
- `src/ui/render.js` : rendu DOM uniquement.
- `src/ui/events.js` : binding des événements.
- `src/app/bootstrap.js` : assemblage et initialisation.

**Bénéfice** : chaque module a une responsabilité claire et testable.

### 2) Introduire un "Store" découplé de l'UI

- Remplacer les appels directs `updateUI()` dans le cœur métier par un mécanisme `subscribe(listener)`.
- Le store notifie l'UI des changements; l'UI décide quoi rerender.
- Les side effects (toast/confetti/notifications) passent par des adaptateurs UI.

**Bénéfice** : logique métier testable sans DOM.

### 3) Encapsuler les effets externes

Créer des ports/adaptateurs :

- `Clock` (date/heure)
- `Storage` (`localStorage`)
- `Notifier` (toast, confetti, web notifications)

**Bénéfice** : tests déterministes (mock propre), moins de globals.

### 4) Réorganiser les données pédagogiques

- Scinder `data.js` en fichiers par domaine :
  - `src/data/tenses/*.js`
  - `src/data/irregular-verbs.js`
  - `src/data/lessons.js`
- Ajouter un module `src/data/index.js` qui agrège et valide la cohérence minimale au chargement.

**Bénéfice** : maintenabilité éditoriale et revues Git plus lisibles.

### 5) Faire évoluer la stratégie de tests

- Tester les modules métier en import direct (sans `eval`).
- Conserver des tests d'intégration UI ciblés (jsdom) pour les parcours critiques.
- Ajouter des tests de non-régression pour les règles de conjugaison et l'algorithme de répétition espacée.

**Bénéfice** : exécution plus fiable + meilleure couverture des régressions fonctionnelles.

## Plan en 4 itérations (faible risque)

### Itération 1 — Extraction sûre
- Déplacer les fonctions de conjugaison dans `conjugation.js`.
- Déplacer la génération de questions dans `generator.js`.
- Garder l'API publique actuelle comme façade pour ne rien casser.

### Itération 2 — Store modulaire
- Créer un store pur + persistance dédiée.
- Brancher l'UI via `subscribe`.
- Remplacer les appels directs aux globals d'UI.

### Itération 3 — Données & validations
- Fragmenter les datasets.
- Ajouter validation de structure au démarrage.

### Itération 4 — Nettoyage et stabilité
- Supprimer le code global résiduel.
- Simplifier les tests (imports natifs).
- Mesurer perf chargement initial + temps de génération.

## Garde-fous recommandés

- **Contrat de compatibilité** : ne pas changer les IDs des temps (`present_simple`, etc.).
- **Feature flags simples** : activer progressivement la nouvelle pile (ex. `USE_MODULAR_ENGINE`).
- **Checklist de PR** :
  - 0 changement UX visible non prévu
  - tests unitaires OK
  - taille bundle contrôlée
  - données inchangées (ou migration documentée)

## Priorités immédiates (quick wins)

1. Exporter `State` et `ExerciseEngine` comme modules importables.
2. Isoler `localStorage` dans un seul fichier.
3. Créer `selectors` purs pour `weakPoints` et `reviewQueue`.
4. Ajouter une suite de tests pour les cas limites de conjugaison (`-y`, `-ie`, verbes irréguliers).

---

Si souhaité, je peux enchaîner avec **un PR technique minimal (itération 1)** qui extrait la conjugaison et la génération d'exercices sans modifier l'interface.
