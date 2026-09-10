import { describe, expect, test, vi } from 'vitest';
import { APP_DATA } from '../../../src/data/index.js';
import { generateQuestions, generateTransform } from '../../../src/core/exercises/generator.js';

describe('generator core distribution', () => {
  test('revision mode cycles deterministically across the requested review queue (Issue #107)', () => {
    const queueTenses = ['past_simple', 'present_perfect', 'future_will'];
    const count = 6;

    const questions = generateQuestions('qcm', queueTenses, 'intermediate', count, true);

    expect(questions).toHaveLength(6);
    expect(questions[0].tenseId).toBe('past_simple');
    expect(questions[1].tenseId).toBe('present_perfect');
    expect(questions[2].tenseId).toBe('future_will');
    expect(questions[3].tenseId).toBe('past_simple');
    expect(questions[4].tenseId).toBe('present_perfect');
    expect(questions[5].tenseId).toBe('future_will');
  });

  test('revision mode with queue count = 1 repeats that single tense for all questions', () => {
    const queueTenses = ['past_continuous'];
    const count = 3;

    const questions = generateQuestions('fill', queueTenses, 'beginner', count, true);

    expect(questions).toHaveLength(3);
    expect(questions.every((q) => q.tenseId === 'past_continuous')).toBe(true);
  });
});

describe('P-03 and P-10: Conditionals with be and special lessons', () => {
  test("conditional_0, 1, 2 with be never produce doesn't be, don't be, or didn't be (P-03)", () => {
    const t0 = APP_DATA.tensesById.conditional_0;
    const t1 = APP_DATA.tensesById.conditional_1;
    const t2 = APP_DATA.tensesById.conditional_2;

    for (const [subj, third] of [
      ['I', false],
      ['She', true],
      ['They', false],
    ]) {
      for (const t of [t0, t1, t2]) {
        for (const random of [0, 0.99]) {
          vi.spyOn(Math, 'random').mockReturnValue(random);
          const q = generateTransform(t, subj, 'be', third);
          expect(q.answer).not.toMatch(/\b(?:doesn't|don't|didn't)\s+be\b/i);
          expect(q.answer).not.toMatch(/\bDoes\s+\w+\s+be\b/i);
          Math.random.mockRestore();
        }
      }
    }
  });

  test("conditional_2 with be produces subjunctive were/weren't (P-03)", () => {
    const t2 = APP_DATA.tensesById.conditional_2;
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(generateTransform(t2, 'She', 'be', true).answer).toBe(
      "If She weren't, She wouldn't be.",
    );
    expect(generateTransform(t2, 'I', 'be', false).answer).toBe("If I weren't, I wouldn't be.");

    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(generateTransform(t2, 'She', 'be', true).answer).toBe('If She were, would she be?');
    Math.random.mockRestore();
  });

  test('generateQuestions produces specific questions for special lessons l_passive and l_reported (P-10)', () => {
    const passiveQuestions = generateQuestions('mixed', [], 'intermediate', 5, false, 'l_passive');
    expect(passiveQuestions).toHaveLength(5);
    expect(passiveQuestions.every((q) => q.sentence.includes('voix passive'))).toBe(true);

    const reportedQuestions = generateQuestions(
      'mixed',
      [],
      'intermediate',
      5,
      false,
      'l_reported',
    );
    expect(reportedQuestions).toHaveLength(5);
    expect(reportedQuestions.every((q) => q.sentence.includes('discours indirect'))).toBe(true);
  });
});
