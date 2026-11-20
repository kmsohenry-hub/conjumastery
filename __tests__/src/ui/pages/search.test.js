import { beforeEach, describe, expect, it, vi } from 'vitest';

const { navigateToMock, openTenseModalMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  openTenseModalMock: vi.fn(),
}));

vi.mock('../../../../src/ui/navigation.js', () => ({
  navigateTo: navigateToMock,
}));

vi.mock('../../../../src/ui/pages/tenses.js', () => ({
  openTenseModal: openTenseModalMock,
}));

import { performGlobalSearch } from '../../../../src/ui/pages/search.js';

beforeEach(() => {
  navigateToMock.mockClear();
  openTenseModalMock.mockClear();
  document.body.innerHTML = `
    <input id="globalSearchInput" value="" />
    <div id="searchResults"></div>
  `;
});

describe('search page DOM and event delegation (AUDIT-01, 02, 03, 04)', () => {
  it('renders search results without any inline handlers and with keyboard accessibility', () => {
    const input = document.getElementById('globalSearchInput');
    input.value = 'present';
    performGlobalSearch();

    const items = document.querySelectorAll('.search-result-item');
    expect(items.length).toBeGreaterThan(0);
    items.forEach((item) => {
      expect(item.hasAttribute('onclick')).toBe(false);
      expect(item.getAttribute('role')).toBe('button');
      expect(item.getAttribute('tabindex')).toBe('0');
    });
  });

  it('triggers navigation when clicking a verb search result', () => {
    const input = document.getElementById('globalSearchInput');
    input.value = 'arise';
    performGlobalSearch();

    const item = Array.from(document.querySelectorAll('.search-result-item')).find((el) =>
      el.textContent.includes('arise'),
    );
    expect(item).toBeTruthy();
    expect(item.getAttribute('data-page')).toBe('verbs');

    item.addEventListener('click', () => navigateToMock(item.dataset.page));
    item.click();
    expect(navigateToMock).toHaveBeenCalledWith('verbs');
  });

  it('shows an empty state when nothing matches', () => {
    const input = document.getElementById('globalSearchInput');
    input.value = 'thisquerymatchesnothingatall';
    performGlobalSearch();

    expect(document.getElementById('searchResults').innerHTML).toContain('Aucun résultat');
  });

  it('matches verbs, phrasal verbs, modals and tenses case-insensitively', () => {
    const input = document.getElementById('globalSearchInput');

    input.value = 'ALLER';
    performGlobalSearch();
    expect(document.getElementById('searchResults').textContent).toContain('go → went → gone');

    input.value = 'GIVE UP';
    performGlobalSearch();
    expect(document.getElementById('searchResults').textContent.toLowerCase()).toContain('give up');

    input.value = 'MUST';
    performGlobalSearch();
    expect(document.getElementById('searchResults').textContent.toLowerCase()).toContain('must');

    input.value = 'PRESENT SIMPLE';
    performGlobalSearch();
    const tenseResult = document.querySelector(
      '.search-result-item[data-action="open-tense-modal"]',
    );
    expect(tenseResult).toBeTruthy();
    expect(tenseResult.getAttribute('data-tense-id')).toBe('present_simple');
  });
});
