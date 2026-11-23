import { navigateTo } from '../navigation.js';
import { startExercise } from './exercises.js';
import { escapeHtml } from '../../core/security.js';
import { State } from '../../core/state/State.js';
import { APP_DATA } from '../../data/index.js';

let pendingRevisionTimer = null;

export function renderRevision() {
  const queue = State.getReviewQueue();
  const container = document.getElementById('revisionContent');

  if (queue.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>Aucune révision en attente</h3>
        <p>Votre programme de répétition espacée est à jour. Continuez à apprendre de nouvelles leçons !</p>
        <button type="button" class="btn btn-primary" style="margin-top:16px" data-page="lessons">📚 Voir les leçons</button>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="margin-bottom:20px">
      <p style="color:var(--text-light)">${queue.length} point${queue.length > 1 ? 's' : ''} à réviser</p>
      <button type="button" class="btn btn-primary" style="margin-top:12px" data-action="start-revision">🚀 Démarrer la session de révision</button>
    </div>
    ${queue
      .map((q) => {
        const topic = APP_DATA.tensesById?.[q.tenseId] || APP_DATA.specialTopicsById?.[q.tenseId];
        return `<div class="revision-item">
        <span class="ri-icon">📖</span>
        <div class="ri-info">
          <div class="ri-title">${escapeHtml(topic ? topic.nameFR : q.tenseId)}</div>
          <div class="ri-meta">Prochaine révision : maintenant • Intervalle : ${escapeHtml(String(q.interval))}min • Erreurs : ${escapeHtml(String(q.errors))}</div>
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
  if (pendingRevisionTimer) {
    clearTimeout(pendingRevisionTimer);
    pendingRevisionTimer = null;
  }
  navigateTo('exercises');
  pendingRevisionTimer = setTimeout(() => {
    pendingRevisionTimer = null;
    const exercisesPage = document.getElementById('page-exercises');
    if (exercisesPage && !exercisesPage.classList.contains('active')) return;
    startExercise('mixed', tenses, 'intermediate', tenses.length, null, true);
  }, 100);
}
