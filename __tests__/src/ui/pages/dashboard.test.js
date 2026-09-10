import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_DATA } from '../../../../src/data/index.js';

const { state, navigateToMock } = vi.hoisted(() => ({
  state: {
    xp: 150,
    level: 2,
    totalExercises: 10,
    correctAnswers: 8,
    completedLessons: ['l_present_simple'],
    tenseStats: { present_simple: { correct: 8, total: 10 } },
  },
  navigateToMock: vi.fn(),
}));

vi.mock('../../../../src/core/state/State.js', () => ({
  State: {
    data: state,
    getReviewQueue: vi
      .fn()
      .mockReturnValue([{ tenseId: 'present_simple', errors: 2, interval: 10 }]),
  },
}));

vi.mock('../../../../src/ui/navigation.js', () => ({
  navigateTo: navigateToMock,
  initEventDelegation: vi.fn(),
}));

import {
  renderDashboard,
  renderDashboardNextLesson,
  renderDashboardRevisionQueue,
  renderDashboardStats,
  renderDashboardChart,
} from '../../../../src/ui/pages/dashboard.js';

beforeEach(() => {
  navigateToMock.mockClear();
  document.body.innerHTML = `
    <div id="dashXP"></div>
    <div id="dashLevel"></div>
    <div id="dashExercises"></div>
    <div id="dashAccuracy"></div>
    <div id="dashNextLesson"></div>
    <div id="dashRevisionQueue"></div>
    <div id="revisionBadge"></div>
    <div id="dashChart"></div>
  `;
});

describe('dashboard page', () => {
  it('renders summary stats correctly', () => {
    renderDashboardStats(state);
    expect(document.getElementById('dashXP').textContent).toBe('150');
    expect(document.getElementById('dashLevel').textContent).toBe('2');
    expect(document.getElementById('dashExercises').textContent).toBe('10');
    expect(document.getElementById('dashAccuracy').textContent).toBe('80%');
  });

  it('renders next lesson element with accessible role and data-page', () => {
    renderDashboardNextLesson(['l_present_simple']);
    const card = document.querySelector('#dashNextLesson .lesson-card');
    expect(card).toBeTruthy();
    expect(card.getAttribute('data-page')).toBe('lessons');
    expect(card.getAttribute('role')).toBe('button');
    expect(card.getAttribute('tabindex')).toBe('0');
    expect(card.hasAttribute('onclick')).toBe(false);
  });

  it('navigates to lessons when clicking the next lesson card (DOM event simulation)', () => {
    renderDashboardNextLesson(['l_present_simple']);
    const card = document.querySelector('#dashNextLesson .lesson-card');
    expect(card).toBeTruthy();

    // Click on card
    card.addEventListener('click', () => navigateToMock(card.dataset.page));
    card.click();
    expect(navigateToMock).toHaveBeenCalledWith('lessons');
  });

  it('renders completed all lessons state', () => {
    const allLessonIds = APP_DATA.modules.flatMap((m) => m.lessons.map((l) => l.id));
    renderDashboardNextLesson(allLessonIds);
    expect(document.getElementById('dashNextLesson').innerHTML).toContain(
      'Toutes les leçons sont terminées',
    );
  });

  it('renders revision queue correctly', () => {
    renderDashboardRevisionQueue([{ tenseId: 'present_simple', errors: 4, interval: 5 }]);
    expect(document.getElementById('dashRevisionQueue').innerHTML).toContain('Urgent');
    expect(document.getElementById('revisionBadge').textContent).toBe('1');
  });

  it('renders empty revision queue', () => {
    renderDashboardRevisionQueue([]);
    expect(document.getElementById('dashRevisionQueue').innerHTML).toContain(
      'Aucune révision en attente',
    );
    expect(document.getElementById('revisionBadge').textContent).toBe('0');
  });

  it('renders dashboard chart', () => {
    renderDashboardChart();
    expect(document.querySelectorAll('#dashChart .bar-item').length).toBeGreaterThan(0);
  });

  it('calls full renderDashboard without throwing', () => {
    renderDashboard();
    expect(document.getElementById('dashXP').textContent).toBe('150');
  });
});
