import { describe, expect, test, vi } from 'vitest';
import { APP_DATA } from '../../../../data.js';
import { generateQCM } from '../../../../src/core/exercises/generator.js';

APP_DATA.verbsByBase = APP_DATA.irregularVerbs.reduce((acc, verb) => {
  acc[verb.base] = verb;
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
