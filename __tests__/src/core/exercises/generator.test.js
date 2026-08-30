import { describe, expect, test, vi } from 'vitest';
import { APP_DATA } from '../../../../src/data/index.js';
import {
  generateCorrection,
  generateQCM,
  generateTranslation,
} from '../../../../src/core/exercises/generator.js';

APP_DATA.verbsByBase = APP_DATA.irregularVerbs.reduce((acc, verb) => {
  acc[verb.base] = verb;
  return acc;
}, {});

APP_DATA.tensesById = APP_DATA.tenses.reduce((acc, tense) => {
  acc[tense.id] = tense;
  return acc;
}, {});

describe('generateQCM', () => {
  test.each([
    ['future_continuous', 'will be working'],
    ['future_perfect', 'will have worked'],
    ['future_perfect_continuous', 'will have been working'],
    ['present_perfect_continuous', 'have been working'],
    ['past_perfect_continuous', 'had been working'],
  ])('generates a dynamic QCM for %s', (tenseId, expectedAnswer) => {
    const tense = APP_DATA.tenses.find((item) => item.id === tenseId);

    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const question = generateQCM(tense, 'They', 'work', false, 'easy');

    expect(question.sentence).toContain('___');
    expect(question.options).toContain(expectedAnswer);
    expect(question.correct).toBe(question.options.indexOf(expectedAnswer));

    Math.random.mockRestore();
  });
});

describe('tense-aligned generated exercises', () => {
  test.each([
    ['present_perfect', 'They have worked already.'],
    ['past_perfect', 'They had worked before I arrived.'],
    ['future_perfect', 'They will have worked by tomorrow.'],
    ['future_perfect_continuous', 'They will have been working for two hours by then.'],
  ])('generates translations aligned with %s', (tenseId, expectedAnswer) => {
    const tense =
      APP_DATA.tensesById[tenseId] || APP_DATA.tenses.find((item) => item.id === tenseId);

    const question = generateTranslation(tense, 'They', 'work', false);

    expect(question.tenseId).toBe(tenseId);
    expect(question.sentence).toContain(tense.nameFR);
    expect(question.answer).toBe(expectedAnswer);
  });

  test.each([
    ['present_perfect', 'They have worked already.'],
    ['past_continuous', 'They were working when I arrived.'],
    ['future_continuous', 'They will be working tomorrow evening.'],
  ])('generates corrections aligned with %s', (tenseId, expectedAnswer) => {
    const tense =
      APP_DATA.tensesById[tenseId] || APP_DATA.tenses.find((item) => item.id === tenseId);

    const question = generateCorrection(tense, 'They', 'work', false);

    expect(question.tenseId).toBe(tenseId);
    expect(question.answer).toBe(expectedAnswer);
    expect(question.sentence).not.toContain(expectedAnswer);
  });
});
