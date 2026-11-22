import { describe, expect, test, vi } from 'vitest';
import { APP_DATA } from '../../../../src/data/index.js';
import {
  generateQuestions,
  generateQCM,
  generateTransform,
  generateFill,
  generatePassiveQuestion,
  generateReportedQuestion,
} from '../../../../src/core/exercises/generator.js';

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

  test('generateFill handles future_going_to with subject I correctly in dynamic fallback', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const tense = APP_DATA.tensesById.future_going_to;
    const q = generateFill(tense, 'I', 'work', false);
    expect(q.answer).toBe('am going to work');
    Math.random.mockRestore();
  });

  test('generateTransform handles fallback tenses gracefully', () => {
    const customTense = { id: 'unknown_tense', nameFR: 'Temps Custom' };
    const q = generateTransform(customTense, 'They', 'play', false);
    expect(q.type).toBe('transform');
    expect(q.answer).toMatch(/didn't play|Did they play/);
  });

  test('generatePassiveQuestion returns passive transform question and fallback', () => {
    const q = generatePassiveQuestion();
    expect(q.type).toBe('transform');
    expect(q.tenseId).toBe('passive_voice');
    expect(q.sentence).toContain('Transformez à la voix passive :');
    expect(typeof q.answer).toBe('string');
    expect(q.answer.length).toBeGreaterThan(0);
    expect(q.explanation).toContain(q.answer);

    const originalPassiveInfo = APP_DATA.passiveInfo;
    APP_DATA.passiveInfo = null;
    try {
      const fallbackQ = generatePassiveQuestion();
      expect(fallbackQ.answer).toBe('Houses are built.');
      expect(fallbackQ.explanation).toContain('Present Simple');
    } finally {
      APP_DATA.passiveInfo = originalPassiveInfo;
    }
  });

  test('generateReportedQuestion returns reported transform question and fallback', () => {
    const q = generateReportedQuestion();
    expect(q.type).toBe('transform');
    expect(q.tenseId).toBe('reported_speech');
    expect(q.sentence).toContain('Transformez au discours indirect :');
    expect(typeof q.answer).toBe('string');
    expect(q.answer.length).toBeGreaterThan(0);
    expect(q.explanation).toContain(q.answer);

    const originalReported = APP_DATA.reportedSpeech;
    APP_DATA.reportedSpeech = null;
    try {
      const fallbackQ = generateReportedQuestion();
      expect(fallbackQ.answer).toBe('He said he was happy');
      expect(fallbackQ.explanation).toContain('Present -> Past');
    } finally {
      APP_DATA.reportedSpeech = originalReported;
    }
  });

  test('generateQCM dynamic fallback builds auxiliary continuous forms and single-blank conditionals', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    try {
      const presCont = generateQCM(
        APP_DATA.tensesById.present_continuous,
        'He',
        'work',
        true,
        'intermediate',
      );
      expect(presCont.sentence).toBe('He ___ right now.');
      expect(presCont.options[presCont.correct]).toBe('is working');

      const pastCont = generateQCM(
        APP_DATA.tensesById.past_continuous,
        'He',
        'work',
        true,
        'intermediate',
      );
      expect(pastCont.sentence).toBe('He ___ when I arrived.');
      expect(pastCont.options[pastCont.correct]).toBe('was working');

      const cond0 = generateQCM(
        APP_DATA.tensesById.conditional_0,
        'He',
        'work',
        true,
        'intermediate',
      );
      expect(cond0.sentence).toBe('If He ___, He works.');

      const cond3 = generateQCM(
        APP_DATA.tensesById.conditional_3,
        'He',
        'work',
        true,
        'intermediate',
      );
      expect(cond3.sentence).toBe('If He had ___, He would have worked.');

      const myParentsBe = generateQCM(
        APP_DATA.tensesById.present_simple,
        'My parents',
        'be',
        false,
        'intermediate',
      );
      expect(myParentsBe.sentence).toBe('My parents ___ every day.');
      expect(myParentsBe.options[myParentsBe.correct]).toBe('are');
    } finally {
      Math.random.mockRestore();
    }
  });

  test('generateReportedQuestion never accepts grammatical tense rule names as answers', () => {
    const ruleCount = APP_DATA.reportedSpeech.rules.length;
    for (let i = 0; i < ruleCount; i++) {
      const q = generateReportedQuestion(i);
      const ruleName = APP_DATA.reportedSpeech.rules[i].reported;
      expect(q.acceptedAnswers).not.toContain(ruleName);
    }
  });

  test('curated stative-verb correction template does not accept ungrammatical continuous form', () => {
    const knowCorrection = APP_DATA.exerciseTemplates.present_perfect_continuous.correction.find(
      (item) => item.wrong.includes('She has been know'),
    );
    expect(knowCorrection).toBeDefined();
    expect(knowCorrection.answer).toBe('She has known him for years.');
    expect(knowCorrection.acceptedAnswers).not.toContain('has been knowing');
  });
});
