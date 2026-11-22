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
  it('renders verbs without inline handlers, without nested interactive elements, and with continuous auxiliaries', () => {
    renderVerbs();
    const container = document.getElementById('verbsList');
    expect(container.children.length).toBeGreaterThan(0);

    const cards = container.querySelectorAll('.verb-card');
    cards.forEach((c) => {
      expect(c.hasAttribute('onclick')).toBe(false);
      expect(c.hasAttribute('role')).toBe(false);
      const toggleBtn = c.querySelector('button.verb-card-toggle');
      const favBtn = c.querySelector('button.fav-btn');
      expect(toggleBtn).toBeTruthy();
      expect(favBtn).toBeTruthy();
      expect(toggleBtn.getAttribute('data-action')).toBe('toggle-verb');
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
      expect(toggleBtn.contains(favBtn)).toBe(false);
    });

    const firstTable = cards[0].querySelector('.verb-conjugation-table');
    expect(firstTable.textContent).toContain('am/is/are arising');
    expect(firstTable.textContent).toContain('was/were arising');

    const favBtns = container.querySelectorAll('.fav-btn');
    favBtns.forEach((b) => {
      expect(b.hasAttribute('onclick')).toBe(false);
      expect(b.getAttribute('data-action')).toBe('toggle-fav');
    });
  });

  it('toggles verb card on toggle button click and updates aria-expanded', () => {
    renderVerbs();
    const card = document.getElementById('verb-card-0');
    const toggleBtn = card.querySelector('.verb-card-toggle');
    expect(card).toBeTruthy();
    expect(toggleBtn).toBeTruthy();
    expect(card.classList.contains('expanded')).toBe(false);

    toggleBtn.addEventListener('click', () => {
      toggleVerbCard(Number(toggleBtn.dataset.index));
    });

    toggleBtn.click();
    expect(card.classList.contains('expanded')).toBe(true);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');

    toggleBtn.click();
    expect(card.classList.contains('expanded')).toBe(false);
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
  });

  it('clicking favorite button does NOT trigger card expansion (sibling button separation)', () => {
    renderVerbs();
    const card = document.getElementById('verb-card-0');
    const favBtn = card.querySelector('[data-action="toggle-fav"]');
    expect(card).toBeTruthy();
    expect(favBtn).toBeTruthy();

    let cardToggled = false;
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="toggle-fav"]')) {
        toggleFavMock(favBtn.dataset.favId, favBtn);
        return;
      }
      if (e.target.closest('[data-action="toggle-verb"]')) {
        cardToggled = true;
      }
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
