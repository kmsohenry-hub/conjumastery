import { beforeEach, describe, expect, test, vi } from 'vitest';
import { loadState, saveState } from '../../../../src/core/persistence/storage.js';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('saves and loads JSON state', () => {
    const state = { xp: 120, favorites: ['go'] };
    saveState('state', state);
    expect(localStorage.getItem('state')).toBe(JSON.stringify(state));
    expect(loadState('state')).toEqual(state);
  });

  test('returns null when no saved state exists', () => {
    expect(loadState('missing')).toBeNull();
  });

  test('returns null and logs when saved JSON is invalid', () => {
    localStorage.setItem('broken', '{not-json');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(loadState('broken')).toBeNull();
    expect(error).toHaveBeenCalledOnce();
  });

  test('does not throw when storage read fails', () => {
    const getItem = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('read failed');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(loadState('state')).toBeNull();
    expect(getItem).toHaveBeenCalledWith('state');
  });

  test('does not throw when storage write fails', () => {
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('write failed');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => saveState('state', { xp: 1 })).not.toThrow();
    expect(setItem).toHaveBeenCalledWith('state', JSON.stringify({ xp: 1 }));
  });
});
