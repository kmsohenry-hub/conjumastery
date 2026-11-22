import { APP_DATA } from '../../data/index.js';
import { escapeHtml } from '../../core/security.js';
import { State } from '../../core/state/State.js';
import { isTenseUnlocked } from '../../core/progression.js';

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

  // Search tenses (including signal words, usage, structure, and examples)
  APP_DATA.tenses.forEach((t) => {
    const name = (t.name || '').toLowerCase();
    const nameFR = (t.nameFR || '').toLowerCase();
    const explanation = (t.explanation || '').toLowerCase();
    const structure = (t.structure || '').toLowerCase();
    const signalWords = Array.isArray(t.signalWords) ? t.signalWords.join(' ').toLowerCase() : '';
    const usage = Array.isArray(t.usage)
      ? t.usage.join(' ').toLowerCase()
      : String(t.usage || '').toLowerCase();
    const examples = Array.isArray(t.examples)
      ? t.examples
          .map((ex) => `${ex?.en || ''} ${ex?.fr || ''}`)
          .join(' ')
          .toLowerCase()
      : '';
    if (
      name.includes(query) ||
      nameFR.includes(query) ||
      explanation.includes(query) ||
      structure.includes(query) ||
      signalWords.includes(query) ||
      usage.includes(query) ||
      examples.includes(query)
    ) {
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
      let attrs = 'class="search-result-item"';
      let titlePrefix = '';
      if (r.actionType === 'open-tense') {
        const unlocked = isTenseUnlocked(State?.data, r.targetId, APP_DATA.modules);
        attrs = `class="search-result-item${!unlocked ? ' locked' : ''}" role="button" tabindex="0" data-action="open-tense-modal" data-tense-id="${escapeHtml(r.targetId)}"${!unlocked ? ' data-locked="true" aria-disabled="true"' : ''}`;
        if (!unlocked) titlePrefix = '🔒 ';
      } else if (r.actionType === 'nav-page') {
        attrs = `class="search-result-item" role="button" tabindex="0" data-page="${escapeHtml(r.targetPage)}"`;
      }
      return `
    <div ${attrs}>
      <div class="sr-type">${escapeHtml(r.type)}</div>
      <div class="sr-title">${titlePrefix}${escapeHtml(r.title)}</div>
      <div class="sr-desc">${escapeHtml(r.desc)}</div>
    </div>`;
    })
    .join('');
}
