import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockState } = vi.hoisted(() => ({
  mockState: {
    getReviewQueue: vi.fn().mockReturnValue([]),
  },
}));

vi.mock('../../../../src/core/state/State.js', () => ({
  State: mockState,
}));

vi.mock('../../../../src/ui/navigation.js', () => ({
  navigateTo: vi.fn(),
}));

vi.mock('../../../../src/ui/pages/exercises.js', () => ({
  startExercise: vi.fn(),
}));

import { renderRevision, startRevisionSession } from '../../../../src/ui/pages/reviews.js';
import { navigateTo } from '../../../../src/ui/navigation.js';
import { startExercise } from '../../../../src/ui/pages/exercises.js';

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div id="revisionContent"></div>';
});

describe('reviews page', () => {
  it('renders empty revision state', () => {
    mockState.getReviewQueue.mockReturnValue([]);
    renderRevision();
    expect(document.getElementById('revisionContent').innerHTML).toContain(
      'Aucune révision en attente',
    );
  });

  it('renders revision list', () => {
    mockState.getReviewQueue.mockReturnValue([
      { tenseId: 'present_simple', errors: 2, interval: 10 },
    ]);
    renderRevision();
    expect(document.getElementById('revisionContent').innerHTML).toContain('1 point à réviser');
  });

  it('starts revision session', () => {
    mockState.getReviewQueue.mockReturnValue([
      { tenseId: 'present_simple', errors: 2, interval: 10 },
    ]);
    startRevisionSession();
    expect(navigateTo).toHaveBeenCalledWith('exercises');
    vi.advanceTimersByTime(150);
    expect(startExercise).toHaveBeenCalledWith('mixed', ['present_simple'], 'intermediate');
  });
});
