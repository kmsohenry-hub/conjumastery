import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockState } = vi.hoisted(() => ({
  mockState: {
    getWeakPoints: vi.fn().mockReturnValue([]),
  },
}));

vi.mock('../../../../src/core/state/State.js', () => ({
  State: mockState,
}));

import { renderWeakpoints } from '../../../../src/ui/pages/weakpoints.js';

beforeEach(() => {
  document.body.innerHTML = '<div id="weakpointsContent"></div>';
});

describe('weakpoints page', () => {
  it('renders empty state when no weakpoints exist', () => {
    mockState.getWeakPoints.mockReturnValue([]);
    renderWeakpoints();
    expect(document.getElementById('weakpointsContent').innerHTML).toContain(
      'Aucun point faible identifié',
    );
  });

  it('renders weakpoints list when weakpoints exist', () => {
    mockState.getWeakPoints.mockReturnValue([
      { tenseId: 'present_simple', accuracy: 0.35, total: 10, errors: 6.5 },
    ]);
    renderWeakpoints();
    const html = document.getElementById('weakpointsContent').innerHTML;
    expect(html).toContain('35%');
    expect(html).toContain('Présent simple');
  });
});
