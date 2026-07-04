import { APP_DATA } from '../../../data.js';
import {
  getAllIrregularForms,
  getIrregularForms,
  getRegularPast,
  getPresentSimpleForm,
  getIngForm,
  getConjugation,
} from './conjugation.js';
import { generateQuestions } from './generator.js';

const ExerciseEngine = {
  currentExercise: null,
  currentMode: null,
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

  getPresentSimpleForm(verb, is3rdSing) {
    return getPresentSimpleForm(verb, is3rdSing);
  },

  getIngForm(verb) {
    return getIngForm(verb);
  },

  getConjugation(verb, tenseId, subject, is3rdSing) {
    return getConjugation(APP_DATA.verbsByBase, verb, tenseId, subject, is3rdSing);
  },

  generateQuestions(mode, tenseFilter, difficulty, count = 10) {
    return generateQuestions(mode, tenseFilter, difficulty, count);
  },

  start(mode, tenseFilter, difficulty, count = 10) {
    this.questions = generateQuestions(mode, tenseFilter, difficulty, count);
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
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
