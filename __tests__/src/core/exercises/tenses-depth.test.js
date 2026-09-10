import { describe, expect, test, vi } from 'vitest';
import { APP_DATA } from '../../../../src/data/index.js';
import {
  generateCorrection,
  generateFill,
  generateQuestions,
  generateSingleQuestion,
  generateTransform,
  generateTranslation,
} from '../../../../src/core/exercises/generator.js';
import { getConjugation, getAuxiliary } from '../../../../src/core/exercises/conjugation.js';

const TENSES = [
  ['present_simple', 'works', 'work'],
  ['present_continuous', 'working', 'working'],
  ['present_perfect', 'gone', 'gone'],
  ['present_perfect_continuous', 'working', 'working'],
  ['past_simple', 'went', 'went'],
  ['past_continuous', 'working', 'working'],
  ['past_perfect', 'gone', 'gone'],
  ['past_perfect_continuous', 'working', 'working'],
  ['future_will', 'go', 'go'],
  ['future_going_to', 'go', 'go'],
  ['future_continuous', 'working', 'working'],
  ['future_perfect', 'gone', 'gone'],
  ['future_perfect_continuous', 'working', 'working'],
  ['conditional_0', 'works', 'work'],
  ['conditional_1', 'go', 'go'],
  ['conditional_2', 'went', 'went'],
  ['conditional_3', 'gone', 'gone'],
  ['mixed_conditional', 'go', 'go'],
];

const cleanRandom = (value = 0.99) => vi.spyOn(Math, 'random').mockReturnValue(value);

describe('18 tenses: conjugation matrix', () => {
  test.each(TENSES)('%s returns the expected core form for go / She', (tenseId, expected) => {
    expect(getConjugation(APP_DATA.verbsByBase, 'go', tenseId, 'She', true)).toBe(expected);
  });

  test('covers every tense exactly once in the canonical application data', () => {
    const ids = APP_DATA.tenses.map((tense) => tense.id);
    expect(ids).toHaveLength(18);
    expect(new Set(ids).size).toBe(18);
    expect(ids.sort()).toEqual(TENSES.map(([id]) => id).sort());
  });

  test.each([
    ['present_simple', 'does'],
    ['present_continuous', 'is'],
    ['present_perfect', 'has'],
    ['present_perfect_continuous', 'has been'],
    ['past_simple', 'did'],
    ['past_continuous', 'was'],
    ['past_perfect', 'had'],
    ['past_perfect_continuous', 'had been'],
    ['future_will', 'will'],
    ['future_going_to', 'is going to'],
    ['future_continuous', 'will be'],
    ['future_perfect', 'will have'],
    ['future_perfect_continuous', 'will have been'],
    ['conditional_0', 'does'],
    ['conditional_1', 'will'],
    ['conditional_2', 'would'],
    ['conditional_3', 'would have'],
    ['mixed_conditional', 'would'],
  ])('%s exposes the expected auxiliary for She', (tenseId, expected) => {
    expect(getAuxiliary(tenseId, 'She', true)).toBe(expected);
  });
});

describe('18 tenses: generated fill questions', () => {
  test.each(TENSES)('%s preserves tense identity and returns a substantive answer', (tenseId) => {
    const restore = cleanRandom();
    try {
      const question = generateFill(APP_DATA.tensesById[tenseId], 'She', 'go', true);
      expect(question).toMatchObject({ type: 'fill', tenseId });
      expect(question.answer).toEqual(expect.any(String));
      expect(question.answer.trim()).not.toBe('');
      expect(question.sentence).toContain('___');
      const tenseName = APP_DATA.tensesById[tenseId].nameFR;
      expect(question.explanation).toContain(tenseName);
    } finally {
      restore.mockRestore();
    }
  });

  test('checks the hardest irregular auxiliary/participle combinations explicitly', () => {
    const restore = cleanRandom();
    try {
      expect(
        generateFill(APP_DATA.tensesById.present_perfect, 'She', 'go', true).answer,
      ).toBe('has gone');
      expect(generateFill(APP_DATA.tensesById.past_perfect, 'She', 'go', true).answer).toBe(
        'had gone',
      );
      expect(generateFill(APP_DATA.tensesById.future_perfect, 'She', 'go', true).answer).toBe(
        'will have gone',
      );
      expect(generateFill(APP_DATA.tensesById.conditional_3, 'She', 'go', true).answer).toBe(
        'gone',
      );
      expect(
        generateFill(APP_DATA.tensesById.present_perfect_continuous, 'She', 'go', true).answer,
      ).toBe('has been going');
      expect(
        generateFill(APP_DATA.tensesById.future_perfect_continuous, 'She', 'go', true).answer,
      ).toBe('will have been going');
    } finally {
      restore.mockRestore();
    }
  });
});

describe('18 tenses: affirmative/negative/interrogative transformations', () => {
  test.each(TENSES)('%s can generate both transformation directions', (tenseId) => {
    const tense = APP_DATA.tensesById[tenseId];

    const negativeRandom = cleanRandom(0);
    let negative;
    try {
      negative = generateTransform(tense, 'She', 'go', true);
    } finally {
      negativeRandom.mockRestore();
    }

    const questionRandom = cleanRandom(0.99);
    let question;
    try {
      question = generateTransform(tense, 'She', 'go', true);
    } finally {
      questionRandom.mockRestore();
    }

    expect(negative.type).toBe('transform');
    expect(question.type).toBe('transform');
    expect(negative.tenseId).toBe(tenseId);
    expect(question.tenseId).toBe(tenseId);
    expect(negative.answer).toEqual(expect.any(String));
    expect(question.answer).toEqual(expect.any(String));
    expect(negative.answer).not.toBe(question.answer);
  });

  test('covers the special be behaviour across present, past and conditionals', () => {
    const cases = [
      ['present_simple', 0, 'If She'],
      ['past_simple', 0, "She wasn't"],
      ['conditional_1', 0, "If She isn't"],
      ['conditional_2', 0, "If She weren't"],
      ['conditional_3', 0, "If She hadn't"],
      ['mixed_conditional', 0, "If She hadn't"],
    ];

    for (const [tenseId, random, expected] of cases) {
      const restore = cleanRandom(random);
      try {
        const q = generateTransform(APP_DATA.tensesById[tenseId], 'She', 'be', true);
        expect(q.answer).toContain(expected);
        expect(q.answer).not.toMatch(/\b(?:doesn't|don't|didn't)\s+be\b/i);
      } finally {
        restore.mockRestore();
      }
    }
  });
});

describe('18 tenses: correction and translation contracts', () => {
  test.each(TENSES)('%s produces a correction task with the same tense id', (tenseId) => {
    const question = generateCorrection(APP_DATA.tensesById[tenseId], 'She', 'go', true);
    expect(question).toMatchObject({ type: 'correction', tenseId });
    expect(question.sentence).toContain("Trouvez l'erreur");
    expect(question.answer).toEqual(expect.any(String));
    expect(question.explanation).toContain(APP_DATA.tensesById[tenseId].nameFR);
  });

  test.each(TENSES)('%s produces a translation task with a non-empty answer', (tenseId) => {
    const question = generateTranslation(APP_DATA.tensesById[tenseId], 'She', 'go', true);
    expect(question).toMatchObject({ type: 'translation', tenseId });
    expect(question.sentence).toContain(APP_DATA.tensesById[tenseId].nameFR);
    expect(question.answer).toEqual(expect.any(String));
    expect(question.answer.trim()).not.toBe('');
  });
});

describe('18 tenses: generated session integrity', () => {
  test('revision mode traverses all 18 tenses without dropping any', () => {
    const questions = generateQuestions(
      'fill',
      APP_DATA.tenses.map((tense) => tense.id),
      'intermediate',
      36,
      true,
    );
    expect(questions).toHaveLength(36);
    expect(questions.slice(0, 18).map((q) => q.tenseId)).toEqual(
      APP_DATA.tenses.map((tense) => tense.id),
    );
    expect(questions.slice(18).map((q) => q.tenseId)).toEqual(
      APP_DATA.tenses.map((tense) => tense.id),
    );
  });

  test('each tense supports every non-special exercise mode', () => {
    const modes = ['qcm', 'fill', 'transform', 'correction', 'translation'];
    for (const tenseId of APP_DATA.tenses.map((tense) => tense.id)) {
      for (const mode of modes) {
        const restore = cleanRandom(0.99);
        try {
          const q = generateSingleQuestion(
            mode,
            APP_DATA.tensesById[tenseId],
            ['She'],
            ['go'],
            'intermediate',
          );
          expect(q).not.toBeNull();
          expect(q.tenseId).toBe(tenseId);
          expect(q.type).toBe(mode);
          expect(q.answer || q.options?.[q.correct]).toBeTruthy();
        } finally {
          restore.mockRestore();
        }
      }
    }
  });
});
