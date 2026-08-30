import { beforeEach, describe, expect, test } from 'vitest';
import { APP_DATA } from '../../../../data.js';
import ExerciseEngine from '../../../../src/core/exercises/ExerciseEngine.js';

APP_DATA.verbsByBase = APP_DATA.irregularVerbs.reduce((acc, verb) => {
  acc[verb.base] = verb;
  return acc;
}, {});
APP_DATA.tensesById = APP_DATA.tenses.reduce((acc, tense) => {
  acc[tense.id] = tense;
  return acc;
}, {});

describe('ExerciseEngine', () => {
  beforeEach(() => {
    ExerciseEngine.questions = [];
    ExerciseEngine.currentIndex = 0;
    ExerciseEngine.score = 0;
    ExerciseEngine.answered = false;
    ExerciseEngine.currentExercise = null;
    ExerciseEngine.currentMode = null;
  });

  test('starts an exercise session and resets progress', () => {
    const questions = ExerciseEngine.start('fill', ['present_simple'], 'easy', 3);

    expect(questions).toHaveLength(3);
    expect(ExerciseEngine.questions).toBe(questions);
    expect(ExerciseEngine.currentIndex).toBe(0);
    expect(ExerciseEngine.score).toBe(0);
    expect(ExerciseEngine.answered).toBe(false);
  });

  test('returns the current question and advances through the session', () => {
    ExerciseEngine.start('fill', ['present_simple'], 'easy', 2);

    const first = ExerciseEngine.getCurrent();
    expect(first).not.toBeNull();
    expect(ExerciseEngine.getProgress()).toEqual({ current: 1, total: 2, score: 0 });
    expect(ExerciseEngine.isComplete()).toBe(false);

    expect(ExerciseEngine.next()).toBe(true);
    expect(ExerciseEngine.currentIndex).toBe(1);
    expect(ExerciseEngine.getCurrent()).not.toBeNull();
    expect(ExerciseEngine.getProgress().current).toBe(2);

    expect(ExerciseEngine.next()).toBe(false);
    expect(ExerciseEngine.isComplete()).toBe(true);
    expect(ExerciseEngine.getCurrent()).toBeNull();
  });

  test('delegates conjugation helpers to the conjugation module', () => {
    expect(ExerciseEngine.getRegularPast('work')).toBe('worked');
    expect(ExerciseEngine.getPresentSimpleForm('work', true)).toBe('works');
    expect(ExerciseEngine.getIngForm('work')).toBe('working');
    expect(ExerciseEngine.getIrregularForms('go')).toEqual({ past: 'went', pp: 'gone' });
    expect(ExerciseEngine.getAllIrregularForms('go')).toEqual({ past: ['went'], pp: ['gone'] });
    expect(ExerciseEngine.getConjugation('go', 'past_simple', 'They', false)).toBe('went');
  });

  test('exposes question generation', () => {
    const question = ExerciseEngine.generateQuestions('fill', ['present_simple'], 'easy', 1);

    expect(question).toHaveLength(1);
    expect(question[0].type).toBe('fill');
    expect(question[0].tenseId).toBe('present_simple');
  });

  test('uses the requested count without throwing for zero', () => {
    expect(ExerciseEngine.generateQuestions('fill', ['present_simple'], 'easy', 0)).toEqual([]);
  });

  test('keeps next() behaviour consistent for an empty session', () => {
    expect(ExerciseEngine.isComplete()).toBe(true);
    expect(ExerciseEngine.getCurrent()).toBeNull();
    expect(ExerciseEngine.getProgress()).toEqual({ current: 1, total: 0, score: 0 });
    expect(ExerciseEngine.next()).toBe(false);
    expect(ExerciseEngine.currentIndex).toBe(1);
  });
});
