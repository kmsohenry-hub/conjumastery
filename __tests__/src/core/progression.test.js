import { describe, expect, it } from 'vitest';
import { APP_DATA } from '../../../src/data/index.js';
import {
  UNLOCK_THRESHOLD,
  getLessonProgress,
  getOrderedLessons,
  getPreviousLesson,
  getUnlockedTenseIds,
  isLessonUnlocked,
  isTenseUnlocked,
} from '../../../src/core/progression.js';

describe('progression (75% sequential unlocking engine)', () => {
  it('sets the global unlock threshold to 75%', () => {
    expect(UNLOCK_THRESHOLD).toBe(75);
  });

  it('orders all 20 lessons starting with Present Simple (l_present_simple)', () => {
    const ordered = getOrderedLessons(APP_DATA.modules);
    expect(ordered).toHaveLength(20);
    expect(ordered[0].id).toBe('l_present_simple');
    expect(ordered[0].tenseId).toBe('present_simple');
    expect(ordered[0].orderIndex).toBe(0);
    expect(ordered[1].id).toBe('l_present_continuous');
    expect(ordered[ordered.length - 1].id).toBe('l_reported');

    expect(getOrderedLessons(null)).toEqual([]);
    expect(getOrderedLessons([{ id: 'empty_mod', lessons: null }])).toEqual([]);
  });

  it('unlocks only Present Simple initially when state is empty', () => {
    const emptyState = { completedLessons: [], tenseStats: {} };
    const ordered = getOrderedLessons(APP_DATA.modules);

    expect(isLessonUnlocked(emptyState, 'l_present_simple')).toBe(true);
    expect(isTenseUnlocked(emptyState, 'present_simple')).toBe(true);

    for (let i = 1; i < ordered.length; i++) {
      expect(isLessonUnlocked(emptyState, ordered[i].id)).toBe(false);
      if (ordered[i].tenseId) {
        expect(isTenseUnlocked(emptyState, ordered[i].tenseId)).toBe(false);
      }
    }

    expect(getUnlockedTenseIds(emptyState)).toEqual(['present_simple']);
  });

  it('keeps the next lesson locked at 74% accuracy and unlocks it at 75% accuracy', () => {
    const stateAt74 = {
      completedLessons: [],
      tenseStats: {
        present_simple: { correct: 74, total: 100 },
      },
    };
    expect(isLessonUnlocked(stateAt74, 'l_present_continuous')).toBe(false);
    expect(isTenseUnlocked(stateAt74, 'present_continuous')).toBe(false);

    const stateAt75 = {
      completedLessons: [],
      tenseStats: {
        present_simple: { correct: 15, total: 20 }, // 75%
      },
    };
    expect(isLessonUnlocked(stateAt75, 'l_present_continuous')).toBe(true);
    expect(isTenseUnlocked(stateAt75, 'present_continuous')).toBe(true);
    expect(isLessonUnlocked(stateAt75, 'l_past_simple')).toBe(false);
    expect(getUnlockedTenseIds(stateAt75)).toEqual(['present_simple', 'present_continuous']);
  });

  it('unlocks lessons sequentially one by one across modules as each reaches >= 75%', () => {
    const ordered = getOrderedLessons(APP_DATA.modules);
    const state = {
      completedLessons: [],
      tenseStats: {},
    };

    for (let i = 0; i < ordered.length - 1; i++) {
      const current = ordered[i];
      const next = ordered[i + 1];

      expect(isLessonUnlocked(state, current.id)).toBe(true);
      expect(isLessonUnlocked(state, next.id)).toBe(false);

      // Master current lesson via 75% accuracy (if tenseId exists) or completedLessons
      if (current.tenseId && i % 2 === 0) {
        state.tenseStats[current.tenseId] = { correct: 3, total: 4 }; // 75%
      } else {
        state.completedLessons.push(current.id);
      }

      expect(isLessonUnlocked(state, next.id)).toBe(true);
    }
  });

  it('computes lesson progress and handles null/edge inputs gracefully', () => {
    expect(getLessonProgress(null, null)).toEqual({
      isCompleted: false,
      accuracy: 0,
      attempts: 0,
      isMastered: false,
    });

    const lesson = { id: 'l_present_simple', tenseId: 'present_simple' };
    const partialState = {
      completedLessons: [],
      tenseStats: { present_simple: { correct: 6, total: 10 } },
    };
    expect(getLessonProgress(partialState, lesson)).toEqual({
      isCompleted: false,
      accuracy: 60,
      rawAccuracy: 60,
      attempts: 10,
      isMastered: false,
    });

    const completedState = {
      completedLessons: ['l_present_simple'],
      tenseStats: { present_simple: { correct: 8, total: 10 } },
    };
    expect(getLessonProgress(completedState, lesson)).toEqual({
      isCompleted: true,
      accuracy: 100,
      rawAccuracy: 80,
      attempts: 10,
      isMastered: true,
    });
  });

  it('returns the previous lesson or null for the first/unknown lesson', () => {
    expect(getPreviousLesson('l_present_simple')).toBeNull();
    expect(getPreviousLesson('unknown_lesson')).toBeNull();
    const prev = getPreviousLesson('l_present_continuous');
    expect(prev?.id).toBe('l_present_simple');
  });

  it('gracefully handles unknown lesson/tense IDs and empty module lists', () => {
    const state = { completedLessons: ['l_past_simple'], tenseStats: {} };
    expect(isLessonUnlocked(state, 'unknown_id')).toBe(true);
    expect(isLessonUnlocked(state, 'l_past_simple')).toBe(true);
    expect(isTenseUnlocked(state, null)).toBe(true);
    expect(isTenseUnlocked(state, 'unknown_tense')).toBe(true);
    expect(getUnlockedTenseIds(state, [])).toEqual(['present_simple']);
  });
});
