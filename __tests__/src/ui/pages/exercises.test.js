import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockEngine, navigateTo, launchConfetti } = vi.hoisted(() => ({
  mockEngine: {
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
}));

vi.mock('../../../../src/core/exercises/ExerciseEngine.js', () => ({ default: mockEngine }));
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
import { State } from '../../../../src/core/state/State.js';

function buildDOM() {
  document.body.innerHTML = `
    <div id="exerciseModeSelector" style="display:block"></div>
    <div id="exerciseArea" style="display:none">
      <span id="exCurrent"></span>
      <span id="exTotal"></span>
      <div id="exProgressBar"></div>
      <div id="exerciseQuestionContainer"></div>
      <div id="exerciseFeedback" style="display:none"></div>
      <button id="exValidateBtn" style="display:none"></button>
      <button id="exNextBtn" style="display:none"></button>
      <button id="exSkipBtn" style="display:none"></button>
    </div>
  `;
}

beforeEach(() => {
  vi.useFakeTimers();
  buildDOM();
  vi.clearAllMocks();
  mockEngine.questions = [];
  mockEngine.currentIndex = 0;
  mockEngine.score = 0;
  mockEngine.answered = false;
  mockEngine.currentMode = null;
  mockEngine.currentTenseFilter = null;
  mockEngine.currentDifficulty = null;
  mockEngine.currentCount = 10;
  mockEngine.currentLessonId = null;
  mockEngine.isRevision = false;
  mockEngine.sessionConfig = null;
  mockEngine.getProgress.mockReturnValue({ current: 1, total: 10, score: 0 });
});

describe('exercises page', () => {
  it('toggles selector and exercise area on resetExerciseUI', () => {
    document.getElementById('exerciseModeSelector').style.display = 'none';
    document.getElementById('exerciseArea').style.display = 'block';

    resetExerciseUI();

    expect(document.getElementById('exerciseModeSelector').style.display).toBe('block');
    expect(document.getElementById('exerciseArea').style.display).toBe('none');
  });

  it('starts exercise and renders initial view elements', () => {
    mockEngine.getCurrent.mockReturnValue({
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'She ___ every day.',
      options: ['works', 'work', 'working', 'worked'],
      correct: 0,
      explanation: 'Present simple with she takes -s',
    });

    startExercise('qcm', ['present_simple'], 'beginner', 5);

    expect(mockEngine.start).toHaveBeenCalledWith(
      'qcm',
      ['present_simple'],
      'beginner',
      5,
      null,
      false,
    );
    expect(document.getElementById('exerciseModeSelector').style.display).toBe('none');
    expect(document.getElementById('exerciseArea').style.display).toBe('block');
    expect(document.getElementById('exerciseQuestionContainer').innerHTML).toContain(
      'She ___ every day.',
    );
    expect(document.querySelectorAll('.option-btn')).toHaveLength(4);
    expect(document.getElementById('exProgressBar').style.width).toBe('10%');
  });

  it('resolves missing start parameters from the active session configuration', () => {
    mockEngine.sessionConfig = {
      mode: 'fill',
      tenseFilter: ['past_simple'],
      difficulty: 'advanced',
      count: 7,
      lessonId: 'lesson-1',
      isRevision: true,
    };
    mockEngine.getCurrent.mockReturnValue({
      type: 'fill',
      tenseId: 'past_simple',
      sentence: 'I ___ yesterday.',
      answer: 'went',
    });

    startExercise();

    expect(mockEngine.start).toHaveBeenCalledWith(
      'fill',
      ['past_simple'],
      'advanced',
      7,
      'lesson-1',
      true,
    );
    expect(mockEngine.currentLessonId).toBe('lesson-1');
    expect(mockEngine.isRevision).toBe(true);
  });

  it('uses mixed-mode and fallback defaults when no prior session exists', () => {
    mockEngine.currentMode = null;
    mockEngine.currentTenseFilter = undefined;
    mockEngine.currentDifficulty = null;
    mockEngine.currentCount = 0;
    mockEngine.getCurrent.mockReturnValue(null);

    startExercise();

    expect(mockEngine.start).toHaveBeenCalledWith('mixed', [], 'intermediate', 10, null, false);
  });

  it.each([
    ['fill', '<script>alert(1)</script>\nI went yesterday.', 'input', 'Compléter'],
    ['translation', 'Translate this sentence.', 'input', 'Traduire'],
    ['transform', 'Rewrite this sentence.', 'textarea', 'Transformer'],
    ['correction', 'Correct this sentence.', 'textarea', 'Corriger'],
    ['other', 'What does this mean?', 'textarea', 'Traduire'],
  ])('renders the %s question shape and escapes user-visible content', (type, sentence, control, label) => {
    const q = {
      type,
      tenseId: 'past_simple',
      sentence,
      answer: 'answer',
      explanation: 'Explanation',
    };
    mockEngine.questions = [q];
    mockEngine.getCurrent.mockReturnValue(q);

    renderExerciseQuestion(q);

    expect(document.querySelector(control)).not.toBeNull();
    expect(document.querySelectorAll('.option-btn')).toHaveLength(0);
    expect(document.getElementById('exerciseQuestionContainer').innerHTML).not.toContain(
      '<script>',
    );
    expect(document.getElementById('exerciseQuestionContainer').textContent).toContain(
      sentence.replace(/\n/g, ' '),
    );
    expect(document.getElementById('exerciseQuestionContainer').textContent).toContain(label);
    vi.advanceTimersByTime(100);
    expect(document.activeElement?.id).toBe('exerciseInput');
  });

  it('renders QCM options and assigns stable keyboard-facing letters', () => {
    const q = {
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'They ___ here.',
      options: ['live', 'lives', 'living', 'lived'],
      correct: 0,
      explanation: 'Explanation',
    };

    renderExerciseQuestion(q);

    const buttons = document.querySelectorAll('.option-btn');
    expect(buttons).toHaveLength(4);
    expect([...buttons].map((button) => button.querySelector('.option-letter').textContent)).toEqual([
      'A',
      'B',
      'C',
      'D',
    ]);
    expect([...buttons].map((button) => button.dataset.action)).toEqual(
      Array(4).fill('select-option'),
    );
  });

  it('handles option selection before answering and ignores later changes', () => {
    renderExerciseQuestion({
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'They ___ here.',
      options: ['live', 'lives'],
      correct: 0,
      explanation: 'Explanation',
    });

    const buttons = document.querySelectorAll('.option-btn');
    selectOption(buttons[1], 1);
    expect(buttons[1].classList.contains('selected')).toBe(true);
    selectOption(buttons[0], 0);
    expect(buttons[1].classList.contains('selected')).toBe(false);
    expect(buttons[0].classList.contains('selected')).toBe(true);

    mockEngine.answered = true;
    selectOption(buttons[1], 1);
    expect(buttons[0].classList.contains('selected')).toBe(true);
    expect(buttons[1].classList.contains('selected')).toBe(false);
  });

  it('does not validate a QCM question without a selected option', () => {
    mockEngine.getCurrent.mockReturnValue({
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'He ___ tennis.',
      options: ['plays', 'play'],
      correct: 0,
      explanation: 'Explanation',
    });
    startExercise('qcm');

    validateExercise();

    expect(mockEngine.answered).toBe(false);
    expect(mockEngine.score).toBe(0);
    expect(State.recordAnswer).not.toHaveBeenCalled();
  });

  it('validates a correct QCM answer and updates score/feedback', () => {
    const addXPSpy = vi.spyOn(State, 'addXP').mockImplementation(() => {});
    const recordAnswerSpy = vi.spyOn(State, 'recordAnswer').mockImplementation(() => {});

    mockEngine.getCurrent.mockReturnValue({
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'He ___ tennis.',
      options: ['play', 'plays', 'playing', 'played'],
      correct: 1,
      explanation: '3rd person singular takes -s',
    });

    startExercise('qcm');
    const buttons = document.querySelectorAll('.option-btn');
    selectOption(buttons[1], 1);

    validateExercise();

    expect(mockEngine.score).toBe(1);
    expect(mockEngine.answered).toBe(true);
    expect(addXPSpy).toHaveBeenCalledWith(10);
    expect(recordAnswerSpy).toHaveBeenCalledWith('present_simple', true);
    expect(buttons[1].classList.contains('correct')).toBe(true);
    expect(document.getElementById('exerciseFeedback').style.display).toBe('block');
    expect(document.getElementById('exerciseFeedback').innerHTML).toContain('Correct');
  });

  it('marks a wrong QCM answer and records it without awarding XP', () => {
    const addXPSpy = vi.spyOn(State, 'addXP').mockImplementation(() => {});
    const recordAnswerSpy = vi.spyOn(State, 'recordAnswer').mockImplementation(() => {});
    const q = {
      type: 'qcm',
      tenseId: 'past_simple',
      sentence: 'She ___ it.',
      options: ['see', 'saw'],
      correct: 1,
      explanation: 'Past of see is saw.',
    };
    mockEngine.getCurrent.mockReturnValue(q);
    startExercise('qcm');
    const buttons = document.querySelectorAll('.option-btn');
    selectOption(buttons[0], 0);

    validateExercise();

    expect(buttons[1].classList.contains('correct')).toBe(true);
    expect(buttons[0].classList.contains('incorrect')).toBe(true);
    expect(mockEngine.score).toBe(0);
    expect(addXPSpy).not.toHaveBeenCalled();
    expect(recordAnswerSpy).toHaveBeenCalledWith('past_simple', false);
  });

  it('validates non-QCM answers through answerMatches and trims whitespace', () => {
    const recordAnswerSpy = vi.spyOn(State, 'recordAnswer').mockImplementation(() => {});
    mockEngine.getCurrent.mockReturnValue({
      type: 'fill',
      tenseId: 'past_simple',
      sentence: 'She ___ (see) him yesterday.',
      answer: 'saw',
      explanation: 'Past of see is saw',
    });

    startExercise('fill');
    const input = document.getElementById('exerciseInput');
    input.value = '  SaW  ';
    validateExercise();

    expect(mockEngine.score).toBe(1);
    expect(mockEngine.answered).toBe(true);
    expect(recordAnswerSpy).toHaveBeenCalledWith('past_simple', true);
  });

  it('does not mutate state for an empty text answer or a duplicate validation', () => {
    const recordAnswerSpy = vi.spyOn(State, 'recordAnswer').mockImplementation(() => {});
    mockEngine.getCurrent.mockReturnValue({
      type: 'fill',
      tenseId: 'present_simple',
      sentence: 'She ___ here.',
      answer: 'works',
      explanation: 'Explanation',
    });
    startExercise('fill');
    document.getElementById('exerciseInput').value = '   ';

    validateExercise();
    expect(mockEngine.answered).toBe(false);
    expect(recordAnswerSpy).not.toHaveBeenCalled();

    document.getElementById('exerciseInput').value = 'works';
    validateExercise();
    validateExercise();
    expect(recordAnswerSpy).toHaveBeenCalledTimes(1);
  });

  it('skips an unanswered question and reveals the expected answer', () => {
    const recordAnswerSpy = vi.spyOn(State, 'recordAnswer').mockImplementation(() => {});
    const q = {
      type: 'fill',
      tenseId: 'future_will',
      sentence: 'They ___ arrive.',
      answer: 'will',
      explanation: 'Use will.',
    };
    mockEngine.getCurrent.mockReturnValue(q);
    startExercise('fill');

    skipExercise();

    expect(mockEngine.answered).toBe(true);
    expect(recordAnswerSpy).toHaveBeenCalledWith('future_will', false);
    expect(document.getElementById('exerciseFeedback').textContent).toContain('Question passée');
    expect(document.getElementById('exerciseNextBtn').style.display).toBe('inline-flex');

    const calls = recordAnswerSpy.mock.calls.length;
    skipExercise();
    expect(recordAnswerSpy).toHaveBeenCalledTimes(calls);
  });

  it('updates progress from the engine without introducing rounding drift', () => {
    mockEngine.getProgress.mockReturnValue({ current: 3, total: 8, score: 1 });

    updateExerciseProgress();

    expect(document.getElementById('exProgressBar').style.width).toBe('37.5%');
  });

  it('advances to the next question and resets answer controls when more work remains', () => {
    mockEngine.next.mockReturnValue(true);
    mockEngine.currentIndex = 1;
    const q = {
      type: 'qcm',
      tenseId: 'past_simple',
      sentence: 'He ___.',
      options: ['ran', 'run'],
      correct: 0,
      explanation: 'Explanation',
    };
    mockEngine.getCurrent.mockReturnValue(q);
    mockEngine.questions = [q, q];
    mockEngine.getProgress.mockReturnValue({ current: 2, total: 2, score: 1 });
    mockEngine.answered = true;

    nextExercise();

    expect(mockEngine.next).toHaveBeenCalledOnce();
    expect(document.getElementById('exerciseFeedback').style.display).toBe('none');
    expect(document.getElementById('exValidateBtn').style.display).toBe('inline-flex');
    expect(document.getElementById('exNextBtn').style.display).toBe('none');
    expect(document.getElementById('exSkipBtn').style.display).toBe('inline-flex');
    expect(document.getElementById('exCurrent').textContent).toBe('2');
  });

  it.each([
    [90, '🎉', 'Excellent !', true],
    [60, '👍', 'Bien joué !', false],
    [40, '💪', 'Continuez vos efforts !', false],
  ])('renders the correct finish state at %s%%', (percentage, emoji, heading, confettiExpected) => {
    const total = 10;
    const score = percentage / 10;
    const completeLessonSpy = vi.spyOn(State, 'completeLesson').mockImplementation(() => {});
    mockEngine.getProgress.mockReturnValue({ current: total, total, score });
    mockEngine.currentLessonId = percentage === 90 ? 'lesson-1' : null;

    finishExercise();

    const html = document.getElementById('exerciseQuestionContainer').innerHTML;
    expect(html).toContain(emoji);
    expect(html).toContain(heading);
    expect(html).toContain(`${score} / ${total}`);
    expect(document.getElementById('exValidateBtn').style.display).toBe('none');
    expect(document.getElementById('exNextBtn').style.display).toBe('none');
    expect(document.getElementById('exSkipBtn').style.display).toBe('none');
    expect(launchConfetti).toHaveBeenCalledTimes(confettiExpected ? 1 : 0);
    expect(completeLessonSpy).toHaveBeenCalledTimes(confettiExpected ? 1 : 0);
  });

  it('completes the active lesson on successful finishExercise (Issue #111)', () => {
    const completeLessonSpy = vi.spyOn(State, 'completeLesson').mockImplementation(() => {});
    mockEngine.getProgress.mockReturnValue({ current: 10, total: 10, score: 9 });
    mockEngine.currentLessonId = 'l_pres_simple';

    finishExercise();

    expect(launchConfetti).toHaveBeenCalled();
    expect(completeLessonSpy).toHaveBeenCalledWith('l_pres_simple');
  });

  it('does NOT complete any lesson on free training finishExercise even with 100% score (Issue #111)', () => {
    const completeLessonSpy = vi.spyOn(State, 'completeLesson').mockImplementation(() => {});
    mockEngine.getProgress.mockReturnValue({ current: 10, total: 10, score: 10 });
    mockEngine.currentLessonId = null;

    finishExercise();

    expect(launchConfetti).toHaveBeenCalled();
    expect(completeLessonSpy).not.toHaveBeenCalled();
  });

  it('guards startExerciseForLesson against nonexistent lesson IDs (Issue P-04)', () => {
    mockEngine.currentLessonId = null;
    mockEngine.start.mockClear();

    startExerciseForLesson('nonexistent_lesson_xyz');
    expect(navigateTo).not.toHaveBeenCalledWith('exercises');
    expect(mockEngine.start).not.toHaveBeenCalled();
    expect(mockEngine.currentLessonId).toBeNull();
  });

  it('starts a lesson session with its declared exercise count (Issue #111)', () => {
    startExerciseForLesson('l_past_simple');

    expect(navigateTo).toHaveBeenCalledWith('exercises');
    vi.advanceTimersByTime(100);

    expect(mockEngine.start).toHaveBeenCalledWith(
      'mixed',
      ['past_simple'],
      'intermediate',
      20,
      'l_past_simple',
      false,
    );
  });

  it('starts a tense-focused exercise session with the expected defaults', () => {
    startExerciseForTense('future_will');

    expect(navigateTo).toHaveBeenCalledWith('exercises');
    vi.advanceTimersByTime(100);

    expect(mockEngine.start).toHaveBeenCalledWith(
      'mixed',
      ['future_will'],
      'intermediate',
      10,
      null,
      false,
    );
  });

  it('restarts exercise using immutable sessionConfig when available (Issue #98)', () => {
    mockEngine.sessionConfig = {
      mode: 'qcm',
      tenseFilter: ['past_continuous'],
      difficulty: 'advanced',
      count: 15,
      lessonId: 'l_past_cont',
      isRevision: true,
    };

    restartExercise();

    expect(mockEngine.start).toHaveBeenCalledWith(
      'qcm',
      ['past_continuous'],
      'advanced',
      15,
      'l_past_cont',
      true,
    );
  });

  it('restarts exercise using engine fallback properties when sessionConfig is null', () => {
    mockEngine.sessionConfig = null;
    mockEngine.currentMode = 'fill';
    mockEngine.currentTenseFilter = ['future_will'];
    mockEngine.currentDifficulty = 'beginner';
    mockEngine.currentCount = 8;
    mockEngine.currentLessonId = null;
    mockEngine.isRevision = false;

    restartExercise();

    expect(mockEngine.start).toHaveBeenCalledWith(
      'fill',
      ['future_will'],
      'beginner',
      8,
      null,
      false,
    );
  });

  it('exits an exercise by returning to the mode selector', () => {
    document.getElementById('exerciseModeSelector').style.display = 'none';
    document.getElementById('exerciseArea').style.display = 'block';

    exitExercise();

    expect(document.getElementById('exerciseModeSelector').style.display).toBe('block');
    expect(document.getElementById('exerciseArea').style.display).toBe('none');
  });
});
