import { State } from '../../core/state/State.js';
import { APP_DATA } from '../../data/index.js';


export function renderFavorites() {
  const container = document.getElementById('favoritesContent');
  const favs = State.data.favorites;

  if (favs.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-icon">⭐</div><h3>Aucun favori</h3><p>Marquez des leçons ou des verbes comme favoris pour les retrouver ici.</p></div>';
    return;
  }

  container.innerHTML = favs
    .map((f) => {
      if (f.startsWith('verb_')) {
        const verbName = f.replace('verb_', '');
        const verb = APP_DATA.verbsByBase[verbName];
        if (verb) {
          return `<div class="verb-card" style="cursor:default">
          <span class="verb-base">${verb.base}</span> → <span style="color:var(--accent)">${verb.past}</span> → <span style="color:var(--secondary)">${verb.pp}</span>
          <span style="color:var(--text-light);margin-left:8px">${verb.meaning}</span>
          <button class="fav-btn active" style="margin-left:auto" onclick="toggleFav('${f}', this)">★</button>
        </div>`;
        }
      } else {
        const tense = APP_DATA.tensesById[f];
        if (tense) {
          return `<div class="lesson-card" onclick="openTenseModal(APP_DATA.tensesById['${f}'])">
          <div class="lesson-icon" style="background:var(--primary)15;color:var(--primary)">📖</div>
          <div class="lesson-info">
            <div class="lesson-title">${tense.nameFR}</div>
            <div class="lesson-desc">${tense.explanation.substring(0, 80)}...</div>
          </div>
          <button class="fav-btn active" onclick="event.stopPropagation();toggleFav('${f}', this)">★</button>
        </div>`;
        }
      }
      return '';
    })
    .filter(Boolean)
    .join('');
}

export function toggleFav(item, btn) {
  if (State.isFavorite(item)) {
    State.removeFavorite(item);
    if (btn) {
      btn.classList.remove('active');
      btn.innerText = '☆';
    }
  } else {
    State.addFavorite(item);
    if (btn) {
      btn.classList.add('active');
      btn.innerText = '★';
    }
  }
}
