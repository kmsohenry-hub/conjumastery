import { beforeEach, describe, expect, it } from 'vitest';
import { State } from '../../../../src/core/state/State.js';

const defaultState = {
  xp: 0,
  level: 1,
  daysStreak: 0,
  lastActiveDate: null,
  completedLessons: [],
  favorites: [],
  spacedRepetition: {},
  activityLog: [],
  settings: { theme: 'light', dailyGoal: 10, notifications: false },
};

beforeEach(() => {
  State.data = { ...defaultState };
  State.resetSessionPromotions();
});

describe('SRS promotion capping and lesson isolation', () => {
  describe('session-level SRS interval capping (Issue #107)', () => {
    it('promotes tense interval on the first correct answer in a session', () => {
      State.data = {
        ...defaultState,
        spacedRepetition: {
          past_simple: { interval: 1, ease: 2.5, errors: 0, nextReview: 0 },
        },
      };

      State.recordAnswer('past_simple', true);
      const sr = State.data.spacedRepetition.past_simple;
      expect(sr.interval).toBe(3);
    });

    it('does NOT promote interval a second time for the same tense in the same session', () => {
      State.data = {
        ...defaultState,
        spacedRepetition: {
          past_simple: { interval: 1, ease: 2.5, errors: 0, nextReview: 0 },
        },
      };

      // First correct answer -> promoted
      State.recordAnswer('past_simple', true);
      const firstInterval = State.data.spacedRepetition.past_simple.interval;
      expect(firstInterval).toBe(3);

      // Second correct answer in the same session -> interval must stay locked at 3
      State.recordAnswer('past_simple', true);
      expect(State.data.spacedRepetition.past_simple.interval).toBe(firstInterval);

      // Third correct answer -> still locked at 3
      State.recordAnswer('past_simple', true);
      expect(State.data.spacedRepetition.past_simple.interval).toBe(firstInterval);
    });

    it('strictly enforces at most one promotion per session even if an error occurs between successes (P-05)', () => {
      State.data = {
        ...defaultState,
        spacedRepetition: {
          present_simple: { interval: 1, ease: 2.5, errors: 0, nextReview: 0 },
        },
      };
      State.resetSessionPromotions();

      // Q1: correct -> interval advances from 1 to 3
      State.recordAnswer('present_simple', true);
      expect(State.data.spacedRepetition.present_simple.interval).toBe(3);

      // Q2: error -> interval resets to 1, errors = 1
      State.recordAnswer('present_simple', false);
      expect(State.data.spacedRepetition.present_simple.interval).toBe(1);
      expect(State.data.spacedRepetition.present_simple.errors).toBe(1);

      // Q3: correct again in the SAME session -> must NOT promote again!
      State.recordAnswer('present_simple', true);
      expect(State.data.spacedRepetition.present_simple.interval).toBe(1);

      // New session starts
      State.resetSessionPromotions();
      State.recordAnswer('present_simple', true);
      expect(State.data.spacedRepetition.present_simple.interval).toBeGreaterThan(1);
    });

    it('allows promotion in the next session after session reset', () => {
      State.data = {
        ...defaultState,
        spacedRepetition: {
          past_simple: { interval: 1, ease: 2.5, errors: 0, nextReview: 0 },
        },
      };

      // Session 1: promote
      State.recordAnswer('past_simple', true);
      expect(State.data.spacedRepetition.past_simple.interval).toBe(3);

      // Session 2 begins: resetSessionPromotions called
      State.resetSessionPromotions();
      State.recordAnswer('past_simple', true);
      expect(State.data.spacedRepetition.past_simple.interval).toBeGreaterThan(3);
    });
  });

  describe('lesson completion decoupling (Issue #111)', () => {
    it('only marks the targeted lesson as completed', () => {
      State.completeLesson('l_pres_simple');
      expect(State.data.completedLessons).toContain('l_pres_simple');
      expect(State.data.completedLessons).not.toContain('l_past_simple');
      expect(State.data.completedLessons).toHaveLength(1);
    });

    it('does not duplicate completedLessons when completed multiple times', () => {
      State.completeLesson('l_future');
      State.completeLesson('l_future');
      expect(State.data.completedLessons.filter((id) => id === 'l_future')).toHaveLength(1);
    });
  });
});
