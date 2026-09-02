import { beforeEach, describe, expect, it, vi } from 'vitest';

const { navigateTo, launchConfetti } = vi.hoisted(() => ({
  navigateTo: vi.fn(),
  launchConfetti: vi.fn(),
}));

const { mockEngine, mockState } = vi.hoisted(() => ({
  mockEngine: {
    currentTenseFilter: null,
    currentMode: 'all',
    currentIndex: 0,
    score: 0,
    answered: false,
    questions: [
      {
        tenseId: 'present_simple',
        type: 'qcm',
        sentence: 'I ___ to school.',
        options: ['go', 'goes', 'went', 'going'],
        correct: 0,
        explanation: 'Present simple with I.',
      },
      {
        tenseId: 'present_simple',
        type: 'fill',
        sentence: 'She ___ (like) apples.',
        answer: 'likes',
        explanation: '3rd person singular.',
      },
    ],
    start: vi.fn(),
    getCurrent: vi.fn(function () {
      return this.questions[this.currentIndex];
    }),
    next: vi.fn(function () {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++;
        return true;
      }
      return false;
    }),
    getProgress: vi.fn(function () {
      return { current: this.currentIndex + 1, total: this.questions.length, score: this.score };
    }),
  },
  mockState: {
    addXP: vi.fn(),
    recordAnswer: vi.fn(),
    completeLesson: vi.fn(),
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

  document.body.innerHTML = `
    <div id="exerciseModeSelector" style="display:block"></div>
    <div id="exerciseArea" style="display:none"></div>
    <div id="exerciseQuestionContainer"></div>
    <div id="exCurrent"></div>
    <div id="exTotal"></div>
    <div id="exProgressBar"></div>
    <div id="exerciseFeedback" style="display:none"></div>
    <div id="exValidateBtn" style="display:none"></div>
    <div id="exNextBtn" style="display:none"></div>
    <div id="exSkipBtn" style="display:none"></div>
  `;
});

import { afterEach } from 'vitest';
afterEach(() => vi.useRealTimers());

describe('exercises page', () => {
  it('resets exercise UI', () => {
    resetExerciseUI();
    expect(document.getElementById('exerciseModeSelector').style.display).toBe('block');
    expect(document.getElementById('exerciseArea').style.display).toBe('none');
  });

  it('starts exercise and renders QCM question', () => {
    startExercise('mixed', ['present_simple'], 'intermediate');
    expect(mockEngine.start).toHaveBeenCalled();
    expect(document.getElementById('exerciseArea').style.display).toBe('block');
    expect(document.getElementById('exerciseQuestionContainer').innerHTML).toContain(
      'I ___ to school.',
    );
  });

  it('selects option and validates QCM correctly', () => {
    startExercise('mixed', ['present_simple'], 'intermediate');
    const btn = document.querySelector('.option-btn');
    selectOption(btn, 0);

    validateExercise();
    expect(mockEngine.score).toBe(1);
    expect(mockState.addXP).toHaveBeenCalledWith(10);
    expect(document.getElementById('exerciseFeedback').style.display).toBe('block');
    expect(document.getElementById('exerciseFeedback').innerHTML).toContain('✅ Correct');
  });

  it('validates incorrect fill-in-the-blank question', () => {
    mockEngine.currentIndex = 1;
    startExercise('mixed', ['present_simple'], 'intermediate');

    const input = document.getElementById('exerciseInput');
    input.value = 'wrong answer';

    validateExercise();
    expect(mockEngine.score).toBe(0);
    expect(document.getElementById('exerciseFeedback').innerHTML).toContain('❌ Incorrect');
  });

  it('skips exercise', () => {
    startExercise('mixed', ['present_simple'], 'intermediate');
    skipExercise();
    expect(document.getElementById('exerciseFeedback').innerHTML).toContain('Question passée');
  });

  it('advances to next exercise and finishes session', () => {
    startExercise('mixed', ['present_simple'], 'intermediate');
    nextExercise();
    expect(mockEngine.currentIndex).toBe(1);

    mockEngine.score = 2;
    nextExercise(); // Finishes exercise
    expect(document.getElementById('exerciseQuestionContainer').innerHTML).toContain('Excellent !');
  });

  it('uses defaults when tense filter and difficulty are omitted', () => {
    startExercise('mixed');
    expect(mockEngine.start).toHaveBeenCalledWith('mixed', [], 'intermediate');
    expect(mockEngine.currentTenseFilter).toEqual([]);
  });

  it('uses null tense filter and default difficulty for non-mixed mode', () => {
    startExercise('fill', undefined, '');
    expect(mockEngine.start).toHaveBeenCalledWith('fill', null, 'intermediate');
    expect(mockEngine.currentTenseFilter).toBeNull();
  });

  it('supports explicit null tense filter', () => {
    startExercise('fill', null, 'advanced');
    expect(mockEngine.start).toHaveBeenCalledWith('fill', null, 'advanced');
  });

  it('starts a tense-focused exercise after navigating', () => {
    startExerciseForTense('past_simple');
    expect(navigateTo).toHaveBeenCalledWith('exercises');
    vi.advanceTimersByTime(100);
    expect(mockEngine.start).toHaveBeenCalledWith('mixed', ['past_simple'], 'intermediate');
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

  it('finishes with a high-grade result, launches confetti and completes matching lesson', () => {
    mockEngine.currentTenseFilter = ['present_simple'];
    mockEngine.questions = [mockEngine.questions[0]];
    mockEngine.score = 1;
    mockEngine.getProgress.mockReturnValue({ current: 1, total: 1, score: 1 });
    finishExercise();
    expect(launchConfetti).toHaveBeenCalledTimes(1);
    expect(mockState.completeLesson).toHaveBeenCalled();
    expect(document.getElementById('exerciseQuestionContainer').innerHTML).toContain('Excellent !');
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
