import { beforeEach, describe, expect, it } from 'vitest';
import { performGlobalSearch } from '../../../../src/ui/pages/search.js';

describe('search page', () => {
  beforeEach(() => {
    document.body.innerHTML = '<input id="globalSearch"><div id="searchResults"></div>';
  });

  it('clears results for an empty query', () => {
    const results = document.getElementById('searchResults');
    results.innerHTML = '<p>old</p>';
    performGlobalSearch();
    expect(results.innerHTML).toBe('');
  });

  it('finds tenses', () => {
    document.getElementById('globalSearch').value = 'present simple';
    performGlobalSearch();
    const results = document.getElementById('searchResults');
    expect(results.querySelectorAll('.search-result-item').length).toBeGreaterThan(0);
    expect(results.textContent).toContain('Présent simple');
  });

  it('finds irregular verbs', () => {
    document.getElementById('globalSearch').value = 'arise';
    performGlobalSearch();
    const item = [...document.querySelectorAll('.search-result-item')].find((el) => el.textContent.includes('arise'));
    expect(item).toBeTruthy();
    expect(item.getAttribute('onclick')).toBe("navigateTo('verbs')");
  });

  it('shows an empty state when nothing matches', () => {
    document.getElementById('globalSearch').value = 'zzzz-no-match-xyz';
    performGlobalSearch();
    expect(document.getElementById('searchResults').textContent).toContain('Aucun résultat');
  });
});
