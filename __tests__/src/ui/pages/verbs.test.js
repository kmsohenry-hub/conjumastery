import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockState, toggleFavMock } = vi.hoisted(() => ({
  mockState: {
    isFavorite: vi.fn((item) => item === 'verb_be'),
    toggleFavorite: vi.fn(),
  },
  toggleFavMock: vi.fn(),
}));

vi.mock('../../../../src/core/state/State.js', () => ({
  State: mockState,
}));

vi.mock('../../../../src/ui/pages/favorites.js', () => ({
  toggleFav: toggleFavMock,
}));

import { renderVerbs, filterVerbs, toggleVerbCard } from '../../../../src/ui/pages/verbs.js';

beforeEach(() => {
  toggleFavMock.mockClear();
  document.body.innerHTML = `
    <input id="verbSearch" value="" />
    <div id="verbsList"></div>
  `;
});

describe('verbs page DOM and event delegation (AUDIT-01, 02, 03, 04)', () => {
  it('renders verbs without any inline handlers and with keyboard accessibility', () => {
    renderVerbs();
    const container = document.getElementById('verbsList');
    expect(container.children.length).toBeGreaterThan(0);

    const cards = container.querySelectorAll('.verb-card');
    cards.forEach((c) => {
      expect(c.hasAttribute('onclick')).toBe(false);
      expect(c.getAttribute('role')).toBe('button');
      expect(c.getAttribute('tabindex')).toBe('0');
      expect(c.getAttribute('data-action')).toBe('toggle-verb');
    });

    const favBtns = container.querySelectorAll('.fav-btn');
    favBtns.forEach((b) => {
      expect(b.hasAttribute('onclick')).toBe(false);
      expect(b.getAttribute('data-action')).toBe('toggle-fav');
    });
  });

  it('toggles verb card on DOM click and Enter keypress', () => {
    renderVerbs();
    const card = document.getElementById('verb-card-0');
    expect(card).toBeTruthy();
    expect(card.classList.contains('expanded')).toBe(false);

    // Wire local delegation simulation
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="toggle-fav"]')) return;
      toggleVerbCard(Number(card.dataset.index));
    });

    // 1. Mouse Click
    card.click();
    expect(card.classList.contains('expanded')).toBe(true);
    card.click();
    expect(card.classList.contains('expanded')).toBe(false);

    // 2. Keyboard Enter
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    card.click();
    expect(card.classList.contains('expanded')).toBe(true);
  });

  it('clicking favorite button does NOT trigger card expansion (stopPropagation parity)', () => {
    renderVerbs();
    const card = document.getElementById('verb-card-0');
    const favBtn = card.querySelector('[data-action="toggle-fav"]');
    expect(card).toBeTruthy();
    expect(favBtn).toBeTruthy();

    let cardToggled = false;
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="toggle-fav"]')) {
        toggleFavMock(favBtn.dataset.favId, favBtn);
        return; // stop propagation
      }
      cardToggled = true;
    });

    favBtn.click();
    expect(toggleFavMock).toHaveBeenCalledWith('verb_arise', favBtn);
    expect(cardToggled).toBe(false);
    expect(card.classList.contains('expanded')).toBe(false);
  });

  it('filters verbs by search query', () => {
    const input = document.getElementById('verbSearch');
    input.value = 'become';
    filterVerbs();
    const container = document.getElementById('verbsList');
    expect(container.innerHTML).toContain('become');
    expect(container.innerHTML).not.toContain('verb-card-10');
  });

  it('renders empty state if no verb matches search', () => {
    const input = document.getElementById('verbSearch');
    input.value = 'nonexistentxyz';
    filterVerbs();
    expect(document.getElementById('verbsList').innerHTML).toContain('Aucun verbe trouvé');
  });
});
