import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockEngine, mockState, answerMatches, showToast, appData } = vi.hoisted(() => ({
  mockEngine: {
    start: vi.fn(),
    getCurrent: vi.fn(),
    next: vi.fn(),
    questions: [],
    currentIndex: 0,
    score: 0,
    answered: false,
  },
  mockState: {
    addXP: vi.fn(),
    recordAnswer: vi.fn(),
  },
  answerMatches: vi.fn(),
  showToast: vi.fn(),
  appData: {
    tenses: [
      { id: 'present_simple', nameFR: 'Présent simple' },
      { id: 'past_simple', nameFR: 'Past simple' },
      { id: 'future_will', nameFR: 'Futur avec will' },
    ],
    tensesById: {
      present_simple: { nameFR: 'Présent simple' },
      past_simple: { nameFR: 'Past simple' },
      future_will: { nameFR: 'Futur avec will' },
    },
  },
}));

vi.mock('../../../../src/core/exercises/ExerciseEngine.js', () => ({ default: mockEngine }));
vi.mock('../../../../src/core/state/State.js', () => ({ State: mockState }));
vi.mock('../../../../src/core/exercises/validation.js', () => ({ answerMatches }));
vi.mock('../../../../src/data/index.js', () => ({ APP_DATA: appData }));
vi.mock('../../../../src/ui/utils/toast.js', () => ({ showToast }));

import {
  cancelTest,
  finishTest,
  nextTestQuestion,
  renderTestQuestion,
  renderTestSetup,
  selectOption,
  startTest,
  validateTestAnswer,
} from '../../../../src/ui/pages/test.js';

function buildDOM() {
  document.body.innerHTML = `
    <div id="testSetup"></div>
    <div id="testArea" style="display:none">
      <span id="testCurrent"></span>
      <span id="testTotal"></span>
      <span id="testScore"></span>
      <div id="testProgressBar"></div>
      <div id="testQuestionContainer"></div>
      <div id="testFeedback" style="display:none"></div>
      <button id="testValidateBtn"></button>
      <button id="testNextBtn"></button>
      <span id="testTimer">00:00</span>
    </div>
    <div id="testResults" style="display:none"></div>
    <div id="testTenseCheckboxes"></div>
    <select id="testDifficulty">
      <option value="beginner">Débutant</option>
      <option value="intermediate" selected>Intermédiaire</option>
      <option value="advanced">Avancé</option>
    </select>
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
  mockEngine.next.mockReturnValue(false);
  mockEngine.getCurrent.mockReturnValue(null);
  answerMatches.mockReturnValue(false);
});

afterEach(() => {
  cancelTest();
  vi.useRealTimers();
});

describe('test mode', () => {
  it('renders every configured tense as a checked checkbox', () => {
    renderTestSetup();

    const inputs = document.querySelectorAll('#testTenseCheckboxes input[type="checkbox"]');
    expect(inputs).toHaveLength(3);
    expect([...inputs].map((input) => input.value)).toEqual([
      'present_simple',
      'past_simple',
      'future_will',
    ]);
    expect([...inputs].every((input) => input.checked)).toBe(true);
  });

  it('refuses to start without a selected tense and shows an error toast', () => {
    renderTestSetup();
    document.querySelectorAll('#testTenseCheckboxes input').forEach((input) => {
      input.checked = false;
    });

    startTest();

    expect(showToast).toHaveBeenCalledWith('Sélectionnez au moins un temps verbal', 'error');
    expect(mockEngine.start).not.toHaveBeenCalled();
    expect(document.getElementById('testArea').style.display).toBe('none');
  });

  it('starts a test with exactly the selected tenses and difficulty', () => {
    renderTestSetup();
    const inputs = document.querySelectorAll('#testTenseCheckboxes input');
    inputs[1].checked = false;

    const question = {
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'She ___ every day.',
      options: ['works', 'work', 'working', 'worked'],
      correct: 0,
      explanation: 'Third person singular takes -s.',
    };
    mockEngine.questions = [question, { ...question, sentence: 'He ___ tennis.' }];
    mockEngine.getCurrent.mockReturnValue(question);

    startTest();

    expect(mockEngine.start).toHaveBeenCalledWith(
      'mixed',
      ['present_simple', 'future_will'],
      'intermediate',
      20,
    );
    expect(document.getElementById('testSetup').style.display).toBe('none');
    expect(document.getElementById('testArea').style.display).toBe('block');
    expect(document.getElementById('testResults').style.display).toBe('none');
    expect(document.getElementById('testTimer').textContent).toBe('00:00');
  });

  it('advances the timer accurately across minutes and resets it on cancel', () => {
    mockEngine.questions = [{ type: 'qcm', tenseId: 'present_simple', options: ['a', 'b'], correct: 0 }];
    mockEngine.getCurrent.mockReturnValue(mockEngine.questions[0]);
    renderTestSetup();
    startTest();

    vi.advanceTimersByTime(65_000);
    expect(document.getElementById('testTimer').textContent).toBe('01:05');

    cancelTest();
    expect(document.getElementById('testTimer').textContent).toBe('00:00');

    vi.advanceTimersByTime(2_000);
    expect(document.getElementById('testTimer').textContent).toBe('00:00');
  });

  it('does nothing when renderTestQuestion has no current question', () => {
    document.getElementById('testQuestionContainer').innerHTML = '<p>existing</p>';

    renderTestQuestion();

    expect(document.getElementById('testQuestionContainer').innerHTML).toBe('<p>existing</p>');
  });

  it.each([
    ['fill', '<script>alert(1)</script>\nGo tomorrow.'],
    ['translation', 'Line one\nLine two'],
    ['transform', 'Rewrite the sentence.'],
  ])('renders %s questions with the correct input control and escapes the sentence', (type, sentence) => {
    mockEngine.currentIndex = 0;
    mockEngine.questions = [{ type, tenseId: 'present_simple', sentence, answer: 'answer' }];
    mockEngine.getCurrent.mockReturnValue(mockEngine.questions[0]);

    renderTestQuestion();

    const input = document.getElementById('testInput');
    expect(input).not.toBeNull();
    expect(document.getElementById('testQuestionContainer').innerHTML).not.toContain('<script>');
    expect(document.getElementById('testQuestionContainer').innerHTML).toContain('&lt;script&gt;');
    expect(document.getElementById('testQuestionContainer').innerHTML).toContain('<br>');
    vi.advanceTimersByTime(100);
    expect(document.activeElement).toBe(input);
  });

  it('renders QCM options and replaces an earlier selection', () => {
    mockEngine.questions = [
      {
        type: 'qcm',
        tenseId: 'past_simple',
        sentence: 'They ___ yesterday.',
        options: ['left', 'leave', 'leaving', 'leaves'],
        correct: 0,
      },
    ];
    mockEngine.getCurrent.mockReturnValue(mockEngine.questions[0]);
    renderTestQuestion();

    const buttons = document.querySelectorAll('.option-btn');
    expect(buttons).toHaveLength(4);
    expect([...buttons].map((button) => button.querySelector('.option-letter').textContent)).toEqual([
      'A',
      'B',
      'C',
      'D',
    ]);

    selectOption(buttons[1], 1);
    selectOption(buttons[3], 3);
    expect(buttons[1].classList.contains('selected')).toBe(false);
    expect(buttons[3].classList.contains('selected')).toBe(true);
  });

  it('ignores option changes after the question has been answered', () => {
    mockEngine.questions = [{ type: 'qcm', tenseId: 'present_simple', options: ['a'], correct: 0 }];
    mockEngine.getCurrent.mockReturnValue(mockEngine.questions[0]);
    renderTestQuestion();
    mockEngine.answered = true;
    const button = document.querySelector('.option-btn');

    selectOption(button, 0);

    expect(button.classList.contains('selected')).toBe(false);
  });

  it('requires a QCM selection before validating', () => {
    const q = {
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'She ___ here.',
      options: ['works', 'work'],
      correct: 0,
      answer: 'works',
      explanation: 'Explanation',
    };
    mockEngine.questions = [q];
    mockEngine.getCurrent.mockReturnValue(q);
    renderTestQuestion();

    validateTestAnswer();

    expect(mockEngine.answered).toBe(false);
    expect(mockEngine.score).toBe(0);
    expect(mockState.recordAnswer).not.toHaveBeenCalled();
  });

  it('validates a correct QCM answer and awards XP', () => {
    const q = {
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'She ___ here.',
      options: ['works', 'work'],
      correct: 0,
      explanation: 'Third person singular takes -s.',
    };
    mockEngine.questions = [q];
    mockEngine.getCurrent.mockReturnValue(q);
    renderTestQuestion();
    selectOption(document.querySelectorAll('.option-btn')[0], 0);

    validateTestAnswer();

    expect(mockEngine.answered).toBe(true);
    expect(mockEngine.score).toBe(1);
    expect(q.answeredCorrectly).toBe(true);
    expect(q.userAnswer).toBe('works');
    expect(mockState.addXP).toHaveBeenCalledWith(15);
    expect(mockState.recordAnswer).toHaveBeenCalledWith('present_simple', true);
    expect(document.getElementById('testFeedback').innerHTML).toContain('Correct');
    expect(document.getElementById('testValidateBtn').style.display).toBe('none');
    expect(document.getElementById('testNextBtn').style.display).toBe('inline-flex');
  });

  it('marks both the selected wrong option and the correct option in QCM mode', () => {
    const q = {
      type: 'qcm',
      tenseId: 'past_simple',
      sentence: 'She ___ it.',
      options: ['see', 'saw'],
      correct: 1,
      explanation: 'Past of see is saw.',
    };
    mockEngine.questions = [q];
    mockEngine.getCurrent.mockReturnValue(q);
    renderTestQuestion();
    const buttons = document.querySelectorAll('.option-btn');
    selectOption(buttons[0], 0);

    validateTestAnswer();

    expect(buttons[1].classList.contains('correct')).toBe(true);
    expect(buttons[0].classList.contains('incorrect')).toBe(true);
    expect(mockEngine.score).toBe(0);
    expect(mockState.addXP).not.toHaveBeenCalled();
    expect(mockState.recordAnswer).toHaveBeenCalledWith('past_simple', false);
    expect(q.answeredCorrectly).toBe(false);
    expect(q.userAnswer).toBe('see');
    expect(document.getElementById('testFeedback').innerHTML).toContain('Réponse :');
  });

  it('rejects blank free-text answers without mutating the engine', () => {
    const q = {
      type: 'fill',
      tenseId: 'future_will',
      sentence: 'They ___ arrive.',
      answer: 'will',
      explanation: 'Use will for this exercise.',
    };
    mockEngine.questions = [q];
    mockEngine.getCurrent.mockReturnValue(q);
    renderTestQuestion();
    document.getElementById('testInput').value = '   ';

    validateTestAnswer();

    expect(mockEngine.answered).toBe(false);
    expect(mockEngine.score).toBe(0);
    expect(mockState.recordAnswer).not.toHaveBeenCalled();
  });

  it('validates free-text answers through answerMatches and trims the user answer', () => {
    const q = {
      type: 'fill',
      tenseId: 'future_will',
      sentence: 'They ___ arrive.',
      answer: 'will',
      explanation: 'Use will for this exercise.',
    };
    mockEngine.questions = [q];
    mockEngine.getCurrent.mockReturnValue(q);
    answerMatches.mockReturnValue(true);
    renderTestQuestion();
    document.getElementById('testInput').value = '  WILL  ';

    validateTestAnswer();

    expect(answerMatches).toHaveBeenCalledWith('WILL', 'will');
    expect(mockEngine.score).toBe(1);
    expect(mockState.addXP).toHaveBeenCalledWith(15);
    expect(q.userAnswer).toBe('WILL');
  });

  it('does not validate twice once the answer is recorded', () => {
    const q = {
      type: 'fill',
      tenseId: 'present_simple',
      sentence: 'She ___ here.',
      answer: 'works',
      explanation: 'Explanation',
    };
    mockEngine.questions = [q];
    mockEngine.getCurrent.mockReturnValue(q);
    answerMatches.mockReturnValue(true);
    renderTestQuestion();
    document.getElementById('testInput').value = 'works';

    validateTestAnswer();
    validateTestAnswer();

    expect(mockState.recordAnswer).toHaveBeenCalledTimes(1);
  });

  it('moves to the next question when the engine reports more work', () => {
    const nextQuestion = {
      type: 'qcm',
      tenseId: 'past_simple',
      sentence: 'He ___.',
      options: ['ran', 'run'],
      correct: 0,
      explanation: 'Explanation',
    };
    mockEngine.next.mockReturnValue(true);
    mockEngine.currentIndex = 1;
    mockEngine.questions = [
      { type: 'qcm', tenseId: 'present_simple', options: ['a'], correct: 0 },
      nextQuestion,
    ];
    mockEngine.getCurrent.mockReturnValue(nextQuestion);

    nextTestQuestion();

    expect(mockEngine.next).toHaveBeenCalledOnce();
    expect(document.getElementById('testCurrent').textContent).toBe('2');
    expect(document.getElementById('testQuestionContainer').innerHTML).toContain('He ___');
  });

  it('finishes the test when no question remains', () => {
    mockEngine.next.mockReturnValue(false);
    mockEngine.questions = [];
    mockEngine.score = 0;

    nextTestQuestion();

    expect(document.getElementById('testResults').style.display).toBe('block');
    expect(document.getElementById('testArea').style.display).toBe('none');
  });

  it.each([
    [90, '🏆', 'Niveau recommandé : 🌳 Avancé'],
    [60, '🎯', 'Niveau recommandé : 🌿 Intermédiaire'],
    [20, '📚', 'Niveau recommandé : 🌱 Débutant'],
  ])('renders the correct result level for %s%%', (pct, emoji, label) => {
    const total = 10;
    mockEngine.questions = Array.from({ length: total }, (_, index) => ({
      tenseId: index % 2 === 0 ? 'present_simple' : 'past_simple',
      sentence: `Question ${index + 1}`,
      answeredCorrectly: index < pct / 10,
      answer: 'answer',
    }));
    mockEngine.score = pct / 10;

    vi.advanceTimersByTime(125_000);
    finishTest();

    const results = document.getElementById('testResults').innerHTML;
    expect(results).toContain(emoji);
    expect(results).toContain(label);
    expect(results).toContain(`${mockEngine.score} / ${total} (${pct}%)`);
    expect(results).toContain('Temps : 2min 5s');
  });
});
