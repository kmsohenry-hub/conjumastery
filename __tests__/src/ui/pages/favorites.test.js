import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockState } = vi.hoisted(() => ({
  mockState: {
    data: {
      favorites: ['verb_go', 'present_simple'],
    },
    isFavorite: vi.fn((item) => mockState.data.favorites.includes(item)),
    addFavorite: vi.fn((item) => {
      if (!mockState.data.favorites.includes(item)) mockState.data.favorites.push(item);
    }),
    removeFavorite: vi.fn((item) => {
      mockState.data.favorites = mockState.data.favorites.filter((i) => i !== item);
    }),
  },
}));

vi.mock('../../../../src/core/state/State.js', () => ({
  State: mockState,
}));

import { APP_DATA } from '../../../../src/data/index.js';
import { renderFavorites, toggleFav } from '../../../../src/ui/pages/favorites.js';

beforeEach(() => {
  mockState.data.favorites = ['verb_go', 'present_simple'];
  document.body.innerHTML = '<div id="favoritesContent"></div>';
});

describe('favorites page', () => {
  it('renders favorites correctly when favorites exist', () => {
    renderFavorites();
    const html = document.getElementById('favoritesContent').innerHTML;
    expect(html).toContain('verb-card');
    expect(html).toContain('go');
  });

  it('renders empty state when no favorites exist', () => {
    mockState.data.favorites = [];
    renderFavorites();
    expect(document.getElementById('favoritesContent').innerHTML).toContain('Aucun favori');
  });

  it('escapes verb metadata before injecting it into HTML', () => {
    const original = APP_DATA.verbsByBase.evil;
    APP_DATA.verbsByBase.evil = {
      base: '<img src=x onerror=alert(1)>',
      past: 'past',
      pp: 'pp',
      meaning: '<script>alert(1)</script>',
    };
    mockState.data.favorites = ['verb_evil'];

    try {
      renderFavorites();
      const container = document.getElementById('favoritesContent');
      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('script')).toBeNull();
      expect(container.textContent).toContain('<img src=x onerror=alert(1)>');
      expect(container.textContent).toContain('<script>alert(1)</script>');
    } finally {
      if (original === undefined) delete APP_DATA.verbsByBase.evil;
      else APP_DATA.verbsByBase.evil = original;
    }
  });

  it('toggles favorite off and on', () => {
    const btn = document.createElement('button');
    btn.classList.add('active');

    // Currently 'verb_go' is in favorites
    toggleFav('verb_go', btn);
    expect(mockState.removeFavorite).toHaveBeenCalledWith('verb_go');
    expect(btn.classList.contains('active')).toBe(false);

    // Toggle on
    toggleFav('verb_go', btn);
    expect(mockState.addFavorite).toHaveBeenCalledWith('verb_go');
    expect(btn.classList.contains('active')).toBe(true);
  });
});
