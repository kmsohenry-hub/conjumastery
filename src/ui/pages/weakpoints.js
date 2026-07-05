import { State } from '../../core/state/State.js';
import { APP_DATA } from '../../../data.js';


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
    <p style="color:var(--text-light);margin-bottom:20px">${weak.length} point${weak.length > 1 ? 's' : ''} faible${weak.length > 1 ? 's' : ''} détecté${weak.length > 1 ? 's' : ''}</p>
    <div class="grid" style="gap:12px">
      ${weak
        .map((w) => {
          const tense = APP_DATA.tensesById[w.tenseId];
          const accuracy = Math.round(w.accuracy * 100);
          return `<div class="card" style="display:flex;align-items:center;gap:16px">
          <div style="text-align:center;min-width:80px">
            <div style="font-size:1.5rem;font-weight:800;color:${accuracy < 40 ? 'var(--danger)' : accuracy < 60 ? 'var(--warning)' : 'var(--success)'}">${accuracy}%</div>
            <div style="font-size:0.7rem;color:var(--text-light)">précision</div>
          </div>
          <div style="flex:1">
            <div style="font-weight:700">${tense ? tense.nameFR : w.tenseId}</div>
            <div style="font-size:0.8rem;color:var(--text-light)">${w.total} exercices • ${w.errors} erreurs</div>
            <div class="progress-bar" style="margin-top:8px;height:6px">
              <div class="progress-fill ${accuracy < 50 ? 'warning' : 'success'}" style="width:${accuracy}%"></div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="('${w.tenseId}')">🎯 Pratiquer</button>
        </div>`;
        })
        .join('')}
    </div>`;
}
