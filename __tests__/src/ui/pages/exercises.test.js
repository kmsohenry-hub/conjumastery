import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  navigateTo: vi.fn(),
}));

vi.mock('../../../../src/ui/utils/confetti.js', () => ({
  launchConfetti: vi.fn(),
}));

import {
  resetExerciseUI,
  startExercise,
  selectOption,
  validateExercise,
  skipExercise,
  nextExercise,
} from '../../../../src/ui/pages/exercises.js';

beforeEach(() => {
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
});
