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
  renderTestQuestion,
  finishTest,
} from '../../../../src/ui/pages/test.js';
import { showToast } from '../../../../src/ui/utils/toast.js';

beforeEach(() => {
  vi.clearAllMocks();
  mockEngine.currentIndex = 0;
  mockEngine.score = 0;
  mockEngine.answered = false;
  mockEngine.questions = [
    {
      tenseId: 'present_simple',
      type: 'qcm',
      sentence: 'I ___ to school.',
      options: ['go', 'goes', 'went', 'going'],
      correct: 0,
      explanation: 'Present simple with I.',
    },
  ];
  mockEngine.next.mockReset();
  mockEngine.next.mockReturnValue(false);
  mockEngine.getProgress.mockImplementation(function () {
    return { current: this.currentIndex + 1, total: this.questions.length, score: this.score };
  });
  vi.useFakeTimers();
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

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
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
    vi.advanceTimersByTime(61_000);
    expect(document.getElementById('testTimer').textContent).toBe('01:01');
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

  it('ignores option selection after the question is answered', () => {
    renderTestSetup();
    startTest();
    const buttons = document.querySelectorAll('.option-btn');
    mockEngine.answered = true;

    selectTestOption(buttons[0], 0);

    expect(buttons[0].classList.contains('selected')).toBe(false);
  });

  it('does not validate a QCM without a selected option', () => {
    renderTestSetup();
    startTest();

    validateTestAnswer();

    expect(mockEngine.answered).toBe(false);
    expect(mockState.addXP).not.toHaveBeenCalled();
  });

  it('marks an incorrect QCM answer and records the failure', () => {
    renderTestSetup();
    startTest();
    const buttons = document.querySelectorAll('.option-btn');
    selectTestOption(buttons[1], 1);

    validateTestAnswer();

    expect(buttons[0].classList.contains('correct')).toBe(true);
    expect(buttons[1].classList.contains('incorrect')).toBe(true);
    expect(mockEngine.answered).toBe(true);
    expect(mockState.recordAnswer).toHaveBeenCalledWith('present_simple', false);
    expect(mockState.addXP).not.toHaveBeenCalled();
  });

  it('renders a text-answer question and focuses its input', () => {
    mockEngine.questions = [
      {
        tenseId: 'present_simple',
        type: 'fill',
        sentence: 'She ___ to school.',
        answer: 'goes',
        explanation: 'Third person singular.',
      },
    ];

    renderTestQuestion();
    expect(document.getElementById('testInput')).not.toBeNull();
    vi.advanceTimersByTime(100);
    expect(document.activeElement?.id).toBe('testInput');
  });

  it('returns early for an empty text answer', () => {
    mockEngine.questions = [
      {
        tenseId: 'present_simple',
        type: 'fill',
        sentence: 'She ___ to school.',
        answer: 'goes',
        explanation: 'Third person singular.',
      },
    ];
    renderTestQuestion();

    validateTestAnswer();

    expect(mockEngine.answered).toBe(false);
    expect(mockState.recordAnswer).not.toHaveBeenCalled();
  });

  it('validates a correct text answer and awards XP', () => {
    mockEngine.questions = [
      {
        tenseId: 'present_simple',
        type: 'fill',
        sentence: 'She ___ to school.',
        answer: 'goes',
        explanation: 'Third person singular.',
      },
    ];
    renderTestQuestion();
    document.getElementById('testInput').value = 'goes';

    validateTestAnswer();

    expect(mockEngine.score).toBe(1);
    expect(mockState.addXP).toHaveBeenCalledWith(15);
    expect(mockState.recordAnswer).toHaveBeenCalledWith('present_simple', true);
    expect(document.getElementById('testFeedback').innerHTML).toContain('✅');
  });

  it('does not validate the same answer twice', () => {
    renderTestSetup();
    startTest();
    selectTestOption(document.querySelector('.option-btn'), 0);
    validateTestAnswer();
    mockState.addXP.mockClear();
    mockState.recordAnswer.mockClear();

    validateTestAnswer();

    expect(mockState.addXP).not.toHaveBeenCalled();
    expect(mockState.recordAnswer).not.toHaveBeenCalled();
  });

  it('moves to the next question when more questions remain', () => {
    mockEngine.questions = [
      {
        tenseId: 'present_simple',
        type: 'qcm',
        sentence: 'I ___ to school.',
        options: ['go', 'goes'],
        correct: 0,
        explanation: 'Present simple with I.',
      },
      {
        tenseId: 'past_simple',
        type: 'qcm',
        sentence: 'I ___ yesterday.',
        options: ['go', 'went'],
        correct: 1,
        explanation: 'Past simple.',
      },
    ];
    mockEngine.next.mockImplementation(function () {
      this.currentIndex = 1;
      this.answered = false;
      return true;
    });
    renderTestQuestion();

    nextTestQuestion();

    expect(document.getElementById('testQuestionContainer').innerHTML).toContain(
      'I ___ yesterday.',
    );
    expect(document.getElementById('testCurrent').textContent).toBe('2');
  });

  it('renders a low-score grade at the end of a test', () => {
    mockEngine.questions = [{ ...mockEngine.questions[0], answeredCorrectly: false }];
    mockEngine.score = 0;
    mockEngine.getProgress.mockReturnValue({ current: 1, total: 1, score: 0 });

    finishTest();

    expect(document.getElementById('testResults').innerHTML).toContain('Continuez vos efforts !');
  });

  it.each([
    [50, 'Pas mal !'],
    [70, 'Très bien !'],
    [90, 'Exceptionnel !'],
  ])('renders the correct grade for %i%%', (scorePercent, label) => {
    const total = 100;
    const score = scorePercent;
    mockEngine.questions = Array.from({ length: total }, (_, i) => ({
      ...mockEngine.questions[0],
      answeredCorrectly: i < score,
    }));
    mockEngine.score = score;
    mockEngine.getProgress.mockReturnValue({ current: total, total, score });

    finishTest();

    expect(document.getElementById('testResults').innerHTML).toContain(label);
  });

  it('escapes question details in the final results', () => {
    mockEngine.questions = [
      {
        tenseId: 'present_simple',
        type: 'qcm',
        sentence: '<img src=x onerror=alert(1)>',
        options: ['go', 'goes'],
        correct: 0,
        explanation: 'Safe.',
        answeredCorrectly: false,
      },
    ];
    mockEngine.getProgress.mockReturnValue({ current: 1, total: 1, score: 0 });

    finishTest();

    const html = document.getElementById('testResults').innerHTML;
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img');
  });
});
