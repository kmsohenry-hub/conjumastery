import { describe, test, expect } from 'vitest';
import { getPresentSimpleForm, getConjugation } from '../src/core/exercises/conjugation.js';
import { APP_DATA } from '../src/data/index.js';

describe('getPresentSimpleForm', () => {
  test('returns the base verb when not 3rd person singular', () => {
    expect(getPresentSimpleForm('run', false)).toBe('run');
    expect(getPresentSimpleForm('watch', false)).toBe('watch');
  });

  test('adds "es" to verbs ending in "s", "ch", "sh", "x", or "o"', () => {
    expect(getPresentSimpleForm('miss', true)).toBe('misses');
    expect(getPresentSimpleForm('watch', true)).toBe('watches');
    expect(getPresentSimpleForm('wash', true)).toBe('washes');
    expect(getPresentSimpleForm('fix', true)).toBe('fixes');
    expect(getPresentSimpleForm('go', true)).toBe('goes');
    expect(getPresentSimpleForm('do', true)).toBe('does');
  });

  test('adds "ies" to verbs ending in consonant + "y"', () => {
    expect(getPresentSimpleForm('study', true)).toBe('studies');
    expect(getPresentSimpleForm('fly', true)).toBe('flies');
    expect(getPresentSimpleForm('try', true)).toBe('tries');
  });

  test('adds "s" to regular verbs ending in vowel + "y" or standard endings', () => {
    expect(getPresentSimpleForm('play', true)).toBe('plays');
    expect(getPresentSimpleForm('work', true)).toBe('works');
    expect(getPresentSimpleForm('like', true)).toBe('likes');
  });

  test('conjugates "have" correctly without producing "haves"', () => {
    expect(getPresentSimpleForm('have', true)).toBe('has');
    expect(getPresentSimpleForm('have', false)).toBe('have');
    expect(getPresentSimpleForm('have', true, 'She')).toBe('has');
    expect(getPresentSimpleForm('have', false, 'They')).toBe('have');
    expect(getPresentSimpleForm('have', true)).not.toBe('haves');
  });

  test('conjugates "be" correctly with subject awareness and never produces "bes"', () => {
    expect(getPresentSimpleForm('be', false, 'I')).toBe('am');
    expect(getPresentSimpleForm('be', true, 'He')).toBe('is');
    expect(getPresentSimpleForm('be', true, 'She')).toBe('is');
    expect(getPresentSimpleForm('be', true, 'It')).toBe('is');
    expect(getPresentSimpleForm('be', true, 'John')).toBe('is');
    expect(getPresentSimpleForm('be', false, 'You')).toBe('are');
    expect(getPresentSimpleForm('be', false, 'We')).toBe('are');
    expect(getPresentSimpleForm('be', false, 'They')).toBe('are');
    expect(getPresentSimpleForm('be', true)).toBe('is');
    expect(getPresentSimpleForm('be', false)).toBe('are');
    expect(getPresentSimpleForm('be', true)).not.toBe('bes');
  });
});

describe('getConjugation with irregular and auxiliary verbs', () => {
  test('handles "be" across present and past tenses', () => {
    expect(getConjugation(APP_DATA.verbsByBase, 'be', 'present_simple', 'I', false)).toBe('am');
    expect(getConjugation(APP_DATA.verbsByBase, 'be', 'present_simple', 'She', true)).toBe('is');
    expect(getConjugation(APP_DATA.verbsByBase, 'be', 'present_simple', 'They', false)).toBe('are');
    expect(getConjugation(APP_DATA.verbsByBase, 'be', 'past_simple', 'I', false)).toBe('was');
    expect(getConjugation(APP_DATA.verbsByBase, 'be', 'past_simple', 'He', true)).toBe('was');
    expect(getConjugation(APP_DATA.verbsByBase, 'be', 'past_simple', 'They', false)).toBe('were');
  });

  test('handles "have" across tenses', () => {
    expect(getConjugation(APP_DATA.verbsByBase, 'have', 'present_simple', 'He', true)).toBe('has');
    expect(getConjugation(APP_DATA.verbsByBase, 'have', 'present_simple', 'I', false)).toBe('have');
    expect(getConjugation(APP_DATA.verbsByBase, 'have', 'past_simple', 'They', false)).toBe('had');
  });
});
