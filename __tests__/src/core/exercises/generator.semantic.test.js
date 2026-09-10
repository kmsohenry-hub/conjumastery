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

  // HARDENED TESTS FOR ISSUE #99: "bes" / "haves" NEVER produced in any mode
  test.each(dynamicTenses)(
    'invariants for issue #99: no question contains "bes" or "haves" for tense %s',
    (tenseId) => {
      const currentTense = tense(tenseId);
      const testCases = [
        ['be', 'I', false],
        ['be', 'She', true],
        ['be', 'They', false],
        ['have', 'She', true],
        ['have', 'They', false],
      ];

      for (const [verb, subject, is3rd] of testCases) {
        // QCM
        const qcm = generateQCM(currentTense, subject, verb, is3rd, 'easy');
        expect(qcm.options).not.toContain('bes');
        expect(qcm.options).not.toContain('haves');
        expect(qcm.sentence).not.toMatch(/\b(?:bes|haves)\b/);

        // Fill
        const fill = generateFill(currentTense, subject, verb, is3rd);
        expect(fill.answer).not.toMatch(/\b(?:bes|haves)\b/);
        expect(fill.sentence).not.toMatch(/\b(?:bes|haves)\b/);

        // Transform
        const transform = generateTransform(currentTense, subject, verb, is3rd);
        expect(transform.answer).not.toMatch(/\b(?:bes|haves)\b/);
        expect(transform.sentence).not.toMatch(/\b(?:bes|haves)\b/);

        // Correction
        const correction = generateCorrection(currentTense, subject, verb, is3rd);
        expect(correction.answer).not.toMatch(/\b(?:bes|haves)\b/);

        // Translation
        const translation = generateTranslation(currentTense, subject, verb, is3rd);
        expect(translation.answer).not.toMatch(/\b(?:bes|haves)\b/);
      }
    },
  );

  // HARDENED TESTS FOR ISSUE #100: Exact grammatical transform answers for all 18 tenses
  test.each([
    ['present_simple', "She doesn't go every day."],
    ['present_continuous', 'She is not going.'],
    ['present_perfect', "She hasn't gone."],
    ['present_perfect_continuous', "She hasn't been going."],
    ['past_simple', "She didn't go yesterday."],
    ['past_continuous', 'She was not going.'],
    ['past_perfect', "She hadn't gone."],
    ['past_perfect_continuous', "She hadn't been going."],
    ['future_will', "She won't go."],
    ['future_going_to', 'She is not going to go.'],
    ['future_continuous', "She won't be going."],
    ['future_perfect', "She won't have gone."],
    ['future_perfect_continuous', "She won't have been going."],
    ['conditional_0', "If She doesn't go, She doesn't go."],
    ['conditional_1', "If She doesn't go, She won't go."],
    ['conditional_2', "If She didn't go, She wouldn't go."],
    ['conditional_3', "If She hadn't gone, She wouldn't have gone."],
    ['mixed_conditional', "If She hadn't gone, She wouldn't go."],
  ])(
    'transform negative direction produces exact grammatical form for %s (She / go)',
    (tenseId, expectedNegative) => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const question = generateTransform(tense(tenseId), 'She', 'go', true);

      assertMeaningfulQuestion(question, tenseId);
      expect(question.answer).toBe(expectedNegative);
      expect(question.sentence).toContain('Mettez cette phrase à la forme négative :');
      Math.random.mockRestore();
    },
  );

  test.each([
    ['present_simple', 'Does she go every day?'],
    ['present_continuous', 'Is she going?'],
    ['present_perfect', 'Has she gone?'],
    ['present_perfect_continuous', 'Has she been going?'],
    ['past_simple', 'Did she go yesterday?'],
    ['past_continuous', 'Was she going?'],
    ['past_perfect', 'Had she gone?'],
    ['past_perfect_continuous', 'Had she been going?'],
    ['future_will', 'Will she go?'],
    ['future_going_to', 'Is she going to go?'],
    ['future_continuous', 'Will she be going?'],
    ['future_perfect', 'Will she have gone?'],
    ['future_perfect_continuous', 'Will she have been going?'],
    ['conditional_0', 'If She goes, Does she go?'],
    ['conditional_1', 'If She goes, will she go?'],
    ['conditional_2', 'If She went, would she go?'],
    ['conditional_3', 'If She had gone, would she have gone?'],
    ['mixed_conditional', 'If She had gone, would she go?'],
  ])(
    'transform question direction produces exact grammatical form for %s (She / go)',
    (tenseId, expectedQuestion) => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const question = generateTransform(tense(tenseId), 'She', 'go', true);

      assertMeaningfulQuestion(question, tenseId);
      expect(question.answer).toBe(expectedQuestion);
      expect(question.sentence).toContain('Transformez en question :');
      Math.random.mockRestore();
    },
  );

  test('transform handles "be" with proper auxiliaries instead of do/did', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(generateTransform(tense('present_simple'), 'She', 'be', true).answer).toBe(
      "She isn't every day.",
    );
    expect(generateTransform(tense('past_simple'), 'They', 'be', false).answer).toBe(
      "They weren't yesterday.",
    );

    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(generateTransform(tense('present_simple'), 'She', 'be', true).answer).toBe(
      'Is she every day?',
    );
    expect(generateTransform(tense('past_simple'), 'They', 'be', false).answer).toBe(
      'Were they yesterday?',
    );
    Math.random.mockRestore();
  });
});
