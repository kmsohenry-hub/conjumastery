import { describe, expect, test, vi } from 'vitest';
import { APP_DATA } from '../../../../src/data/index.js';
import {
  generateCorrection,
  generateFill,
  generateQCM,
  generateTranslation,
  generateTransform,
} from '../../../../src/core/exercises/generator.js';

const tense = (id) => APP_DATA.tenses.find((item) => item.id === id);

const assertMeaningfulQuestion = (question, tenseId) => {
  expect(question.tenseId).toBe(tenseId);
  for (const value of Object.values(question)) {
    expect(String(value)).not.toContain('undefined');
  }
  expect(String(question.sentence).trim()).not.toBe('');
  expect(String(question.answer).trim()).not.toBe('');
};

const dynamicTenses = [
  'present_simple',
  'present_continuous',
  'present_perfect',
  'present_perfect_continuous',
  'past_simple',
  'past_continuous',
  'past_perfect',
  'past_perfect_continuous',
  'future_will',
  'future_going_to',
  'future_continuous',
  'future_perfect',
  'future_perfect_continuous',
  'conditional_0',
  'conditional_1',
  'conditional_2',
  'conditional_3',
  'mixed_conditional',
];

describe('semantic generation invariants', () => {
  test.each(dynamicTenses)(
    'dynamic fill remains aligned with the requested tense: %s',
    (tenseId) => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const question = generateFill(tense(tenseId), 'John', 'go', true);

      assertMeaningfulQuestion(question, tenseId);
      expect(question.sentence).toContain('___');
      Math.random.mockRestore();
    },
  );

  test.each([
    ['present_perfect_continuous', 'has been going'],
    ['past_perfect', 'had gone'],
    ['past_perfect_continuous', 'had been going'],
    ['future_continuous', 'will be going'],
    ['future_perfect', 'will have gone'],
    ['future_perfect_continuous', 'will have been going'],
  ])('QCM fallback exposes the correct complex-tense answer: %s', (tenseId, expectedAnswer) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const question = generateQCM(tense(tenseId), 'John', 'go', true, 'easy');

    assertMeaningfulQuestion(question, tenseId);
    expect(question.sentence).toContain('___');
    expect(question.options).toContain(expectedAnswer);
    expect(question.options[question.correct]).toBe(expectedAnswer);
    Math.random.mockRestore();
  });

  test.each([
    ['conditional_0', /If John ___, John ___\./i],
    ['conditional_1', /If John ___, John will go\./i],
    ['conditional_2', /If John ___, John would go\./i],
    ['conditional_3', /If John had ___, John would have ___\./i],
    ['mixed_conditional', /If John had ___, John would go\./i],
  ])('QCM fallback preserves the conditional skeleton: %s', (tenseId, pattern) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const question = generateQCM(tense(tenseId), 'John', 'go', true, 'easy');

    assertMeaningfulQuestion(question, tenseId);
    expect(question.sentence).toMatch(pattern);
    Math.random.mockRestore();
  });

  test('dynamic fill fallback keeps its generic contract for unknown tenses', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const question = generateFill(
      { id: 'custom_tense', nameFR: 'Temps personnalisé', structure: 'Sujet + verbe' },
      'John',
      'go',
      true,
    );

    expect(question).toMatchObject({
      type: 'fill',
      sentence: 'John ___ (go) recently.',
      answer: 'has gone',
      tenseId: 'custom_tense',
    });
    Math.random.mockRestore();
  });

  test.each([
    ['present_perfect_continuous', /^(?:has|have) been \w+ing$/i],
    ['past_perfect', /^had \w+$/i],
    ['past_perfect_continuous', /^had been \w+ing$/i],
    ['future_continuous', /^will be \w+ing$/i],
    ['future_perfect', /^will have \w+$/i],
    ['future_perfect_continuous', /^will have been \w+ing$/i],
    ['conditional_0', /^\w+(?:s|es|ies)$/i],
    ['conditional_1', /^\w+(?:s|es|ies)$/i],
    ['conditional_2', /^\w+(?:t|ed)$/i],
    ['conditional_3', /^\w+$/i],
    ['mixed_conditional', /^\w+$/i],
  ])('dynamic fill answer uses the grammatical form required by %s: %s', (tenseId, pattern) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const question = generateFill(tense(tenseId), 'John', 'go', true);

    assertMeaningfulQuestion(question, tenseId);
    expect(question.answer).toMatch(pattern);
    Math.random.mockRestore();
  });

  test.each([
    ['past_perfect', /John had gone\b/i],
    ['past_perfect_continuous', /John had been going\b/i],
    ['future_continuous', /John will be going\b/i],
    ['future_perfect', /John will have gone\b/i],
    ['future_perfect_continuous', /John will have been going\b/i],
    ['conditional_0', /If John goes.*John goes\./i],
    ['conditional_1', /If John goes.*John will go\./i],
    ['conditional_2', /If John went.*John would go\./i],
    ['conditional_3', /If John had gone.*John would have gone\./i],
    ['mixed_conditional', /If John had gone.*John would go\./i],
  ])('transform source is grammatical and aligned with %s', (tenseId, pattern) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const question = generateTransform(tense(tenseId), 'John', 'go', true);

    assertMeaningfulQuestion(question, tenseId);
    expect(question.sentence).toMatch(pattern);
    expect(question.sentence).not.toContain('John go.');
    expect(question.sentence).not.toContain('John going.');
    expect(question.sentence).not.toContain('John gone.');
    Math.random.mockRestore();
  });

  test.each([
    'conditional_0',
    'conditional_1',
    'conditional_2',
    'conditional_3',
    'mixed_conditional',
  ])('correction and translation keep a valid conditional contract: %s', (tenseId) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const currentTense = tense(tenseId);
    const correction = generateCorrection(currentTense, 'John', 'go', true);
    const translation = generateTranslation(currentTense, 'John', 'go', true);

    assertMeaningfulQuestion(correction, tenseId);
    assertMeaningfulQuestion(translation, tenseId);
    expect(correction.answer).not.toBe('John goes practice.');
    expect(translation.answer).not.toBe('John goes practice.');
    Math.random.mockRestore();
  });

  test.each(
    dynamicTenses.flatMap((tenseId) =>
      ['qcm', 'fill', 'transform', 'correction', 'translation'].map((mode) => [mode, tenseId]),
    ),
  )('all modes produce a well-formed question for %s / %s', (mode, tenseId) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const currentTense = tense(tenseId);
    const generators = {
      qcm: () => generateQCM(currentTense, 'John', 'go', true, 'easy'),
      fill: () => generateFill(currentTense, 'John', 'go', true),
      transform: () => generateTransform(currentTense, 'John', 'go', true),
      correction: () => generateCorrection(currentTense, 'John', 'go', true),
      translation: () => generateTranslation(currentTense, 'John', 'go', true),
    };

    assertMeaningfulQuestion(generators[mode](), tenseId);
    Math.random.mockRestore();
  });
});
