/**
 * @module state/store
 * @description État applicatif pur + mutations.
 */

const defaultState = {
  xp: 0,
  level: 1,
  totalExercises: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  bestStreak: 0,
  currentStreak: 0,
  daysStreak: 0,
  lastActiveDate: null,
  completedLessons: [],
  tenseStats: {},
  errorLog: [],
  activityLog: [],
  favorites: [],
  spacedRepetition: {},
  settings: { theme: 'light' },
};

function createStore(initial = {}) {
  let state = { ...defaultState, ...initial };

  const listeners = new Set();

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function notify() {
    listeners.forEach((l) => {
      try {
        l(state);
      } catch {
        // noop
      }
    });
  }

  function setState(partial) {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
    notify();
  }

  function getState() {
    return state;
  }

  function addXP(amount) {
    const xp = state.xp + amount;
    const level = Math.floor(xp / 100) + 1;
    setState({
      xp,
      level,
      lastActiveDate: new Date().toDateString(),
      activityLog: [...state.activityLog, { date: new Date().toISOString(), xp: amount }].slice(
        -100,
      ),
    });
    return level;
  }

  function recordAnswer(tenseId, correct) {
    const tenseStats = { ...state.tenseStats };
    if (!tenseStats[tenseId]) {
      tenseStats[tenseId] = { correct: 0, total: 0 };
    }
    tenseStats[tenseId] = {
      correct: tenseStats[tenseId].correct + (correct ? 1 : 0),
      total: tenseStats[tenseId].total + 1,
    };

    const spacedRepetition = { ...state.spacedRepetition };
    if (!correct) {
      spacedRepetition[tenseId] = {
        interval: 1,
        nextReview: Date.now(),
        ease: Math.max(1.3, (spacedRepetition[tenseId]?.ease ?? 2.5) - 0.2),
        errors: (spacedRepetition[tenseId]?.errors ?? 0) + 1,
      };
    } else {
      const current = spacedRepetition[tenseId] ?? {
        interval: 1,
        nextReview: Date.now(),
        ease: 2.5,
        errors: 0,
      };
      spacedRepetition[tenseId] = {
        interval: Math.round(current.interval * current.ease),
        ease: current.ease + 0.1,
        errors: Math.max(0, current.errors - 1),
        nextReview: Date.now() + Math.round(current.interval * current.ease) * 60 * 1000,
      };
    }

    setState({
      totalExercises: state.totalExercises + 1,
      correctAnswers: state.correctAnswers + (correct ? 1 : 0),
      incorrectAnswers: state.incorrectAnswers + (correct ? 0 : 1),
      currentStreak: correct ? state.currentStreak + 1 : 0,
      bestStreak: correct ? Math.max(state.bestStreak, state.currentStreak + 1) : state.bestStreak,
      tenseStats,
      spacedRepetition,
      errorLog: correct
        ? state.errorLog
        : [...state.errorLog, { tenseId, date: new Date().toISOString() }],
    });
  }

  function completeLesson(lessonId) {
    if (state.completedLessons.includes(lessonId)) return state;
    setState({ completedLessons: [...state.completedLessons, lessonId] });
    addXP(25);
    return getState();
  }

  function toggleFavorite(item) {
    const favorites = state.favorites.includes(item)
      ? state.favorites.filter((f) => f !== item)
      : [...state.favorites, item];
    setState({ favorites });
  }

  function reset() {
    setState(defaultState);
  }

  return {
    subscribe,
    getState,
    setState,
    addXP,
    recordAnswer,
    completeLesson,
    toggleFavorite,
    reset,
  };
}

export { createStore, defaultState };
