import { describe, expect, test } from 'vitest';
import {
  answerMatches,
  canonicalizeGrammar,
  checkAmericanEnglishUsage,
  detectAmericanisms,
  getExpectedBritishForm,
  normalizeAnswer,
} from '../../../../src/core/exercises/validation.js';
import {
  buildFillAcceptedAnswers,
  generateCorrection,
  generateFill,
  generatePassiveQuestion,
  generateQuestions,
  generateReportedQuestion,
  generateTransform,
  generateTranslation,
} from '../../../../src/core/exercises/generator.js';
import { APP_DATA } from '../../../../src/data/index.js';

describe('validation.js — smart grammatical equivalence', () => {
  test('normalizes punctuation, quotes, parenthetical hints, and extra spaces', () => {
    expect(normalizeAnswer('  "She   works!" (work) ')).toBe('she works');
    expect(normalizeAnswer('«He doesn’t know...»')).toBe("he doesn't know");
  });

  test.each([
    ["She doesn't go every day.", 'She does not go every day.'],
    ['They do not like spicy food.', "They don't like spicy food."],
    ["He didn't see her.", 'He did not see her.'],
    ["She isn't working today.", 'She is not working today.'],
    ["She's not working today.", 'She is not working today.'],
    ["They aren't watching TV.", 'They are not watching TV.'],
    ["We're not ready yet.", 'We are not ready yet.'],
    ["I wasn't sleeping.", 'I was not sleeping.'],
    ["They weren't listening.", 'They were not listening.'],
    ["I haven't seen that film.", 'I have not seen that film.'],
    ["She hasn't finished yet.", 'She has not finished yet.'],
    ["He hadn't left.", 'He had not left.'],
    ["I won't tell anyone.", 'I will not tell anyone.'],
    ["We wouldn't do that.", 'We would not do that.'],
    ["You shouldn't worry.", 'You should not worry.'],
    ["He couldn't swim.", 'He could not swim.'],
    ["You mustn't smoke here.", 'You must not smoke here.'],
    ["I can't swim.", 'I cannot swim.'],
    ["I can't swim.", 'I can not swim.'],
    ["I'm looking for my keys.", 'I am looking for my keys.'],
    ["You're doing great.", 'You are doing great.'],
    ["We've known each other for years.", 'We have known each other for years.'],
    ["They'll arrive tomorrow.", 'They will arrive tomorrow.'],
    ["She's worked here for ten years.", 'She has worked here for ten years.'],
    ["He's sleeping right now.", 'He is sleeping right now.'],
    ["If I'd known, I'd have helped.", 'If I had known, I would have helped.'],
    ["You'd better leave now.", 'You had better leave now.'],
  ])('matches contracted and expanded forms bidirectionally: %s <-> %s', (formA, formB) => {
    expect(answerMatches(formA, formB)).toBe(true);
    expect(answerMatches(formB, formA)).toBe(true);
  });

  test.each([
    ['I have learnt a lot.', 'I have learned a lot.'],
    ['She dreamt of flying.', 'She dreamed of flying.'],
    ['He burnt the toast.', 'He burned the toast.'],
    ['She spelt her name.', 'She spelled her name.'],
    ['They have got a car.', 'They have gotten a car.'],
    ['We will have been travelling.', 'We will have been traveling.'],
    ['The flight was cancelled.', 'The flight was canceled.'],
    ['She realised her mistake.', 'She realized her mistake.'],
    ['He apologised immediately.', 'He apologized immediately.'],
    ['I practised the piano.', 'I practiced the piano.'],
  ])('matches British and American verb spellings bidirectionally: %s <-> %s', (ukForm, usForm) => {
    expect(answerMatches(ukForm, usForm)).toBe(true);
    expect(answerMatches(usForm, ukForm)).toBe(true);
    expect(canonicalizeGrammar(ukForm)).toBe(canonicalizeGrammar(usForm));
  });

  test('accepts multi-blank answers separated by spaces, slashes, dots, or commas', () => {
    expect(answerMatches('Did win', 'Did win')).toBe(true);
    expect(answerMatches('Did / win', 'Did win')).toBe(true);
    expect(answerMatches('Did ... win', 'Did win')).toBe(true);
    expect(answerMatches('Did, win', 'Did win')).toBe(true);
    expect(answerMatches('Did - win', 'Did win')).toBe(true);
    expect(answerMatches('have / eaten', 'have / eaten')).toBe(true);
    expect(answerMatches('have eaten', 'have / eaten')).toBe(true);
  });

  test('accepts optional "that" and omitted introductory clause in reported speech', () => {
    const expected = 'She said she liked tea.';
    expect(answerMatches('She said she liked tea.', expected)).toBe(true);
    expect(answerMatches('She said that she liked tea.', expected)).toBe(true);
    expect(answerMatches('she liked tea', expected)).toBe(true);
    expect(answerMatches('that she liked tea', expected)).toBe(true);
  });

  test('accepts inverted conditional clause order', () => {
    const expected = 'If it rains tomorrow, we will stay home.';
    expect(answerMatches('We will stay home if it rains tomorrow.', expected)).toBe(true);
    expect(answerMatches("We'll stay home if it rains tomorrow.", expected)).toBe(true);
  });

  test('rejects grammatically wrong answers without false positives', () => {
    expect(answerMatches('She work every day.', 'She works every day.')).toBe(false);
    expect(answerMatches('She don’t go.', "She doesn't go.")).toBe(false);
    expect(answerMatches('I have went.', 'I have gone.')).toBe(false);
    expect(answerMatches('He is work.', 'He is working.')).toBe(false);
    expect(answerMatches('   ', 'works')).toBe(false);
  });

  test('detects American English forms and generates explicit British English notice', () => {
    expect(detectAmericanisms('I have learned a lot while traveling.')).toEqual([
      { us: 'learned', uk: 'learnt' },
      { us: 'traveling', uk: 'travelling' },
    ]);
    expect(detectAmericanisms('I have learnt a lot while travelling.')).toEqual([]);

    expect(getExpectedBritishForm('learnt / learned')).toBe('learnt');
    expect(getExpectedBritishForm('have / eaten')).toBe('have / eaten');

    const checkUs = checkAmericanEnglishUsage(
      'We will have been traveling.',
      'We will have been travelling.',
    );
    expect(checkUs.isAmerican).toBe(true);
    expect(checkUs.expectedBritishAnswer).toBe('We will have been travelling.');
    expect(checkUs.differences).toEqual([{ us: 'traveling', uk: 'travelling' }]);
    expect(checkUs.notice).toContain("ce n'était pas le résultat attendu en anglais britannique");

    const checkUk = checkAmericanEnglishUsage(
      'We will have been travelling.',
      'We will have been travelling.',
    );
    expect(checkUk.isAmerican).toBe(false);
    expect(checkUk.notice).toBe('');
  });
});

describe('generator + validation integration across exercise modes', () => {
  test('buildFillAcceptedAnswers accepts both blank words and full sentence for single and multi-blank questions', () => {
    const single = buildFillAcceptedAnswers('My brother ___ (work) in a bank.', 'works');
    expect(single).toContain('My brother works in a bank.');
    expect(single).toContain('My brother works');

    const multi = buildFillAcceptedAnswers('___ they ___ (win) the match last night?', 'Did win');
    expect(multi).toContain('Did they win the match last night?');
    expect(multi).toContain('Did they win');
  });

  test('correction questions accept full corrected sentence, uncontracted form, or just the corrected verb phrase', () => {
    const tense = APP_DATA.tensesById.present_simple;
    const q = generateCorrection(tense, 'She', 'work', true);
    const isAccepted = (input) =>
      answerMatches(input, q.answer) ||
      (Array.isArray(q.acceptedAnswers) &&
        q.acceptedAnswers.some((alt) => answerMatches(input, alt)));

    expect(isAccepted(q.answer)).toBe(true);
    for (const alt of q.acceptedAnswers) {
      expect(isAccepted(alt)).toBe(true);
    }
  });

  test('reported speech lesson generates authentic direct-to-reported sentence transformations', () => {
    const questions = generateQuestions('mixed', [], 'intermediate', 15, false, 'l_reported');
    expect(questions).toHaveLength(15);
    const uniqueSentences = new Set(questions.map((q) => q.sentence));
    expect(uniqueSentences.size).toBe(15);
    for (const q of questions) {
      expect(q.sentence).not.toContain('Present Simple →');
      expect(q.answer).not.toBe('Past Simple');
      expect(q.answer).toMatch(/\b(?:said|told)\b/i);
    }
  });

  test('passive voice lesson generates 15 distinct passive transformation exercises', () => {
    const questions = generateQuestions('mixed', [], 'intermediate', 15, false, 'l_passive');
    expect(questions).toHaveLength(15);
    const uniqueSentences = new Set(questions.map((q) => q.sentence));
    expect(uniqueSentences.size).toBe(15);
    for (const q of questions) {
      expect(q.acceptedAnswers.length).toBeGreaterThanOrEqual(1);
    }
  });

  test('single-tense session deduplicates questions so identical prompts do not repeat back-to-back', () => {
    for (const mode of ['qcm', 'fill', 'correction', 'translation', 'mixed']) {
      const questions = generateQuestions(mode, ['present_simple'], 'intermediate', 8, false);
      expect(questions).toHaveLength(8);
      const uniqueSentences = new Set(questions.map((q) => q.sentence));
      expect(uniqueSentences.size).toBeGreaterThanOrEqual(6);
    }
  });

  test('every tense has curated exerciseTemplates for qcm, fill, correction, and translation', () => {
    for (const tense of APP_DATA.tenses) {
      const tpl = APP_DATA.exerciseTemplates[tense.id];
      expect(tpl, `Missing templates for ${tense.id}`).toBeDefined();
      expect(tpl.qcm?.length).toBeGreaterThanOrEqual(3);
      expect(tpl.fill?.length).toBeGreaterThanOrEqual(3);
      expect(tpl.correction?.length).toBeGreaterThanOrEqual(1);
      expect(tpl.translation?.length).toBeGreaterThanOrEqual(1);
    }
  });

  test('generateFill, generateTransform, and generateTranslation attach acceptedAnswers', () => {
    const tense = APP_DATA.tensesById.present_perfect;
    const fillQ = generateFill(tense, 'She', 'go', true);
    expect(Array.isArray(fillQ.acceptedAnswers)).toBe(true);
    expect(fillQ.acceptedAnswers.length).toBeGreaterThan(0);

    const transQ = generateTransform(tense, 'She', 'go', true);
    expect(Array.isArray(transQ.acceptedAnswers)).toBe(true);

    const trlQ = generateTranslation(tense, 'She', 'go', true);
    expect(Array.isArray(trlQ.acceptedAnswers)).toBe(true);

    const passiveQ = generatePassiveQuestion(0);
    expect(Array.isArray(passiveQ.acceptedAnswers)).toBe(true);

    const reportedQ = generateReportedQuestion(0);
    expect(Array.isArray(reportedQ.acceptedAnswers)).toBe(true);
  });
});
