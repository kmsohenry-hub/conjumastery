import { navigateTo } from '../navigation.js';
import { startExercise } from './exercises.js';
import { State } from '../../core/state/State.js';
import { APP_DATA } from '../../../data.js';

export function renderRevision() {
  const queue = State.getReviewQueue();
  const container = document.getElementById('revisionContent');

  if (queue.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>Aucune révision en attente</h3>
        <p>Votre programme de répétition espacée est à jour. Continuez à apprendre de nouvelles leçons !</p>
        <button class="btn btn-primary" style="margin-top:16px" onclick="navigateTo('lessons')">📚 Voir les leçons</button>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="margin-bottom:20px">
      <p style="color:var(--text-light)">${queue.length} point${queue.length > 1 ? 's' : ''} à réviser</p>
      <button class="btn btn-primary" style="margin-top:12px" onclick="startRevisionSession()">🚀 Démarrer la session de révision</button>
    </div>
    ${queue
      .map((q) => {
        const tense = APP_DATA.tensesById[q.tenseId];
        return `<div class="revision-item">
        <span class="ri-icon">📖</span>
        <div class="ri-info">
          <div class="ri-title">${tense ? tense.nameFR : q.tenseId}</div>
          <div class="ri-meta">Prochaine révision : maintenant • Intervalle : ${q.interval}min • Erreurs : ${q.errors}</div>
        </div>
        <span class="ri-priority ${q.errors > 3 ? 'priority-high' : q.errors > 1 ? 'priority-medium' : 'priority-low'}">
          ${q.errors > 3 ? 'Urgent' : q.errors > 1 ? 'Moyen' : 'Faible'}
        </span>
      </div>`;
      })
      .join('')}`;
}

export function startRevisionSession() {
  const queue = State.getReviewQueue();
  if (queue.length === 0) return;
  const tenses = queue.map((q) => q.tenseId);
  navigateTo('exercises');
  setTimeout(() => startExercise('mixed', tenses, 'intermediate'), 100);
}
