/**
 * @module state/store
 * @description État applicatif pur + mutations avec isolation par clonage profond et gestion de rétention.
 */

export const MAX_ERROR_LOG_ENTRIES = 100;
export const MAX_ACTIVITY_LOG_ENTRIES = 100;

function toArray(val) {
  return Array.isArray(val) ? val : [];
}

function isPlainObject(val) {
  return Boolean(val) && typeof val === 'object' && !Array.isArray(val);
}

const defaultState = Object.freeze({
  xp: 0,
  level: 1,
  totalExercises: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  bestStreak: 0,
  currentStreak: 0,
  daysStreak: 0,
  lastActiveDate: null,
  completedLessons: Object.freeze([]),
  tenseStats: Object.freeze({}),
  errorLog: Object.freeze([]),
  activityLog: Object.freeze([]),
  favorites: Object.freeze([]),
  spacedRepetition: Object.freeze({}),
  settings: Object.freeze({ theme: 'light' }),
});

/**
 * Crée une copie profonde et découplée d'un état.
 * @param {Object} obj
 * @returns {Object}
 */
export function cloneState(obj) {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Fusionne deux états de manière déterministe (sans perte de progression multi-onglets).
 * @param {Object} local
 * @param {Object} remote
 * @returns {Object}
 */
export function mergeStates(local, remote) {
  if (!isPlainObject(remote)) return cloneState(local);
  if (!isPlainObject(local)) return cloneState(remote);

  const xp = Math.max(Number(local.xp) || 0, Number(remote.xp) || 0);
  const level = Math.max(
    Number(local.level) || 1,
    Number(remote.level) || 1,
    Math.floor(xp / 100) + 1,
  );

  let correctAnswers = Math.max(Number(local.correctAnswers) || 0, Number(remote.correctAnswers) || 0);
  const incorrectAnswers = Math.max(
    Number(local.incorrectAnswers) || 0,
    Number(remote.incorrectAnswers) || 0,
  );
  let totalExercises = Math.max(
    Number(local.totalExercises) || 0,
    Number(remote.totalExercises) || 0,
    correctAnswers + incorrectAnswers,
  );

  const currentStreak = Math.max(Number(local.currentStreak) || 0, Number(remote.currentStreak) || 0);
  const bestStreak = Math.max(
    Number(local.bestStreak) || 0,
    Number(remote.bestStreak) || 0,
    currentStreak,
  );
  const daysStreak = Math.max(Number(local.daysStreak) || 0, Number(remote.daysStreak) || 0);

  // Date d'activité la plus récente
  let lastActiveDate = local.lastActiveDate;
  if (remote.lastActiveDate) {
    if (!lastActiveDate || new Date(remote.lastActiveDate).getTime() > new Date(lastActiveDate).getTime()) {
      lastActiveDate = remote.lastActiveDate;
    }
  }

  // Union dédupliquée des leçons et favoris
  const completedLessons = Array.from(
    new Set([...toArray(local.completedLessons), ...toArray(remote.completedLessons)]),
  );
  const favorites = Array.from(
    new Set([...toArray(local.favorites), ...toArray(remote.favorites)]),
  );

  // Fusion des statistiques par temps
  const localTenses = isPlainObject(local.tenseStats) ? local.tenseStats : {};
  const remoteTenses = isPlainObject(remote.tenseStats) ? remote.tenseStats : {};
  const tenseStats = {};
  const allTenseIds = new Set([...Object.keys(localTenses), ...Object.keys(remoteTenses)]);
  let sumTenseCorrect = 0;
  let sumTenseTotal = 0;
  for (const tid of allTenseIds) {
    const l = localTenses[tid] || { correct: 0, total: 0 };
    const r = remoteTenses[tid] || { correct: 0, total: 0 };
    const c = Math.max(Number(l.correct) || 0, Number(r.correct) || 0);
    const t = Math.max(Number(l.total) || 0, Number(r.total) || 0, c);
    tenseStats[tid] = { correct: c, total: t };
    sumTenseCorrect += c;
    sumTenseTotal += t;
  }

  correctAnswers = Math.max(correctAnswers, sumTenseCorrect);
  totalExercises = Math.max(totalExercises, sumTenseTotal, correctAnswers + incorrectAnswers);

  // Spaced Repetition : conserver l'état le plus à jour
  const localSR = isPlainObject(local.spacedRepetition) ? local.spacedRepetition : {};
  const remoteSR = isPlainObject(remote.spacedRepetition) ? remote.spacedRepetition : {};
  const spacedRepetition = { ...localSR };
  for (const [tid, rData] of Object.entries(remoteSR)) {
    if (isPlainObject(rData)) {
      const lData = spacedRepetition[tid];
      const rReview = Number(rData.nextReview) || 0;
      const lReview = lData ? Number(lData.nextReview) || 0 : -1;
      if (rReview >= lReview) {
        spacedRepetition[tid] = rData;
      }
    }
  }

  // Activity Log : fusion dédupliquée et triée
  const actMap = new Map();
  for (const item of [...toArray(local.activityLog), ...toArray(remote.activityLog)]) {
    if (isPlainObject(item) && typeof item.date === 'string') {
      actMap.set(`${item.date}_${item.xp}`, item);
    }
  }
  const activityLog = Array.from(actMap.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-MAX_ACTIVITY_LOG_ENTRIES);

  // Error Log : fusion dédupliquée et bornée à MAX_ERROR_LOG_ENTRIES
  const errMap = new Map();
  for (const item of [...toArray(local.errorLog), ...toArray(remote.errorLog)]) {
    if (isPlainObject(item) && typeof item.date === 'string') {
      errMap.set(`${item.date}_${item.tenseId}`, item);
    }
  }
  const errorLog = Array.from(errMap.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-MAX_ERROR_LOG_ENTRIES);

  // Settings
  const isDark =
    Boolean(remote.settings && remote.settings.theme === 'dark') ||
    Boolean(local.settings && local.settings.theme === 'dark');
  const settings = { theme: isDark ? 'dark' : 'light' };

  return {
    xp,
    level,
    totalExercises,
    correctAnswers,
    incorrectAnswers,
    bestStreak,
    currentStreak,
    daysStreak,
    lastActiveDate,
    completedLessons,
    tenseStats,
    errorLog,
    activityLog,
    favorites,
    spacedRepetition,
    settings,
  };
}

function createStore(initial = {}) {
  let state = { ...cloneState(defaultState), ...cloneState(initial) };
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
        -MAX_ACTIVITY_LOG_ENTRIES,
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
        : [...state.errorLog, { tenseId, date: new Date().toISOString() }].slice(
            -MAX_ERROR_LOG_ENTRIES,
          ),
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
    setState(cloneState(defaultState));
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
