import { APP_DATA } from '../../data/index.js';
import {
  getAllIrregularForms,
  getIrregularForms,
  getRegularPast,
  getPresentSimpleForm,
  getIngForm,
  getConjugation,
} from './conjugation.js';
import { generateQuestions } from './generator.js';
import { State } from '../state/State.js';

const ExerciseEngine = {
  currentExercise: null,
  currentMode: null,
  currentTenseFilter: null,
  currentDifficulty: null,
  currentCount: 10,
  currentLessonId: null,
  isRevision: false,
  sessionConfig: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  answered: false,

  getAllIrregularForms(verb) {
    return getAllIrregularForms(APP_DATA.verbsByBase, verb);
  },

  getIrregularForms(verb) {
    return getIrregularForms(APP_DATA.verbsByBase, verb);
  },

  getRegularPast(verb) {
    return getRegularPast(verb);
  },

  getPresentSimpleForm(verb, is3rdSing, subject = null) {
    return getPresentSimpleForm(verb, is3rdSing, subject);
  },

  getIngForm(verb) {
    return getIngForm(verb);
  },

  getConjugation(verb, tenseId, subject, is3rdSing) {
    return getConjugation(APP_DATA.verbsByBase, verb, tenseId, subject, is3rdSing);
  },

  generateQuestions(
    mode,
    tenseFilter,
    difficulty,
    count = 10,
    isRevision = false,
    lessonId = null,
  ) {
    return generateQuestions(mode, tenseFilter, difficulty, count, isRevision, lessonId);
  },

  start(
    mode = 'mixed',
    tenseFilter = null,
    difficulty = 'intermediate',
    count = 10,
    lessonId = null,
    isRevision = false,
  ) {
    this.currentMode = mode;
    this.currentTenseFilter = tenseFilter;
    this.currentDifficulty = difficulty;
    this.currentCount = count;
    this.currentLessonId = lessonId;
    this.isRevision = isRevision;
    this.sessionConfig = Object.freeze({
      mode,
      tenseFilter: Array.isArray(tenseFilter) ? Object.freeze([...tenseFilter]) : tenseFilter,
      difficulty,
      count,
      lessonId,
      isRevision,
    });
    this.questions = generateQuestions(mode, tenseFilter, difficulty, count, isRevision, lessonId);
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    State.resetSessionPromotions?.();
    return this.questions;
  },

  getCurrent() {
    return this.questions[this.currentIndex] || null;
  },

  next() {
    this.currentIndex++;
    this.answered = false;
    return this.currentIndex < this.questions.length;
  },

  isComplete() {
    return this.currentIndex >= this.questions.length;
  },

  getProgress() {
    return { current: this.currentIndex + 1, total: this.questions.length, score: this.score };
  },
};

export default ExerciseEngine;
