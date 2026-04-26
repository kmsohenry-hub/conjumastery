/**
 * Module d'utilitaires généraux
 */

/**
 * Formate un nombre avec des séparateurs de milliers
 * @param {number} num - Nombre à formater
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Formate une date en relatif (il y a X jours, etc.)
 * @param {Date|string|number} date - Date à formater
 * @returns {string}
 */
export function formatRelativeDate(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  
  return then.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined,
  });
}

/**
 * Débounce une fonction (évite les appels trop fréquents)
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Temps d'attente en ms
 * @returns {Function}
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle une fonction (limite la fréquence d'appel)
 * @param {Function} func - Fonction à throttler
 * @param {number} limit - Intervalle minimum en ms
 * @returns {Function}
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Génère un ID unique
 * @returns {string}
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Mélange aléatoirement un tableau (Fisher-Yates shuffle)
 * @param {Array} array - Tableau à mélanger
 * @returns {Array} - Nouveau tableau mélangé
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Sélectionne N éléments aléatoires dans un tableau
 * @param {Array} array - Tableau source
 * @param {number} count - Nombre d'éléments à sélectionner
 * @returns {Array}
 */
export function sampleArray(array, count) {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Calcule le pourcentage de progression
 * @param {number} current - Valeur actuelle
 * @param {number} total - Valeur totale
 * @returns {number} - Pourcentage (0-100)
 */
export function calculatePercentage(current, total) {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Vérifie si une chaîne contient du texte (non vide après trim)
 * @param {string} str - Chaîne à vérifier
 * @returns {boolean}
 */
export function isNotBlank(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

/**
 * Normalise une chaîne (minuscules, sans accents)
 * @param {string} str - Chaîne à normaliser
 * @returns {string}
 */
export function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Compare deux chaînes de manière insensible à la casse et aux accents
 * @param {string} str1 - Première chaîne
 * @param {string} str2 - Deuxième chaîne
 * @returns {boolean}
 */
export function compareStrings(str1, str2) {
  return normalizeString(str1) === normalizeString(str2);
}

/**
 * Tronque une chaîne avec des points de suspension
 * @param {string} str - Chaîne à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string}
 */
export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Groupe un tableau par une clé
 * @param {Array} array - Tableau à grouper
 * @param {string|Function} key - Clé ou fonction de groupement
 * @returns {object}
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Attend un certain temps (promesse)
 * @param {number} ms - Durée en millisecondes
 * @returns {Promise}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry une fonction async avec backoff exponentiel
 * @param {Function} fn - Fonction à exécuter
 * @param {object} options - Options
 * @returns {Promise}
 */
export async function retry(fn, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry = () => {},
  } = options;

  let lastError;
  let currentDelay = delay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        onRetry(error, attempt + 1);
        await sleep(currentDelay);
        currentDelay *= backoff;
      }
    }
  }

  throw lastError;
}

/**
 * Crée une fonction de mémorisation (cache les résultats)
 * @param {Function} fn - Fonction à mémoïser
 * @returns {Function}
 */
export function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
