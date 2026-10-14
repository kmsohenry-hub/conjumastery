import { escapeHtml } from '../../core/security.js';
import { APP_DATA } from '../../data/index.js';
import { State } from '../../core/state/State.js';

const meaningCache = new WeakMap();

function getLowerMeaning(verb) {
  let val = meaningCache.get(verb);
  if (val === undefined) {
    val = verb.meaning.toLowerCase();
    meaningCache.set(verb, val);
  }
  return val;
}

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
      getLowerMeaning(v).includes(search),
  );

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-icon">📫</div><h3>Aucun verbe trouvé</h3><p>Essayez un autre terme de recherche.</p></div>';
    return;
  }

  container.innerHTML = filtered
    .map((v, i) => {
      const isFav = State.isFavorite('verb_' + v.base);
      const base = escapeHtml(v.base);
      const past = escapeHtml(v.past);
      const pp = escapeHtml(v.pp);
      const meaning = escapeHtml(v.meaning);
      return `<div class="verb-card" id="verb-card-${i}" data-action="toggle-verb" data-index="${i}" role="button" tabindex="0" aria-expanded="false">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <span class="verb-base">${base}</span>
            <span style="font-weight:600;color:var(--accent)">${past}</span>
            <span style="font-weight:600;color:var(--secondary)">${pp}</span>
            <span style="color:var(--text-light);margin-left:8px;font-size:0.85rem">${meaning}</span>
          </div>
          <button class="fav-btn ${isFav ? 'active' : ''}" data-action="toggle-fav" data-fav-id="verb_${base}" aria-label="Favori">${isFav ? '★' : '☆'}</button>
        </div>
        <div class="verb-conjugation-table">
          <div class="conj-grid">
            <div class="conj-item"><div class="tense-label">Present Simple</div><div class="tense-form">${base}${v.base === 'be' ? ' (am/is/are)' : ''}</div></div>
            <div class="conj-item"><div class="tense-label">Present Continuous</div><div class="tense-form">${v.base === 'be' ? 'being' : base + 'ing'}</div></div>
            <div class="conj-item"><div class="tense-label">Past Simple</div><div class="tense-form">${past}</div></div>
            <div class="conj-item"><div class="tense-label">Past Continuous</div><div class="tense-form">${base}ing</div></div>
            <div class="conj-item"><div class="tense-label">Present Perfect</div><div class="tense-form">have/has ${pp}</div></div>
            <div class="conj-item"><div class="tense-label">Past Perfect</div><div class="tense-form">had ${pp}</div></div>
            <div class="conj-item"><div class="tense-label">Future</div><div class="tense-form">will ${base}</div></div>
            <div class="conj-item"><div class="tense-label">Participe présent</div><div class="tense-form">${base}ing</div></div>
            <div class="conj-item"><div class="tense-label">Participe passé</div><div class="tense-form">${pp}</div></div>
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
