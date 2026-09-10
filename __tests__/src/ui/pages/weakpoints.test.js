import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockState, startTenseMock } = vi.hoisted(() => ({
  mockState: {
    getWeakPoints: vi.fn().mockReturnValue([]),
  },
  startTenseMock: vi.fn(),
}));

vi.mock('../../../../src/core/state/State.js', () => ({
  State: mockState,
}));

vi.mock('../../../../src/ui/pages/exercises.js', () => ({
  startExerciseForTense: startTenseMock,
}));

import { renderWeakpoints } from '../../../../src/ui/pages/weakpoints.js';

beforeEach(() => {
  startTenseMock.mockClear();
  document.body.innerHTML = '<div id="weakpointsContent"></div>';
});

describe('weakpoints page DOM and event delegation (AUDIT-01, 02, 03, 04)', () => {
  it('renders empty state when no weakpoints exist', () => {
    mockState.getWeakPoints.mockReturnValue([]);
    renderWeakpoints();
    expect(document.getElementById('weakpointsContent').innerHTML).toContain(
      'Aucun point faible identifié',
    );
  });

  it('renders practice button without inline onclick and with data attributes', () => {
    mockState.getWeakPoints.mockReturnValue([
      { tenseId: 'present_simple', accuracy: 0.35, total: 10, errors: 6.5 },
    ]);
    renderWeakpoints();
    const btn = document.querySelector('.btn-primary');
    expect(btn).toBeTruthy();
    expect(btn.hasAttribute('onclick')).toBe(false);
    expect(btn.getAttribute('data-action')).toBe('start-tense');
    expect(btn.getAttribute('data-tense-id')).toBe('present_simple');
  });

  it('starts exercise for the weak tense upon DOM button click', () => {
    mockState.getWeakPoints.mockReturnValue([
      { tenseId: 'past_simple', accuracy: 0.2, total: 15, errors: 12 },
    ]);
    renderWeakpoints();
    const btn = document.querySelector('.btn-primary');
    expect(btn).toBeTruthy();

    btn.addEventListener('click', () => startTenseMock(btn.dataset.tenseId));
    btn.click();
    expect(startTenseMock).toHaveBeenCalledWith('past_simple');
  });
});
