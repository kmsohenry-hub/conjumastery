import { describe, test, expect, vi } from 'vitest';
import { shuffle } from '../../../../src/core/exercises/shuffle.js';

describe('shuffle', () => {
  test('retourne les mêmes éléments (ensemble, pas de perte ni doublon)', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f'];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual([...input].sort());
  });

  test('ne mute pas le tableau original', () => {
    const input = ['a', 'b', 'c', 'd'];
    const snapshot = [...input];
    shuffle(input);
    expect(input).toEqual(snapshot);
  });

  test('un tableau à un seul élément reste inchangé', () => {
    expect(shuffle(['solo'])).toEqual(['solo']);
  });

  test('un tableau vide reste vide', () => {
    expect(shuffle([])).toEqual([]);
  });

  test('produit une permutation différente au moins une fois sur plusieurs essais', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const original = [...input];
    let changed = false;
    for (let i = 0; i < 20; i++) {
      if (JSON.stringify(shuffle(input)) !== JSON.stringify(original)) {
        changed = true;
        break;
      }
    }
    expect(changed).toBe(true);
  });

  test('Fisher-Yates avec random mocké produit le résultat attendu', () => {
    // Math.random() = 0 → j = 0 à chaque itération.
    // i=3 : échange arr[3]↔arr[0] → ['d','b','c','a']
    // i=2 : échange arr[2]↔arr[0] → ['c','b','d','a']
    // i=1 : échange arr[1]↔arr[0] → ['b','c','d','a']
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = shuffle(['a', 'b', 'c', 'd']);
    expect(result).toEqual(['b', 'c', 'd', 'a']);
    Math.random.mockRestore();

    // Math.random() = 0.999 → j = i à chaque itération → pas d'échange
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const result2 = shuffle(['a', 'b', 'c', 'd']);
    expect(result2).toEqual(['a', 'b', 'c', 'd']);
    Math.random.mockRestore();
  });
});
