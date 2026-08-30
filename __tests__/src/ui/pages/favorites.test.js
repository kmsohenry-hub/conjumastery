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
