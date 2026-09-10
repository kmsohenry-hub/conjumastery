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
  finishExercise,
  renderExerciseQuestion,
  resetExerciseUI,
  restartExercise,
  selectOption,
  startExercise,
  startExerciseForLesson,
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

  it('renders non-qcm question types without options grid', () => {
    renderExerciseQuestion({
      type: 'fill',
      tenseId: 'past_simple',
      sentence: 'I ___ (go) yesterday.',
      answer: 'went',
      explanation: 'Past of go is went',
    });

    expect(document.getElementById('exerciseInput')).not.toBeNull();
    expect(document.querySelectorAll('.option-btn')).toHaveLength(0);
  });

  it('handles option selection before answering', () => {
    renderExerciseQuestion({
      type: 'qcm',
      tenseId: 'present_simple',
      sentence: 'They ___ here.',
      options: ['live', 'lives', 'living', 'lived'],
      correct: 0,
      explanation: 'Subject they uses base form',
    });

    const buttons = document.querySelectorAll('.option-btn');
    selectOption(buttons[1], 1);
    expect(buttons[1].classList.contains('selected')).toBe(true);

    selectOption(buttons[0], 0);
    expect(buttons[1].classList.contains('selected')).toBe(false);
    expect(buttons[0].classList.contains('selected')).toBe(true);
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

  it('validates a text input answer case-insensitively and trims whitespace', () => {
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
      10,
      'l_past_simple',
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
});
