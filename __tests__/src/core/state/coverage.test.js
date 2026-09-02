import { describe, expect, it, vi } from 'vitest';
import { createStore, defaultState } from '../../../../src/core/state/store.js';
import { getWeakPoints, getReviewQueue } from '../../../../src/core/state/selectors.js';
import { State } from '../../../../src/core/state/State.js';

describe('state coverage', () => {
  it('exercises store listener, functional setState, mutations and reset paths', () => {
    const store = createStore({
      ...defaultState,
      activityLog: [],
      tenseStats: {},
      spacedRepetition: {},
      favorites: [],
    });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.setState((state) => ({ xp: state.xp + 1 }));
    expect(listener).toHaveBeenCalled();
    expect(unsubscribe()).toBe(true);
    expect(unsubscribe()).toBe(false);
    store.subscribe(() => {
      throw new Error('listener failure');
    });
    expect(() => store.addXP(99)).not.toThrow();
    store.recordAnswer('present_simple', true);
    store.recordAnswer('present_simple', false);
    store.recordAnswer('present_simple', true);
    expect(store.getState().totalExercises).toBe(3);
    store.completeLesson('l1');
    const xpAfterLesson = store.getState().xp;
    expect(store.completeLesson('l1').xp).toBe(xpAfterLesson);
    store.toggleFavorite('x');
    store.toggleFavorite('x');
    expect(store.getState().favorites).toEqual([]);
    store.reset();
    expect(store.getState().xp).toBe(0);
  });

  it('covers weak-point own-property filtering and review queue filtering/sorting', () => {
    const proto = { inherited: { correct: 0, total: 10 } };
    const tenseStats = Object.assign(Object.create(proto), {
      weakA: { correct: 1, total: 5 },
      strong: { correct: 4, total: 5 },
      tooFew: { correct: 0, total: 2 },
    });
    expect(getWeakPoints({ tenseStats })).toEqual([
      { tenseId: 'weakA', accuracy: 0.2, total: 5, errors: 4 },
    ]);
    expect(
      getReviewQueue(
        {
          spacedRepetition: {
            later: { nextReview: 20, interval: 1 },
            now: { nextReview: 5, interval: 2 },
            past: { nextReview: 1, interval: 3 },
          },
        },
        10,
      ),
    ).toEqual([
      { tenseId: 'past', nextReview: 1, interval: 3 },
      { tenseId: 'now', nextReview: 5, interval: 2 },
    ]);
  });
});

it('initializes State from persisted data and starts a first-day streak when needed', () => {
  localStorage.setItem(
    'conjumaster_data',
    JSON.stringify({
      ...defaultState,
      xp: 42,
      daysStreak: 0,
      lastActiveDate: null,
    }),
  );
  const realToday = new Date('2026-09-02T12:00:00').getTime();
  vi.setSystemTime(realToday);
  expect(() => State.init()).not.toThrow();
  expect(State.data.xp).toBe(42);
  localStorage.clear();
  State.init();
  expect(State.data.daysStreak).toBeGreaterThanOrEqual(1);
});

it('sorts multiple weak points by ascending accuracy', () => {
  expect(
    getWeakPoints({
      tenseStats: {
        a: { correct: 1, total: 5 },
        b: { correct: 2, total: 5 },
        c: { correct: 4, total: 5 },
      },
    }),
  ).toEqual([
    { tenseId: 'a', accuracy: 0.2, total: 5, errors: 4 },
    { tenseId: 'b', accuracy: 0.4, total: 5, errors: 3 },
  ]);
});

it('covers new streak after a gap and favorite no-op guards', () => {
  const yesterday = new Date('2026-08-31T12:00:00').toDateString();
  localStorage.setItem(
    'conjumaster_data',
    JSON.stringify({ ...defaultState, daysStreak: 7, lastActiveDate: yesterday }),
  );
  vi.setSystemTime(new Date('2026-09-03T12:00:00'));
  State.init();
  expect(State.data.daysStreak).toBe(1);
  expect(State.data.lastActiveDate).toBe(new Date('2026-09-03T12:00:00').toDateString());
  State.addFavorite('x');
  State.addFavorite('x');
  State.removeFavorite('missing');
});

it('ignores a future last-active date without resetting it', () => {
  const future = new Date('2026-09-05T12:00:00').toDateString();
  State.data = { ...State.data, daysStreak: 9, lastActiveDate: future };
  vi.setSystemTime(new Date('2026-09-02T12:00:00'));
  State.checkStreak();
  expect(State.data.lastActiveDate).toBe(future);
  expect(State.data.daysStreak).toBe(9);
});
