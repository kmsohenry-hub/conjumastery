import { defaultState } from './store.js';

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
