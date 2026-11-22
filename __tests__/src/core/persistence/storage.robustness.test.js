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

  describe('Security, immutability, and invariant guards', () => {
    it('strips prototype-pollution keys and clamps negative or invalid numeric/theme values in sanitizeState', () => {
      const malicious = JSON.parse(
        '{"xp":-50,"level":0,"daysStreak":-4,"settings":{"theme":"neon","__proto__":{"polluted":true},"constructor":"bad"},"tenseStats":{"__proto__":{"x":1},"present_simple":{"correct":2,"total":3}}}',
      );
      const sanitized = sanitizeState(malicious);

      expect(sanitized.xp).toBe(0);
      expect(sanitized.level).toBe(1);
      expect(sanitized.daysStreak).toBe(0);
      expect(sanitized.settings.theme).toBe('light');
      expect({}.polluted).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(sanitized.settings, 'constructor')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(sanitized.tenseStats, '__proto__')).toBe(false);
      expect(sanitized.tenseStats.present_simple).toEqual({ correct: 2, total: 3 });
    });

    it('guards addXP against NaN and negative amounts', () => {
      const store = createStore({ xp: 50, level: 1 });
      store.addXP(-100);
      expect(store.getState().xp).toBe(50);
      store.addXP(Number.NaN);
      expect(store.getState().xp).toBe(50);
      store.addXP(60);
      expect(store.getState().xp).toBe(110);
      expect(store.getState().level).toBe(2);
    });

    it('mergeStates recovers from corrupted local lastActiveDate and isolates spacedRepetition objects', async () => {
      const { mergeStates } = await import('../../../../src/core/state/store.js');
      const local = {
        ...defaultState,
        lastActiveDate: 'not-a-valid-date',
        spacedRepetition: {
          present_simple: { interval: 1, nextReview: 1000, ease: 2.5, errors: 1 },
        },
      };
      const remote = {
        ...defaultState,
        lastActiveDate: '2026-05-01T10:00:00.000Z',
        spacedRepetition: {
          past_simple: { interval: 3, nextReview: 5000, ease: 2.6, errors: 0 },
        },
      };

      const merged = mergeStates(local, remote);
      expect(merged.lastActiveDate).toBe('2026-05-01T10:00:00.000Z');

      // Mutating merged spacedRepetition must not mutate source objects
      merged.spacedRepetition.present_simple.interval = 999;
      merged.spacedRepetition.past_simple.interval = 888;
      expect(local.spacedRepetition.present_simple.interval).toBe(1);
      expect(remote.spacedRepetition.past_simple.interval).toBe(3);
    });

    it('selectors handle malformed or zero-total entries without NaN or throwing', async () => {
      const { getWeakPoints, getReviewQueue } =
        await import('../../../../src/core/state/selectors.js');
      expect(getWeakPoints(null)).toEqual([]);
      expect(
        getWeakPoints({
          tenseStats: {
            broken: null,
            zero: { correct: 0, total: 0 },
            few: { correct: 0, total: 2 },
            weak: { correct: 1, total: 5 },
          },
        }),
      ).toEqual([{ tenseId: 'weak', accuracy: 0.2, total: 5, errors: 4 }]);

      expect(getReviewQueue(null)).toEqual([]);
      expect(
        getReviewQueue(
          {
            spacedRepetition: {
              broken: null,
              badDate: { nextReview: Number.NaN },
              due: { nextReview: 100, interval: 1 },
              later: { nextReview: 999999, interval: 10 },
            },
          },
          500,
        ),
      ).toEqual([{ tenseId: 'due', nextReview: 100, interval: 1 }]);
    });

    it('deeply sanitizes tenseStats, spacedRepetition bounds, deduplicates arrays, and guards mergeStates/recordAnswer', async () => {
      const { mergeStates, MAX_SRS_EASE, MAX_SRS_INTERVAL_MINUTES } =
        await import('../../../../src/core/state/store.js');

      const sanitized = sanitizeState({
        lastActiveDate: 'not-a-date',
        completedLessons: ['l_present_simple', 'l_present_simple'],
        favorites: ['verb_go', 'verb_go'],
        tenseStats: {
          broken: null,
          present_simple: { correct: 10, total: 4 },
          past_simple: { correct: -2, total: -5 },
        },
        spacedRepetition: {
          broken: 'nope',
          present_simple: { interval: 9999999, ease: 99, nextReview: -10, errors: -3 },
        },
        errorLog: [{ tenseId: 'present_simple', date: 123, extra: 'drop' }],
        activityLog: [{ date: '2026-11-22T00:00:00.000Z', xp: 15, extra: 'drop' }],
      });

      expect(sanitized.lastActiveDate).toBeNull();
      expect(sanitized.completedLessons).toEqual(['l_present_simple']);
      expect(sanitized.favorites).toEqual(['verb_go']);
      expect(sanitized.tenseStats).toEqual({
        present_simple: { correct: 10, total: 10 },
        past_simple: { correct: 0, total: 0 },
      });
      expect(sanitized.spacedRepetition).toEqual({
        present_simple: {
          interval: MAX_SRS_INTERVAL_MINUTES,
          ease: MAX_SRS_EASE,
          nextReview: 0,
          errors: 0,
        },
      });
      expect(sanitized.errorLog[0].extra).toBeUndefined();
      expect(sanitized.activityLog[0].extra).toBeUndefined();

      // mergeStates strips forbidden keys
      const pollutedRemote = JSON.parse(
        '{"tenseStats":{"__proto__":{"correct":9,"total":9},"present_simple":{"correct":1,"total":2}},"spacedRepetition":{"constructor":{"interval":1,"nextReview":1}}}',
      );
      const merged = mergeStates(defaultState, pollutedRemote);
      expect(Object.prototype.hasOwnProperty.call(merged.tenseStats, '__proto__')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(merged.spacedRepetition, 'constructor')).toBe(
        false,
      );

      // recordAnswer ignores forbidden/empty tenseIds and rounds ease cleanly without float drift
      const store = createStore();
      store.recordAnswer('__proto__', true);
      store.recordAnswer('', false);
      expect(store.getState().totalExercises).toBe(0);

      store.recordAnswer('present_simple', false);
      store.recordAnswer('present_simple', false);
      expect(store.getState().spacedRepetition.present_simple.ease).toBe(2.1);
    });
  });
});
