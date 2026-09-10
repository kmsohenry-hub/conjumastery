import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

const { navigateTo, launchConfetti } = vi.hoisted(() => ({
  navigateTo: vi.fn(),
  launchConfetti: vi.fn(),
}));

const { mockEngine, mockState } = vi.hoisted(() => ({
  mockEngine: {
    currentTenseFilter: null,
    currentMode: null,
    currentDifficulty: null,
    currentCount: 10,
    currentLessonId: null,
    isRevision: false,
    sessionConfig: null,
    currentIndex: 0,
    score: 0,
    answered: false,
    questions: [
      {
        tenseId: 'present_simple',
        type: 'qcm',
        sentence: 'He ___ every day.',
        options: ['works', 'work'],
        correct: 0,
        explanation: 'He works.',
      },
      {
        tenseId: 'present_simple',
        type: 'fill',
        sentence: 'She ___ chocolate.',
        answer: 'likes',
        explanation: 'She likes.',
      },
    ],
    getCurrent: vi.fn(function () {
      return this.questions[this.currentIndex] || null;
    }),
    next: vi.fn(function () {
      this.currentIndex++;
      return this.currentIndex < this.questions.length;
    }),
    getProgress: vi.fn(function () {
      return {
        current: this.currentIndex + 1,
        total: this.questions.length,
        score: this.score,
      };
    }),
    start: vi.fn(function (mode, tenseFilter, difficulty, count = 10, lessonId = null, isRevision = false) {
      this.currentMode = mode;
      this.currentTenseFilter = tenseFilter;
      this.currentDifficulty = difficulty;
      this.currentCount = count;
      this.currentLessonId = lessonId;
      this.isRevision = isRevision;
      this.sessionConfig = Object.freeze({ mode, tenseFilter, difficulty, count, lessonId, isRevision });
      return this.questions;
    }),
  },
  mockState: {
    addXP: vi.fn(),
    recordAnswer: vi.fn(),
    completeLesson: vi.fn(),
    updateSpacedRepetition: vi.fn(),
  },
}));

vi.mock('../../../../src/core/exercises/ExerciseEngine.js', () => ({
  default: mockEngine,
}));

vi.mock('../../../../src/core/state/State.js', () => ({
  State: mockState,
}));

vi.mock('../../../../src/ui/navigation.js', () => ({
  navigateTo,
}));

vi.mock('../../../../src/ui/utils/confetti.js', () => ({
  launchConfetti,
}));

import {
  resetExerciseUI,
  startExercise,
  startExerciseForLesson,
  restartExercise,
  selectOption,
  validateExercise,
  skipExercise,
  nextExercise,
  updateExerciseProgress,
  finishExercise,
  exitExercise,
  startExerciseForTense,
  renderExerciseQuestion,
} from '../../../../src/ui/pages/exercises.js';

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
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
  document.body.innerHTML = `
    <div id="exerciseModeSelector"></div>
    <div id="exerciseArea" style="display:none"></div>
    <div id="exerciseQuestionContainer"></div>
    <div id="exerciseFeedback" style="display:none"></div>
    <button id="exValidateBtn"></button>
    <button id="exNextBtn"></button>
    <button id="exSkipBtn"></button>
    <div id="exProgressBar" style="width:0%"></div>
    <span id="exCurrent"></span>
    <span id="exTotal"></span>
  `;
});

afterEach(() => vi.useRealTimers());

describe('exercises page', () => {
  it('resets exercise UI', () => {
    resetExerciseUI();
    expect(document.getElementById('exerciseModeSelector').style.display).toBe('block');
    expect(document.getElementById('exerciseArea').style.display).toBe('none');
  });

  it('starts an exercise session', () => {
    startExercise('mixed');
    expect(document.getElementById('exerciseModeSelector').style.display).toBe('none');
    expect(document.getElementById('exerciseArea').style.display).toBe('block');
    expect(document.getElementById('exerciseQuestionContainer').innerHTML).toContain('exercise-card');
  });

  it('advances through questions', () => {
    startExercise('mixed');
    nextExercise();
    expect(mockEngine.next).toHaveBeenCalledTimes(1);
    expect(document.getElementById('exCurrent').textContent).toBe('2');
  });

  it('finishes exercise when questions are exhausted', () => {
    startExercise('mixed');
    nextExercise();
    nextExercise(); // Finishes exercise
    expect(document.getElementById('exerciseQuestionContainer').innerHTML).toContain('Excellent !');
  });

  it('uses defaults when tense filter and difficulty are omitted', () => {
    startExercise('mixed');
    expect(mockEngine.start).toHaveBeenCalledWith('mixed', [], 'intermediate', 10);
    expect(mockEngine.currentTenseFilter).toEqual([]);
  });

  it('uses null tense filter and default difficulty for non-mixed mode', () => {
    startExercise('fill', undefined, '');
    expect(mockEngine.start).toHaveBeenCalledWith('fill', null, 'intermediate', 10);
    expect(mockEngine.currentTenseFilter).toBeNull();
  });

  it('supports explicit null tense filter', () => {
    startExercise('fill', null, 'advanced');
    expect(mockEngine.start).toHaveBeenCalledWith('fill', null, 'advanced', 10);
  });

  it('starts a tense-focused exercise after navigating', () => {
    startExerciseForTense('past_simple');
    expect(navigateTo).toHaveBeenCalledWith('exercises');
    vi.advanceTimersByTime(100);
    expect(mockEngine.start).toHaveBeenCalledWith('mixed', ['past_simple'], 'intermediate', 10, null, false);
  });

  it('restarts the exercise preserving exact mode, filter, difficulty, and count (Issue #98)', () => {
    startExercise('transform', ['past_perfect'], 'hard', 5);
    expect(mockEngine.start).toHaveBeenLastCalledWith('transform', ['past_perfect'], 'hard', 5, null, false);

    restartExercise();
    expect(mockEngine.start).toHaveBeenLastCalledWith('transform', ['past_perfect'], 'hard', 5, null, false);
  });

  it('renders restart button in finishExercise and triggers restartExercise (Issue #98)', () => {
    startExercise('transform', ['past_perfect'], 'hard', 5);
    finishExercise();

    const finishHtml = document.getElementById('exerciseQuestionContainer').innerHTML;
    expect(finishHtml).toContain('Recommencer');
    expect(finishHtml).toContain('restartExercise()');
  });

  it('renders fill, translation, transform and correction inputs', () => {
    const cases = [
      ['fill', 'Votre réponse...', 'input'],
      ['translation', 'Votre réponse...', 'input'],
      ['transform', 'Écrivez la phrase transformée...', 'textarea'],
      ['correction', 'Écrivez la phrase corrigée...', 'textarea'],
    ];
    for (const [type, placeholder, tag] of cases) {
      const q = { ...mockEngine.questions[0], type, sentence: 'Test sentence.' };
      renderExerciseQuestion(q);
      const input = document.getElementById('exerciseInput');
      expect(input?.tagName.toLowerCase()).toBe(tag);
      expect(input?.getAttribute('placeholder')).toBe(placeholder);
      vi.advanceTimersByTime(100);
      expect(document.activeElement?.id).toBe('exerciseInput');
    }
  });

  it('escapes rendered question metadata', () => {
    const q = {
      tenseId: 'unknown',
      type: 'qcm',
      sentence: '<img src=x onerror=alert(1)>',
      options: ['<script>alert(1)</script>'],
      correct: 0,
      explanation: 'Safe.',
    };
    renderExerciseQuestion(q);
    const html = document.getElementById('exerciseQuestionContainer').innerHTML;
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img');
    expect(html).toContain('&lt;script&gt;');
  });

  it('ignores option selection after answering', () => {
    renderExerciseQuestion(mockEngine.questions[0]);
    const btn = document.querySelector('.option-btn');
    mockEngine.answered = true;
    selectOption(btn, 0);
    expect(btn.classList.contains('selected')).toBe(false);
  });

  it('returns early without validating a QCM when no option is selected', () => {
    renderExerciseQuestion(mockEngine.questions[0]);
    validateExercise();
    expect(mockEngine.answered).toBe(false);
    expect(mockState.recordAnswer).not.toHaveBeenCalled();
  });

  it('validates an incorrect QCM answer and marks feedback', () => {
    renderExerciseQuestion(mockEngine.questions[0]);
    const buttons = document.querySelectorAll('.option-btn');
    selectOption(buttons[1], 1);
    validateExercise();
    expect(buttons[0].classList.contains('correct')).toBe(true);
    expect(buttons[1].classList.contains('incorrect')).toBe(true);
    expect(mockState.recordAnswer).toHaveBeenCalledWith('present_simple', false);
    expect(mockState.addXP).not.toHaveBeenCalled();
  });

  it('returns early for an empty text response', () => {
    mockEngine.currentIndex = 1;
    renderExerciseQuestion(mockEngine.questions[1]);
    validateExercise();
    expect(mockEngine.answered).toBe(false);
    expect(mockState.recordAnswer).not.toHaveBeenCalled();
  });

  it('validates a correct text response and awards XP', () => {
    mockEngine.currentIndex = 1;
    renderExerciseQuestion(mockEngine.questions[1]);
    document.getElementById('exerciseInput').value = 'likes';
    validateExercise();
    expect(mockEngine.score).toBe(1);
    expect(mockState.addXP).toHaveBeenCalledWith(10);
    expect(mockState.recordAnswer).toHaveBeenCalledWith('present_simple', true);
  });

  it('does not validate an already answered exercise twice', () => {
    renderExerciseQuestion(mockEngine.questions[0]);
    selectOption(document.querySelector('.option-btn'), 0);
    validateExercise();
    mockState.addXP.mockClear();
    mockState.recordAnswer.mockClear();
    validateExercise();
    expect(mockState.addXP).not.toHaveBeenCalled();
    expect(mockState.recordAnswer).not.toHaveBeenCalled();
  });

  it('ignores skip after answering', () => {
    renderExerciseQuestion(mockEngine.questions[0]);
    mockEngine.answered = true;
    skipExercise();
    expect(mockState.recordAnswer).not.toHaveBeenCalled();
  });

  it('skips the current exercise and shows the expected answer', () => {
    renderExerciseQuestion(mockEngine.questions[0]);
    skipExercise();
    expect(mockEngine.answered).toBe(true);
    expect(mockState.recordAnswer).toHaveBeenCalledWith('present_simple', false);
    expect(document.getElementById('exerciseFeedback').innerHTML).toContain('Question passée');
  });

  it('updates progress from engine progress', () => {
    mockEngine.getProgress.mockReturnValue({ current: 2, total: 4, score: 1 });
    updateExerciseProgress();
    expect(document.getElementById('exProgressBar').style.width).toBe('50%');
  });

  it('finishes with a middle-grade result and no confetti', () => {
    mockEngine.questions = [mockEngine.questions[0], mockEngine.questions[1]];
    mockEngine.score = 1;
    mockEngine.getProgress.mockReturnValue({ current: 2, total: 2, score: 1 });
    finishExercise();
    expect(document.getElementById('exerciseQuestionContainer').innerHTML).toContain('Bien joué !');
    expect(launchConfetti).not.toHaveBeenCalled();
  });

  it('finishes with a high-grade result, launches confetti and completes matching lesson (Issue #111)', () => {
    mockEngine.currentLessonId = 'l_present_simple';
    mockEngine.questions = [mockEngine.questions[0]];
    mockEngine.score = 1;
    mockEngine.getProgress.mockReturnValue({ current: 1, total: 1, score: 1 });
    finishExercise();
    expect(launchConfetti).toHaveBeenCalledTimes(1);
    expect(mockState.completeLesson).toHaveBeenCalledWith('l_present_simple');
    expect(document.getElementById('exerciseQuestionContainer').innerHTML).toContain('Excellent !');
  });

  it('does not complete lessons in free training mode even with 100% score (Issue #111)', () => {
    mockEngine.currentLessonId = null;
    mockEngine.questions = [mockEngine.questions[0]];
    mockEngine.score = 1;
    mockEngine.getProgress.mockReturnValue({ current: 1, total: 1, score: 1 });
    finishExercise();
    expect(mockState.completeLesson).not.toHaveBeenCalled();
  });

  it('starts a lesson session with its declared exercise count (Issue #111)', () => {
    startExerciseForLesson('l_present_simple');
    expect(navigateTo).toHaveBeenCalledWith('exercises');
    vi.advanceTimersByTime(100);
    expect(mockEngine.start).toHaveBeenCalledWith('mixed', ['present_simple'], 'intermediate', 15, 'l_present_simple', false);
  });

  it('finishes with a low-grade result', () => {
    mockEngine.questions = [
      mockEngine.questions[0],
      mockEngine.questions[1],
      mockEngine.questions[0],
    ];
    mockEngine.score = 0;
    mockEngine.getProgress.mockReturnValue({ current: 3, total: 3, score: 0 });
    finishExercise();
    expect(document.getElementById('exerciseQuestionContainer').innerHTML).toContain(
      'Continuez vos efforts !',
    );
  });

  it('does not complete lessons when multiple tenses are filtered', () => {
    mockEngine.currentTenseFilter = ['present_simple', 'past_simple'];
    mockEngine.questions = [mockEngine.questions[0]];
    mockEngine.score = 1;
    mockEngine.getProgress.mockReturnValue({ current: 1, total: 1, score: 1 });
    finishExercise();
    expect(launchConfetti).toHaveBeenCalled();
    expect(mockState.completeLesson).not.toHaveBeenCalled();
  });

  it('exits exercise through the reset UI flow', () => {
    exitExercise();
    expect(document.getElementById('exerciseModeSelector').style.display).toBe('block');
    expect(document.getElementById('exerciseArea').style.display).toBe('none');
  });
});
