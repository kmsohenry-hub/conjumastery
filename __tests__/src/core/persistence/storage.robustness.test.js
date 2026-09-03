import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadState,
  saveState,
  migrateState,
  sanitizeState,
  STORAGE_VERSION,
} from '../../../../src/core/persistence/storage.js';
import { defaultState, createStore } from '../../../../src/core/state/store.js';
import { State } from '../../../../src/core/state/State.js';

describe('Storage and State Robustness (Issues #103, #108, #112)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Issue #108: Immutability of defaultState and clean reset', () => {
    it('guarantees defaultState is frozen and unaffected by store state mutations', () => {
      const store = createStore();
      expect(Object.isFrozen(defaultState)).toBe(true);
      expect(Object.isFrozen(defaultState.settings)).toBe(true);

      // Mutate store state
      store.getState().settings.theme = 'dark';
      expect(defaultState.settings.theme).toBe('light');

      // Reset must yield a clean default copy
      store.reset();
      expect(store.getState().settings.theme).toBe('light');
    });

    it('clones initial options without referencing mutable arrays or objects', () => {
      const customInitial = {
        completedLessons: ['lesson-1'],
        settings: { theme: 'dark' },
      };
      const store = createStore(customInitial);
      customInitial.completedLessons.push('lesson-2');
      customInitial.settings.theme = 'light';

      expect(store.getState().completedLessons).toEqual(['lesson-1']);
      expect(store.getState().settings.theme).toBe('dark');
    });
  });

  describe('Issue #103: Recovery from structurally invalid localStorage state', () => {
    it('recovers gracefully and sanitizes null or corrupt settings during State.init()', () => {
      // Simulate corrupted localStorage payload
      localStorage.setItem(
        'conjumaster_data',
        JSON.stringify({
          version: 1,
          data: {
            settings: null,
            tenseStats: null,
            favorites: null,
            xp: 'invalid_number',
          },
        }),
      );

      expect(() => State.init()).not.toThrow();
      expect(State.data.settings).toBeDefined();
      expect(State.data.settings.theme).toBe('light');
      expect(State.data.tenseStats).toEqual({});
      expect(State.data.favorites).toEqual([]);
    });

    it('handles non-object inputs in sanitizeState safely', () => {
      expect(sanitizeState(null)).toEqual(defaultState);
      expect(sanitizeState('string')).toEqual(defaultState);
      expect(sanitizeState([1, 2, 3])).toEqual(defaultState);
    });

    it('sanitizes sub-objects and retains valid properties while filling missing ones', () => {
      const candidate = {
        xp: 150,
        settings: { custom: true }, // theme is missing
        unknownField: 'ignored',
      };
      const sanitized = sanitizeState(candidate);
      expect(sanitized.xp).toBe(150);
      expect(sanitized.settings.theme).toBe('light');
      expect(sanitized.settings.custom).toBe(true);
    });
  });

  describe('Issue #112: Versioned persistence format and migrations', () => {
    it('migrates legacy unversioned raw state (version 0) to version 1 schema', () => {
      const legacyRaw = {
        xp: 250,
        level: 3,
        settings: { theme: 'dark' },
      };

      const migrated = migrateState(legacyRaw);
      expect(migrated.xp).toBe(250);
      expect(migrated.level).toBe(3);
      expect(migrated.settings.theme).toBe('dark');
      expect(migrated.tenseStats).toEqual({});
    });

    it('loads versioned payload correctly with loadState', () => {
      const payload = {
        version: STORAGE_VERSION,
        data: {
          xp: 500,
          settings: { theme: 'dark' },
        },
      };
      localStorage.setItem('versioned_key', JSON.stringify(payload));

      const loaded = loadState('versioned_key');
      expect(loaded.xp).toBe(500);
      expect(loaded.settings.theme).toBe('dark');
    });

    it('handles future versions gracefully with fallback and warning', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const futurePayload = {
        version: 99,
        data: {
          xp: 1000,
          settings: { theme: 'dark' },
        },
      };

      const migrated = migrateState(futurePayload);
      expect(migrated.xp).toBe(1000);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('saves versioned format by default in saveState', () => {
      saveState('test_save', { xp: 80 });
      const rawInStorage = JSON.parse(localStorage.getItem('test_save'));
      expect(rawInStorage.version).toBe(STORAGE_VERSION);
      expect(rawInStorage.data.xp).toBe(80);
    });

    it('returns defaultState if migrateState receives invalid input', () => {
      expect(migrateState(null)).toEqual(defaultState);
      expect(migrateState(undefined)).toEqual(defaultState);
      expect(migrateState([1, 2])).toEqual(defaultState);
    });
  });
});
