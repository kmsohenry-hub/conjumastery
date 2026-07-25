/**
 * @module exercises/shuffle
 * @description Fisher-Yates shuffle — permutation uniforme non biaisée.
 *
 * Contrairement à `array.sort(() => Math.random() - 0.5)` qui produit une
 * distribution inégale (le comparateur n'étant ni transitif ni consistant),
 * Fisher-Yates garantit que chaque permutation a exactement la même
 * probabilité d'occurer (1/n!).
 *
 * @param {Array} array - le tableau à mélanger.
 * @returns {Array} une **nouvelle** copie mélangée (l'original n'est pas muté).
 */
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
