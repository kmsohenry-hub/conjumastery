/**
 * @module persistence/storage
 * @description Gestion de la persistance locale avec support de format versionné (migrations) et assainissement défensif.
 */

import {
  cloneState,
  defaultState,
  MAX_ACTIVITY_LOG_ENTRIES,
  MAX_ERROR_LOG_ENTRIES,
  MAX_SRS_EASE,
  MAX_SRS_INTERVAL_MINUTES,
} from '../state/store.js';

export const STORAGE_VERSION = 1;

/**
 * Migre un état stocké vers la version courante.
 * @param {any} raw
 * @returns {Object}
 */
export function migrateState(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return cloneState(defaultState);
  }

  // Si l'objet possède un champ version et un conteneur data
  let version = 0;
  let data = raw;

  if (typeof raw.version === 'number' && raw.data && typeof raw.data === 'object') {
    version = raw.version;
    data = raw.data;
  }

  // Version future inconnue : ne pas écraser ni risquer d'altérer avec un schéma ancien
  if (version > STORAGE_VERSION) {
    console.warn(`Future storage version detected (${version}), using as-is with fallback`);
    return sanitizeState(data);
  }

  // Pipeline de migration séquentielle :
  // Si version === 0 (format historique non versionné) -> rehausser vers version 1
  if (version === 0) {
    data = sanitizeState(data);
  }

  return sanitizeState(data);
}

/**
 * Assainit structurellement un objet d'état pour garantir l'absence de nullité sur les sous-arbres essentiels.
 * @param {any} candidate
 * @returns {Object}
 */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function sanitizePlainObject(defaultVal, candidateVal) {
  const clean = { ...defaultVal };
  for (const [k, v] of Object.entries(candidateVal)) {
    if (!FORBIDDEN_KEYS.has(k)) {
      clean[k] = v;
    }
  }
  return clean;
}

function sanitizeTenseStatsMap(rawMap) {
  const clean = {};
  for (const [k, v] of Object.entries(rawMap)) {
    if (FORBIDDEN_KEYS.has(k) || !v || typeof v !== 'object' || Array.isArray(v)) continue;
    const correct = Math.max(0, Math.floor(Number(v.correct) || 0));
    const total = Math.max(correct, Math.floor(Number(v.total) || 0));
    clean[k] = { correct, total };
  }
  return clean;
}

function sanitizeSpacedRepetitionMap(rawMap) {
  const clean = {};
  for (const [k, v] of Object.entries(rawMap)) {
    if (FORBIDDEN_KEYS.has(k) || !v || typeof v !== 'object' || Array.isArray(v)) continue;
    const rawInterval = Number(v.interval);
    const interval = Number.isFinite(rawInterval)
      ? Math.min(MAX_SRS_INTERVAL_MINUTES, Math.max(1, Math.round(rawInterval)))
      : 1;
    const rawEase = Number(v.ease);
    const ease = Number.isFinite(rawEase)
      ? Number(Math.min(MAX_SRS_EASE, Math.max(1.3, rawEase)).toFixed(2))
      : 2.5;
    const rawNextReview = Number(v.nextReview);
    const nextReview = Number.isFinite(rawNextReview) && rawNextReview >= 0 ? rawNextReview : 0;
    const errors = Math.max(0, Math.floor(Number(v.errors) || 0));
    clean[k] = { interval, nextReview, ease, errors };
  }
  return clean;
}

export function sanitizeState(candidate) {
  const base = cloneState(defaultState);
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return base;
  }

  const sanitized = { ...base };

  for (const [key, defaultVal] of Object.entries(base)) {
    const val = candidate[key];
    if (val === undefined || val === null) {
      sanitized[key] = defaultVal;
    } else if (Array.isArray(defaultVal)) {
      sanitized[key] = Array.isArray(val) ? val : defaultVal;
    } else if (typeof defaultVal === 'object') {
      sanitized[key] =
        typeof val === 'object' && !Array.isArray(val)
          ? sanitizePlainObject(defaultVal, val)
          : defaultVal;
    } else {
      sanitized[key] = val;
    }
  }

  // Invariants mathématiques et d'intégrité
  sanitized.xp = Math.max(0, Number(sanitized.xp) || 0);
  sanitized.level = Math.max(1, Number(sanitized.level) || 1);
  sanitized.daysStreak = Math.max(0, Number(sanitized.daysStreak) || 0);
  sanitized.currentStreak = Math.max(0, Number(sanitized.currentStreak) || 0);
  sanitized.bestStreak = Math.max(Number(sanitized.bestStreak) || 0, sanitized.currentStreak);
  sanitized.correctAnswers = Math.max(0, Number(sanitized.correctAnswers) || 0);
  sanitized.incorrectAnswers = Math.max(0, Number(sanitized.incorrectAnswers) || 0);
  sanitized.totalExercises = Math.max(
    Number(sanitized.totalExercises) || 0,
    sanitized.correctAnswers + sanitized.incorrectAnswers,
  );
  if (
    sanitized.lastActiveDate !== null &&
    (typeof sanitized.lastActiveDate !== 'string' ||
      !Number.isFinite(Date.parse(sanitized.lastActiveDate)))
  ) {
    sanitized.lastActiveDate = null;
  }
  sanitized.completedLessons = Array.from(
    new Set(sanitized.completedLessons.filter((item) => typeof item === 'string')),
  );
  sanitized.favorites = Array.from(
    new Set(sanitized.favorites.filter((item) => typeof item === 'string')),
  );
  sanitized.tenseStats = sanitizeTenseStatsMap(sanitized.tenseStats);
  sanitized.spacedRepetition = sanitizeSpacedRepetitionMap(sanitized.spacedRepetition);
  sanitized.errorLog = sanitized.errorLog
    .filter(
      (entry) =>
        Boolean(entry) &&
        typeof entry === 'object' &&
        !Array.isArray(entry) &&
        typeof entry.tenseId === 'string',
    )
    .map((entry) => ({
      tenseId: entry.tenseId,
      date: typeof entry.date === 'string' ? entry.date : new Date().toISOString(),
    }))
    .slice(-MAX_ERROR_LOG_ENTRIES);
  sanitized.activityLog = sanitized.activityLog
    .filter(
      (entry) =>
        Boolean(entry) &&
        typeof entry === 'object' &&
        !Array.isArray(entry) &&
        Number.isFinite(Number(entry.xp)),
    )
    .map((entry) => ({
      date: typeof entry.date === 'string' ? entry.date : new Date().toISOString(),
      xp: Math.max(0, Number(entry.xp)),
    }))
    .slice(-MAX_ACTIVITY_LOG_ENTRIES);
  sanitized.settings.theme = sanitized.settings.theme === 'dark' ? 'dark' : 'light';

  return sanitized;
}

/**
 * Charge l'état depuis le localStorage en appliquant assainissement et migrations.
 * @param {string} key
 * @returns {Object|null}
 */
export function loadState(key) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return migrateState(parsed);
    }
  } catch (e) {
    console.error(`Failed to load state for key: ${key}`, e);
  }
  return null;
}

/**
 * Sauvegarde l'état dans le localStorage sous format versionné.
 * @param {string} key
 * @param {Object} state
 * @param {number} [version=STORAGE_VERSION]
 * @returns {boolean} Indique si la sauvegarde locale a réussi
 */
export function saveState(key, state, version = STORAGE_VERSION) {
  try {
    const payload = {
      version,
      data: state,
    };
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.error(`Failed to save state for key: ${key}`, e);
    return false;
  }
}
