// @vitest-environment node
import { afterEach, describe, expect, test, vi } from 'vitest';
import { APP_DATA } from '../../../src/data/index.js';
import { answerMatches, detectAmericanisms } from '../../../src/core/exercises/validation.js';
import {
  buildFillAcceptedAnswers,
  generateCorrection,
  generateFill,
  generateQCM,
  generateTransform,
  generateTranslation,
} from '../../../src/core/exercises/generator.js';
import { getAllIrregularForms, getIngForm } from '../../../src/core/exercises/conjugation.js';

const DANGEROUS_HTML_RE = /<script\b|javascript:|on(?:error|load|click)\s*=/i;

describe('curriculum data & pedagogical invariants', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('every tense has valid required structure, category membership, and unique ID', () => {
    const seenIds = new Set();
    const validCategories = new Set(['present', 'past', 'future', 'perfect', 'conditionals']);

    expect(APP_DATA.tenses.length).toBeGreaterThanOrEqual(18);
    for (const tense of APP_DATA.tenses) {
      expect(seenIds.has(tense.id), `Duplicate tense ID: ${tense.id}`).toBe(false);
      seenIds.add(tense.id);
      expect(APP_DATA.tensesById[tense.id]).toBe(tense);
      expect(validCategories.has(tense.category), `Invalid category on ${tense.id}`).toBe(true);
      expect(tense.name?.trim()).toBeTruthy();
      expect(tense.nameFR?.trim()).toBeTruthy();
      expect(tense.structure?.trim()).toBeTruthy();
      expect(tense.explanation?.trim()).toBeTruthy();
      expect(DANGEROUS_HTML_RE.test(tense.explanation)).toBe(false);
    }
  });

  test('every module lesson has unique ID and resolves either to a valid tense or special lesson', () => {
    const seenLessonIds = new Set();
    const specialLessons = new Set(['l_passive', 'l_reported', 'l_modals', 'l_phrasal']);

    for (const mod of APP_DATA.modules) {
      expect(mod.id).toBeTruthy();
      expect(Array.isArray(mod.lessons) && mod.lessons.length > 0).toBe(true);
      for (const lesson of mod.lessons) {
        expect(seenLessonIds.has(lesson.id), `Duplicate lesson ID: ${lesson.id}`).toBe(false);
        seenLessonIds.add(lesson.id);
        expect(lesson.title?.trim()).toBeTruthy();
        expect(lesson.exercises).toBeGreaterThan(0);
        if (lesson.tenseId) {
          expect(
            APP_DATA.tensesById[lesson.tenseId],
            `Lesson ${lesson.id} references unknown tenseId ${lesson.tenseId}`,
          ).toBeDefined();
        } else {
          expect(
            specialLessons.has(lesson.id),
            `Lesson ${lesson.id} has no tenseId and is not a registered special lesson`,
          ).toBe(true);
        }
      }
    }
  });

  test('every curated exercise template is structurally sound, self-matching, and British-English consistent', () => {
    let totalTemplates = 0;

    for (const [tenseId, group] of Object.entries(APP_DATA.exerciseTemplates)) {
      expect(
        APP_DATA.tensesById[tenseId],
        `Unknown tenseId in templates: ${tenseId}`,
      ).toBeDefined();

      for (const tpl of group.qcm || []) {
        totalTemplates++;
        expect(tpl.sentence, `Empty QCM sentence in ${tenseId}`).toContain('___');
        expect(tpl.options, `QCM options in ${tenseId}`).toHaveLength(4);
        expect(
          new Set(tpl.options).size,
          `Duplicate QCM options in ${tenseId}: ${tpl.sentence}`,
        ).toBe(4);
        expect(tpl.correct).toBeGreaterThanOrEqual(0);
        expect(tpl.correct).toBeLessThan(tpl.options.length);
        expect(tpl.explanation?.trim()).toBeTruthy();
        expect(DANGEROUS_HTML_RE.test(tpl.sentence + tpl.explanation)).toBe(false);
      }

      for (const tpl of group.fill || []) {
        totalTemplates++;
        expect(tpl.sentence, `Fill missing blank in ${tenseId}`).toContain('___');
        expect(tpl.answer?.trim()).toBeTruthy();
        expect(
          answerMatches(tpl.answer, tpl.answer),
          `Fill answer failed self-match: ${tpl.answer}`,
        ).toBe(true);
        expect(
          detectAmericanisms(tpl.answer),
          `Unexpected Americanism in canonical British fill answer (${tenseId}): ${tpl.answer}`,
        ).toEqual([]);
        const expanded = buildFillAcceptedAnswers(tpl.sentence, tpl.answer);
        expect(expanded.length).toBeGreaterThan(0);
        expect(expanded.every((item) => answerMatches(item, item))).toBe(true);
      }

      for (const tpl of group.correction || []) {
        totalTemplates++;
        expect(tpl.wrong?.trim()).toBeTruthy();
        expect(tpl.answer?.trim()).toBeTruthy();
        expect(
          answerMatches(tpl.wrong, tpl.answer),
          `Correction wrong sentence matches expected answer (${tenseId}): ${tpl.wrong}`,
        ).toBe(false);
        expect(answerMatches(tpl.answer, tpl.answer)).toBe(true);
        expect(
          detectAmericanisms(tpl.answer),
          `Unexpected Americanism in canonical British correction answer (${tenseId}): ${tpl.answer}`,
        ).toEqual([]);
      }

      for (const tpl of group.translation || []) {
        totalTemplates++;
        expect(tpl.fr?.trim()).toBeTruthy();
        expect(tpl.answer?.trim()).toBeTruthy();
        expect(answerMatches(tpl.answer, tpl.answer)).toBe(true);
        expect(
          detectAmericanisms(tpl.answer),
          `Unexpected Americanism in canonical British translation answer (${tenseId}): ${tpl.answer}`,
        ).toEqual([]);
      }
    }

    expect(totalTemplates).toBeGreaterThanOrEqual(240);
  });

  test('every irregular verb has unique base, consistent O(1) index, and valid inflections', () => {
    const seen = new Set();
    expect(APP_DATA.irregularVerbs.length).toBeGreaterThanOrEqual(140);

    for (const verb of APP_DATA.irregularVerbs) {
      expect(seen.has(verb.base), `Duplicate irregular verb: ${verb.base}`).toBe(false);
      seen.add(verb.base);
      expect(APP_DATA.verbsByBase[verb.base]).toBe(verb);
      expect(verb.past?.trim()).toBeTruthy();
      expect(verb.pp?.trim()).toBeTruthy();
      expect(verb.meaning?.trim()).toBeTruthy();

      const forms = getAllIrregularForms(APP_DATA.verbsByBase, verb.base);
      expect(forms.past.length).toBeGreaterThanOrEqual(1);
      expect(forms.pp.length).toBeGreaterThanOrEqual(1);
      expect(getIngForm(verb.base).endsWith('ing')).toBe(true);
    }
  });

  test('dynamic generators satisfy structural invariants across all 18 tenses (no double-blank QCM bug)', () => {
    // Force fallback dynamic generation (>= 0.7) for every tense
    vi.spyOn(Math, 'random').mockReturnValue(0.85);

    const testCases = [
      ['I', 'be', false],
      ['She', 'have', true],
      ['The teacher', 'teach', true],
      ['They', 'go', false],
    ];

    for (const tense of APP_DATA.tenses) {
      for (const [subj, verb, is3rdSing] of testCases) {
        const qcm = generateQCM(tense, subj, verb, is3rdSing, 'intermediate');
        const blankCount = (qcm.sentence.match(/___/g) || []).length;
        expect(
          blankCount,
          `Expected 1 or 2 blanks in dynamic QCM for ${tense.id} (${subj}/${verb}): "${qcm.sentence}"`,
        ).toBeGreaterThanOrEqual(1);
        expect(blankCount).toBeLessThanOrEqual(2);
        expect(qcm.options).toHaveLength(4);
        expect(new Set(qcm.options).size).toBe(4);
        expect(qcm.correct).toBeGreaterThanOrEqual(0);
        expect(qcm.correct).toBeLessThan(4);

        const fill = generateFill(tense, subj, verb, is3rdSing);
        expect(fill.sentence).toContain('___');
        expect(answerMatches(fill.answer, fill.answer)).toBe(true);
        expect(fill.acceptedAnswers.length).toBeGreaterThan(0);

        const transform = generateTransform(tense, subj, verb, is3rdSing);
        expect(answerMatches(transform.answer, transform.answer)).toBe(true);
        expect(transform.acceptedAnswers.length).toBeGreaterThan(0);

        const correction = generateCorrection(tense, subj, verb, is3rdSing);
        expect(answerMatches(correction.answer, correction.answer)).toBe(true);
        expect(correction.sentence).not.toContain(`"${correction.answer}"`);

        const translation = generateTranslation(tense, subj, verb, is3rdSing);
        expect(answerMatches(translation.answer, translation.answer)).toBe(true);
      }
    }
  });

  test('buildFillAcceptedAnswers safely escapes regex metacharacters in answers', () => {
    expect(() =>
      buildFillAcceptedAnswers('___ they ___ (win) the match?', 'Did (win)+?'),
    ).not.toThrow();
    const res = buildFillAcceptedAnswers('___ they ___ (win) the match?', 'Did (win)+?');
    expect(res).toContain('Did they (win)+? the match?');
  });
});
