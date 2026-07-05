import { APP_DATA } from '../../../data.js';
import { escapeHtml } from '../../../src/core/security.js';

export function renderTenses() {
  const categories = [
    { id: 'present', name: 'Présent' },
    { id: 'past', name: 'Passé' },
    { id: 'perfect', name: 'Perfect' },
    { id: 'future', name: 'Futur' },
    { id: 'conditionals', name: 'Conditionnels' },
  ];

  const tabsEl = document.getElementById('tenseCategoryTabs');
  tabsEl.innerHTML = categories
    .map(
      (cat, i) =>
        `<button class="tab ${i === 0 ? 'active' : ''}" onclick="showTenseCategory('${cat.id}', this)">${cat.name}</button>`,
    )
    .join('');

  showTenseCategory('present');
}

export function showTenseCategory(category, tabEl) {
  if (tabEl) {
    document
      .querySelectorAll('#tenseCategoryTabs .tab')
      .forEach((t) => t.classList.remove('active'));
    tabEl.classList.add('active');
  }

  const tenses = APP_DATA.tenses.filter((t) => t.category === category);
  const contentEl = document.getElementById('tenseContent');

  contentEl.innerHTML = `<div class="grid" style="gap:16px">
    ${tenses
      .map(
        (t) => `
      <div class="lesson-card" onclick="openTenseModal(APP_DATA.tensesById['${t.id}'])">
        <div class="lesson-icon" style="background:var(--primary)15;color:var(--primary)">${t.level === 'beginner' ? '🌱' : t.level === 'intermediate' ? '🌿' : '🌳'}</div>
        <div class="lesson-info">
          <div class="lesson-title">${t.nameFR}</div>
          <div class="lesson-desc">${t.explanation.substring(0, 120)}...</div>
          <div class="lesson-meta">
            <span class="level-badge level-${t.level}">${t.level === 'beginner' ? 'Débutant' : t.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join('')}
  </div>`;
}

export function renderComparison() {
  const tabs = [
    { id: 'present', name: 'Présent' },
    { id: 'past', name: 'Passé' },
    { id: 'future', name: 'Futur' },
    { id: 'conditionals', name: 'Conditionnels' },
  ];

  document.getElementById('comparisonTabs').innerHTML = tabs
    .map(
      (t, i) =>
        `<button class="tab ${i === 0 ? 'active' : ''}" onclick="showComparison('${t.id}', this)">${t.name}</button>`,
    )
    .join('');

  showComparison('present');
}

export function showComparison(category, tabEl) {
  if (tabEl) {
    document.querySelectorAll('#comparisonTabs .tab').forEach((t) => t.classList.remove('active'));
    tabEl.classList.add('active');
  }

  const tenses = APP_DATA.tenses.filter((t) => t.category === category);
  const content = document.getElementById('comparisonContent');

  content.innerHTML = `
    <div class="table-wrapper">
      <table class="comparison-table">
        <tr>
          <th>Temps</th>
          <th>Structure</th>
          <th>Usage principal</th>
          <th>Exemple</th>
          <th>Mots-clés</th>
        </tr>
        ${tenses
          .map(
            (t) => `
          <tr>
            <td><strong>${escapeHtml(t.nameFR)}</strong></td>
            <td><code style="font-size:0.75rem">${escapeHtml(t.structure)}</code></td>
            <td>${escapeHtml(t.usage[0].split(':')[1]?.trim() || t.usage[0])}</td>
            <td><em>${escapeHtml(t.examples[0]?.en)}</em></td>
            <td>${t.signalWords
              ?.slice(0, 4)
              .map((w) => `<span class="tag tag-blue" style="margin:2px">${escapeHtml(w)}</span>`)
              .join('')}</td>
          </tr>
        `,
          )
          .join('')}
      </table>
    </div>

    ${
      tenses.length >= 2
        ? `
    <h3 style="margin:24px 0 12px">🔍 Comparaison détaillée</h3>
    ${tenses
      .slice(0, 2)
      .map(
        (t) => `
      <div class="card" style="margin-bottom:12px;cursor:pointer" onclick="openTenseModal(APP_DATA.tensesById['${t.id}'])">
        <h4>${escapeHtml(t.nameFR)}</h4>
        <p style="font-size:0.9rem;color:var(--text-light);margin-top:8px">${escapeHtml(t.nuances || t.explanation.substring(0, 200))}</p>
      </div>
    `,
      )
      .join('')}`
        : ''
    }`;
}
