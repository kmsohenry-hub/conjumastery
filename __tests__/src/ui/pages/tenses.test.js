import { beforeEach, describe, expect, it } from 'vitest';

import {
  renderTenses,
  showTenseCategory,
  renderComparison,
  showComparison,
} from '../../../../src/ui/pages/tenses.js';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="tenseCategoryTabs"></div>
    <div id="tenseContent"></div>
    <div id="comparisonTabs"></div>
    <div id="comparisonContent"></div>
  `;
});

describe('tenses page', () => {
  it('renders tense tabs and initial category', () => {
    renderTenses();
    expect(document.getElementById('tenseCategoryTabs').children.length).toBe(5);
    expect(document.getElementById('tenseContent').innerHTML).toContain('Present Simple');
  });

  it('switches tense category tab', () => {
    renderTenses();
    const secondTab = document.querySelectorAll('#tenseCategoryTabs .tab')[1];
    showTenseCategory('past', secondTab);
    expect(secondTab.classList.contains('active')).toBe(true);
    expect(document.getElementById('tenseContent').innerHTML).toContain('Past Simple');
  });

  it('renders tense comparison table', () => {
    renderComparison();
    expect(document.getElementById('comparisonTabs').children.length).toBe(4);
    expect(document.getElementById('comparisonContent').innerHTML).toContain('Present Simple');
  });

  it('switches comparison category tab', () => {
    renderComparison();
    const secondTab = document.querySelectorAll('#comparisonTabs .tab')[1];
    showComparison('past', secondTab);
    expect(secondTab.classList.contains('active')).toBe(true);
    expect(document.getElementById('comparisonContent').innerHTML).toContain('Past Simple');
  });
});
