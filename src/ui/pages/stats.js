import { State } from '../../core/state/State.js';
import { APP_DATA } from '../../../data.js';


export function renderStats() {
  const d = State.data;
  document.getElementById('statTotal').textContent = d.totalExercises;
  document.getElementById('statCorrect').textContent = d.correctAnswers;
  document.getElementById('statIncorrect').textContent = d.incorrectAnswers;
  document.getElementById('statStreak').textContent = d.bestStreak;

  // Chart
  const chartEl = document.getElementById('statsChart');
  const stats = d.tenseStats;
  const tenses = APP_DATA.tenses.filter((t) => stats[t.id] && stats[t.id].total > 0);

  if (tenses.length === 0) {
    chartEl.innerHTML =
      '<div class="empty-state" style="padding:20px"><p>Aucune donnée disponible</p></div>';
  } else {
    chartEl.innerHTML = tenses
      .map((t) => {
        const s = stats[t.id];
        const accuracy = Math.round((s.correct / s.total) * 100);
        const height = Math.max(accuracy, 5);
        const color =
          accuracy >= 80 ? 'var(--success)' : accuracy >= 50 ? 'var(--warning)' : 'var(--danger)';
        return `<div class="bar-item">
        <div class="bar-value">${accuracy}%</div>
        <div class="bar" style="height:${height}%;background:${color}"></div>
        <div class="bar-label">${t.nameFR.split(' ')[0]}</div>
      </div>`;
      })
      .join('');
  }

  // Activity log
  const logEl = document.getElementById('activityLog');
  const recent = d.activityLog.slice(-10).reverse();
  if (recent.length === 0) {
    logEl.innerHTML =
      '<p style="color:var(--text-light);font-size:0.85rem;padding:12px">Aucune activité récente</p>';
  } else {
    logEl.innerHTML = recent
      .map((a) => {
        const date = new Date(a.date);
        return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.8rem">
        <span>${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
        <span style="color:var(--primary);font-weight:600">+${a.xp} XP</span>
      </div>`;
      })
      .join('');
  }

  // Common errors
  const errorsEl = document.getElementById('commonErrors');
  if (d.errorLog.length === 0) {
    errorsEl.innerHTML =
      '<p style="color:var(--text-light);font-size:0.85rem">Aucune erreur enregistrée</p>';
  } else {
    const tenseErrors = {};
    d.errorLog.forEach((e) => {
      tenseErrors[e.tenseId] = (tenseErrors[e.tenseId] || 0) + 1;
    });
    const sorted = Object.entries(tenseErrors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    errorsEl.innerHTML = sorted
      .map(([tenseId, count]) => {
        const tense = APP_DATA.tensesById[tenseId];
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:0.9rem">${tense ? tense.nameFR : tenseId}</span>
        <span style="background:rgba(225,112,85,0.1);color:var(--danger);padding:4px 10px;border-radius:12px;font-size:0.75rem;font-weight:700">${count} erreur${count > 1 ? 's' : ''}</span>
      </div>`;
      })
      .join('');
  }
}
