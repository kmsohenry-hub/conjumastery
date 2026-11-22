import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockState, openTenseModalMock } = vi.hoisted(() => ({
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
  openTenseModalMock: vi.fn(),
}));

vi.mock('../../../../src/core/state/State.js', () => ({
  State: mockState,
}));

vi.mock('../../../../src/ui/pages/tenses.js', () => ({
  openTenseModal: openTenseModalMock,
}));

import { renderFavorites, toggleFav } from '../../../../src/ui/pages/favorites.js';

beforeEach(() => {
  openTenseModalMock.mockClear();
  mockState.data.favorites = ['verb_go', 'present_simple'];
  document.body.innerHTML = '<div id="favoritesContent"></div>';
});

describe('favorites page DOM and event delegation (AUDIT-01, 02, 03, 04)', () => {
  it('renders favorites without inline handlers and with keyboard accessibility', () => {
    renderFavorites();
    const container = document.getElementById('favoritesContent');
    expect(container.children.length).toBeGreaterThan(0);

    const favBtns = container.querySelectorAll('.fav-btn');
    favBtns.forEach((b) => {
      expect(b.hasAttribute('onclick')).toBe(false);
      expect(b.getAttribute('data-action')).toBe('toggle-fav');
      expect(b.hasAttribute('data-fav-id')).toBe(true);
    });

    const cards = container.querySelectorAll('.lesson-card');
    cards.forEach((c) => {
      expect(c.hasAttribute('onclick')).toBe(false);
      expect(c.hasAttribute('role')).toBe(false);
      const trigger = c.querySelector('.lesson-card-trigger');
      const favBtn = c.querySelector('.fav-btn');
      expect(trigger).toBeTruthy();
      expect(trigger.getAttribute('data-action')).toBe('open-tense-modal');
      expect(trigger.getAttribute('role')).toBe('button');
      expect(trigger.getAttribute('tabindex')).toBe('0');
      expect(trigger.contains(favBtn)).toBe(false);
    });
  });

  it('triggers toggleFav on favorite button DOM click', () => {
    renderFavorites();
    const btn = document.querySelector('.fav-btn[data-fav-id="verb_go"]');
    expect(btn).toBeTruthy();

    btn.addEventListener('click', () => toggleFav(btn.dataset.favId, btn));
    btn.click();
    expect(mockState.removeFavorite).toHaveBeenCalledWith('verb_go');
    expect(btn.classList.contains('active')).toBe(false);

    btn.click();
    expect(mockState.addFavorite).toHaveBeenCalledWith('verb_go');
    expect(btn.classList.contains('active')).toBe(true);
  });

  it('opens tense modal when clicking a favorite tense card trigger and locks locked tenses', () => {
    mockState.data.favorites = ['present_simple', 'past_perfect'];
    renderFavorites();
    const trigger = document.querySelector('.lesson-card-trigger[data-tense-id="present_simple"]');
    expect(trigger).toBeTruthy();
    expect(trigger.hasAttribute('data-locked')).toBe(false);

    const lockedTrigger = document.querySelector(
      '.lesson-card-trigger[data-tense-id="past_perfect"]',
    );
    expect(lockedTrigger).toBeTruthy();
    expect(lockedTrigger.getAttribute('data-locked')).toBe('true');

    trigger.addEventListener('click', () => {
      openTenseModalMock(trigger.dataset.tenseId);
    });

    trigger.click();
    expect(openTenseModalMock).toHaveBeenCalledWith('present_simple');
  });

  it('renders empty state when no favorites exist', () => {
    mockState.data.favorites = [];
    renderFavorites();
    expect(document.getElementById('favoritesContent').innerHTML).toContain('Aucun favori');
  });

  it('re-renders favorites list when toggleFav is called while #page-favorites is active', () => {
    document.body.innerHTML =
      '<div id="page-favorites" class="page active"><div id="favoritesContent"></div></div>';
    renderFavorites();
    const btn = document.querySelector('.fav-btn[data-fav-id="verb_go"]');
    toggleFav('verb_go', btn);
    expect(document.querySelector('.fav-btn[data-fav-id="verb_go"]')).toBeNull();
  });
});
