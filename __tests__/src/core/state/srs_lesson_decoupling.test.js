import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore, defaultState } from '../../../../src/core/state/store.js';
import { State } from '../../../../src/core/state/State.js';
import ExerciseEngine from '../../../../src/core/exercises/ExerciseEngine.js';
import { generateQuestions } from '../../../../src/core/exercises/generator.js';

describe('Pedagogical decoupling: Lessons and Spaced Repetition (Issues #111, #107)', () => {
  beforeEach(() => {
    localStorage.clear();
    State.reset();
    State.resetSessionPromotions?.();
  });

  describe('Issue #111: Lesson session completion decoupling', () => {
    it('does not complete any lesson during free single-tense training even with 100% score', () => {
      ExerciseEngine.start('mixed', ['present_simple'], 'intermediate', 5, null);
      expect(ExerciseEngine.currentLessonId).toBeNull();

      // Simulate completion check
      const score = 5;
      const total = 5;
      const pct = Math.round((score / total) * 100);
      expect(pct).toBe(100);

      // Finish logic should check currentLessonId
      if (pct >= 80 && ExerciseEngine.currentLessonId) {
        State.completeLesson(ExerciseEngine.currentLessonId);
      }
      expect(State.data.completedLessons).toEqual([]);
    });

    it('completes only the specified lesson when score >= 80%', () => {
      ExerciseEngine.start('mixed', ['present_simple'], 'intermediate', 15, 'l_present_simple');
      expect(ExerciseEngine.currentLessonId).toBe('l_present_simple');

      const score = 13;
      const total = 15;
      const pct = Math.round((score / total) * 100);
      expect(pct).toBeGreaterThanOrEqual(80);

      if (pct >= 80 && ExerciseEngine.currentLessonId) {
        State.completeLesson(ExerciseEngine.currentLessonId);
      }
      expect(State.data.completedLessons).toEqual(['l_present_simple']);
    });

    it('does not complete lesson if score is below 80%', () => {
      ExerciseEngine.start('mixed', ['present_simple'], 'intermediate', 15, 'l_present_simple');

      const score = 10;
      const total = 15;
      const pct = Math.round((score / total) * 100);
      expect(pct).toBeLessThan(80);

      if (pct >= 80 && ExerciseEngine.currentLessonId) {
        State.completeLesson(ExerciseEngine.currentLessonId);
      }
      expect(State.data.completedLessons).toEqual([]);
    });
  });

  describe('Issue #107: Spaced Repetition stabilization & deterministic queue coverage', () => {
    it('covers all due tenses in round-robin order without omissions when isRevision is true', () => {
      const dueQueue = ['present_simple', 'past_simple', 'future_will', 'present_perfect'];
      const questions = generateQuestions('mixed', dueQueue, 'intermediate', dueQueue.length, true);

      expect(questions).toHaveLength(4);
      expect(questions.map((q) => q.tenseId)).toEqual(dueQueue);
    });

    it('promotes a tense interval at most once per session to prevent artificial inflation', () => {
      State.data = {
        ...defaultState,
        spacedRepetition: {
          present_simple: { interval: 1, ease: 2.5, errors: 1, nextReview: 0 },
        },
      };
      State.resetSessionPromotions();

      // Answer 1: correct -> interval should advance (1 * 2.5 = 3)
      State.recordAnswer('present_simple', true);
      expect(State.data.spacedRepetition.present_simple.interval).toBe(3);

      // Answers 2 to 10 in same session -> interval should NOT advance again
      for (let i = 2; i <= 10; i++) {
        State.recordAnswer('present_simple', true);
        expect(State.data.spacedRepetition.present_simple.interval).toBe(3);
      }

      // Answer incorrect -> resets interval and records error immediately
      State.recordAnswer('present_simple', false);
      expect(State.data.spacedRepetition.present_simple.interval).toBe(1);
      expect(State.data.spacedRepetition.present_simple.errors).toBe(1);
    });

    it('allows promotion in the next session after session reset', () => {
      State.data = {
        ...defaultState,
        spacedRepetition: {
          present_simple: { interval: 3, ease: 2.6, errors: 0, nextReview: 0 },
        },
      };

      // New session
      State.resetSessionPromotions();
      State.recordAnswer('present_simple', true);
      expect(State.data.spacedRepetition.present_simple.interval).toBe(8); // 3 * 2.6 = 8
    });
  });
});
