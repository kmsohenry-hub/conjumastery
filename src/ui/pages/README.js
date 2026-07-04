/**
 * @module ui/pages
 * @description Point d'entrée pour les modules de rendu UI.
 *
 * --- BRIEF ITÉRATION 2 ---
 *
 * Chaque renderer de page dans app.js doit être extrait vers son propre module.
 *
 * Référence : PROPOSITION_REFACTORISATION.md (section "Étape 4 — UI")
 *
 * Objectifs :
 * 1. Extraire chaque fonction render*() de app.js vers src/ui/pages/<page>.js
 * 2. Chaque module exporte une fonction render() qui retourne du HTML (string)
 * 3. app.js importe et appelle ces fonctions
 * 4. Le pattern : le module reçoit l'état en paramètre, retourne le HTML
 * 5. Pas de logique métier dans les modules UI (séparation des préoccupations)
 *
 * Pages à extraire (dans l'ordre suggéré) :
 *   - dashboard.js      → renderDashboard()
 *   - lessons.js        → renderLessons()
 *   - exercises.js      → renderExercises() + renderQuestion() + validateExercise()
 *   - test.js           → renderTest() + validateTestAnswer()
 *   - tenses.js         → renderTenses() + showComparison()
 *   - verbs.js          → renderVerbs()
 *   - reviews.js        → renderReviews()
 *   - weakpoints.js     → renderWeakPoints()
 *   - search.js         → renderSearch()
 *   - favorites.js      → renderFavorites()
 *   - stats.js          → renderStats()
 *
 * Utilitaires à extraire :
 *   - src/ui/utils/toast.js      → showToast()
 *   - src/ui/utils/confetti.js   → launchConfetti()
 *   - src/ui/utils/notifications.js → browser notifications
 *
 * Contraintes :
 *   - Rétrocompatibilité : app.js garde les wrappers globaux (window.render* = ...)
 *   - Les tests existants doivent passer
 *   - Pas de régression UX
 *   - Chaque fichier < 300 lignes
 *
 * Pattern suggéré pour chaque module :
 *
 *   // src/ui/pages/dashboard.js
 *   import { getState } from '../../core/state/store.js';
 *   export function renderDashboard() {
 *     const state = getState();
 *     return `<div>...</div>`;
 *   }
 *
 * À toi de jouer, Jules ! 🚀
 */

export {};
