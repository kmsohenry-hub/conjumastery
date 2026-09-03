import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore, defaultState, MAX_ERROR_LOG_ENTRIES, mergeStates } from '../../../src/core/state/store.js';
import { saveState } from '../../../src/core/persistence/storage.js';
import { State, setupStorageSync } from '../../../src/core/state/State.js';
import { validateImportedState } from '../../../app.js';
import { renderDashboardStats } from '../../../src/ui/pages/dashboard.js';

describe('Reliability, Quotas & Multi-tab Sync (Issues #105, #110, #109)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Issue #105: errorLog retention & save failure handling', () => {
    it('caps errorLog entries to MAX_ERROR_LOG_ENTRIES when answering incorrectly repeatedly', () => {
      const store = createStore();
      for (let i = 0; i < MAX_ERROR_LOG_ENTRIES + 50; i++) {
        store.recordAnswer('present_simple', false);
      }
      expect(store.getState().errorLog.length).toBe(MAX_ERROR_LOG_ENTRIES);
      expect(store.getState().incorrectAnswers).toBe(MAX_ERROR_LOG_ENTRIES + 50);
    });

    it('returns false from saveState on QuotaExceededError and dispatches save-error event from State.save()', () => {
      const quotaError = new Error('QuotaExceededError: DOM Exception 22');
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw quotaError;
      });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = saveState('test_key', { xp: 10 });
      expect(result).toBe(false);

      const eventSpy = vi.fn();
      window.addEventListener('conjumaster:save-error', eventSpy);

      const savedSuccess = State.save();
      expect(savedSuccess).toBe(false);
      expect(eventSpy).toHaveBeenCalled();
      window.removeEventListener('conjumaster:save-error', eventSpy);
    });

    it('returns true from saveState on normal write', () => {
      expect(saveState('test_key', { xp: 10 })).toBe(true);
    });
  });

  describe('Issue #110: Validation of imported global counters vs detailed statistics', () => {
    it('corrects impossible correctAnswers > totalExercises relations', () => {
      const raw = {
        totalExercises: 1,
        correctAnswers: 99,
        incorrectAnswers: 10,
      };
      const cleaned = validateImportedState(raw);
      expect(cleaned.correctAnswers).toBe(99);
      expect(cleaned.totalExercises).toBeGreaterThanOrEqual(99 + 10);
      expect(cleaned.correctAnswers).toBeLessThanOrEqual(cleaned.totalExercises);

      // Verify dashboard calculation stays bounded 0-100%
      document.body.innerHTML = `
        <div id="dashXP"></div>
        <div id="dashLevel"></div>
        <div id="dashExercises"></div>
        <div id="dashAccuracy"></div>
      `;
      renderDashboardStats(cleaned);
      const accText = document.getElementById('dashAccuracy').textContent;
      const accNum = parseInt(accText, 10);
      expect(accNum).toBeLessThanOrEqual(100);
      expect(accNum).toBeGreaterThanOrEqual(0);
    });

    it('reconciles global counters with tenseStats when tenseStats totals exceed globals', () => {
      const raw = {
        totalExercises: 5,
        correctAnswers: 2,
        incorrectAnswers: 3,
        tenseStats: {
          present_simple: { correct: 10, total: 15 },
          past_simple: { correct: 5, total: 8 },
        },
      };
      const cleaned = validateImportedState(raw);
      expect(cleaned.correctAnswers).toBeGreaterThanOrEqual(15);
      expect(cleaned.totalExercises).toBeGreaterThanOrEqual(23);
      expect(cleaned.correctAnswers + cleaned.incorrectAnswers).toBeLessThanOrEqual(cleaned.totalExercises);
    });

    it('enforces bestStreak >= currentStreak', () => {
      const raw = {
        bestStreak: 2,
        currentStreak: 10,
      };
      const cleaned = validateImportedState(raw);
      expect(cleaned.bestStreak).toBe(10);
      expect(cleaned.currentStreak).toBe(10);
    });
  });

  describe('Issue #109: Multi-tab state synchronization & conflict resolution', () => {
    it('merges states deterministically preserving highest progress and union of sets', () => {
      const stateA = {
        ...defaultState,
        xp: 150,
        level: 2,
        totalExercises: 10,
        correctAnswers: 8,
        incorrectAnswers: 2,
        currentStreak: 5,
        bestStreak: 5,
        completedLessons: ['l_present_simple'],
        favorites: ['present_simple'],
        tenseStats: {
          present_simple: { correct: 8, total: 10 },
        },
      };

      const stateB = {
        ...defaultState,
        xp: 220,
        level: 3,
        totalExercises: 12,
        correctAnswers: 10,
        incorrectAnswers: 2,
        currentStreak: 7,
        bestStreak: 7,
        completedLessons: ['l_present_continuous'],
        favorites: ['verb_go'],
        tenseStats: {
          present_simple: { correct: 7, total: 9 },
          past_simple: { correct: 3, total: 3 },
        },
      };

      const merged = mergeStates(stateA, stateB);
      expect(merged.xp).toBe(220);
      expect(merged.level).toBe(3);
      expect(merged.completedLessons).toEqual(['l_present_simple', 'l_present_continuous']);
      expect(merged.favorites).toEqual(['present_simple', 'verb_go']);
      expect(merged.tenseStats.present_simple).toEqual({ correct: 8, total: 10 });
      expect(merged.tenseStats.past_simple).toEqual({ correct: 3, total: 3 });
    });

    it('synchronizes State on storage event from another tab without losing local data', () => {
      State.init();
      setupStorageSync();

      State.data = {
        ...State.data,
        xp: 50,
        completedLessons: ['l_present_simple'],
      };

      const incomingState = {
        ...defaultState,
        xp: 120,
        completedLessons: ['l_past_simple'],
        favorites: ['verb_be'],
      };

      const storageEvent = new window.StorageEvent('storage', {
        key: 'conjumaster_data',
        newValue: JSON.stringify({ version: 1, data: incomingState }),
      });
      window.dispatchEvent(storageEvent);

      expect(State.data.xp).toBe(120);
      expect(State.data.completedLessons).toContain('l_present_simple');
      expect(State.data.completedLessons).toContain('l_past_simple');
      expect(State.data.favorites).toContain('verb_be');
    });
  });
});
