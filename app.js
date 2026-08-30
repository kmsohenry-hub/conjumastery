import {
  navigateTo,
  toggleSidebar,
  toggleTheme,
  setTheme,
  closeModal,
  closeModalDirect,
} from './src/ui/navigation.js';
import { answerMatches, normalizeAnswer } from './src/core/exercises/validation.js';
import { APP_DATA } from './src/data/index.js';
import ExerciseEngineObj from './src/core/exercises/ExerciseEngine.js';
import { escapeHtml, sanitizeInput } from './src/core/security.js';

import { showToast } from './src/ui/utils/toast.js';
import { launchConfetti } from './src/ui/utils/confetti.js';
import { NotificationManager } from './src/ui/utils/notifications.js';
import { renderDashboard } from './src/ui/pages/dashboard.js';
import {
  renderLessons,
  showModule,
  openLesson,
  openTenseModal,
  openPassiveModal,
  openReportedModal,
  renderTimeline,
} from './src/ui/pages/lessons.js';
import {
  resetExerciseUI,
  startExercise,
  startExerciseForTense,
  selectOption,
  validateExercise,
  skipExercise,
  nextExercise,
  exitExercise,
  finishExercise,
} from './src/ui/pages/exercises.js';
import {
  renderTestSetup,
  startTest,
  validateTestAnswer,
  nextTestQuestion,
  finishTest,
} from './src/ui/pages/test.js';
import { renderTenses, showTenseCategory, showComparison } from './src/ui/pages/tenses.js';
import { renderVerbs, filterVerbs, toggleVerbCard } from './src/ui/pages/verbs.js';
import { renderRevision, startRevisionSession } from './src/ui/pages/reviews.js';
import { renderWeakpoints } from './src/ui/pages/weakpoints.js';
import { performGlobalSearch } from './src/ui/pages/search.js';
import { renderFavorites, toggleFav } from './src/ui/pages/favorites.js';
import { renderStats } from './src/ui/pages/stats.js';

// ============================================================
// 1. STATE MANAGEMENT
// ============================================================

// Index APP_DATA for O(1) lookups
APP_DATA.tensesById = APP_DATA.tenses.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});

APP_DATA.verbsByBase = APP_DATA.irregularVerbs.reduce((acc, v) => {
  acc[v.base] = v;
  return acc;
}, {});

import { State } from './src/core/state/State.js';
import { defaultState } from './src/core/state/store.js';

// ============================================================
// 3. EXERCISE ENGINE
// ============================================================

const ExerciseEngine = {
  get currentExercise() {
    return ExerciseEngineObj.currentExercise;
  },
  set currentExercise(v) {
    ExerciseEngineObj.currentExercise = v;
  },
  get currentMode() {
    return ExerciseEngineObj.currentMode;
  },
  set currentMode(v) {
    ExerciseEngineObj.currentMode = v;
  },
  get questions() {
    return ExerciseEngineObj.questions;
  },
  set questions(v) {
    ExerciseEngineObj.questions = v;
  },
  get currentIndex() {
    return ExerciseEngineObj.currentIndex;
  },
  set currentIndex(v) {
    ExerciseEngineObj.currentIndex = v;
  },
  get score() {
    return ExerciseEngineObj.score;
  },
  set score(v) {
    ExerciseEngineObj.score = v;
  },
  get answered() {
    return ExerciseEngineObj.answered;
  },
  set answered(v) {
    ExerciseEngineObj.answered = v;
  },

  getAllIrregularForms: (verb) => ExerciseEngineObj.getAllIrregularForms(verb),
  getIrregularForms: (verb) => ExerciseEngineObj.getIrregularForms(verb),
  getRegularPast: (verb) => ExerciseEngineObj.getRegularPast(verb),
  getPresentSimpleForm: (verb, is3rdSing) =>
    ExerciseEngineObj.getPresentSimpleForm(verb, is3rdSing),
  getIngForm: (verb) => ExerciseEngineObj.getIngForm(verb),
  getConjugation: (verb, tenseId, subject, is3rdSing) =>
    ExerciseEngineObj.getConjugation(verb, tenseId, subject, is3rdSing),
  generateQuestions: (mode, tenseFilter, difficulty, count = 10) =>
    ExerciseEngineObj.generateQuestions(mode, tenseFilter, difficulty, count),
  start: (mode, tenseFilter, difficulty, count = 10) =>
    ExerciseEngineObj.start(mode, tenseFilter, difficulty, count),
  getCurrent: () => ExerciseEngineObj.getCurrent(),
  next: () => ExerciseEngineObj.next(),
  isComplete: () => ExerciseEngineObj.isComplete(),
  getProgress: () => ExerciseEngineObj.getProgress(),
};

// ============================================================
// 4. UI CONTROLLER
// ============================================================

// ============================================================
// 5. PAGE RENDERERS
// ============================================================

// ============================================================
// 6. EXERCISE UI
// ============================================================

/**
 * Compare la réponse utilisateur à la réponse attendue.
 * Accepte plusieurs variantes séparées par "/" dans la réponse attendue
 * (utile pour BrE/AmE : "learnt/learned", "dreamt/dreamed", etc.).
 */

// ============================================================
// 7. TEST MODE
// ============================================================

// ============================================================
// 8. TENSES REFERENCE PAGE
// ============================================================

// ============================================================
// 9. VERBS DICTIONARY
// ============================================================

// ============================================================
// 10. COMPARISON TABLE
// ============================================================

// ============================================================
// 11. REVISION PAGE
// ============================================================

// ============================================================
// 12. WEAKPOINTS PAGE
// ============================================================

// ============================================================
// 13. SEARCH
// ============================================================

// ============================================================
// 14. FAVORITES
// ============================================================

// ============================================================
// 15. STATS PAGE
// ============================================================

// ============================================================
// 16. MODAL
// ============================================================

// ============================================================
// 17. TOAST NOTIFICATIONS
// ============================================================

// ============================================================
// 18. CONFETTI
// ============================================================

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanNumber(value, fallback = 0, min = 0) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min ? value : fallback;
}

function cleanStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

function cleanTenseStats(value) {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, stats]) => isPlainObject(stats))
      .map(([tenseId, stats]) => [
        tenseId,
        {
          correct: cleanNumber(stats.correct),
          total: cleanNumber(stats.total),
        },
      ])
      .filter(([, stats]) => stats.total >= stats.correct),
  );
}

function cleanSpacedRepetition(value) {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, data]) => isPlainObject(data))
      .map(([tenseId, data]) => [
        tenseId,
        {
          interval: cleanNumber(data.interval, 1, 1),
          nextReview: cleanNumber(data.nextReview, Date.now(), 0),
          ease: cleanNumber(data.ease, 2.5, 1.3),
          errors: cleanNumber(data.errors),
        },
      ]),
  );
}

export function validateImportedState(raw) {
  if (!isPlainObject(raw)) throw new Error('Invalid backup format');
  const data = isPlainObject(raw.data) ? raw.data : raw;
  const settings = isPlainObject(data.settings) ? data.settings : {};

  return {
    ...defaultState,
    xp: cleanNumber(data.xp),
    level: cleanNumber(data.level, defaultState.level, 1),
    totalExercises: cleanNumber(data.totalExercises),
    correctAnswers: cleanNumber(data.correctAnswers),
    incorrectAnswers: cleanNumber(data.incorrectAnswers),
    bestStreak: cleanNumber(data.bestStreak),
    currentStreak: cleanNumber(data.currentStreak),
    daysStreak: cleanNumber(data.daysStreak),
    lastActiveDate: typeof data.lastActiveDate === 'string' ? data.lastActiveDate : null,
    completedLessons: cleanStringArray(data.completedLessons),
    tenseStats: cleanTenseStats(data.tenseStats),
    errorLog: Array.isArray(data.errorLog) ? data.errorLog.filter(isPlainObject).slice(-500) : [],
    activityLog: Array.isArray(data.activityLog)
      ? data.activityLog.filter(isPlainObject).slice(-100)
      : [],
    favorites: cleanStringArray(data.favorites),
    spacedRepetition: cleanSpacedRepetition(data.spacedRepetition),
    settings: { theme: settings.theme === 'dark' ? 'dark' : 'light' },
  };
}

// ============================================================
// 19. SETTINGS FUNCTIONS
// ============================================================

function exportData() {
  const data = JSON.stringify(State.data, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conjumaster_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 Données exportées avec succès', 'success');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = validateImportedState(JSON.parse(ev.target.result));
        State.data = data;
        State.save();
        updateUI();
        showToast('📥 Données importées avec succès', 'success');
      } catch {
        showToast('❌ Fichier invalide', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function resetProgress() {
  if (
    confirm(
      '⚠️ Êtes-vous sûr de vouloir réinitialiser toute votre progression ? Cette action est irréversible.',
    )
  ) {
    State.reset();
    navigateTo('dashboard');
  }
}

// ============================================================
// 20. UI UPDATE
// ============================================================

function updateUI() {
  const d = State.data;
  document.getElementById('headerXP').textContent = d.xp;
  document.getElementById('headerLevel').textContent = d.level;
  document.getElementById('sidebarLevel').textContent = d.level;
  const displayXP = d.xp - (d.level - 1) * 100;
  document.getElementById('sidebarXP').textContent = `${displayXP} / 100 XP`;
  document.getElementById('sidebarXPBar').style.width = `${displayXP}%`;
  document.getElementById('streakCount').textContent = d.daysStreak;
  document.getElementById('streakPlural').textContent = d.daysStreak > 1 ? 's' : '';

  // Update revision badge
  const queue = State.getReviewQueue();
  const badge = document.getElementById('revisionBadge');
  if (badge) badge.textContent = queue.length;
  const lessonsBadge = document.getElementById('lessonsBadge');
  if (lessonsBadge) {
    let incomplete = 0;
    const completedSet = new Set(d.completedLessons);
    APP_DATA.modules.forEach((mod) =>
      mod.lessons.forEach((l) => {
        if (!completedSet.has(l.id)) incomplete++;
      }),
    );
    lessonsBadge.textContent = incomplete;
  }
}

// ============================================================
// 21. NOTIFICATIONS
// ============================================================

// ============================================================
// 22. INITIALIZATION
// ============================================================

function init() {
  State.init();
  NotificationManager.init();
  updateUI();
  navigateTo('dashboard');

  // Apply saved theme
  if (State.data.settings.theme === 'dark') {
    setTheme('dark');
  }
}

window.APP_DATA = APP_DATA;
window.State = State;
window.ExerciseEngine = ExerciseEngine;
window.escapeHtml = escapeHtml;
window.sanitizeInput = sanitizeInput;
window.updateUI = updateUI;
window.NotificationManager = NotificationManager;
window.showModule = showModule;
window.openLesson = openLesson;
window.openTenseModal = openTenseModal;
window.openPassiveModal = openPassiveModal;
window.openReportedModal = openReportedModal;
window.startExercise = startExercise;
window.startExerciseForTense = startExerciseForTense;
window.selectOption = selectOption;
window.validateExercise = validateExercise;
window.skipExercise = skipExercise;
window.nextExercise = nextExercise;
window.exitExercise = exitExercise;
window.startTest = startTest;
window.validateTestAnswer = validateTestAnswer;
window.nextTestQuestion = nextTestQuestion;
window.showTenseCategory = showTenseCategory;
window.filterVerbs = filterVerbs;
window.toggleVerbCard = toggleVerbCard;
window.showComparison = showComparison;
window.startRevisionSession = startRevisionSession;
window.performGlobalSearch = performGlobalSearch;
window.toggleFav = toggleFav;
window.showToast = showToast;
window.launchConfetti = launchConfetti;
window.navigateTo = navigateTo;
window.closeModal = closeModal;
window.renderTimeline = renderTimeline;
window.answerMatches = answerMatches;
window.normalizeAnswer = normalizeAnswer;
window.renderDashboard = renderDashboard;
window.renderLessons = renderLessons;
window.resetExerciseUI = resetExerciseUI;
window.renderTestSetup = renderTestSetup;
window.renderTenses = renderTenses;
window.renderVerbs = renderVerbs;
window.renderRevision = renderRevision;
window.renderWeakpoints = renderWeakpoints;
window.renderFavorites = renderFavorites;
window.renderStats = renderStats;
window.finishTest = finishTest;
window.finishExercise = finishExercise;
window.toggleTheme = toggleTheme;
window.toggleSidebar = toggleSidebar;
window.setTheme = setTheme;
window.resetProgress = resetProgress;
window.importData = importData;
window.exportData = exportData;
window.closeModalDirect = closeModalDirect;

// Start the app
document.addEventListener('DOMContentLoaded', init);

export {
  APP_DATA,
  State,
  ExerciseEngine,
  NotificationManager,
  showModule,
  openLesson,
  openTenseModal,
  openPassiveModal,
  openReportedModal,
  startExercise,
  startExerciseForTense,
  selectOption,
  validateExercise,
  skipExercise,
  nextExercise,
  exitExercise,
  startTest,
  validateTestAnswer,
  nextTestQuestion,
  showTenseCategory,
  filterVerbs,
  toggleVerbCard,
  showComparison,
  startRevisionSession,
  performGlobalSearch,
  toggleFav,
  showToast,
  launchConfetti,
  navigateTo,
  closeModal,
  answerMatches,
  normalizeAnswer,
};

window.closeModalDirect = closeModalDirect;
