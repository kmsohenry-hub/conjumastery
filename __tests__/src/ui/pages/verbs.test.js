import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockState } = vi.hoisted(() => ({
  mockState: {
    isFavorite: vi.fn((item) => item === 'verb_be'),
  },
}));

vi.mock('../../../../src/core/state/State.js', () => ({
  State: mockState,
}));

import { renderVerbs, filterVerbs, toggleVerbCard } from '../../../../src/ui/pages/verbs.js';

beforeEach(() => {
  document.body.innerHTML = `
    <input id="verbSearch" value="" />
    <div id="verbsList"></div>
  `;
});

describe('verbs page', () => {
  it('renders and filters verbs list', () => {
    renderVerbs();
    const container = document.getElementById('verbsList');
    expect(container.children.length).toBeGreaterThan(0);
    expect(container.innerHTML).toContain('be');
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

  it('toggles verb card expansion', () => {
    renderVerbs();
    toggleVerbCard(0);
    const card = document.getElementById('verb-card-0');
    expect(card.classList.contains('expanded')).toBe(true);
    toggleVerbCard(0);
    expect(card.classList.contains('expanded')).toBe(false);
  });
});
