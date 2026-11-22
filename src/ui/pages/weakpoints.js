import { escapeHtml } from '../../core/security.js';
import { State } from '../../core/state/State.js';
import { APP_DATA } from '../../data/index.js';

export function renderWeakpoints() {
  const weak = State.getWeakPoints();
  const container = document.getElementById('weakpointsContent');

  if (weak.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <h3>Aucun point faible identifié</h3>
        <p>Continuez les exercices pour que le système identifie vos points à améliorer.</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <p style="color:var(--text-light);margin-bottom:20px">Temps avec un taux de réussite inférieur à 70% :</p>
    <div class="grid" style="gap:12px">
      ${weak
        .map((w) => {
          const topic = APP_DATA.tensesById?.[w.tenseId] || APP_DATA.specialTopicsById?.[w.tenseId];
          const accuracy = Math.round(w.accuracy * 100);
          return `
        <div class="card weakpoint-card" style="display:flex;flex-wrap:wrap;align-items:center;gap:16px;padding:16px 20px">
          <div style="text-align:center;min-width:60px">
            <div style="font-size:1.5rem;font-weight:800;color:${accuracy < 40 ? 'var(--danger)' : accuracy < 60 ? 'var(--warning)' : 'var(--success)'}">${accuracy}%</div>
            <div style="font-size:0.7rem;color:var(--text-light)">précision</div>
          </div>
          <div style="flex:1;min-width:160px">
            <div style="font-weight:700">${escapeHtml(topic ? topic.nameFR : w.tenseId)}</div>
            <div style="font-size:0.8rem;color:var(--text-light)">${w.total} exercices • ${w.errors} erreurs</div>
            <div class="progress-bar" style="height:6px;margin-top:6px">
              <div class="progress-fill ${accuracy < 50 ? 'warning' : 'success'}" style="width:${accuracy}%"></div>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" data-action="start-tense" data-tense-id="${escapeHtml(w.tenseId)}">🎯 Pratiquer</button>
        </div>`;
        })
        .join('')}
    </div>`;
}
