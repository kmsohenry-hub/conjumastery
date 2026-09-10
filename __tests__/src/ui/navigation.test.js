import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mocks } = vi.hoisted(() => {
  const names = [
    'cancelTest', 'renderDashboard', 'renderLessons', 'openLesson', 'showModule',
    'resetExerciseUI', 'restartExercise', 'startExerciseForLesson', 'startExerciseForTense',
    'selectOption', 'validateExercise', 'nextExercise', 'skipExercise', 'exitExercise',
    'renderTestSetup', 'startTest', 'selectTestOption', 'validateTestAnswer', 'nextTestQuestion',
    'renderTenses', 'renderComparison', 'showTenseCategory', 'showComparison', 'openTenseModal',
    'renderVerbs', 'filterVerbs', 'toggleVerbCard', 'renderRevision', 'startRevisionSession',
    'renderWeakpoints', 'performGlobalSearch', 'renderFavorites', 'toggleFav', 'renderStats',
  ];
  return { mocks: Object.fromEntries(names.map((name) => [name, vi.fn()])) };
});

vi.mock('../../../src/ui/pages/dashboard.js', () => ({ renderDashboard: mocks.renderDashboard }));
vi.mock('../../../src/ui/pages/lessons.js', () => ({ renderLessons: mocks.renderLessons, openLesson: mocks.openLesson, showModule: mocks.showModule }));
vi.mock('../../../src/ui/pages/exercises.js', () => ({
  resetExerciseUI: mocks.resetExerciseUI, restartExercise: mocks.restartExercise,
  startExerciseForLesson: mocks.startExerciseForLesson, startExerciseForTense: mocks.startExerciseForTense,
  selectOption: mocks.selectOption, validateExercise: mocks.validateExercise, nextExercise: mocks.nextExercise,
  skipExercise: mocks.skipExercise, exitExercise: mocks.exitExercise,
}));
vi.mock('../../../src/ui/pages/test.js', () => ({
  renderTestSetup: mocks.renderTestSetup, startTest: mocks.startTest,
  selectOption: mocks.selectTestOption, validateTestAnswer: mocks.validateTestAnswer,
  nextTestQuestion: mocks.nextTestQuestion, cancelTest: mocks.cancelTest,
}));
vi.mock('../../../src/ui/pages/tenses.js', () => ({ renderTenses: mocks.renderTenses, renderComparison: mocks.renderComparison, showTenseCategory: mocks.showTenseCategory, showComparison: mocks.showComparison, openTenseModal: mocks.openTenseModal }));
vi.mock('../../../src/ui/pages/verbs.js', () => ({ renderVerbs: mocks.renderVerbs, filterVerbs: mocks.filterVerbs, toggleVerbCard: mocks.toggleVerbCard }));
vi.mock('../../../src/ui/pages/reviews.js', () => ({ renderRevision: mocks.renderRevision, startRevisionSession: mocks.startRevisionSession }));
vi.mock('../../../src/ui/pages/weakpoints.js', () => ({ renderWeakpoints: mocks.renderWeakpoints }));
vi.mock('../../../src/ui/pages/search.js', () => ({ performGlobalSearch: mocks.performGlobalSearch }));
vi.mock('../../../src/ui/pages/favorites.js', () => ({ renderFavorites: mocks.renderFavorites, toggleFav: mocks.toggleFav }));
vi.mock('../../../src/ui/pages/stats.js', () => ({ renderStats: mocks.renderStats }));

import { closeModal, closeModalDirect, navigateTo, openModal, setTheme, toggleSidebar, toggleTheme } from '../../../src/ui/navigation.js';

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = `
    <aside id="sidebar"></aside><div id="sidebarOverlay"></div><button id="themeBtn"></button><div id="pageTitle"></div>
    <div id="modalOverlay" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div id="modalContent">
      <div id="modalTitle">Titre</div><button id="modalBtnFirst">✕</button><button id="modalBtnSecond">OK</button>
    </div></div>
    ${['dashboard','lessons','exercises','test','tenses','verbs','comparison','revision','weakpoints','search','favorites','stats','settings'].map((p) => `<div class="page" id="page-${p}"></div>`).join('')}
    <button class="nav-item" data-page="dashboard"></button><button class="nav-item" data-page="lessons"></button>
  `;
  Object.values(mocks).forEach((fn) => fn.mockClear());
  document.documentElement.removeAttribute('data-theme');
  window.innerWidth = 1024;
});

describe('navigation', () => {
  it('activates a page and its navigation state', () => {
    navigateTo('lessons');
    expect(document.getElementById('page-lessons').classList.contains('active')).toBe(true);
    expect(document.getElementById('page-dashboard').classList.contains('active')).toBe(false);
    expect(document.getElementById('pageTitle').textContent).toBe('Leçons');
    expect(document.querySelector('[data-page="lessons"]').classList.contains('active')).toBe(true);
    expect(document.querySelector('[data-page="lessons"]').getAttribute('aria-current')).toBe('page');
    expect(document.querySelector('[data-page="dashboard"]').hasAttribute('aria-current')).toBe(false);
  });

  it('routes every supported page to the matching renderer', () => {
    const routes = { dashboard: 'renderDashboard', lessons: 'renderLessons', exercises: 'resetExerciseUI', test: 'renderTestSetup', tenses: 'renderTenses', verbs: 'renderVerbs', comparison: 'renderComparison', revision: 'renderRevision', weakpoints: 'renderWeakpoints', search: 'performGlobalSearch', favorites: 'renderFavorites', stats: 'renderStats' };
    for (const [page, mockName] of Object.entries(routes)) navigateTo(page);
    for (const mockName of Object.values(routes)) expect(mocks[mockName]).toHaveBeenCalled();
  });

  it('handles settings and unknown destinations without throwing', () => {
    expect(() => navigateTo('settings')).not.toThrow();
    expect(document.getElementById('pageTitle').textContent).toBe('Paramètres');
    expect(() => navigateTo('future-page')).not.toThrow();
    expect(document.getElementById('pageTitle').textContent).toBe('future-page');
  });

  it('cancels an active test only when leaving test navigation', () => {
    navigateTo('test');
    mocks.cancelTest.mockClear();
    navigateTo('dashboard');
    expect(mocks.cancelTest).toHaveBeenCalledOnce();
    mocks.cancelTest.mockClear();
    navigateTo('test');
    expect(mocks.cancelTest).not.toHaveBeenCalled();
  });

  it('closes the mobile sidebar after navigation', () => {
    window.innerWidth = 600;
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('active');
    navigateTo('dashboard');
    expect(document.getElementById('sidebar').classList.contains('open')).toBe(false);
    expect(document.getElementById('sidebarOverlay').classList.contains('active')).toBe(false);
  });

  it('toggles sidebar and theme deterministically', () => {
    toggleSidebar(); expect(document.getElementById('sidebar').classList.contains('open')).toBe(true);
    setTheme('dark'); expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.getElementById('themeBtn').textContent).toBe('☀️');
    toggleTheme(); expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.getElementById('themeBtn').textContent).toBe('🌙');
  });

  it('supports keyboard activation without interfering with native buttons', () => {
    const card = document.createElement('div');
    card.setAttribute('role', 'button'); card.setAttribute('tabindex', '0');
    const clickSpy = vi.fn(); card.addEventListener('click', clickSpy); document.body.appendChild(card);
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    expect(clickSpy).toHaveBeenCalledTimes(2);

    const button = document.createElement('button'); const nativeSpy = vi.fn(); button.addEventListener('click', nativeSpy); document.body.appendChild(button);
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(nativeSpy).not.toHaveBeenCalled();
  });

  it('closes a modal from the overlay and restores the trigger focus', () => {
    const trigger = document.createElement('button'); document.body.appendChild(trigger); trigger.focus(); openModal();
    const overlay = document.getElementById('modalOverlay'); overlay.classList.add('active');
    const child = document.createElement('span'); overlay.appendChild(child);
    closeModal({ target: child }); expect(overlay.classList.contains('active')).toBe(true);
    closeModal({ target: overlay }); expect(overlay.classList.contains('active')).toBe(false);
    closeModalDirect(); expect(document.activeElement).toBe(trigger);
  });

  it('traps modal focus and handles Escape', () => {
    const trigger = document.createElement('button'); document.body.appendChild(trigger); trigger.focus(); openModal();
    const first = document.getElementById('modalBtnFirst'); const last = document.getElementById('modalBtnSecond');
    vi.advanceTimersByTime(50); expect(document.activeElement).toBe(first);
    last.focus(); let event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }); window.dispatchEvent(event);
    expect(document.activeElement).toBe(first); expect(event.defaultPrevented).toBe(true);
    first.focus(); event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }); window.dispatchEvent(event);
    expect(document.activeElement).toBe(last); expect(event.defaultPrevented).toBe(true);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.getElementById('modalOverlay').classList.contains('active')).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('delegates action and keyboard events through data contracts', () => {
    const cases = [
      ['toggle-verb', { index: '2' }, 'toggleVerbCard'],
      ['open-tense-modal', { tenseId: 'present_simple' }, 'openTenseModal'],
      ['show-tense-category', { catId: 'past' }, 'showTenseCategory'],
      ['show-comparison', { compId: 'past' }, 'showComparison'],
      ['select-option', { index: '1' }, 'selectOption'],
      ['select-test-option', { index: '2' }, 'selectTestOption'],
      ['show-module', { index: '3' }, 'showModule'],
      ['open-lesson', { lessonId: 'lesson-1', tenseId: 'past_simple' }, 'openLesson'],
      ['start-lesson', { lessonId: 'lesson-1' }, 'startExerciseForLesson'],
      ['start-tense', { tenseId: 'past_simple' }, 'startExerciseForTense'],
      ['start-revision', {}, 'startRevisionSession'],
    ];
    for (const [action, data, mockName] of cases) {
      const el = document.createElement('button'); el.dataset.action = action;
      Object.entries(data).forEach(([key, value]) => { el.dataset[key] = value; }); document.body.appendChild(el); el.click();
      expect(mocks[mockName]).toHaveBeenCalled();
    }
    const input = document.createElement('input'); input.id = 'exerciseInput'; document.body.appendChild(input); input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const testInput = document.createElement('input'); testInput.id = 'testInput'; document.body.appendChild(testInput); testInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(mocks.validateExercise).toHaveBeenCalled(); expect(mocks.validateTestAnswer).toHaveBeenCalled();
  });
});
