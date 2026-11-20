import { APP_DATA } from '../../data/index.js';
import { escapeHtml } from '../../core/security.js';

export function performGlobalSearch() {
  const query = (
    document.getElementById('globalSearchInput')?.value ||
    document.getElementById('globalSearch')?.value ||
    ''
  )
    .toLowerCase()
    .trim();
  const container = document.getElementById('searchResults');

  if (!query) {
    container.innerHTML = '';
    return;
  }

  const results = [];

  // Search tenses
  APP_DATA.tenses.forEach((t) => {
    const name = (t.name || '').toLowerCase();
    const nameFR = (t.nameFR || '').toLowerCase();
    const explanation = (t.explanation || '').toLowerCase();
    if (name.includes(query) || nameFR.includes(query) || explanation.includes(query)) {
      results.push({
        type: 'temps',
        title: t.nameFR,
        desc: (t.explanation || '').substring(0, 100),
        actionType: 'open-tense',
        targetId: t.id,
      });
    }
  });

  // Search verbs
  APP_DATA.irregularVerbs.forEach((v) => {
    const base = (v.base || '').toLowerCase();
    const past = (v.past || '').toLowerCase();
    const pp = (v.pp || '').toLowerCase();
    const meaning = (v.meaning || '').toLowerCase();
    if (
      base.includes(query) ||
      past.includes(query) ||
      pp.includes(query) ||
      meaning.includes(query)
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
    const phrase = (pv.pv || '').toLowerCase();
    const meaning = (pv.meaning || '').toLowerCase();
    if (phrase.includes(query) || meaning.includes(query)) {
      results.push({ type: 'phrasal verb', title: pv.pv, desc: pv.meaning });
    }
  });

  // Search modals
  APP_DATA.modals.forEach((m) => {
    const name = (m.name || '').toLowerCase();
    const ability = (m.ability || '').toLowerCase();
    if (name.includes(query) || ability.includes(query)) {
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
        attrs += ` data-action="open-tense-modal" data-tense-id="${escapeHtml(r.targetId)}"`;
      } else if (r.actionType === 'nav-page') {
        attrs += ` data-page="${escapeHtml(r.targetPage)}"`;
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
