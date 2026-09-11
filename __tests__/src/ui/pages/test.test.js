import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { engine, state, answerMatches, showToast, appData } = vi.hoisted(() => ({
  engine: {
    start: vi.fn(),
    getCurrent: vi.fn(),
    next: vi.fn(() => false),
    questions: [],
    currentIndex: 0,
    score: 0,
    answered: false,
  },
  state: { addXP: vi.fn(), recordAnswer: vi.fn() },
  answerMatches: vi.fn(() => false),
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

vi.mock('../../../../src/core/exercises/ExerciseEngine.js', () => ({ default: engine }));
vi.mock('../../../../src/core/state/State.js', () => ({ State: state }));
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

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = `
    <div id="testSetup"></div>
    <div id="testArea" style="display:none">
      <span id="testCurrent"></span><span id="testTotal"></span><span id="testScore"></span>
      <div id="testProgressBar"></div><div id="testQuestionContainer"></div>
      <div id="testFeedback" style="display:none"></div>
      <button id="testValidateBtn"></button><button id="testNextBtn"></button>
      <span id="testTimer">00:00</span>
    </div>
    <div id="testResults" style="display:none"></div>
    <div id="testTenseCheckboxes"></div>
    <select id="testDifficulty"><option value="intermediate" selected>Intermédiaire</option></select>
  `;
  vi.clearAllMocks();
  engine.questions = [];
  engine.currentIndex = 0;
  engine.score = 0;
  engine.answered = false;
  engine.next.mockReturnValue(false);
  engine.getCurrent.mockReturnValue(null);
  answerMatches.mockReturnValue(false);
});

afterEach(() => {
  cancelTest();
  vi.useRealTimers();
});

describe('test mode', () => {
  it('renders every configured tense as selected by default', () => {
    renderTestSetup();
    const inputs = [...document.querySelectorAll('#testTenseCheckboxes input[type="checkbox"]')];
    expect(inputs.map((i) => i.value)).toEqual(['present_simple', 'past_simple', 'future_will']);
    expect(inputs.every((i) => i.checked)).toBe(true);
  });

  it('guards against starting without a tense', () => {
    renderTestSetup();
    document.querySelectorAll('#testTenseCheckboxes input').forEach((i) => (i.checked = false));
    startTest();
    expect(showToast).toHaveBeenCalledWith('Sélectionnez au moins un temps verbal', 'error');
    expect(engine.start).not.toHaveBeenCalled();
  });

  it('starts with selected tenses and selected difficulty', () => {
    renderTestSetup();
    document.querySelectorAll('#testTenseCheckboxes input')[1].checked = false;
    engine.getCurrent.mockReturnValue({
      type: 'qcm',
      tenseId: 'present_simple',
      options: ['a'],
      correct: 0,
      sentence: 'She ___.',
    });
    startTest();
    expect(engine.start).toHaveBeenCalledWith(
      'mixed',
      ['present_simple', 'future_will'],
      'intermediate',
      20,
    );
    expect(document.getElementById('testSetup').style.display).toBe('none');
    expect(document.getElementById('testArea').style.display).toBe('block');
  });

  it('updates and stops the timer on cancel', () => {
    renderTestSetup();
    engine.getCurrent.mockReturnValue({
      type: 'qcm',
      tenseId: 'present_simple',
      options: ['a'],
      correct: 0,
      sentence: 'She ___.',
    });
    startTest();
    vi.advanceTimersByTime(65_000);
    expect(document.getElementById('testTimer').textContent).toBe('01:05');
    cancelTest();
    vi.advanceTimersByTime(2_000);
    expect(document.getElementById('testTimer').textContent).toBe('00:00');
  });

  it('renders text questions and preserves newline structure while preventing script elements', () => {
    const q = {
      type: 'fill',
      tenseId: 'present_simple',
      sentence: '<script>alert(1)</script>\nNext line',
      answer: 'works',
    };
    engine.questions = [q];
    engine.getCurrent.mockReturnValue(q);
    renderTestQuestion();
    const container = document.getElementById('testQuestionContainer');
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('.exercise-question').innerHTML).toContain('<br>');
    expect(container.textContent).toContain('<script>alert(1)</script>');
    expect(container.querySelector('#testInput')).not.toBeNull();
    vi.advanceTimersByTime(100);
    expect(document.activeElement?.id).toBe('testInput');
  });

  it.each([
    ['translation', 'testInput'],
    ['transform', 'testInput'],
  ])('renders %s questions with the expected text input', (type, id) => {
    const q = { type, tenseId: 'past_simple', sentence: 'Sentence', answer: 'answer' };
    engine.questions = [q];
    engine.getCurrent.mockReturnValue(q);
    renderTestQuestion();
    expect(document.getElementById(id)).not.toBeNull();
    expect(document.querySelectorAll('.option-btn')).toHaveLength(0);
  });

  it('renders QCM options and replaces a previous selection', () => {
    const q = {
      type: 'qcm',
      tenseId: 'past_simple',
      sentence: 'They ___.',
      options: ['left', 'leave'],
      correct: 0,
    };
    engine.questions = [q];
    engine.getCurrent.mockReturnValue(q);
    renderTestQuestion();
    const buttons = [...document.querySelectorAll('.option-btn')];
    expect(buttons.map((b) => b.querySelector('.option-letter').textContent)).toEqual(['A', 'B']);
    selectOption(buttons[0], 0);
    selectOption(buttons[1], 1);
    expect(buttons[0].classList.contains('selected')).toBe(false);
    expect(buttons[1].classList.contains('selected')).toBe(true);
  });

  it('blocks QCM validation until an option is selected', () => {
    const q = {
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'He ___.',
      options: ['runs', 'run'],
      correct: 0,
    };
    engine.questions = [q];
    engine.getCurrent.mockReturnValue(q);
    renderTestQuestion();
    nextTestQuestion();
    engine.getCurrent.mockReturnValue(q);
    renderTestQuestion();
    validateTestAnswer();
    expect(engine.answered).toBe(false);
    expect(state.recordAnswer).not.toHaveBeenCalled();
  });

  it('records a correct QCM answer and awards XP', () => {
    const q = {
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'She ___.',
      options: ['works', 'work'],
      correct: 0,
      explanation: '3rd person singular',
    };
    engine.questions = [q];
    engine.getCurrent.mockReturnValue(q);
    renderTestQuestion();
    selectOption(document.querySelectorAll('.option-btn')[0], 0);
    validateTestAnswer();
    expect(engine.score).toBe(1);
    expect(state.addXP).toHaveBeenCalledWith(15);
    expect(state.recordAnswer).toHaveBeenCalledWith('present_simple', true);
    expect(q.userAnswer).toBe('works');
  });

  it('records a wrong QCM answer without XP', () => {
    const q = {
      type: 'qcm',
      tenseId: 'past_simple',
      sentence: 'She ___.',
      options: ['see', 'saw'],
      correct: 1,
      explanation: 'Past of see',
    };
    engine.questions = [q];
    engine.getCurrent.mockReturnValue(q);
    renderTestQuestion();
    selectOption(document.querySelectorAll('.option-btn')[0], 0);
    validateTestAnswer();
    expect(engine.score).toBe(0);
    expect(state.addXP).not.toHaveBeenCalled();
    expect(state.recordAnswer).toHaveBeenCalledWith('past_simple', false);
    expect(document.querySelectorAll('.option-btn')[0].classList.contains('incorrect')).toBe(true);
  });

  it('validates free text through answerMatches and trims whitespace', () => {
    const q = {
      type: 'fill',
      tenseId: 'future_will',
      sentence: 'They ___.',
      answer: 'will',
      explanation: 'Use will',
    };
    engine.questions = [q];
    engine.getCurrent.mockReturnValue(q);
    answerMatches.mockReturnValue(true);
    renderTestQuestion();
    document.getElementById('testInput').value = '  WILL  ';
    validateTestAnswer();
    expect(answerMatches).toHaveBeenCalledWith('WILL', 'will');
    expect(engine.score).toBe(1);
    expect(q.userAnswer).toBe('WILL');
  });

  it('ignores blank and duplicate validation attempts', () => {
    const q = { type: 'fill', tenseId: 'present_simple', sentence: 'She ___.', answer: 'works' };
    engine.questions = [q];
    engine.getCurrent.mockReturnValue(q);
    answerMatches.mockReturnValue(true);
    renderTestQuestion();
    const input = document.getElementById('testInput');
    input.value = '   ';
    validateTestAnswer();
    expect(engine.answered).toBe(false);
    input.value = 'works';
    validateTestAnswer();
    validateTestAnswer();
    expect(state.recordAnswer).toHaveBeenCalledTimes(1);
  });

  it('advances when questions remain and finishes otherwise', () => {
    const q = {
      type: 'qcm',
      tenseId: 'past_simple',
      sentence: 'He ___.',
      options: ['ran', 'run'],
      correct: 0,
    };
    engine.questions = [{ ...q, sentence: 'First' }, q];
    engine.currentIndex = 1;
    engine.getCurrent.mockReturnValue(q);
    engine.next.mockReturnValue(true);
    nextTestQuestion();
    expect(engine.next).toHaveBeenCalledOnce();
    expect(document.getElementById('testCurrent').textContent).toBe('2');
    engine.next.mockReturnValue(false);
    nextTestQuestion();
    expect(document.getElementById('testResults').style.display).toBe('block');
  });

  it.each([
    [90, '🏆', '🌳 Avancé'],
    [60, '🎯', '🌿 Intermédiaire'],
    [20, '📚', '🌱 Débutant'],
  ])('renders the correct recommendation at %s%%', (pct, emoji, level) => {
    engine.questions = Array.from({ length: 10 }, (_, i) => ({
      tenseId: i % 2 ? 'past_simple' : 'present_simple',
      sentence: `Q${i}`,
      answeredCorrectly: i < pct / 10,
    }));
    engine.score = pct / 10;
    finishTest();
    const results = document.getElementById('testResults').textContent;
    expect(results).toContain(emoji);
    expect(results).toContain(level);
    expect(results).toContain(`${engine.score} / 10 (${pct}%)`);
  });
});
