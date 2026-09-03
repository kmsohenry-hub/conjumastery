import { describe, expect, it, vi } from 'vitest';
import { cloneState } from '../../../../src/core/state/store.js';
import { sanitizeState } from '../../../../src/core/persistence/storage.js';

describe('Storage and Store branch coverage precision', () => {
  it('covers fallback when structuredClone is undefined in environment', () => {
    const originalStructuredClone = globalThis.structuredClone;
    try {
      delete globalThis.structuredClone;
      const copy = cloneState({ test: 'fallback' });
      expect(copy).toEqual({ test: 'fallback' });
    } finally {
      globalThis.structuredClone = originalStructuredClone;
    }
  });

  it('covers sanitizeState when candidate sub-object property is not an object or is an array', () => {
    // defaultState.settings is an object: test when candidate.settings is a primitive or array
    const candidateWithPrimitiveSubObject = {
      settings: 'invalid_settings_primitive',
    };
    const sanitized1 = sanitizeState(candidateWithPrimitiveSubObject);
    expect(sanitized1.settings.theme).toBe('light');

    const candidateWithArraySubObject = {
      settings: ['not', 'an', 'object'],
    };
    const sanitized2 = sanitizeState(candidateWithArraySubObject);
    expect(sanitized2.settings.theme).toBe('light');

    // defaultState.completedLessons is an array: test when candidate.completedLessons is a non-array object
    const candidateWithNonArrayCompletedLessons = {
      completedLessons: { not: 'an array' },
    };
    const sanitized3 = sanitizeState(candidateWithNonArrayCompletedLessons);
    expect(sanitized3.completedLessons).toEqual([]);
  });
});
