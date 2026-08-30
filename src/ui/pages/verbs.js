import { State } from '../../core/state/State.js';
import { getIngForm } from '../../core/exercises/conjugation.js';
import { APP_DATA } from '../../data/index.js';

export function renderVerbs() {
  filterVerbs();
}

export function filterVerbs() {
  const search = (document.getElementById('verbSearch')?.value || '').toLowerCase();
  const container = document.getElementById('verbsList');

  const filtered = APP_DATA.irregularVerbs.filter(
    (v) =>
      v.base.includes(search) ||
      v.past.includes(search) ||
      v.pp.includes(search) ||
      v.meaning.includes(search),
  );

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-icon">📭</div><h3>Aucun verbe trouvé</h3><p>Essayez un autre terme de recherche.</p></div>';
    return;
  }

  container.innerHTML = filtered
    .map((v, i) => {
      const isFav = State.isFavorite('verb_' + v.base);
      return `<div class="verb-card" id="verb-card-${i}" onclick="toggleVerbCard(${i})">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <span class="verb-base">${v.base}</span>
          <span style="color:var(--text-light);margin:0 8px">→</span>
          <span style="font-weight:600;color:var(--accent)">${v.past}</span>
          <span style="color:var(--text-light);margin:0 8px">→</span>
          <span style="font-weight:600;color:var(--secondary)">${v.pp}</span>
          <span style="color:var(--text-light);margin-left:8px;font-size:0.85rem">${v.meaning}</span>
        </div>
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation();toggleFav('verb_${v.base}', this)">${isFav ? '★' : '☆'}</button>
      </div>
      <div class="verb-conjugation-table">
        <div class="conj-grid">
          <div class="conj-item"><div class="tense-label">Present Simple</div><div class="tense-form">${v.base}${v.base === 'be' ? ' (am/is/are)' : ''}</div></div>
          <div class="conj-item"><div class="tense-label">Present Continuous</div><div class="tense-form">${getIngForm(v.base)}</div></div>
          <div class="conj-item"><div class="tense-label">Past Simple</div><div class="tense-form">${v.past}</div></div>
          <div class="conj-item"><div class="tense-label">Past Continuous</div><div class="tense-form">${getIngForm(v.base)}</div></div>
          <div class="conj-item"><div class="tense-label">Present Perfect</div><div class="tense-form">have/has ${v.pp}</div></div>
          <div class="conj-item"><div class="tense-label">Past Perfect</div><div class="tense-form">had ${v.pp}</div></div>
          <div class="conj-item"><div class="tense-label">Future</div><div class="tense-form">will ${v.base}</div></div>
          <div class="conj-item"><div class="tense-label">Participe présent</div><div class="tense-form">${getIngForm(v.base)}</div></div>
          <div class="conj-item"><div class="tense-label">Participe passé</div><div class="tense-form">${v.pp}</div></div>
        </div>
      </div>
    </div>`;
    })
    .join('');
}

export function toggleVerbCard(index) {
  const card = document.getElementById(`verb-card-${index}`);
  card.classList.toggle('expanded');
}
