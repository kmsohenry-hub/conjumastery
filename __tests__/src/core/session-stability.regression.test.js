import { describe, expect, it, vi } from 'vitest';
import { APP_DATA } from '../../../src/data/index.js';
import { generateQuestions } from '../../../src/core/exercises/generator.js';
import { handleImportFile, validateImportedState } from '../../../app.js';
import {
  createStore,
  MAX_ACTIVITY_LOG_ENTRIES,
  MAX_ERROR_LOG_ENTRIES,
  MAX_SRS_EASE,
  MAX_SRS_INTERVAL_MINUTES,
} from '../../../src/core/state/store.js';
import { sanitizeState } from '../../../src/core/persistence/storage.js';
import { renderDashboardRevisionQueue } from '../../../src/ui/pages/dashboard.js';
import { renderRevision } from '../../../src/ui/pages/reviews.js';
import { renderWeakpoints } from '../../../src/ui/pages/weakpoints.js';
import { renderStats } from '../../../src/ui/pages/stats.js';
import { State } from '../../../src/core/state/State.js';

describe('session, special topics, persistence & SRS stability regressions', () => {
  it('generates non-empty revision and weakpoint questions for passive_voice and reported_speech', () => {
    const passiveOnly = generateQuestions('mixed', ['passive_voice'], 'intermediate', 5, true);
    expect(passiveOnly).toHaveLength(5);
    expect(passiveOnly.every((q) => q.tenseId === 'passive_voice')).toBe(true);
    expect(new Set(passiveOnly.map((q) => q.sentence)).size).toBe(5);

    const reportedOnly = generateQuestions('mixed', ['reported_speech'], 'intermediate', 5, false);
    expect(reportedOnly).toHaveLength(5);
    expect(reportedOnly.every((q) => q.tenseId === 'reported_speech')).toBe(true);
    expect(new Set(reportedOnly.map((q) => q.sentence)).size).toBe(5);

    const mixedQueue = generateQuestions(
      'mixed',
      ['passive_voice', 'reported_speech', 'present_simple'],
      'intermediate',
      3,
      true,
    );
    expect(mixedQueue.map((q) => q.tenseId)).toEqual([
      'passive_voice',
      'reported_speech',
      'present_simple',
    ]);
  });

  it('preserves passive_voice and reported_speech across backup import while clamping SRS and deduplicating arrays', () => {
    const imported = validateImportedState({
      version: 1,
      data: {
        xp: 120,
        completedLessons: ['l_present_simple', 'l_present_simple'],
        favorites: ['verb_go', 'verb_go'],
        tenseStats: {
          passive_voice: { correct: 4, total: 5 },
          reported_speech: { correct: 3, total: 5 },
          '<script>xss</script>': { correct: 1, total: 1 },
        },
        spacedRepetition: {
          passive_voice: { interval: 9999999, nextReview: 1000, ease: 99, errors: 1 },
          reported_speech: { interval: 1, nextReview: 2000, ease: 2.3, errors: 2 },
          malicious_id: { interval: 1, nextReview: 0, ease: 2.5, errors: 1 },
        },
        errorLog: [
          { tenseId: 'passive_voice', date: '2026-11-20T10:00:00.000Z', injected: true },
          { tenseId: 'reported_speech', date: '2026-11-20T10:05:00.000Z' },
          { tenseId: 'unknown_id', date: '2026-11-20T10:10:00.000Z' },
        ],
        activityLog: [{ date: '2026-11-20T10:00:00.000Z', xp: 20, injected: true }],
      },
    });

    expect(APP_DATA.specialTopicsById.passive_voice.nameFR).toBe('Voix Passive');
    expect(APP_DATA.specialTopicsById.reported_speech.nameFR).toBe('Discours Indirect');
    expect(imported.completedLessons).toEqual(['l_present_simple']);
    expect(imported.favorites).toEqual(['verb_go']);
    expect(imported.tenseStats.passive_voice).toEqual({ correct: 4, total: 5 });
    expect(imported.tenseStats.reported_speech).toEqual({ correct: 3, total: 5 });
    expect(imported.tenseStats['<script>xss</script>']).toBeUndefined();
    expect(imported.spacedRepetition.passive_voice.interval).toBe(MAX_SRS_INTERVAL_MINUTES);
    expect(imported.spacedRepetition.passive_voice.ease).toBe(MAX_SRS_EASE);
    expect(imported.spacedRepetition.reported_speech.errors).toBe(2);
    expect(imported.spacedRepetition.malicious_id).toBeUndefined();
    expect(imported.errorLog.map((e) => e.tenseId)).toEqual(['passive_voice', 'reported_speech']);
    expect(imported.errorLog[0].injected).toBeUndefined();
    expect(imported.activityLog[0].injected).toBeUndefined();
  });

  it('rejects oversized backup files and syncs theme immediately on valid import', () => {
    document.body.innerHTML = '<div id="toastContainer"></div>';
    document.documentElement.setAttribute('data-theme', 'light');

    handleImportFile({ size: 3 * 1024 * 1024 });
    expect(document.getElementById('toastContainer').textContent).toContain('trop volumineux');

    const originalFileReader = globalThis.FileReader;
    try {
      globalThis.FileReader = class MockReader {
        readAsText() {
          this.onload?.({
            target: {
              result: JSON.stringify({
                version: 1,
                data: { xp: 50, settings: { theme: 'dark' } },
              }),
            },
          });
        }
      };
      handleImportFile({ size: 128 });
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      globalThis.FileReader = class FailingReader {
        readAsText() {
          this.onerror?.(new Error('disk error'));
        }
      };
      handleImportFile({ size: 128 });
      expect(document.getElementById('toastContainer').textContent).toContain(
        'Impossible de lire le fichier',
      );
    } finally {
      globalThis.FileReader = originalFileReader;
      document.documentElement.setAttribute('data-theme', 'light');
    }
  });

  it('displays French labels instead of raw snake_case IDs for passive_voice and reported_speech across UI views', () => {
    document.body.innerHTML = `
      <div id="dashRevisionQueue"></div>
      <span id="revisionBadge"></span>
      <div id="revisionContent"></div>
      <div id="weakpointsContent"></div>
      <span id="statTotal"></span>
      <span id="statCorrect"></span>
      <span id="statIncorrect"></span>
      <span id="statStreak"></span>
      <div id="statsChart"></div>
      <div id="activityLog"></div>
      <div id="commonErrors"></div>
    `;

    State.reset();
    State.data = {
      ...State.data,
      tenseStats: {
        passive_voice: { correct: 1, total: 4 },
        reported_speech: { correct: 1, total: 4 },
      },
      spacedRepetition: {
        passive_voice: { interval: 1, nextReview: 0, ease: 2.3, errors: 2 },
        reported_speech: { interval: 1, nextReview: 0, ease: 2.3, errors: 1 },
      },
      errorLog: [
        { tenseId: 'passive_voice', date: '2026-11-20T10:00:00.000Z' },
        { tenseId: 'reported_speech', date: '2026-11-20T10:01:00.000Z' },
      ],
      activityLog: [{ date: 'invalid-date', xp: 10 }],
    };

    renderDashboardRevisionQueue(State.getReviewQueue());
    expect(document.getElementById('dashRevisionQueue').textContent).toContain('Voix Passive');
    expect(document.getElementById('dashRevisionQueue').textContent).toContain('Discours Indirect');
    expect(document.getElementById('dashRevisionQueue').textContent).not.toContain('passive_voice');

    renderRevision();
    expect(document.getElementById('revisionContent').textContent).toContain('Voix Passive');
    expect(document.getElementById('revisionContent').textContent).toContain('Discours Indirect');

    renderWeakpoints();
    expect(document.getElementById('weakpointsContent').textContent).toContain('Voix Passive');
    expect(document.getElementById('weakpointsContent').textContent).toContain('Discours Indirect');

    renderStats();
    expect(document.getElementById('commonErrors').textContent).toContain('Voix Passive');
    expect(document.getElementById('commonErrors').textContent).toContain('Discours Indirect');
    expect(document.getElementById('statsChart').innerHTML).toContain('Voix Passive');
    expect(document.getElementById('activityLog').textContent).toContain('—');
    expect(document.getElementById('activityLog').textContent).not.toContain('Invalid Date');
  });

  it('caps SRS ease and interval growth over many consecutive correct answers', () => {
    const store = createStore();
    for (let i = 0; i < 40; i++) {
      store.recordAnswer('present_simple', true);
    }
    const sr = store.getState().spacedRepetition.present_simple;
    expect(sr.ease).toBeLessThanOrEqual(MAX_SRS_EASE);
    expect(sr.interval).toBeLessThanOrEqual(MAX_SRS_INTERVAL_MINUTES);
    expect(Number.isFinite(sr.nextReview)).toBe(true);
  });

  it('sanitizes malformed array entries and caps logs in storage sanitizeState', () => {
    const oversizedErrors = Array.from({ length: MAX_ERROR_LOG_ENTRIES + 20 }, (_, i) => ({
      tenseId: `t_${i}`,
      date: '2026-11-20T10:00:00.000Z',
    }));
    const oversizedActivity = Array.from({ length: MAX_ACTIVITY_LOG_ENTRIES + 20 }, (_, i) => ({
      date: '2026-11-20T10:00:00.000Z',
      xp: i,
    }));

    const sanitized = sanitizeState({
      completedLessons: ['l_present_simple', 42, null, {}],
      favorites: ['verb_go', null, 123],
      errorLog: [null, 'broken', { missingTenseId: true }, ...oversizedErrors],
      activityLog: [null, { xp: 'NaN' }, ...oversizedActivity],
    });

    expect(sanitized.completedLessons).toEqual(['l_present_simple']);
    expect(sanitized.favorites).toEqual(['verb_go']);
    expect(sanitized.errorLog).toHaveLength(MAX_ERROR_LOG_ENTRIES);
    expect(sanitized.activityLog).toHaveLength(MAX_ACTIVITY_LOG_ENTRIES);
    expect(vi.fn).toBeTypeOf('function');
  });
});
