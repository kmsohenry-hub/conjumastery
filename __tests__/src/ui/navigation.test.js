import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mocks } = vi.hoisted(() => ({
  mocks: Object.fromEntries(
    [
      'cancelTest',
      'renderDashboard',
      'renderLessons',
      'openLesson',
      'showModule',
      'resetExerciseUI',
      'restartExercise',
      'startExercise',
      'startExerciseForLesson',
      'startExerciseForTense',
      'selectOption',
      'validateExercise',
      'nextExercise',
      'skipExercise',
      'exitExercise',
      'renderTestSetup',
      'startTest',
      'selectTestOption',
      'validateTestAnswer',
      'nextTestQuestion',
      'renderTenses',
      'renderComparison',
      'showTenseCategory',
      'showComparison',
      'openTenseModal',
      'renderVerbs',
      'filterVerbs',
      'toggleVerbCard',
      'renderRevision',
      'startRevisionSession',
      'renderWeakpoints',
      'performGlobalSearch',
      'renderFavorites',
      'toggleFav',
      'renderStats',
    ].map((name) => [name, vi.fn()]),
  ),
}));

vi.mock('../../../src/ui/pages/dashboard.js', () => ({
  renderDashboard: mocks.renderDashboard,
}));
vi.mock('../../../src/ui/pages/lessons.js', () => ({
  renderLessons: mocks.renderLessons,
  openLesson: mocks.openLesson,
  showModule: mocks.showModule,
}));
vi.mock('../../../src/ui/pages/exercises.js', () => ({
  resetExerciseUI: mocks.resetExerciseUI,
  restartExercise: mocks.restartExercise,
  startExercise: mocks.startExercise,
  startExerciseForLesson: mocks.startExerciseForLesson,
  startExerciseForTense: mocks.startExerciseForTense,
  selectOption: mocks.selectOption,
  validateExercise: mocks.validateExercise,
  nextExercise: mocks.nextExercise,
  skipExercise: mocks.skipExercise,
  exitExercise: mocks.exitExercise,
}));
vi.mock('../../../src/ui/pages/test.js', () => ({
  renderTestSetup: mocks.renderTestSetup,
  startTest: mocks.startTest,
  selectOption: mocks.selectTestOption,
  validateTestAnswer: mocks.validateTestAnswer,
  nextTestQuestion: mocks.nextTestQuestion,
  cancelTest: mocks.cancelTest,
}));
vi.mock('../../../src/ui/pages/tenses.js', () => ({
  renderTenses: mocks.renderTenses,
  renderComparison: mocks.renderComparison,
  showTenseCategory: mocks.showTenseCategory,
  showComparison: mocks.showComparison,
  openTenseModal: mocks.openTenseModal,
}));
vi.mock('../../../src/ui/pages/verbs.js', () => ({
  renderVerbs: mocks.renderVerbs,
  filterVerbs: mocks.filterVerbs,
  toggleVerbCard: mocks.toggleVerbCard,
}));
vi.mock('../../../src/ui/pages/reviews.js', () => ({
  renderRevision: mocks.renderRevision,
  startRevisionSession: mocks.startRevisionSession,
}));
vi.mock('../../../src/ui/pages/weakpoints.js', () => ({ renderWeakpoints: mocks.renderWeakpoints }));
vi.mock('../../../src/ui/pages/search.js', () => ({ performGlobalSearch: mocks.performGlobalSearch }));
vi.mock('../../../src/ui/pages/favorites.js', () => ({
  renderFavorites: mocks.renderFavorites,
  toggleFav: mocks.toggleFav,
}));
vi.mock('../../../src/ui/pages/stats.js', () => ({ renderStats: mocks.renderStats }));

import {
  closeModal,
  closeModalDirect,
  navigateTo,
  openModal,
  setTheme,
  toggleSidebar,
  toggleTheme,
} from '../../../src/ui/navigation.js';

function buildShell() {
  document.body.innerHTML = `
    <aside id="sidebar"></aside><div id="sidebarOverlay"></div><button id="themeBtn"></button>
    <div id="pageTitle"></div>
    <div id="modalOverlay" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div id="modalContent">
        <div id="modalTitle">Titre</div>
        <button id="modalBtnFirst" class="modal-close">✕</button>
        <button id="modalBtnSecond" class="btn">Valider</button>
      </div>
    </div>
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
    ${['dashboard', 'lessons', 'settings']
      .map((page) => `<button class="nav-item" data-page="${page}"></button>`)
      .join('')}
  `;
}

beforeEach(() => {
  vi.useFakeTimers();
  buildShell();
  Object.values(mocks).forEach((fn) => fn.mockClear());
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
    expect(document.querySelector('[data-page="lessons"]').getAttribute('aria-current')).toBe('page');
    expect(document.querySelector('[data-page="dashboard"]').hasAttribute('aria-current')).toBe(false);
    expect(mocks.renderLessons).toHaveBeenCalledOnce();
  });

  it('routes all supported pages to their renderers', () => {
    const routes = {
      dashboard: mocks.renderDashboard,
      lessons: mocks.renderLessons,
      exercises: mocks.resetExerciseUI,
      test: mocks.renderTestSetup,
      tenses: mocks.renderTenses,
      verbs: mocks.renderVerbs,
      comparison: mocks.renderComparison,
      revision: mocks.renderRevision,
      weakpoints: mocks.renderWeakpoints,
      search: mocks.performGlobalSearch,
      favorites: mocks.renderFavorites,
      stats: mocks.renderStats,
    };

    Object.keys(routes).forEach((page) => navigateTo(page));
    Object.values(routes).forEach((renderer) => expect(renderer).toHaveBeenCalled());
  });

  it('keeps settings pages valid without invoking an unrelated renderer and handles unknown pages', () => {
    navigateTo('settings');
    expect(document.getElementById('pageTitle').textContent).toBe('Paramètres');

    navigateTo('future-page');
    expect(document.getElementById('pageTitle').textContent).toBe('future-page');
    expect(mocks.renderDashboard).not.toHaveBeenCalled();
  });

  it('cancels active test when navigating away from test page (Issue #104)', () => {
    navigateTo('test');
    expect(mocks.renderTestSetup).toHaveBeenCalled();
    mocks.cancelTest.mockClear();

    navigateTo('dashboard');
    expect(mocks.cancelTest).toHaveBeenCalledOnce();
  });

  it('does not cancel the test while navigating to the test page itself', () => {
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

  it('toggles sidebar and theme and persists the selected theme', () => {
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

  it('falls back to light mode when toggling with no existing theme', () => {
    toggleTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('closes the modal only when the overlay itself is clicked', () => {
    const overlay = document.getElementById('modalOverlay');
    const child = document.createElement('div');
    overlay.appendChild(child);
    overlay.classList.add('active');

    closeModal({ target: child });
    expect(overlay.classList.contains('active')).toBe(true);

    closeModal({ target: overlay });
    expect(overlay.classList.contains('active')).toBe(false);
  });

  it('closes the modal when closeModal is called without an event', () => {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.add('active');

    closeModal();

    expect(overlay.classList.contains('active')).toBe(false);
  });

  it('handles keyboard activation with Enter and Space on semantic cards', () => {
    const card = document.createElement('div');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    const clickSpy = vi.fn();
    card.addEventListener('click', clickSpy);
    document.body.appendChild(card);

    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));

    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('does not synthesize clicks for native buttons and ignores unrelated keys', () => {
    const button = document.createElement('button');
    const clickSpy = vi.fn();
    button.addEventListener('click', clickSpy);
    document.body.appendChild(button);

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('closes modal on Escape and restores the triggering focus', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    openModal();
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.add('active');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(overlay.classList.contains('active')).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  describe('modal focus trap and accessibility (Issue #115)', () => {
    it('declares dialog semantics and modal attributes on overlay', () => {
      const modal = document.getElementById('modalOverlay');
      expect(modal.getAttribute('role')).toBe('dialog');
      expect(modal.getAttribute('aria-modal')).toBe('true');
      expect(modal.getAttribute('aria-labelledby')).toBe('modalTitle');
    });

    it('focuses the first available control after opening', () => {
      const first = document.getElementById('modalBtnFirst');
      openModal();
      vi.advanceTimersByTime(50);
      expect(document.activeElement).toBe(first);
    });

    it('traps focus inside the modal on Tab from last to first', () => {
      openModal();
      const first = document.getElementById('modalBtnFirst');
      const last = document.getElementById('modalBtnSecond');
      last.focus();

      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      window.dispatchEvent(event);

      expect(document.activeElement).toBe(first);
      expect(event.defaultPrevented).toBe(true);
    });

    it('traps focus inside the modal on Shift+Tab from first to last', () => {
      openModal();
      const first = document.getElementById('modalBtnFirst');
      const last = document.getElementById('modalBtnSecond');
      first.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);

      expect(document.activeElement).toBe(last);
      expect(event.defaultPrevented).toBe(true);
    });

    it('prevents Tab from escaping when the modal has no focusable elements', () => {
      document.getElementById('modalContent').innerHTML = '<span>Non focusable</span>';
      const modal = document.getElementById('modalOverlay');
      modal.classList.add('active');
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });

      window.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it('restores focus to the triggering element when closed directly', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();
      openModal();

      closeModalDirect();

      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('event delegation', () => {
    it('delegates data-action controls to their handlers and handles local sidebar/theme actions', () => {
      const cases = [
        ['toggle-verb', { index: '2' }, mocks.toggleVerbCard, 2],
        ['open-tense-modal', { tenseId: 'present_simple' }, mocks.openTenseModal],
        ['show-tense-category', { catId: 'past' }, mocks.showTenseCategory],
        ['show-comparison', { compId: 'past' }, mocks.showComparison],
        ['select-option', { index: '1' }, mocks.selectOption, 1],
        ['select-test-option', { index: '2' }, mocks.selectTestOption, 2],
        ['show-module', { index: '3' }, mocks.showModule, 3],
        ['open-lesson', { lessonId: 'lesson-1', tenseId: 'past_simple' }, mocks.openLesson],
        ['start-lesson', { lessonId: 'lesson-1' }, mocks.startExerciseForLesson],
        ['start-tense', { tenseId: 'past_simple' }, mocks.startExerciseForTense],
        ['start-revision', {}, mocks.startRevisionSession],
      ];

      for (const [action, data, handler, numericIndex] of cases) {
        const el = document.createElement('button');
        el.dataset.action = action;
        Object.entries(data).forEach(([key, value]) => {
          el.dataset[key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)] = value;
        });
        document.body.appendChild(el);
        el.click();
        expect(handler).toHaveBeenCalled();
        if (numericIndex !== undefined) expect(handler).toHaveBeenCalledWith(numericIndex);
      }

      const sidebarAction = document.createElement('button');
      sidebarAction.dataset.action = 'toggle-sidebar';
      document.body.appendChild(sidebarAction);
      sidebarAction.click();
      expect(document.getElementById('sidebar').classList.contains('open')).toBe(true);

      const themeAction = document.createElement('button');
      themeAction.dataset.action = 'set-theme';
      themeAction.dataset.theme = 'dark';
      document.body.appendChild(themeAction);
      themeAction.click();
      expect(document.documentElement.dataset.theme).toBe('dark');
    });

    it('handles favorite toggles before card actions', () => {
      const favorite = document.createElement('button');
      favorite.dataset.action = 'toggle-fav';
      favorite.dataset.favId = 'verb-1';
      const card = document.createElement('div');
      card.className = 'verb-card';
      card.appendChild(favorite);
      document.body.appendChild(card);

      favorite.click();

      expect(mocks.toggleFav).toHaveBeenCalledWith('verb-1', favorite);
      expect(mocks.toggleVerbCard).not.toHaveBeenCalled();
    });

    it('delegates input and keyboard events for exercise, test and search fields', () => {
      const exerciseInput = document.createElement('input');
      exerciseInput.id = 'exerciseInput';
      document.body.appendChild(exerciseInput);
      exerciseInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      const testInput = document.createElement('input');
      testInput.id = 'testInput';
      document.body.appendChild(testInput);
      testInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      const verbSearch = document.createElement('input');
      verbSearch.id = 'verbSearch';
      document.body.appendChild(verbSearch);
      verbSearch.dispatchEvent(new Event('input', { bubbles: true }));

      const globalSearch = document.createElement('input');
      globalSearch.id = 'globalSearchInput';
      document.body.appendChild(globalSearch);
      globalSearch.dispatchEvent(new Event('input', { bubbles: true }));

      expect(mocks.validateExercise).toHaveBeenCalledOnce();
      expect(mocks.validateTestAnswer).toHaveBeenCalledOnce();
      expect(mocks.filterVerbs).toHaveBeenCalledOnce();
      expect(mocks.performGlobalSearch).toHaveBeenCalledOnce();
    });

    it('delegates static button IDs to the appropriate actions', () => {
      const ids = [
        ['menuToggleBtn', () => document.getElementById('sidebar').classList.contains('open')],
        ['exSkipBtn', () => mocks.skipExercise],
        ['exValidateBtn', () => mocks.validateExercise],
        ['exNextBtn', () => mocks.nextExercise],
        ['testValidateBtn', () => mocks.validateTestAnswer],
        ['testNextBtn', () => mocks.nextTestQuestion],
      ];

      for (const [id, expected] of ids) {
        const button = document.createElement('button');
        button.id = id;
        document.body.appendChild(button);
        button.click();
        const result = expected();
        if (typeof result !== 'boolean') expect(result).toHaveBeenCalled();
      }

      const themeButton = document.getElementById('themeBtn');
      themeButton.click();
      expect(document.documentElement.dataset.theme).toBe('light');

      const closeButton = document.createElement('button');
      closeButton.className = 'modal-close';
      document.body.appendChild(closeButton);
      const overlay = document.getElementById('modalOverlay');
      overlay.classList.add('active');
      closeButton.click();
      expect(overlay.classList.contains('active')).toBe(false);
    });

    it('ignores malformed or contextually excluded delegated elements', () => {
      const noData = document.createElement('button');
      noData.dataset.action = 'toggle-fav';
      document.body.appendChild(noData);
      noData.click();
      expect(mocks.toggleFav).not.toHaveBeenCalled();

      const excludedNav = document.createElement('button');
      excludedNav.dataset.page = 'dashboard';
      document.getElementById('modalContent').appendChild(excludedNav);
      excludedNav.click();
      expect(mocks.renderDashboard).not.toHaveBeenCalled();
    });
  });
});
