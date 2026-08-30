import { beforeEach, describe, expect, it, vi } from 'vitest';

const { state } = vi.hoisted(() => ({
  state: {
    totalExercises: 4,
    correctAnswers: 3,
    incorrectAnswers: 1,
    bestStreak: 3,
    tenseStats: { present_simple: { correct: 3, total: 4 } },
    activityLog: [
      { date: '2026-08-30T10:00:00.000Z', xp: 10 },
      { date: '2026-08-30T11:00:00.000Z', xp: 15 },
    ],
    errorLog: [{ tenseId: 'present_simple', date: '2026-08-30T11:00:00.000Z' }],
  },
}));

vi.mock('../../../../src/core/state/State.js', () => ({ State: { data: state } }));

import { renderStats } from '../../../../src/ui/pages/stats.js';

beforeEach(() => {
  state.tenseStats = { present_simple: { correct: 3, total: 4 } };
  state.activityLog = [
    { date: '2026-08-30T10:00:00.000Z', xp: 10 },
    { date: '2026-08-30T11:00:00.000Z', xp: 15 },
  ];
  state.errorLog = [{ tenseId: 'present_simple', date: '2026-08-30T11:00:00.000Z' }];
  document.body.innerHTML = '<div id="statTotal"></div><div id="statCorrect"></div><div id="statIncorrect"></div><div id="statStreak"></div><div id="statsChart"></div><div id="activityLog"></div><div id="commonErrors"></div>';
});

describe('stats page', () => {
  it('renders summary metrics', () => {
    renderStats();
    expect(document.getElementById('statTotal').textContent).toBe('4');
    expect(document.getElementById('statCorrect').textContent).toBe('3');
    expect(document.getElementById('statIncorrect').textContent).toBe('1');
    expect(document.getElementById('statStreak').textContent).toBe('3');
  });

  it('renders chart, activity and common errors', () => {
    renderStats();
    expect(document.querySelectorAll('#statsChart .bar-item')).toHaveLength(1);
    expect(document.getElementById('statsChart').textContent).toContain('75%');
    expect(document.querySelectorAll('#activityLog > div')).toHaveLength(2);
    expect(document.getElementById('commonErrors').textContent).toContain('1 erreur');
  });

  it('renders empty states', () => {
    state.tenseStats = {};
    state.activityLog = [];
    state.errorLog = [];
    renderStats();
    expect(document.getElementById('statsChart').textContent).toContain('Aucune donnée disponible');
    expect(document.getElementById('activityLog').textContent).toContain('Aucune activité récente');
    expect(document.getElementById('commonErrors').textContent).toContain('Aucune erreur enregistrée');
  });
});
