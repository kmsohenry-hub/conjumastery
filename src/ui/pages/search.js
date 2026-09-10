import { APP_DATA } from '../../data/index.js';
import { escapeHtml } from '../../../src/core/security.js';

export function performGlobalSearch() {
  const query = (document.getElementById('globalSearchInput')?.value || document.getElementById('globalSearch')?.value || '').toLowerCase().trim();
  const container = document.getElementById('searchResults');

  if (!query) {
    container.innerHTML = '';
    return;
  }

  const results = [];

  // Search tenses
  APP_DATA.tenses.forEach((t) => {
    if (
      t.name.toLowerCase().includes(query) ||
      t.nameFR.toLowerCase().includes(query) ||
      t.explanation.toLowerCase().includes(query)
    ) {
      results.push({
        type: 'temps',
        title: t.nameFR,
        desc: t.explanation.substring(0, 100),
        actionType: 'open-tense',
        targetId: t.id,
      });
    }
  });

  // Search verbs
  APP_DATA.irregularVerbs.forEach((v) => {
    if (
      v.base.includes(query) ||
      v.past.includes(query) ||
      v.pp.includes(query) ||
      v.meaning.includes(query)
    ) {
      results.push({
        type: 'verbe',
        title: `${v.base} → ${v.past} → ${v.pp}`,
        desc: v.meaning,
        actionType: 'nav-page',
        targetPage: 'verbs',
      });
    }
  });

  // Search phrasal verbs
  APP_DATA.phrasalVerbs.forEach((pv) => {
    if (pv.pv.includes(query) || pv.meaning.includes(query)) {
      results.push({ type: 'phrasal verb', title: pv.pv, desc: pv.meaning });
    }
  });

  // Search modals
  APP_DATA.modals.forEach((m) => {
    if (m.name.toLowerCase().includes(query) || m.ability.toLowerCase().includes(query)) {
      results.push({ type: 'modal', title: m.name, desc: m.ability });
    }
  });

  if (results.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-icon">🔍</div><h3>Aucun résultat</h3><p>Essayez un autre terme.</p></div>';
    return;
  }

  container.innerHTML = results
    .map((r) => {
      let attrs = 'class="search-result-item" role="button" tabindex="0"';
      if (r.actionType === 'open-tense') {
        attrs += ` data-action="open-tense-modal" data-tense-id="${r.targetId}"`;
      } else if (r.actionType === 'nav-page') {
        attrs += ` data-page="${r.targetPage}"`;
      }
      return `
    <div ${attrs}>
      <div class="sr-type">${escapeHtml(r.type)}</div>
      <div class="sr-title">${escapeHtml(r.title)}</div>
      <div class="sr-desc">${escapeHtml(r.desc)}</div>
    </div>`;
    })
    .join('');
}
