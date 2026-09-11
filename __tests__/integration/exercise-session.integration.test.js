import { beforeEach, describe, expect, it, vi } from 'vitest';

const { navigateTo, launchConfetti } = vi.hoisted(() => ({
  navigateTo: vi.fn(),
  launchConfetti: vi.fn(),
}));

vi.mock('../../src/ui/navigation.js', () => ({ navigateTo }));
vi.mock('../../src/ui/utils/confetti.js', () => ({ launchConfetti }));

import ExerciseEngine from '../../src/core/exercises/ExerciseEngine.js';
import { State } from '../../src/core/state/State.js';
import {
  finishExercise,
  nextExercise,
  selectOption,
  startExercise,
  validateExercise,
} from '../../src/ui/pages/exercises.js';

function renderExerciseDom() {
  document.body.innerHTML = `
    <div id="exerciseModeSelector"></div>
    <div id="exerciseArea">
      <span id="exCurrent"></span>
      <span id="exTotal"></span>
      <div id="exProgressBar"></div>
      <div id="exerciseQuestionContainer"></div>
      <div id="exerciseFeedback"></div>
      <button id="exValidateBtn"></button>
      <button id="exNextBtn"></button>
      <button id="exSkipBtn"></button>
    </div>`;
}

function answerCurrentQuestion() {
  const question = ExerciseEngine.getCurrent();
  expect(question).not.toBeNull();

  if (question.type === 'qcm') {
    const option = document.querySelectorAll('.option-btn')[question.correct];
    selectOption(option, question.correct);
  } else {
    const input = document.getElementById('exerciseInput');
    expect(input).not.toBeNull();
    input.value = question.answer;
  }

  validateExercise();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  renderExerciseDom();
  State.reset();
  ExerciseEngine.questions = [];
  ExerciseEngine.currentIndex = 0;
  ExerciseEngine.score = 0;
  ExerciseEngine.answered = false;
  ExerciseEngine.currentMode = null;
  ExerciseEngine.currentTenseFilter = null;
  ExerciseEngine.currentDifficulty = null;
  ExerciseEngine.currentCount = 10;
  ExerciseEngine.currentLessonId = null;
  ExerciseEngine.isRevision = false;
  ExerciseEngine.sessionConfig = null;
});

describe('exercise session integration', () => {
  it('runs a real session from generation to completion and persists lesson progress', () => {
    startExercise('fill', ['past_simple'], 'intermediate', 2, 'l_past_simple', false);

    expect(ExerciseEngine.questions).toHaveLength(2);
    expect(ExerciseEngine.sessionConfig).toMatchObject({
      mode: 'fill',
      tenseFilter: ['past_simple'],
      difficulty: 'intermediate',
      count: 2,
      lessonId: 'l_past_simple',
      isRevision: false,
    });

    answerCurrentQuestion();
    expect(State.data.tenseStats.past_simple).toMatchObject({ correct: 1, total: 1 });
    expect(State.data.xp).toBe(10);
    expect(State.data.spacedRepetition.past_simple).toBeDefined();

    nextExercise();
    answerCurrentQuestion();
    expect(State.data.tenseStats.past_simple).toMatchObject({ correct: 2, total: 2 });
    expect(State.data.xp).toBe(20);

    nextExercise();

    expect(ExerciseEngine.isComplete()).toBe(true);
    expect(document.getElementById('exerciseQuestionContainer').textContent).toContain('2 / 2');
    expect(State.data.completedLessons).toContain('l_past_simple');
    expect(State.data.xp).toBe(45);
    expect(launchConfetti).toHaveBeenCalledOnce();
  });

  it('propagates an incorrect answer through score, tense stats, error log and spaced repetition', () => {
    startExercise('fill', ['past_simple'], 'intermediate', 1, null, false);
    const question = ExerciseEngine.getCurrent();

    const input = document.getElementById('exerciseInput');
    input.value = `not ${question.answer}`;
    validateExercise();

    expect(ExerciseEngine.score).toBe(0);
    expect(State.data.totalExercises).toBe(1);
    expect(State.data.correctAnswers).toBe(0);
    expect(State.data.incorrectAnswers).toBe(1);
    expect(State.data.tenseStats.past_simple).toEqual({ correct: 0, total: 1 });
    expect(State.data.errorLog).toHaveLength(1);
    expect(State.data.errorLog[0].tenseId).toBe('past_simple');
    expect(State.data.spacedRepetition.past_simple).toMatchObject({
      interval: 1,
      errors: 1,
      ease: 2.3,
    });
    expect(State.data.xp).toBe(0);
  });

  it('uses the revision generator contract and preserves question tense order', () => {
    startExercise('fill', ['present_simple', 'past_simple'], 'intermediate', 4, null, true);

    expect(ExerciseEngine.questions).toHaveLength(4);
    expect(ExerciseEngine.questions.map((q) => q.tenseId)).toEqual([
      'present_simple',
      'past_simple',
      'present_simple',
      'past_simple',
    ]);

    finishExercise();
    expect(document.getElementById('exerciseQuestionContainer').textContent).toContain('0 / 4');
  });
});
