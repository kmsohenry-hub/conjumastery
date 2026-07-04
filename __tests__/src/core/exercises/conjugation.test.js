import { describe, test, expect } from 'vitest';
import { getIngForm } from '../../../../src/core/exercises/conjugation.js';

describe('getIngForm', () => {
  test('handles verbs ending in "ie"', () => {
    expect(getIngForm('die')).toBe('dying');
    expect(getIngForm('lie')).toBe('lying');
    expect(getIngForm('tie')).toBe('tying');
  });

  test('handles verbs ending in "e" (except "be")', () => {
    expect(getIngForm('make')).toBe('making');
    expect(getIngForm('take')).toBe('taking');
    expect(getIngForm('have')).toBe('having');
    expect(getIngForm('come')).toBe('coming');
  });

  test('handles the verb "be"', () => {
    expect(getIngForm('be')).toBe('being');
  });

  test('handles regular verbs', () => {
    expect(getIngForm('work')).toBe('working');
    expect(getIngForm('play')).toBe('playing');
    expect(getIngForm('eat')).toBe('eating');
    expect(getIngForm('go')).toBe('going');
    expect(getIngForm('do')).toBe('doing');
  });
});
