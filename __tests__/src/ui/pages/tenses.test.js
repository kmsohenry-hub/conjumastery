import { beforeEach, describe, expect, it, vi } from 'vitest';

const { openModalMock } = vi.hoisted(() => ({ openModalMock: vi.fn() }));
vi.mock('../../../../src/ui/navigation.js', () => ({ openModal: openModalMock }));

import {
  openTenseModal,
  renderComparison,
  renderTenses,
  showComparison,
  showTenseCategory,
} from '../../../../src/ui/pages/tenses.js';

const tense = {
  id: 'synthetic',
  nameEN: 'Synthetic Tense',
  nameFR: 'Temps synthétique',
  level: 'beginner',
  category: 'present',
  name: 'Synthetic Tense',
  structure: 'Subject + verb',
  explanation: 'Usage explanation',
  usage: 'Usage',
  examples: {
    affirmative: 'I work.',
    negative: 'I do not work.',
    interrogative: 'Do I work?',
  },
  signalWords: ['always'],
  commonMistakes: [{ wrong: 'I works', right: 'I work', note: 'Agreement' }],
};

beforeEach(() => {
  openModalMock.mockReset();
  document.body.innerHTML = `
    <div id="tenseCategoryTabs"></div>
    <div id="tenseContent"></div>
    <div id="comparisonTabs"></div>
    <div id="comparisonContent"></div>
    <div id="modalContent"></div>
  `;
});

describe('tenses page', () => {
  it('renders the five category tabs with delegated actions', () => {
    renderTenses();
    const tabs = [...document.querySelectorAll('#tenseCategoryTabs .tab')];
    expect(tabs).toHaveLength(5);
    expect(tabs[0].classList.contains('active')).toBe(true);
    for (const tab of tabs) {
      expect(tab.hasAttribute('onclick')).toBe(false);
      expect(tab.getAttribute('data-action')).toBe('show-tense-category');
      expect(tab.getAttribute('data-cat-id')).toBeTruthy();
    }
  });

  it('switches category and active state', () => {
    renderTenses();
    const tabs = document.querySelectorAll('#tenseCategoryTabs .tab');
    showTenseCategory('past', tabs[1]);
    expect(tabs[0].classList.contains('active')).toBe(false);
    expect(tabs[1].classList.contains('active')).toBe(true);
    expect(document.getElementById('tenseContent').innerHTML).toContain('class="grid"');
  });

  it('handles unknown tense categories without throwing', () => {
    expect(() => showTenseCategory('unknown')).not.toThrow();
    expect(document.querySelectorAll('#tenseContent .lesson-card')).toHaveLength(0);
  });

  it('renders comparison tabs (including Futurs) and delegated cards', () => {
    renderComparison();
    const tabs = [...document.querySelectorAll('#comparisonTabs .tab')];
    expect(tabs).toHaveLength(5);
    expect(tabs.map((t) => t.dataset.compId)).toEqual([
      'present',
      'past',
      'future',
      'perfect',
      'conditionals',
    ]);
    expect(tabs[0].classList.contains('active')).toBe(true);
    for (const tab of tabs) {
      expect(tab.hasAttribute('onclick')).toBe(false);
      expect(tab.getAttribute('data-action')).toBe('show-comparison');
      expect(tab.getAttribute('data-comp-id')).toBeTruthy();
    }
  });

  it('switches comparison category and renders the comparison table', () => {
    renderComparison();
    const tabs = document.querySelectorAll('#comparisonTabs .tab');
    showComparison('future', tabs[2]);
    expect(tabs[0].classList.contains('active')).toBe(false);
    expect(tabs[2].classList.contains('active')).toBe(true);
    expect(document.querySelector('.comparison-table').textContent).toContain(
      'Futur simple (will)',
    );
  });

  it('renders an empty comparison for an unknown category', () => {
    showComparison('unknown');
    expect(document.querySelectorAll('.comparison-table tbody tr')).toHaveLength(0);
  });

  it('opens a populated modal with safe delegated actions', () => {
    openTenseModal(tense);
    const modal = document.getElementById('modalContent');
    expect(modal.querySelector('#modalTitle').textContent).toBe('Synthetic Tense');
    expect(modal.textContent).toContain('Temps synthétique');
    expect(modal.textContent).toContain('Entraînement libre');
    expect(modal.textContent).toContain('Voir le comparatif');
    expect(modal.querySelector('[data-action="start-tense"]').dataset.tenseId).toBe('synthetic');
    expect(modal.querySelector('[data-page="comparison"]')).not.toBeNull();
    expect(openModalMock).toHaveBeenCalledOnce();
  });

  it('omits optional sections when their arrays are empty', () => {
    openTenseModal({ ...tense, signalWords: [], commonMistakes: [] });
    const html = document.getElementById('modalContent').innerHTML;
    expect(html).not.toContain('Mots-clés / Marqueurs temporels');
    expect(html).not.toContain('Erreurs fréquentes à éviter');
  });

  it('ignores a missing tense', () => {
    expect(() => openTenseModal(null)).not.toThrow();
    expect(openModalMock).not.toHaveBeenCalled();
    expect(document.getElementById('modalContent').innerHTML).toBe('');
  });

  it('renders real APP_DATA comparison rows without undefined example cells', () => {
    showComparison('present');
    const tableHtml = document.querySelector('.comparison-table').innerHTML;
    expect(tableHtml).toContain('She drinks tea every morning.');
    expect(tableHtml).not.toContain('undefined');
  });

  it('displays unlocked accuracy badges, favorite state, non-nested triggers, and locked prerequisites accurately', async () => {
    const { State } = await import('../../../../src/core/state/State.js');
    State.reset();
    State.data.tenseStats.present_simple = { correct: 9, total: 10 };
    State.data.favorites = ['present_simple'];

    showTenseCategory('present');
    const presentCards = [...document.querySelectorAll('#tenseContent .lesson-card')];
    const presSimple = presentCards.find(
      (c) => c.querySelector('.lesson-card-trigger')?.dataset.tenseId === 'present_simple',
    );
    const presCont = presentCards.find(
      (c) => c.querySelector('.lesson-card-trigger')?.dataset.tenseId === 'present_continuous',
    );

    expect(presSimple.classList.contains('locked')).toBe(false);
    expect(presSimple.hasAttribute('role')).toBe(false);
    expect(
      presSimple
        .querySelector('.lesson-card-trigger')
        .contains(presSimple.querySelector('.fav-btn')),
    ).toBe(false);
    expect(presSimple.textContent).toContain('✓ 90%');
    expect(presSimple.querySelector('.fav-btn').classList.contains('active')).toBe(true);
    expect(presSimple.querySelector('.fav-btn').textContent).toBe('★');
    // Present Continuous unlocks because Present Simple reached >= 75% mastery
    expect(presCont.classList.contains('locked')).toBe(false);
    expect(presCont.textContent).toContain('🔓 Débloqué');

    // Past tenses remain locked until preceding lessons are mastered
    showTenseCategory('past');
    const pastCards = [...document.querySelectorAll('#tenseContent .lesson-card')];
    expect(pastCards.every((c) => c.classList.contains('locked'))).toBe(true);
    expect(pastCards[0].querySelector('.lesson-card-trigger').getAttribute('data-locked')).toBe(
      'true',
    );
    expect(pastCards[0].textContent).toContain('75% requis');

    // Comparison detail cards also enforce progressive lock gating
    showComparison('past');
    const compCards = [...document.querySelectorAll('#comparisonContent .card')];
    expect(compCards.every((c) => c.getAttribute('data-locked') === 'true')).toBe(true);
  });
});
