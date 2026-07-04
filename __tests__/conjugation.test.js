import { describe, test, expect } from 'vitest';
import { getPresentSimpleForm } from '../src/core/exercises/conjugation.js';

describe('getPresentSimpleForm', () => {
  test('returns the base verb when not 3rd person singular', () => {
    expect(getPresentSimpleForm('run', false)).toBe('run');
    expect(getPresentSimpleForm('watch', false)).toBe('watch');
    expect(getPresentSimpleForm('fly', false)).toBe('fly');
    expect(getPresentSimpleForm('play', false)).toBe('play');
  });

  test('adds "es" to verbs ending in "s", "ch", "sh", "x", or "o"', () => {
    expect(getPresentSimpleForm('miss', true)).toBe('misses');
    expect(getPresentSimpleForm('watch', true)).toBe('watches');
    expect(getPresentSimpleForm('wash', true)).toBe('washes');
    expect(getPresentSimpleForm('fix', true)).toBe('fixes');
    expect(getPresentSimpleForm('go', true)).toBe('goes');
  });

  test('changes "y" to "ies" when preceded by a consonant', () => {
    expect(getPresentSimpleForm('fly', true)).toBe('flies');
    expect(getPresentSimpleForm('cry', true)).toBe('cries');
    expect(getPresentSimpleForm('study', true)).toBe('studies');
  });

  test('adds "s" to verbs ending in "y" when preceded by a vowel', () => {
    expect(getPresentSimpleForm('play', true)).toBe('plays');
    expect(getPresentSimpleForm('enjoy', true)).toBe('enjoys');
    expect(getPresentSimpleForm('buy', true)).toBe('buys');
  });

  test('adds "s" to regular verbs', () => {
    expect(getPresentSimpleForm('run', true)).toBe('runs');
    expect(getPresentSimpleForm('eat', true)).toBe('eats');
    expect(getPresentSimpleForm('work', true)).toBe('works');
    expect(getPresentSimpleForm('arrive', true)).toBe('arrives');
  });
});
