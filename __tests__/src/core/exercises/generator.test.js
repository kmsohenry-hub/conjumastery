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

import {
  generateFill,
  generateQuestions,
  generateSingleQuestion,
  generateTransform,
} from '../../../../src/core/exercises/generator.js';

describe('generateFill', () => {
  test('uses a fill template when the template branch is selected', () => {
    const tense = APP_DATA.tensesById.present_simple;
    const original = APP_DATA.exerciseTemplates.present_simple.fill;
    APP_DATA.exerciseTemplates.present_simple.fill = [
      { sentence: 'Template ___', answer: 'works', explanation: 'template' },
    ];
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const question = generateFill(tense, 'He', 'work', true);

    expect(question).toEqual({
      type: 'fill',
      sentence: 'Template ___',
      answer: 'works',
      tenseId: 'present_simple',
      explanation: 'template',
    });
    APP_DATA.exerciseTemplates.present_simple.fill = original;
    Math.random.mockRestore();
  });

  test.each([
    ['present_simple', 'He ___ (work) every morning.', 'works', true],
    ['present_continuous', 'I ___ (work) at the moment.', 'am working', false],
    ['past_simple', 'They ___ (work) last week.', 'worked', false],
    ['present_perfect', 'She ___ (go) already.', 'has gone', true],
    ['future_will', 'They ___ (work) tomorrow.', 'will work', false],
    ['future_going_to', 'He ___ (work) next month.', 'is going to work', true],
    ['past_continuous', 'They ___ (work) when I arrived.', 'were working', false],
  ])('generates dynamic fill for %s', (tenseId, sentence, answer, is3rdSing) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const tense = APP_DATA.tensesById[tenseId];
    const verb = tenseId === 'present_perfect' ? 'go' : 'work';
    const subject =
      tenseId === 'present_continuous'
        ? 'I'
        : tenseId === 'future_going_to' || tenseId === 'past_continuous'
          ? is3rdSing
            ? 'He'
            : 'They'
          : tenseId === 'present_simple'
            ? 'He'
            : tenseId === 'past_simple' || tenseId === 'future_will'
              ? 'They'
              : 'She';

    const question = generateFill(tense, subject, verb, is3rdSing);

    expect(question.sentence).toBe(sentence);
    expect(question.answer).toBe(answer);
    expect(question.tenseId).toBe(tenseId);
    Math.random.mockRestore();
  });

  test('uses the generic fallback for an unsupported tense', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const tense = { id: 'custom_tense', nameFR: 'Temps personnalisé', structure: 'Sujet + verbe' };

    const question = generateFill(tense, 'They', 'work', false);

    expect(question.sentence).toBe('They ___ (work) recently.');
    expect(question.answer).toBe('have worked');
    Math.random.mockRestore();
  });
});

describe('generateTransform', () => {
  test.each([
    [
      'present_simple',
      'I',
      'work',
      false,
      'Phrase affirmative : "I work every day."',
      "I don't work every day.",
    ],
    [
      'present_simple',
      'He',
      'work',
      true,
      'Phrase affirmative:unused',
      "He doesn't work every day.",
    ],
    ['past_simple', 'They', 'go', false, 'Phrase affirmative:unused', "They didn't go yesterday."],
    ['present_continuous', 'I', 'work', false, 'I am working', 'I am not working.'],
    ['past_continuous', 'He', 'work', true, 'He was working', 'He was not working.'],
    ['present_perfect', 'She', 'go', true, 'She has gone', "She hasn't gone."],
    ['future_will', 'They', 'work', false, 'They will work', "They won't work."],
    ['future_going_to', 'He', 'work', true, 'He is going to work', 'He is not going to work.'],
    ['custom_tense', 'They', 'work', false, 'They work.', "They didn't work."],
  ])(
    'generates the expected negative branch for %s',
    (tenseId, subject, verb, is3rdSing, _affirmativeMarker, expectedNegative) => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const tense = APP_DATA.tensesById[tenseId] || {
        id: tenseId,
        nameFR: 'Custom',
        structure: 'Custom',
      };

      const question = generateTransform(tense, subject, verb, is3rdSing);

      expect(question.answer).toBe(expectedNegative);
      expect(question.sentence).toContain('Mettez cette phrase à la forme négative :');
      Math.random.mockRestore();
    },
  );

  test.each([
    ['present_simple', 'I', 'work', false, 'Do I work every day?'],
    ['past_simple', 'They', 'go', false, 'Did they go yesterday?'],
    ['present_continuous', 'He', 'work', true, 'Is he working?'],
    ['past_continuous', 'They', 'work', false, 'Were they working?'],
    ['present_perfect', 'She', 'go', true, 'Has she gone?'],
    ['future_will', 'They', 'work', false, 'Will they work?'],
    ['future_going_to', 'He', 'work', true, 'Is he going to work?'],
    ['custom_tense', 'They', 'work', false, 'Did they work?'],
  ])(
    'generates the expected question branch for %s',
    (tenseId, subject, verb, is3rdSing, expectedQuestion) => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const tense = APP_DATA.tensesById[tenseId] || {
        id: tenseId,
        nameFR: 'Custom',
        structure: 'Custom',
      };

      const question = generateTransform(tense, subject, verb, is3rdSing);

      expect(question.answer).toBe(expectedQuestion);
      expect(question.sentence).toContain('Transformez en question :');
      Math.random.mockRestore();
    },
  );
});

describe('generateSingleQuestion and generateQuestions', () => {
  test.each(['qcm', 'fill', 'transform', 'correction', 'translation', 'unknown'])(
    'supports mode %s',
    (mode) => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const tense = APP_DATA.tensesById.present_simple;

      const question = generateSingleQuestion(mode, tense, ['He'], ['work'], 'easy');

      expect(question).toBeDefined();
      expect(question.type).toBe(mode === 'unknown' ? 'qcm' : mode);
      Math.random.mockRestore();
    },
  );

  test('generates the requested number of mixed questions from a selected tense', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const questions = generateQuestions('mixed', ['present_simple'], 'easy', 5);

    expect(questions).toHaveLength(5);
    expect(questions.every((question) => question.tenseId === 'present_simple')).toBe(true);
    Math.random.mockRestore();
  });

  test('skips unknown tense ids', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const questions = generateQuestions('fill', ['missing_tense'], 'easy', 3);

    expect(questions).toEqual([]);
    Math.random.mockRestore();
  });
});

describe('dynamic branch closure', () => {
  it('exercises every QCM fallback tense and subject combination', () => {
    const original = Math.random;
    Math.random = () => 0.99;
    try {
      for (const tense of APP_DATA.tenses) {
        for (const [subject, third] of [
          ['I', false],
          ['He', true],
          ['They', false],
        ]) {
          const q = generateQCM(tense, subject, 'work', third, 'easy');
          expect(q.options.length).toBe(4);
          expect(q.answer).toBeUndefined();
        }
      }
    } finally {
      Math.random = original;
    }
  });

  it('exercises every fill and transform branch with both direction choices', () => {
    const original = Math.random;
    try {
      for (const value of [0, 0.99]) {
        Math.random = () => value;
        for (const tense of APP_DATA.tenses) {
          for (const [subject, third] of [
            ['I', false],
            ['He', true],
            ['They', false],
          ]) {
            expect(generateFill(tense, subject, 'go', third).answer).toBeTruthy();
            expect(generateTransform(tense, subject, 'go', third).answer).toBeTruthy();
          }
        }
      }
    } finally {
      Math.random = original;
    }
  });
});

describe('fallback generator paths without templates', () => {
  it('exercises dynamic QCM and fill branches when template data is unavailable', () => {
    const originalRandom = Math.random;
    const templates = APP_DATA.exerciseTemplates;
    Math.random = () => 0.99;
    try {
      for (const tense of APP_DATA.tenses) {
        const saved = templates[tense.id];
        templates[tense.id] = undefined;
        try {
          for (const [subject, third] of [
            ['I', false],
            ['He', true],
            ['They', false],
          ]) {
            const qcm = generateQCM(tense, subject, 'work', third, 'easy');
            expect(qcm.type).toBe('qcm');
            const fill = generateFill(tense, subject, 'work', third);
            expect(fill.type).toBe('fill');
          }
        } finally {
          templates[tense.id] = saved;
        }
      }
    } finally {
      Math.random = originalRandom;
    }
  });

  it('exercises transform branches for every supported tense in both directions', () => {
    const originalRandom = Math.random;
    try {
      for (const random of [0, 0.99]) {
        Math.random = () => random;
        for (const tense of APP_DATA.tenses) {
          for (const [subject, third] of [
            ['I', false],
            ['He', true],
            ['They', false],
            ['John', true],
          ]) {
            const q = generateTransform(tense, subject, 'work', third);
            expect(q.answer).toBeTruthy();
          }
        }
      }
    } finally {
      Math.random = originalRandom;
    }
  });
});
