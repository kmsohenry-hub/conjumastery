import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockEngine, mockState } = vi.hoisted(() => ({
  mockEngine: {
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
    ],
    start: vi.fn(),
    getCurrent: vi.fn(function () {
      return this.questions[this.currentIndex];
    }),
    next: vi.fn().mockReturnValue(false),
    getProgress: vi.fn(function () {
      return { current: 1, total: 1, score: this.score };
    }),
  },
  mockState: {
    addXP: vi.fn(),
    recordAnswer: vi.fn(),
  },
}));

vi.mock('../../../../src/core/exercises/ExerciseEngine.js', () => ({
  default: mockEngine,
}));

vi.mock('../../../../src/core/state/State.js', () => ({
  State: mockState,
}));

vi.mock('../../../../src/ui/utils/toast.js', () => ({
  showToast: vi.fn(),
}));

import {
  renderTestSetup,
  startTest,
  validateTestAnswer,
  nextTestQuestion,
  selectOption as selectTestOption,
} from '../../../../src/ui/pages/test.js';
import { showToast } from '../../../../src/ui/utils/toast.js';

beforeEach(() => {
  mockEngine.currentIndex = 0;
  mockEngine.score = 0;
  mockEngine.answered = false;

  document.body.innerHTML = `
    <div id="testSetup" style="display:block"></div>
    <div id="testArea" style="display:none"></div>
    <div id="testResults" style="display:none"></div>
    <div id="testTenseCheckboxes"></div>
    <select id="testDifficulty"><option value="intermediate">Intermédiaire</option></select>
    <div id="testQuestionContainer"></div>
    <div id="testCurrent"></div>
    <div id="testTotal"></div>
    <div id="testScore"></div>
    <div id="testTimer">00:00</div>
    <div id="testProgressBar"></div>
    <div id="testFeedback" style="display:none"></div>
    <div id="testValidateBtn" style="display:none"></div>
    <div id="testNextBtn" style="display:none"></div>
  `;
});

describe('test page', () => {
  it('renders test setup checkboxes', () => {
    renderTestSetup();
    expect(document.getElementById('testTenseCheckboxes').children.length).toBeGreaterThan(0);
  });

  it('shows toast error if no tenses selected', () => {
    renderTestSetup();
    const checkboxes = document.querySelectorAll('#testTenseCheckboxes input');
    checkboxes.forEach((cb) => (cb.checked = false));

    startTest();
    expect(showToast).toHaveBeenCalledWith('Sélectionnez au moins un temps verbal', 'error');
  });

  it('starts test and renders test question', () => {
    renderTestSetup();
    startTest();

    expect(mockEngine.start).toHaveBeenCalled();
    expect(document.getElementById('testArea').style.display).toBe('block');
    expect(document.getElementById('testQuestionContainer').innerHTML).toContain(
      'I ___ to school.',
    );
  });

  it('validates test question and finishes test', () => {
    renderTestSetup();
    startTest();

    const optBtn = document.querySelector('.option-btn');
    selectTestOption(optBtn, 0);

    validateTestAnswer();
    expect(document.getElementById('testFeedback').style.display).toBe('block');

    nextTestQuestion(); // next() returns false -> finishTest()
    expect(document.getElementById('testResults').style.display).toBe('block');
    expect(document.getElementById('testResults').innerHTML).toContain('Détail des réponses');
  });
});
