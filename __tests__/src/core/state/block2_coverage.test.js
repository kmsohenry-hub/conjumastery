import fs from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore, defaultState, mergeStates } from '../../../../src/core/state/store.js';
import { State, setupStorageSync } from '../../../../src/core/state/State.js';
import { init } from '../../../../app.js';

describe('Block 2 branch and line coverage completion', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('covers app.js conjumaster:save-error listener execution', () => {
    document.body.innerHTML = fs.readFileSync('index.html', 'utf8').match(/<body>([\s\S]*)<\/body>/i)[1];
    init();
    window.dispatchEvent(new window.CustomEvent('conjumaster:save-error'));
    const toast = document.querySelector('.toast');
    expect(toast).toBeTruthy();
    expect(toast.textContent).toContain('Espace de stockage');
  });

  it('covers State.js storage event edge cases (invalid json, wrong key, empty value, repeated init)', () => {
    setupStorageSync();
    // Second call should return early
    setupStorageSync();

    // Wrong key
    window.dispatchEvent(new window.StorageEvent('storage', { key: 'other_key', newValue: '{}' }));

    // Empty newValue
    window.dispatchEvent(new window.StorageEvent('storage', { key: 'conjumaster_data', newValue: null }));

    // Invalid JSON
    window.dispatchEvent(new window.StorageEvent('storage', { key: 'conjumaster_data', newValue: '{invalid' }));

    // syncExternalState with non-object
    expect(() => State.syncExternalState(null)).not.toThrow();
    expect(() => State.syncExternalState('string')).not.toThrow();
  });

  it('covers State.save when window.dispatchEvent throws or succeeds', () => {
    // Failure path with throw in dispatchEvent
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('fail');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'dispatchEvent').mockImplementation(() => {
      throw new Error('dispatch fail');
    });

    expect(State.save()).toBe(false);

    // Success path (dispatchEvent is not called)
    vi.restoreAllMocks();
    const store = createStore();
    State.data = store.getState();
    expect(State.save()).toBe(true);
  });

  it('covers State.checkStreak all branch paths', () => {
    const today = new Date().toDateString();
    const store = createStore();
    State.data = store.getState();

    // Branch: lastActiveDate === todayStr (already active today)
    State.data = { ...State.data, lastActiveDate: today, daysStreak: 3 };
    State.checkStreak();
    expect(State.data.daysStreak).toBe(3);

    // Branch: lastActiveDate was yesterday (diff === 1)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    State.data = { ...State.data, lastActiveDate: yesterday, daysStreak: 3 };
    State.checkStreak();
    expect(State.data.daysStreak).toBe(4);

    // Branch: lastActiveDate was 5 days ago (diff > 1, reset streak to 1)
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toDateString();
    State.data = { ...State.data, lastActiveDate: fiveDaysAgo, daysStreak: 10 };
    State.checkStreak();
    expect(State.data.daysStreak).toBe(1);

    // Branch: lastActiveDate is in the future (diff < 0)
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString();
    State.data = { ...State.data, lastActiveDate: futureDate, daysStreak: 5 };
    State.checkStreak();
    expect(State.data.daysStreak).toBe(5);

    // Branch: no lastActiveDate
    State.data = { ...State.data, lastActiveDate: null, daysStreak: 0 };
    State.checkStreak();
    expect(State.data.daysStreak).toBe(1);
  });

  it('covers mergeStates all branch permutations', () => {
    // Non-object type branches
    expect(mergeStates(null, { xp: 10 }).xp).toBe(10);
    expect(mergeStates('not-an-obj', { xp: 15 }).xp).toBe(15);
    expect(mergeStates({ xp: 20 }, null).xp).toBe(20);
    expect(mergeStates({ xp: 25 }, 'not-an-obj').xp).toBe(25);

    const base = defaultState;
    const olderDate = new Date('2026-01-01T00:00:00.000Z').toISOString();
    const newerDate = new Date('2026-02-01T00:00:00.000Z').toISOString();

    // 1. Non-array completedLessons and favorites, null tenseStats
    const invalidSubfields = {
      ...base,
      completedLessons: 'not-array',
      favorites: null,
      tenseStats: null,
      spacedRepetition: null,
      activityLog: [null, { date: olderDate, xp: 10 }, { noDate: true }],
      errorLog: [null, { date: olderDate, tenseId: 'past_simple' }, { noDate: true }],
      settings: null,
    };
    const validWithTense = {
      ...base,
      completedLessons: ['l1'],
      favorites: ['v1'],
      tenseStats: { present_simple: { correct: 5, total: 10 } },
      spacedRepetition: {
        present_simple: { nextReview: 50 },
        past_simple: { nextReview: 10 },
      },
      activityLog: [{ date: newerDate, xp: 20 }],
      errorLog: [{ date: newerDate, tenseId: 'present_simple' }],
      settings: { theme: 'dark' },
    };

    const res1 = mergeStates(invalidSubfields, validWithTense);
    expect(res1.completedLessons).toEqual(['l1']);
    expect(res1.favorites).toEqual(['v1']);
    expect(res1.settings.theme).toBe('dark');
    expect(res1.tenseStats.present_simple).toEqual({ correct: 5, total: 10 });

    // 2. Reverse: local has tense, remote does not; local settings is dark
    const localWithDark = {
      ...base,
      tenseStats: { future_simple: { correct: 2, total: 4 } },
      spacedRepetition: {
        present_simple: { nextReview: 100 },
      },
      settings: { theme: 'dark' },
    };
    const remoteWithoutTense = {
      ...base,
      tenseStats: null,
      spacedRepetition: {
        present_simple: { nextReview: 50 }, // smaller nextReview, should not override
        past_continuous: null,
      },
      settings: { theme: 'light' },
    };
    const res2 = mergeStates(localWithDark, remoteWithoutTense);
    expect(res2.settings.theme).toBe('dark');
    expect(res2.tenseStats.future_simple).toEqual({ correct: 2, total: 4 });
    expect(res2.spacedRepetition.present_simple.nextReview).toBe(100);

    // 3. Date comparison: local is newer than remote
    const localNewer = { ...base, lastActiveDate: newerDate };
    const remoteOlder = { ...base, lastActiveDate: olderDate };
    const res3 = mergeStates(localNewer, remoteOlder);
    expect(res3.lastActiveDate).toBe(newerDate);

    // 4. Remote has date, local has null
    const res4 = mergeStates({ ...base, lastActiveDate: null }, remoteOlder);
    expect(res4.lastActiveDate).toBe(olderDate);

    // 5. Light theme on both sides
    const res5 = mergeStates({ ...base, settings: { theme: 'light' } }, { ...base, settings: { theme: 'light' } });
    expect(res5.settings.theme).toBe('light');
  });
});

  it('covers store.js default fallbacks for level, spacedRepetition falsy nextReview, and non-object remoteSR', () => {
    // 1. local.level and remote.level are undefined/falsy so `|| 1` is evaluated
    const s1 = {
      ...defaultState,
      level: 0,
      xp: 0,
      spacedRepetition: {
        tense_a: { nextReview: 0 }, // nextReview is 0, so `Number(0) || 0` evaluates `|| 0`
      },
    };
    const s2 = {
      ...defaultState,
      level: undefined,
      xp: 0,
      spacedRepetition: {
        tense_a: { nextReview: undefined }, // evaluates `|| 0`
      },
    };
    const res = mergeStates(s1, s2);
    expect(res.level).toBe(1);

    // 2. remote.spacedRepetition is not a plain object (e.g. null)
    const resNonObjSR = mergeStates(s1, { ...defaultState, spacedRepetition: null });
    expect(resNonObjSR.spacedRepetition.tense_a).toBeDefined();
  });
