import { describe, test, expect } from 'vitest';
import {
  getIngForm,
  getRegularPast,
  shouldDoubleFinalConsonant,
} from '../../../../src/core/exercises/conjugation.js';

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

  test('handles consonant doubling for CVC verbs', () => {
    expect(getIngForm('run')).toBe('running');
    expect(getIngForm('sit')).toBe('sitting');
    expect(getIngForm('stop')).toBe('stopping');
  });

  test('does NOT double consonant for polysyllabic verbs with initial stress', () => {
    expect(getIngForm('visit')).toBe('visiting');
    expect(getIngForm('open')).toBe('opening');
    expect(getIngForm('listen')).toBe('listening');
    expect(getIngForm('happen')).toBe('happening');
  });

  test('doubles consonant for polysyllabic verbs with final-syllable stress', () => {
    expect(getIngForm('begin')).toBe('beginning');
    expect(getIngForm('prefer')).toBe('preferring');
    expect(getIngForm('forget')).toBe('forgetting');
  });

  test('doubles final l in BrE regardless of stress (travel → travelling)', () => {
    expect(getIngForm('travel')).toBe('travelling');
    expect(getIngForm('cancel')).toBe('cancelling');
    expect(getIngForm('control')).toBe('controlling'); // also final-stress
  });
});

describe('getRegularPast', () => {
  test('handles consonant doubling for regular past forms', () => {
    expect(getRegularPast('stop')).toBe('stopped');
    expect(getRegularPast('plan')).toBe('planned');
  });

  test('does NOT double consonant for polysyllabic verbs with initial stress (past)', () => {
    expect(getRegularPast('visit')).toBe('visited');
    expect(getRegularPast('open')).toBe('opened');
    expect(getRegularPast('listen')).toBe('listened');
    expect(getRegularPast('happen')).toBe('happened');
  });

  test('doubles consonant for polysyllabic verbs with final-syllable stress (past)', () => {
    expect(getRegularPast('prefer')).toBe('preferred');
    expect(getRegularPast('refer')).toBe('referred');
  });

  test('doubles final l in BrE for regular past (travel → travelled)', () => {
    expect(getRegularPast('travel')).toBe('travelled');
    expect(getRegularPast('cancel')).toBe('cancelled');
  });

  test('keeps existing regular past rules', () => {
    expect(getRegularPast('work')).toBe('worked');
    expect(getRegularPast('live')).toBe('lived');
    expect(getRegularPast('study')).toBe('studied');
  });
});

describe('shouldDoubleFinalConsonant', () => {
  test('returns true for monosyllabic CVC verbs', () => {
    expect(shouldDoubleFinalConsonant('stop')).toBe(true);
    expect(shouldDoubleFinalConsonant('run')).toBe(true);
    expect(shouldDoubleFinalConsonant('sit')).toBe(true);
    expect(shouldDoubleFinalConsonant('plan')).toBe(true);
  });

  test('returns false for polysyllabic verbs with initial stress', () => {
    expect(shouldDoubleFinalConsonant('visit')).toBe(false);
    expect(shouldDoubleFinalConsonant('open')).toBe(false);
    expect(shouldDoubleFinalConsonant('listen')).toBe(false);
    expect(shouldDoubleFinalConsonant('happen')).toBe(false);
    expect(shouldDoubleFinalConsonant('offer')).toBe(false);
  });

  test('returns true for polysyllabic verbs with final-syllable stress', () => {
    expect(shouldDoubleFinalConsonant('begin')).toBe(true);
    expect(shouldDoubleFinalConsonant('prefer')).toBe(true);
    expect(shouldDoubleFinalConsonant('forget')).toBe(true);
    expect(shouldDoubleFinalConsonant('occur')).toBe(true);
  });

  test('doubles final l in BrE regardless of stress', () => {
    expect(shouldDoubleFinalConsonant('travel')).toBe(true);
    expect(shouldDoubleFinalConsonant('cancel')).toBe(true);
  });

  test('returns false for verbs ending in w/x/y', () => {
    expect(shouldDoubleFinalConsonant('play')).toBe(false);
    expect(shouldDoubleFinalConsonant('fix')).toBe(false);
    expect(shouldDoubleFinalConsonant('snow')).toBe(false);
  });

  test('returns false for verbs shorter than 3 chars', () => {
    expect(shouldDoubleFinalConsonant('do')).toBe(false);
    expect(shouldDoubleFinalConsonant('go')).toBe(false);
  });
});
