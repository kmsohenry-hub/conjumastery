import { beforeEach, describe, expect, it, vi } from 'vitest';

const { renderers } = vi.hoisted(() => ({
  renderers: Object.fromEntries(
    [
      ['dashboard', 'renderDashboard'],
      ['lessons', 'renderLessons'],
      ['exercises', 'resetExerciseUI'],
      ['test', 'renderTestSetup'],
      ['tenses', 'renderTenses'],
      ['comparison', 'renderComparison'],
      ['verbs', 'renderVerbs'],
      ['revision', 'renderRevision'],
      ['weakpoints', 'renderWeakpoints'],
      ['search', 'performGlobalSearch'],
      ['favorites', 'renderFavorites'],
      ['stats', 'renderStats'],
    ].map(([key]) => [key, vi.fn()]),
  ),
}));

vi.mock('../../../src/ui/pages/dashboard.js', () => ({ renderDashboard: renderers.dashboard }));
vi.mock('../../../src/ui/pages/lessons.js', () => ({ renderLessons: renderers.lessons }));
vi.mock('../../../src/ui/pages/exercises.js', () => ({ resetExerciseUI: renderers.exercises }));
vi.mock('../../../src/ui/pages/test.js', () => ({ renderTestSetup: renderers.test }));
vi.mock('../../../src/ui/pages/tenses.js', () => ({
  renderTenses: renderers.tenses,
  renderComparison: renderers.comparison,
}));
vi.mock('../../../src/ui/pages/verbs.js', () => ({ renderVerbs: renderers.verbs }));
vi.mock('../../../src/ui/pages/reviews.js', () => ({ renderRevision: renderers.revision }));
vi.mock('../../../src/ui/pages/weakpoints.js', () => ({ renderWeakpoints: renderers.weakpoints }));
vi.mock('../../../src/ui/pages/search.js', () => ({ performGlobalSearch: renderers.search }));
vi.mock('../../../src/ui/pages/favorites.js', () => ({ renderFavorites: renderers.favorites }));
vi.mock('../../../src/ui/pages/stats.js', () => ({ renderStats: renderers.stats }));

import {
  closeModal,
  navigateTo,
  setTheme,
  toggleSidebar,
  toggleTheme,
} from '../../../src/ui/navigation.js';

function buildShell() {
  document.body.innerHTML = `
    <aside id="sidebar"></aside><div id="sidebarOverlay"></div><button id="themeBtn"></button>
    <div id="pageTitle"></div><div id="modalOverlay"></div>
    ${[
      'dashboard',
      'lessons',
      'exercises',
      'test',
      'tenses',
      'verbs',
      'comparison',
      'revision',
      'weakpoints',
      'search',
      'favorites',
      'stats',
      'settings',
    ]
      .map((page) => `<div class="page" id="page-${page}"></div>`)
      .join('')}
    ${['dashboard', 'lessons', 'settings'].map((page) => `<button class="nav-item" data-page="${page}"></button>`).join('')}
  `;
}

beforeEach(() => {
  buildShell();
  Object.values(renderers).forEach((fn) => fn.mockClear());
  document.documentElement.removeAttribute('data-theme');
  window.innerWidth = 1024;
});

describe('navigation', () => {
  it('activates the requested page, title and nav item', () => {
    navigateTo('lessons');
    expect(document.getElementById('page-lessons').classList.contains('active')).toBe(true);
    expect(document.getElementById('page-dashboard').classList.contains('active')).toBe(false);
    expect(document.getElementById('pageTitle').textContent).toBe('Leçons');
    expect(document.querySelector('[data-page="lessons"]').classList.contains('active')).toBe(true);
    expect(renderers.lessons).toHaveBeenCalledOnce();
  });

  it('routes supported pages to their renderers', () => {
    Object.keys(renderers).forEach((page) => navigateTo(page));
    Object.values(renderers).forEach((renderer) => expect(renderer).toHaveBeenCalled());
  });

  it('closes the mobile sidebar after navigation', () => {
    window.innerWidth = 600;
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('active');
    navigateTo('dashboard');
    expect(document.getElementById('sidebar').classList.contains('open')).toBe(false);
    expect(document.getElementById('sidebarOverlay').classList.contains('active')).toBe(false);
  });

  it('toggles sidebar and theme', () => {
    toggleSidebar();
    expect(document.getElementById('sidebar').classList.contains('open')).toBe(true);
    expect(document.getElementById('sidebarOverlay').classList.contains('active')).toBe(true);
    setTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.getElementById('themeBtn').textContent).toBe('☀️');
    toggleTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.getElementById('themeBtn').textContent).toBe('🌙');
  });

  it('closes the modal only when the overlay is clicked', () => {
    const overlay = document.getElementById('modalOverlay');
    const child = document.createElement('div');
    overlay.appendChild(child);
    overlay.classList.add('active');
    closeModal({ target: child });
    expect(overlay.classList.contains('active')).toBe(true);
    closeModal({ target: overlay });
    expect(overlay.classList.contains('active')).toBe(false);
  });
});
