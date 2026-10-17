import { escapeHtml } from '../../core/security.js';
import { getIngForm } from '../../core/exercises/conjugation.js';
import { APP_DATA } from '../../data/index.js';
import { State } from '../../core/state/State.js';

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
      v.meaning.toLowerCase().includes(search),
  );

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-icon">📭</div><h3>Aucun verbe trouvé</h3><p>Essayez un autre terme de recherche.</p></div>';
    return;
  }

  container.innerHTML = filtered
    .map((v, i) => {
      const isFav = State.isFavorite('verb_' + v.base);
      const ingForm = escapeHtml(getIngForm(v.base));
      const baseEsc = escapeHtml(v.base);
      const pastEsc = escapeHtml(v.past);
      const ppEsc = escapeHtml(v.pp);
      const meaningEsc = escapeHtml(v.meaning);
      return `<div class="verb-card" id="verb-card-${i}" data-action="toggle-verb" data-index="${i}" role="button" tabindex="0" aria-expanded="false">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <span class="verb-base">${baseEsc}</span>
          <span style="font-weight:600;color:var(--accent)">${pastEsc}</span>
          <span style="font-weight:600;color:var(--secondary)">${ppEsc}</span>
          <span style="color:var(--text-light);margin-left:8px;font-size:0.85rem">${meaningEsc}</span>
        </div>
        <button class="fav-btn ${isFav ? 'active' : ''}" data-action="toggle-fav" data-fav-id="verb_${baseEsc}" aria-label="Favori">${isFav ? '★' : '☆'}</button>
      </div>
      <div class="verb-conjugation-table">
        <div class="conj-grid">
          <div class="conj-item"><div class="tense-label">Present Simple</div><div class="tense-form">${baseEsc}${v.base === 'be' ? ' (am/is/are)' : ''}</div></div>
          <div class="conj-item"><div class="tense-label">Present Continuous</div><div class="tense-form">${ingForm}</div></div>
          <div class="conj-item"><div class="tense-label">Past Simple</div><div class="tense-form">${pastEsc}</div></div>
          <div class="conj-item"><div class="tense-label">Past Continuous</div><div class="tense-form">${ingForm}</div></div>
          <div class="conj-item"><div class="tense-label">Present Perfect</div><div class="tense-form">have/has ${ppEsc}</div></div>
          <div class="conj-item"><div class="tense-label">Past Perfect</div><div class="tense-form">had ${ppEsc}</div></div>
          <div class="conj-item"><div class="tense-label">Future</div><div class="tense-form">will ${baseEsc}</div></div>
          <div class="conj-item"><div class="tense-label">Participe présent</div><div class="tense-form">${ingForm}</div></div>
          <div class="conj-item"><div class="tense-label">Participe passé</div><div class="tense-form">${ppEsc}</div></div>
        </div>
      </div>
    </div>`;
    })
    .join('');
}

export function toggleVerbCard(index) {
  const card = document.getElementById(`verb-card-${index}`);
  if (card) {
    const isExpanded = card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  }
}
