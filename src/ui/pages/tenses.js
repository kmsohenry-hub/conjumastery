import { APP_DATA } from '../../data/index.js';
import { openModal } from '../navigation.js';
import { escapeHtml } from '../../../src/core/security.js';

export function renderTenses() {
  const categories = [
    { id: 'present', name: 'Présent' },
    { id: 'past', name: 'Passé' },
    { id: 'future', name: 'Futur' },
    { id: 'perfect', name: 'Parfait' },
    { id: 'conditionals', name: 'Conditionnels' },
  ];

  const tabsEl = document.getElementById('tenseCategoryTabs');
  tabsEl.innerHTML = categories
    .map(
      (cat, i) =>
        `<button class="tab ${i === 0 ? 'active' : ''}" data-action="show-tense-category" data-cat-id="${cat.id}">${cat.name}</button>`,
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
      <div class="lesson-card" data-action="open-tense-modal" data-tense-id="${t.id}" role="button" tabindex="0">
        <div class="lesson-icon" style="background:var(--primary)15;color:var(--primary)">${t.level === 'beginner' ? '🌱' : t.level === 'intermediate' ? '🌿' : '🌳'}</div>
        <div class="lesson-info">
          <div class="lesson-title">${t.nameFR}</div>
          <div class="lesson-desc">${t.explanation.substring(0, 120)}...</div>
          <div class="lesson-meta">
            <span class="tag tag-blue">${t.name}</span>
            <span><code>${t.structure}</code></span>
          </div>
        </div>
      </div>`,
      )
      .join('')}
  </div>`;
}

export function renderComparison() {
  const tabs = [
    { id: 'present', name: 'Présents' },
    { id: 'past', name: 'Passés' },
    { id: 'perfect', name: 'Parfaits' },
    { id: 'conditionals', name: 'Conditionnels' },
  ];

  document.getElementById('comparisonTabs').innerHTML = tabs
    .map(
      (t, i) =>
        `<button class="tab ${i === 0 ? 'active' : ''}" data-action="show-comparison" data-comp-id="${t.id}">${t.name}</button>`,
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
        <thead><tr><th>Temps</th><th>Structure</th><th>Usage principal</th><th>Exemple</th><th>Mot-clé</th></tr></thead>
        <tbody>
          ${tenses
            .map(
              (t) => `
            <tr>
              <td><strong>${escapeHtml(t.nameFR)}</strong></td>
              <td><code style="font-size:0.75rem">${escapeHtml(t.structure)}</code></td>
              <td>${escapeHtml(t.usage)}</td>
              <td><em>${escapeHtml(t.examples.affirmative)}</em></td>
              <td><span class="signal-tag">${escapeHtml(t.signalWords[0] || '—')}</span></td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <h3 style="margin:24px 0 12px">🔍 Comparaison détaillée</h3>
    ${tenses
      .map(
        (t) => `
      <div class="card" style="margin-bottom:12px;cursor:pointer" data-action="open-tense-modal" data-tense-id="${t.id}" role="button" tabindex="0">
        <h4>${escapeHtml(t.nameFR)} vs autres</h4>
        <p style="font-size:0.9rem;color:var(--text-light);margin-top:8px">${escapeHtml(t.nuances || t.explanation.substring(0, 200))}</p>
      </div>`,
      )
      .join('')}`;
}

export function openTenseModal(tense) {
  if (!tense) return;
  const modal = document.getElementById('modalContent');
  const signalWords = tense.signalWords || [];
  const commonMistakes = tense.commonMistakes || [];

  modal.innerHTML = `
    <div class="modal-header">
      <div>
        <div class="modal-title" id="modalTitle">${tense.nameEN}</div>
        <div style="color:var(--text-light);font-size:0.9rem">${tense.nameFR} • ${tense.level}</div>
      </div>
      <button class="modal-close" data-action="close-modal" aria-label="Fermer">✕</button>
    </div>
    <div class="explain-block">
      <h4>📝 Utilisation</h4>
      <p>${tense.usage}</p>
    </div>
    <div class="explain-block">
      <h4>🏗️ Structure</h4>
      <p><code>${tense.structure}</code></p>
    </div>
    <h4 style="margin:20px 0 12px">📖 Exemples par type de phrase</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <tr><th>Type</th><th>Exemple</th></tr>
        <tr><td><strong>Affirmatif</strong></td><td>${tense.examples.affirmative}</td></tr>
        <tr><td><strong>Négatif</strong></td><td>${tense.examples.negative}</td></tr>
        <tr><td><strong>Interrogatif</strong></td><td>${tense.examples.interrogative}</td></tr>
      </table>
    </div>
    ${signalWords.length > 0 ? `<h4 style="margin:20px 0 12px">🔑 Mots-clés / Marqueurs temporels</h4><div class="signal-words">${signalWords.map((w) => `<span class="signal-tag">${w}</span>`).join('')}</div>` : ''}
    ${commonMistakes.length > 0 ? `<h4 style="margin:20px 0 12px">⚠️ Erreurs fréquentes à éviter</h4>${commonMistakes.map((e) => `<div class="mistake-item"><span class="wrong">${e.wrong}</span> → <span class="right">${e.right}</span><br><small style="color:var(--text-light)">${e.note}</small></div>`).join('')}` : ''}
    <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap">
      <button class="btn btn-primary" data-action="start-tense" data-tense-id="${tense.id}">🎮 Entraînement libre</button>
      <button class="btn btn-outline" data-page="comparison">📊 Voir le comparatif</button>
    </div>`;

  openModal();
}
