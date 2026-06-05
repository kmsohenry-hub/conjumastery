// ============================================================
// UTILITAIRES DE SÉCURITÉ
// ============================================================

/**
 * Échappe les caractères HTML spéciaux pour prévenir les attaques XSS.
 * @param {string} str - La chaîne à échapper.
 * @returns {string} - La chaîne échappée.
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Valide et nettoie une entrée utilisateur.
 * @param {string} input - L'entrée à valider.
 * @returns {string} - L'entrée nettoyée.
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 500);
}
