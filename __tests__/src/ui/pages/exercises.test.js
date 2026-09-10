import { beforeEach, describe, expect, it, vi } from 'vitest';

const { engine, navigateTo, launchConfetti, answerMatches, state } = vi.hoisted(() => ({
  engine: {
    start: vi.fn(),
    getCurrent: vi.fn(),
    getProgress: vi.fn(() => ({ current: 1, total: 10, score: 0 })),
    next: vi.fn(() => false),
    questions: [],
    currentIndex: 0,
    score: 0,
    answered: false,
    currentMode: null,
    currentTenseFilter: null,
    currentDifficulty: null,
    currentCount: 10,
    currentLessonId: null,
    isRevision: false,
    sessionConfig: null,
  },
  navigateTo: vi.fn(),
  launchConfetti: vi.fn(),
  answerMatches: vi.fn(() => false),
  state: { addXP: vi.fn(), recordAnswer: vi.fn(), completeLesson: vi.fn() },
}));

vi.mock('../../../../src/core/exercises/ExerciseEngine.js', () => ({ default: engine }));
vi.mock('../../../../src/core/exercises/validation.js', () => ({ answerMatches }));
vi.mock('../../../../src/core/state/State.js', () => ({ State: state }));
vi.mock('../../../../src/ui/navigation.js', () => ({ navigateTo }));
vi.mock('../../../../src/ui/utils/confetti.js', () => ({ launchConfetti }));

import {
  exitExercise,
  finishExercise,
  nextExercise,
  renderExerciseQuestion,
  resetExerciseUI,
  restartExercise,
  selectOption,
  skipExercise,
  startExercise,
  startExerciseForLesson,
  startExerciseForTense,
  updateExerciseProgress,
  validateExercise,
} from '../../../../src/ui/pages/exercises.js';

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = `
    <div id="exerciseModeSelector"></div><div id="exerciseArea">
      <span id="exCurrent"></span><span id="exTotal"></span><div id="exProgressBar"></div>
      <div id="exerciseQuestionContainer"></div><div id="exerciseFeedback"></div>
      <button id="exValidateBtn"></button><button id="exNextBtn"></button><button id="exSkipBtn"></button>
    </div>`;
  vi.clearAllMocks();
  Object.assign(engine, {
    questions: [],
    currentIndex: 0,
    score: 0,
    answered: false,
    currentMode: null,
    currentTenseFilter: null,
    currentDifficulty: null,
    currentCount: 10,
    currentLessonId: null,
    isRevision: false,
    sessionConfig: null,
  });
  engine.getProgress.mockReturnValue({ current: 1, total: 10, score: 0 });
  engine.next.mockReturnValue(false);
  answerMatches.mockReturnValue(false);
});

describe('exercises page', () => {
  it('resets the exercise UI', () => {
    document.getElementById('exerciseModeSelector').style.display = 'none';
    document.getElementById('exerciseArea').style.display = 'block';
    resetExerciseUI();
    expect(document.getElementById('exerciseModeSelector').style.display).toBe('block');
    expect(document.getElementById('exerciseArea').style.display).toBe('none');
  });

  it('starts an exercise with explicit parameters and renders the initial question', () => {
    const q = {
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'She ___.',
      options: ['works', 'work'],
      correct: 0,
    };
    engine.getCurrent.mockReturnValue(q);
    startExercise('qcm', ['present_simple'], 'beginner', 5);
    expect(engine.start).toHaveBeenCalledWith(
      'qcm',
      ['present_simple'],
      'beginner',
      5,
      null,
      false,
    );
    expect(document.getElementById('exerciseArea').style.display).toBe('block');
    expect(document.querySelectorAll('.option-btn')).toHaveLength(2);
  });

  it('resolves missing configuration values without mutating source code contracts', () => {
    engine.sessionConfig = {
      mode: 'fill',
      tenseFilter: ['past_simple'],
      difficulty: 'advanced',
      count: 7,
      lessonId: 'lesson-1',
      isRevision: true,
    };
    engine.getCurrent.mockReturnValue({
      type: 'fill',
      tenseId: 'past_simple',
      sentence: 'I ___.',
      answer: 'went',
    });
    startExercise(undefined, undefined, undefined, undefined, undefined, true);
    expect(engine.start).toHaveBeenCalledWith(
      'fill',
      ['past_simple'],
      'advanced',
      7,
      'lesson-1',
      true,
    );
  });

  it('uses mixed mode defaults when no prior session exists', () => {
    engine.getCurrent.mockReturnValue(null);
    startExercise();
    expect(engine.start).toHaveBeenCalledWith('mixed', [], 'intermediate', 10, undefined, false);
  });

  it.each([
    ['fill', 'input'],
    ['translation', 'input'],
    ['transform', 'textarea'],
    ['correction', 'textarea'],
    ['other', null],
  ])('renders %s using the expected control contract', (type, control) => {
    const q = {
      type,
      tenseId: 'past_simple',
      sentence: 'A sentence\nwith two lines',
      answer: 'answer',
    };
    renderExerciseQuestion(q);
    if (control) {
      expect(document.querySelector(control)).not.toBeNull();
      expect(document.getElementById('exerciseInput')).not.toBeNull();
    } else {
      expect(document.getElementById('exerciseInput')).toBeNull();
    }
    expect(document.getElementById('exerciseQuestionContainer').querySelector('script')).toBeNull();
  });

  it('renders escaped text as inert text and preserves line breaks', () => {
    const q = {
      type: 'fill',
      tenseId: 'past_simple',
      sentence: '<script>alert(1)</script>\nNext',
      answer: 'went',
    };
    renderExerciseQuestion(q);
    const container = document.getElementById('exerciseQuestionContainer');
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('.exercise-question').innerHTML).toContain('<br>');
    expect(container.textContent).toContain('<script>alert(1)</script>');
  });

  it('renders QCM options and changes selection deterministically', () => {
    const q = {
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'They ___.',
      options: ['live', 'lives'],
      correct: 0,
    };
    renderExerciseQuestion(q);
    const buttons = [...document.querySelectorAll('.option-btn')];
    selectOption(buttons[0], 0);
    selectOption(buttons[1], 1);
    expect(buttons[0].classList.contains('selected')).toBe(false);
    expect(buttons[1].classList.contains('selected')).toBe(true);
    expect(buttons.map((b) => b.querySelector('.option-letter').textContent)).toEqual(['A', 'B']);
  });

  it('ignores option changes after answering', () => {
    const q = {
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'They ___.',
      options: ['live', 'lives'],
      correct: 0,
    };
    renderExerciseQuestion(q);
    const buttons = [...document.querySelectorAll('.option-btn')];
    engine.answered = true;
    selectOption(buttons[0], 0);
    expect(buttons[0].classList.contains('selected')).toBe(false);
  });

  it('does not validate a QCM without a selected option', () => {
    const q = {
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'He ___.',
      options: ['runs', 'run'],
      correct: 0,
    };
    engine.questions = [q];
    engine.getCurrent.mockReturnValue(q);
    renderExerciseQuestion(q);
    engine.next.mockReturnValue(true);
    nextExercise();
    engine.answered = false;
    renderExerciseQuestion(q);
    validateExercise();
    expect(engine.answered).toBe(false);
    expect(state.recordAnswer).not.toHaveBeenCalled();
  });

  it('records correct and wrong QCM answers with mutually exclusive XP behavior', () => {
    const q = {
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'He ___.',
      options: ['play', 'plays'],
      correct: 1,
      explanation: 'Rule',
    };
    engine.getCurrent.mockReturnValue(q);
    renderExerciseQuestion(q);
    selectOption(document.querySelectorAll('.option-btn')[1], 1);
    validateExercise();
    expect(engine.score).toBe(1);
    expect(state.addXP).toHaveBeenCalledWith(10);
    expect(state.recordAnswer).toHaveBeenCalledWith('present_simple', true);
    vi.clearAllMocks();
    engine.answered = false;
    engine.score = 0;
    renderExerciseQuestion(q);
    selectOption(document.querySelectorAll('.option-btn')[0], 0);
    validateExercise();
    expect(engine.score).toBe(0);
    expect(state.addXP).not.toHaveBeenCalled();
    expect(state.recordAnswer).toHaveBeenCalledWith('present_simple', false);
  });

  it('validates text through answerMatches and ignores blank or duplicate submissions', () => {
    const q = { type: 'fill', tenseId: 'past_simple', sentence: 'She ___.', answer: 'saw' };
    engine.getCurrent.mockReturnValue(q);
    answerMatches.mockReturnValue(true);
    renderExerciseQuestion(q);
    const input = document.getElementById('exerciseInput');
    input.value = '   ';
    validateExercise();
    expect(engine.answered).toBe(false);
    input.value = '  SaW  ';
    validateExercise();
    validateExercise();
    expect(answerMatches).toHaveBeenCalledWith('SaW', 'saw');
    expect(state.recordAnswer).toHaveBeenCalledTimes(1);
  });

  it('skips once and exposes the expected answer', () => {
    const q = {
      type: 'fill',
      tenseId: 'future_will',
      sentence: 'They ___.',
      answer: 'will',
      explanation: 'Use will',
    };
    engine.getCurrent.mockReturnValue(q);
    renderExerciseQuestion(q);
    skipExercise();
    expect(engine.answered).toBe(true);
    expect(state.recordAnswer).toHaveBeenCalledWith('future_will', false);
    expect(document.getElementById('exNextBtn').style.display).toBe('inline-flex');
    const calls = state.recordAnswer.mock.calls.length;
    skipExercise();
    expect(state.recordAnswer).toHaveBeenCalledTimes(calls);
  });

  it('updates progress exactly as reported by the engine', () => {
    engine.getProgress.mockReturnValue({ current: 3, total: 8, score: 1 });
    updateExerciseProgress();
    expect(document.getElementById('exProgressBar').style.width).toBe('37.5%');
  });

  it('advances to the next question and resets transient answer state', () => {
    const q = {
      type: 'qcm',
      tenseId: 'past_simple',
      sentence: 'He ___.',
      options: ['ran', 'run'],
      correct: 0,
    };
    engine.questions = [q, q];
    engine.currentIndex = 1;
    engine.getCurrent.mockReturnValue(q);
    engine.next.mockReturnValue(true);
    engine.answered = true;
    nextExercise();
    expect(engine.next).toHaveBeenCalledOnce();
    expect(document.getElementById('exerciseFeedback').style.display).toBe('none');
    expect(document.getElementById('exValidateBtn').style.display).toBe('inline-flex');
  });

  it.each([
    [90, '🎉'],
    [60, '👍'],
    [40, '💪'],
  ])('renders finish state at %s%%', (pct, emoji) => {
    engine.getProgress.mockReturnValue({ current: 10, total: 10, score: pct / 10 });
    engine.currentLessonId = pct === 90 ? 'lesson-1' : null;
    finishExercise();
    expect(document.getElementById('exerciseQuestionContainer').textContent).toContain(emoji);
    expect(launchConfetti).toHaveBeenCalledTimes(pct >= 80 ? 1 : 0);
    expect(state.completeLesson).toHaveBeenCalledTimes(pct >= 80 ? 1 : 0);
  });

  it('starts a valid lesson asynchronously and guards an invalid id', () => {
    startExerciseForLesson('nonexistent');
    expect(engine.start).not.toHaveBeenCalled();
    startExerciseForLesson('l_past_simple');
    vi.advanceTimersByTime(100);
    expect(navigateTo).toHaveBeenCalledWith('exercises');
    expect(engine.start).toHaveBeenCalledWith(
      'mixed',
      ['past_simple'],
      'intermediate',
      20,
      'l_past_simple',
      false,
    );
  });

  it('starts a tense-focused session asynchronously', () => {
    startExerciseForTense('future_will');
    vi.advanceTimersByTime(100);
    expect(navigateTo).toHaveBeenCalledWith('exercises');
    expect(engine.start).toHaveBeenCalledWith(
      'mixed',
      ['future_will'],
      'intermediate',
      10,
      null,
      false,
    );
  });

  it('restarts from immutable session configuration and fallback engine properties', () => {
    engine.sessionConfig = {
      mode: 'qcm',
      tenseFilter: ['past_continuous'],
      difficulty: 'advanced',
      count: 15,
      lessonId: 'lesson',
      isRevision: true,
    };
    restartExercise();
    expect(engine.start).toHaveBeenCalledWith(
      'qcm',
      ['past_continuous'],
      'advanced',
      15,
      'lesson',
      true,
    );
    vi.clearAllMocks();
    engine.sessionConfig = null;
    engine.currentMode = 'fill';
    engine.currentTenseFilter = ['future_will'];
    engine.currentDifficulty = 'beginner';
    engine.currentCount = 8;
    restartExercise();
    expect(engine.start).toHaveBeenCalledWith('fill', ['future_will'], 'beginner', 8, null, false);
  });

  it('returns to the selector on exit', () => {
    exitExercise();
    expect(document.getElementById('exerciseModeSelector').style.display).toBe('block');
    expect(document.getElementById('exerciseArea').style.display).toBe('none');
  });
});
