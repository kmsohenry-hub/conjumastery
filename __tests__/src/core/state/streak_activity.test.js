import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { State } from '../../../../src/core/state/State.js';
import { defaultState } from '../../../../src/core/state/store.js';

describe('Streak Activity Decoupling & UI Synchronization (Issues #106, #102)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    State.data = structuredClone(defaultState);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps daysStreak at 0 on first launch without learning activity (Issue #106)', () => {
    vi.setSystemTime(new Date('2026-09-10T12:00:00'));
    State.data = { ...defaultState, daysStreak: 0, lastActiveDate: null };
    State.init();

    expect(State.data.daysStreak).toBe(0);
    expect(State.data.lastActiveDate).toBeNull();
  });

  it('does not increment streak upon opening the app on consecutive day without learning activity (Issue #106)', () => {
    vi.setSystemTime(new Date('2026-09-11T09:00:00'));
    const yesterday = new Date('2026-09-10T15:00:00').toDateString();
    State.data = { ...defaultState, daysStreak: 3, lastActiveDate: yesterday };

    State.init();
    expect(State.data.daysStreak).toBe(0);
    expect(State.data.lastActiveDate).toBe(yesterday);
  });

  it('does not double increment when reloading on the same day', () => {
    vi.setSystemTime(new Date('2026-09-10T10:00:00'));
    const today = new Date('2026-09-10T10:00:00').toDateString();
    const persisted = { ...defaultState, daysStreak: 2, lastActiveDate: today };
    localStorage.setItem('conjumaster_data', JSON.stringify(persisted));

    State.init();
    expect(State.data.daysStreak).toBe(2);
    expect(State.data.lastActiveDate).toBe(today);

    vi.setSystemTime(new Date('2026-09-10T22:00:00'));
    State.init();
    expect(State.data.daysStreak).toBe(2);
    expect(State.data.lastActiveDate).toBe(today);
  });

  it('resets streak to 0 when opening after a missed day', () => {
    vi.setSystemTime(new Date('2026-09-15T09:00:00'));
    const fourDaysAgo = new Date('2026-09-11T12:00:00').toDateString();
    State.data = { ...defaultState, daysStreak: 5, lastActiveDate: fourDaysAgo };

    State.init();
    expect(State.data.daysStreak).toBe(0);
  });

  it('starts streak at 1 on first learning activity of day (Issue #106)', () => {
    vi.setSystemTime(new Date('2026-09-10T12:00:00'));
    State.data = { ...defaultState, daysStreak: 0, lastActiveDate: null };

    State.recordAnswer('present_simple', true);
    expect(State.data.daysStreak).toBe(1);
    expect(State.data.lastActiveDate).toBe(new Date('2026-09-10T12:00:00').toDateString());
  });

  it('increments streak on consecutive day learning activity (Issue #106)', () => {
    vi.setSystemTime(new Date('2026-09-11T14:00:00'));
    const yesterday = new Date('2026-09-10T10:00:00').toDateString();
    State.data = { ...defaultState, daysStreak: 4, lastActiveDate: yesterday };

    State.recordAnswer('present_simple', false);
    expect(State.data.daysStreak).toBe(5);
    expect(State.data.lastActiveDate).toBe(new Date('2026-09-11T14:00:00').toDateString());
  });

  it('multiple activities on the same day maintain a single daily streak increment', () => {
    vi.setSystemTime(new Date('2026-09-10T10:00:00'));
    State.data = { ...defaultState, daysStreak: 0, lastActiveDate: null };

    State.recordAnswer('present_simple', true);
    expect(State.data.daysStreak).toBe(1);

    State.addXP(20);
    expect(State.data.daysStreak).toBe(1);

    State.completeLesson('lesson_1');
    expect(State.data.daysStreak).toBe(1);
  });

  it('restarts streak at 1 on learning activity after streak break', () => {
    vi.setSystemTime(new Date('2026-09-15T12:00:00'));
    const fourDaysAgo = new Date('2026-09-11T12:00:00').toDateString();
    State.data = { ...defaultState, daysStreak: 0, lastActiveDate: fourDaysAgo };

    State.addXP(10);
    expect(State.data.daysStreak).toBe(1);
    expect(State.data.lastActiveDate).toBe(new Date('2026-09-15T12:00:00').toDateString());
  });

  it('notifies subscribers immediately on state mutations for UI synchronization (Issue #102)', () => {
    let callCount = 0;
    const unsub = State.subscribe(() => {
      callCount++;
    });

    State.recordAnswer('past_simple', true);
    expect(callCount).toBeGreaterThan(0);

    const prevCount = callCount;
    State.addXP(15);
    expect(callCount).toBeGreaterThan(prevCount);

    unsub();
  });
});
