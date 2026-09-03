import { beforeEach, describe, expect, test, vi } from 'vitest';
import { loadState, saveState, STORAGE_VERSION } from '../../../../src/core/persistence/storage.js';
import { defaultState } from '../../../../src/core/state/store.js';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('saves and loads JSON state under versioned format', () => {
    const state = { xp: 120, favorites: ['go'] };
    saveState('state', state);
    expect(localStorage.getItem('state')).toBe(
      JSON.stringify({ version: STORAGE_VERSION, data: state }),
    );
    const loaded = loadState('state');
    expect(loaded.xp).toBe(120);
    expect(loaded.favorites).toEqual(['go']);
    // Sub-objects are populated with defaults
    expect(loaded.settings).toEqual(defaultState.settings);
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
    expect(setItem).toHaveBeenCalledWith(
      'state',
      JSON.stringify({ version: STORAGE_VERSION, data: { xp: 1 } }),
    );
  });
});
