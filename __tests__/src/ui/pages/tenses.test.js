import { beforeEach, describe, expect, it, vi } from 'vitest';

const { openModalMock } = vi.hoisted(() => ({
  openModalMock: vi.fn(),
}));

vi.mock('../../../../src/ui/navigation.js', () => ({
  openModal: openModalMock,
}));

import {
  renderComparison,
  renderTenses,
  showComparison,
  showTenseCategory,
  openTenseModal,
} from '../../../../src/ui/pages/tenses.js';
import { APP_DATA } from '../../../../src/data/index.js';

beforeEach(() => {
  openModalMock.mockClear();
  document.body.innerHTML = `
    <div id="tenseCategoryTabs"></div>
    <div id="tenseContent"></div>
    <div id="comparisonTabs"></div>
    <div id="comparisonContent"></div>
    <div id="modalOverlay"></div>
    <div id="modalContent"></div>
  `;
});

describe('tenses page DOM and event delegation (AUDIT-01, 02, 03, 04)', () => {
  it('renders category tabs and tense cards without any inline handlers', () => {
    renderTenses();
    const tabs = document.querySelectorAll('#tenseCategoryTabs .tab');
    expect(tabs).toHaveLength(5);
    expect(tabs[0].classList.contains('active')).toBe(true);
    tabs.forEach((tab) => {
      expect(tab).not.toHaveAttribute('onclick');
      expect(tab).toHaveAttribute('data-action', 'show-tense-category');
      expect(tab).toHaveAttribute('data-cat-id');
    });

    const cards = document.querySelectorAll('#tenseContent .lesson-card');
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((card) => {
      expect(card).not.toHaveAttribute('onclick');
      expect(card).toHaveAttribute('data-action', 'open-tense-modal');
      expect(card).toHaveAttribute('data-tense-id');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabindex', '0');
    });
  });

  it('switches tense category and updates active-tab state when a tab is supplied', () => {
    renderTenses();
    const tabs = document.querySelectorAll('#tenseCategoryTabs .tab');
    const pastTab = tabs[1];

    showTenseCategory('past', pastTab);

    expect(pastTab.classList.contains('active')).toBe(true);
    expect(tabs[0].classList.contains('active')).toBe(false);
    expect(document.getElementById('tenseContent').innerHTML).toContain('Past Simple');
  });

  it('renders an empty result when an unknown tense category is requested', () => {
    showTenseCategory('does-not-exist');

    expect(document.querySelectorAll('#tenseContent .lesson-card')).toHaveLength(0);
    expect(document.getElementById('tenseContent').innerHTML).toContain('class="grid"');
  });

  it('renders comparison tabs and cards without inline handlers', () => {
    renderComparison();
    const tabs = document.querySelectorAll('#comparisonTabs .tab');
    expect(tabs).toHaveLength(4);
    expect(tabs[0].classList.contains('active')).toBe(true);
    tabs.forEach((tab) => {
      expect(tab).not.toHaveAttribute('onclick');
      expect(tab).toHaveAttribute('data-action', 'show-comparison');
      expect(tab).toHaveAttribute('data-comp-id');
    });

    const cards = document.querySelectorAll('#comparisonContent .card');
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((card) => {
      expect(card).not.toHaveAttribute('onclick');
      expect(card).toHaveAttribute('data-action', 'open-tense-modal');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabindex', '0');
    });
  });

  it('switches comparison category and updates active-tab state', () => {
    renderComparison();
    const tabs = document.querySelectorAll('#comparisonTabs .tab');
    const pastTab = tabs[1];

    showComparison('past', pastTab);

    expect(pastTab.classList.contains('active')).toBe(true);
    expect(tabs[0].classList.contains('active')).toBe(false);
    expect(document.getElementById('comparisonContent').innerHTML).toContain('Past Simple');
    expect(document.querySelector('.comparison-table')).not.toBeNull();
  });

  it('renders an empty comparison table for an unknown category', () => {
    showComparison('does-not-exist');

    expect(document.querySelectorAll('#comparisonContent tbody tr')).toHaveLength(0);
    expect(document.getElementById('comparisonContent').innerHTML).toContain(
      'Comparaison détaillée',
    );
  });

  it('opens a fully populated tense modal and exposes the relevant actions', () => {
    const tense = APP_DATA.tenses.find((item) => item.id === 'present_simple');
    expect(tense).toBeDefined();

    openTenseModal(tense);

    const modal = document.getElementById('modalContent');
    expect(modal.querySelector('#modalTitle').textContent).toBe(tense.nameEN);
    expect(modal.textContent).toContain(tense.nameFR);
    expect(modal.textContent).toContain('Entraînement libre');
    expect(modal.textContent).toContain('Voir le comparatif');
    expect(modal.querySelector('[data-action="start-tense"]').dataset.tenseId).toBe(tense.id);
    expect(modal.querySelector('[data-page="comparison']")).not.toBeNull();
    expect(openModalMock).toHaveBeenCalledOnce();
  });

  it('handles a tense without optional signal words or common mistakes', () => {
    const tense = {
      id: 'synthetic',
      nameEN: 'Synthetic Tense',
      nameFR: 'Temps synthétique',
      level: 'beginner',
      usage: 'Usage',
      structure: 'Subject + verb',
      examples: {
        affirmative: 'I work.',
        negative: 'I do not work.',
        interrogative: 'Do I work?',
      },
      signalWords: [],
      commonMistakes: [],
    };

    openTenseModal(tense);

    const html = document.getElementById('modalContent').innerHTML;
    expect(html).not.toContain('Mots-clés / Marqueurs temporels');
    expect(html).not.toContain('Erreurs fréquentes à éviter');
    expect(openModalMock).toHaveBeenCalledOnce();
  });

  it('ignores an absent tense instead of opening a modal', () => {
    openTenseModal(null);

    expect(document.getElementById('modalContent').innerHTML).toBe('');
    expect(openModalMock).not.toHaveBeenCalled();
  });
});
