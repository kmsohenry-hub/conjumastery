/**
 * @module persistence/storage
 * @description Gestion de la persistance locale avec support de format versionné (migrations) et assainissement défensif.
 */

import { cloneState, defaultState } from '../state/store.js';

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
          ? { ...defaultVal, ...val }
          : defaultVal;
    } else {
      sanitized[key] = val;
    }
  }

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
 */
export function saveState(key, state, version = STORAGE_VERSION) {
  try {
    const payload = {
      version,
      data: state,
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    console.error(`Failed to save state for key: ${key}`, e);
  }
}
