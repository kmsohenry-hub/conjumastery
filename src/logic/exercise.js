/**
 * Module de logique métier de l'application ConjuMaster UK
 * Gère la génération d'exercices, validation des réponses, etc.
 */

import { APP_DATA, getTenseById, getIrregularVerb } from '../data/data.js';
import { shuffleArray, sampleArray, normalizeString } from '../utils/helpers.js';

export const ExerciseEngine = {
  currentExercise: null,
  currentMode: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  answered: false,

  /**
   * Obtient les formes irrégulières d'un verbe
   */
  getIrregularForms(verb) {
    const irreg = getIrregularVerb(verb);
    return {
      past: irreg ? irreg.past.split('/')[0] : this.getRegularPast(verb),
      pp: irreg ? irreg.pp.split('/')[0] : this.getRegularPast(verb)
    };
  },

  /**
   * Obtient le prétérit régulier d'un verbe
   */
  getRegularPast(verb) {
    if (verb.endsWith('e')) return `${verb}d`;
    if (verb.endsWith('y') && !'aeiou'.includes(verb[verb.length - 2])) {
      return `${verb.slice(0, -1)}ied`;
    }
    return `${verb}ed`;
  },

  /**
   * Obtient la forme du présent simple
   */
  getPresentSimpleForm(verb, is3rdSing) {
    if (!is3rdSing) return verb;
    if (verb.endsWith('s') || verb.endsWith('ch') || verb.endsWith('sh') || 
        verb.endsWith('x') || verb.endsWith('o')) {
      return `${verb}es`;
    }
    if (verb.endsWith('y') && !'aeiou'.includes(verb[verb.length - 2])) {
      return `${verb.slice(0, -1)}ies`;
    }
    return `${verb}s`;
  },

  /**
   * Obtient la forme en -ing
   */
  getIngForm(verb) {
    if (verb.endsWith('ie')) return `${verb.slice(0, -2)}ying`;
    if (verb.endsWith('e') && verb !== 'be') return `${verb.slice(0, -1)}ing`;
    return `${verb}ing`;
  },

  /**
   * Génère des questions pour un exercice
   */
  generateQuestions(mode, tenseFilter, difficulty, count = 10) {
    const questions = [];
    const subjects = ['I', 'You', 'He', 'She', 'We', 'They', 'My friend', 'The teacher', 'The students', 'John', 'Sarah', 'The children', 'The dog', 'My parents'];
    const regularVerbs = ['work', 'play', 'study', 'cook', 'read', 'write', 'walk', 'talk', 'clean', 'watch', 'listen', 'help', 'ask', 'call', 'wait', 'start', 'finish', 'open', 'close', 'use'];
    const allVerbs = [...regularVerbs, ...APP_DATA.irregularVerbs.map(v => v.base)];

    const tenses = tenseFilter && tenseFilter.length > 0 ? tenseFilter : APP_DATA.tenses.map(t => t.id);

    for (let i = 0; i < count; i++) {
      const tenseId = tenses[Math.floor(Math.random() * tenses.length)];
      const tense = getTenseById(tenseId);
      if (!tense) continue;

      const verb = allVerbs[Math.floor(Math.random() * allVerbs.length)];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const is3rdSing = ['He', 'She', 'It', 'My friend', 'The teacher', 'John', 'Sarah', 'The dog'].includes(subject);

      // Choisir le type de question
      let question;
      if (APP_DATA.exerciseTemplates[tenseId] && APP_DATA.exerciseTemplates[tenseId].qcm && Math.random() < 0.7) {
        const templates = APP_DATA.exerciseTemplates[tenseId].qcm;
        const template = templates[Math.floor(Math.random() * templates.length)];
        question = {
          type: 'qcm',
          tenseId,
          text: template.template,
          options: template.answers,
          correctIndex: template.correct,
          explanation: tense.explanation
        };
      } else {
        // Générer une question dynamique
        question = this.generateDynamicQuestion(tense, subject, verb, is3rdSing);
      }

      if (question) questions.push(question);
    }

    return questions.slice(0, count);
  },

  /**
   * Génère une question dynamique basée sur le temps verbal
   */
  generateDynamicQuestion(tense, subject, verb, is3rdSing) {
    switch (tense.id) {
      case 'present_simple': {
        const correct = this.getPresentSimpleForm(verb, is3rdSing);
        const wrong1 = verb;
        const wrong2 = this.getIngForm(verb);
        const wrong3 = this.getRegularPast(verb);
        return {
          type: 'qcm',
          tenseId: tense.id,
          text: `Complete: "${subject} ___ ${verb}" (habit)`,
          options: shuffleArray([correct, wrong1, wrong2, wrong3]),
          correctAnswer: correct,
          explanation: tense.explanation
        };
      }
      case 'present_continuous': {
        const aux = is3rdSing ? 'is' : 'are';
        const correct = `${aux} ${this.getIngForm(verb)}`;
        return {
          type: 'fill',
          tenseId: tense.id,
          text: `Complete: "${subject} _____ (${verb})" (now)`,
          correctAnswer: correct,
          explanation: tense.explanation
        };
      }
      case 'past_simple': {
        const forms = this.getIrregularForms(verb);
        const correct = forms.past;
        return {
          type: 'fill',
          tenseId: tense.id,
          text: `Complete: "${subject} _____ (${verb})" (yesterday)`,
          correctAnswer: correct,
          explanation: tense.explanation
        };
      }
      case 'present_perfect': {
        const forms = this.getIrregularForms(verb);
        const aux = is3rdSing ? 'has' : 'have';
        const correct = `${aux} ${forms.pp}`;
        return {
          type: 'fill',
          tenseId: tense.id,
          text: `Complete: "${subject} _____ (${verb})" (experience)`,
          correctAnswer: correct,
          explanation: tense.explanation
        };
      }
      default:
        return null;
    }
  },

  /**
   * Démarre un nouvel exercice
   */
  start(mode, tenseFilter, difficulty, count = 10) {
    this.currentMode = mode;
    this.questions = this.generateQuestions(mode, tenseFilter, difficulty, count);
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.currentExercise = {
      mode,
      tenseFilter,
      difficulty,
      startTime: Date.now()
    };
    return this.getCurrentQuestion();
  },

  /**
   * Obtient la question actuelle
   */
  getCurrentQuestion() {
    if (this.currentIndex >= this.questions.length) return null;
    return {
      ...this.questions[this.currentIndex],
      index: this.currentIndex,
      total: this.questions.length
    };
  },

  /**
   * Vérifie une réponse
   */
  checkAnswer(answer) {
    const question = this.getCurrentQuestion();
    if (!question) return { correct: false };

    let isCorrect = false;
    
    if (question.type === 'qcm' && typeof answer === 'number') {
      isCorrect = answer === question.correctIndex;
    } else if (question.type === 'fill' && typeof answer === 'string') {
      isCorrect = normalizeString(answer) === normalizeString(question.correctAnswer);
    }

    if (isCorrect) this.score++;
    this.answered = true;

    return {
      correct: isCorrect,
      correctAnswer: question.correctAnswer || question.options?.[question.correctIndex],
      explanation: question.explanation
    };
  },

  /**
   * Passe à la question suivante
   */
  next() {
    this.currentIndex++;
    this.answered = false;
    return this.getCurrentQuestion();
  },

  /**
   * Termine l'exercice et retourne les résultats
   */
  finish() {
    const result = {
      score: this.score,
      total: this.questions.length,
      percentage: Math.round((this.score / this.questions.length) * 100),
      duration: Date.now() - this.currentExercise.startTime,
      mode: this.currentMode,
      tenseFilter: this.currentExercise.tenseFilter
    };

    this.reset();
    return result;
  },

  /**
   * Réinitialise l'exercice
   */
  reset() {
    this.currentExercise = null;
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
  }
};

// Export des fonctions utilitaires de logique
export function calculateAccuracy(correct, total) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function shouldShowHint(errorCount) {
  return errorCount >= 3;
}
