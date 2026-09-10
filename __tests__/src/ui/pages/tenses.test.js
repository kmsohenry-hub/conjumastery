import { beforeEach, describe, expect, it, vi } from 'vitest';

const { openTenseModalMock } = vi.hoisted(() => ({
  openTenseModalMock: vi.fn(),
}));

vi.mock('../../../../src/ui/pages/lessons.js', () => ({
  openLesson: vi.fn(),
  renderLessons: vi.fn(),
  showModule: vi.fn(),
}));

import {
  renderTenses,
  showTenseCategory,
  renderComparison,
  showComparison,
  openTenseModal,
} from '../../../../src/ui/pages/tenses.js';

beforeEach(() => {
  openTenseModalMock.mockClear();
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
    expect(tabs.length).toBe(5);
    tabs.forEach((t) => {
      expect(t.hasAttribute('onclick')).toBe(false);
      expect(t.getAttribute('data-action')).toBe('show-tense-category');
      expect(t.hasAttribute('data-cat-id')).toBe(true);
    });

    const cards = document.querySelectorAll('#tenseContent .lesson-card');
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((c) => {
      expect(c.hasAttribute('onclick')).toBe(false);
      expect(c.getAttribute('data-action')).toBe('open-tense-modal');
      expect(c.hasAttribute('data-tense-id')).toBe(true);
      expect(c.getAttribute('role')).toBe('button');
      expect(c.getAttribute('tabindex')).toBe('0');
    });
  });

  it('switches tense category tab upon DOM click', () => {
    renderTenses();
    const tabs = document.querySelectorAll('#tenseCategoryTabs .tab');
    const pastTab = tabs[1];

    pastTab.addEventListener('click', () => showTenseCategory(pastTab.dataset.catId, pastTab));
    pastTab.click();

    expect(pastTab.classList.contains('active')).toBe(true);
    expect(document.getElementById('tenseContent').innerHTML).toContain('Past Simple');
  });

  it('renders comparison tabs and cards without inline handlers', () => {
    renderComparison();
    const tabs = document.querySelectorAll('#comparisonTabs .tab');
    expect(tabs.length).toBe(4);
    tabs.forEach((t) => {
      expect(t.hasAttribute('onclick')).toBe(false);
      expect(t.getAttribute('data-action')).toBe('show-comparison');
      expect(t.hasAttribute('data-comp-id')).toBe(true);
    });

    const cards = document.querySelectorAll('#comparisonContent .card');
    cards.forEach((c) => {
      expect(c.hasAttribute('onclick')).toBe(false);
      expect(c.getAttribute('data-action')).toBe('open-tense-modal');
      expect(c.getAttribute('role')).toBe('button');
      expect(c.getAttribute('tabindex')).toBe('0');
    });
  });

  it('switches comparison category tab upon DOM click', () => {
    renderComparison();
    const tabs = document.querySelectorAll('#comparisonTabs .tab');
    const pastTab = tabs[1];

    pastTab.addEventListener('click', () => showComparison(pastTab.dataset.compId, pastTab));
    pastTab.click();

    expect(pastTab.classList.contains('active')).toBe(true);
    expect(document.getElementById('comparisonContent').innerHTML).toContain('Past Simple');
  });
});
