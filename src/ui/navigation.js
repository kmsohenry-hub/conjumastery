import { renderDashboard } from './pages/dashboard.js';
import { renderLessons } from './pages/lessons.js';
import { resetExerciseUI } from './pages/exercises.js';
import { renderTestSetup, cancelTest } from './pages/test.js';
import { renderTenses, renderComparison } from './pages/tenses.js';
import { renderVerbs } from './pages/verbs.js';
import { renderRevision } from './pages/reviews.js';
import { renderWeakpoints } from './pages/weakpoints.js';
import { performGlobalSearch } from './pages/search.js';
import { renderFavorites } from './pages/favorites.js';
import { renderStats } from './pages/stats.js';
import { State } from '../core/state/State.js';

let _cachedPages = null;
let _cachedNavItems = null;
let _previousActiveElement = null;

export function navigateTo(page) {
  if (page !== 'test') {
    cancelTest();
  }
  if (!_cachedPages) _cachedPages = document.querySelectorAll('.page');
  if (!_cachedNavItems) _cachedNavItems = document.querySelectorAll('.nav-item');

  _cachedPages.forEach((p) => p.classList.remove('active'));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  _cachedNavItems.forEach((n) => {
    if (n.dataset.page === page) {
      n.classList.add('active');
      n.setAttribute('aria-current', 'page');
      n.removeAttribute('aria-selected');
    } else {
      n.classList.remove('active');
      n.removeAttribute('aria-current');
      n.removeAttribute('aria-selected');
    }
  });

  const titles = {
    dashboard: 'Tableau de bord',
    lessons: 'Leçons',
    exercises: 'Exercices',
    test: 'Mode Test',
    tenses: 'Temps verbaux',
    verbs: 'Verbes irréguliers',
    comparison: 'Comparatif',
    revision: 'Révisions',
    weakpoints: 'Points faibles',
    search: 'Recherche',
    favorites: 'Favoris',
    stats: 'Statistiques',
    settings: 'Paramètres',
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;

  // Render page content
  switch (page) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'lessons':
      renderLessons();
      break;
    case 'exercises':
      resetExerciseUI();
      break;
    case 'test':
      renderTestSetup();
      break;
    case 'tenses':
      renderTenses();
      break;
    case 'verbs':
      renderVerbs();
      break;
    case 'comparison':
      renderComparison();
      break;
    case 'revision':
      renderRevision();
      break;
    case 'weakpoints':
      renderWeakpoints();
      break;
    case 'search':
      performGlobalSearch();
      break;
    case 'favorites':
      renderFavorites();
      break;
    case 'stats':
      renderStats();
      break;
    case 'settings':
      break;
  }

  // Close mobile sidebar
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
  }
}

export function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

export function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeBtn').textContent = theme === 'dark' ? '☀️' : '🌙';
  State.data.settings.theme = theme;
  State.save();
}

export function openModal() {
  _previousActiveElement = document.activeElement;
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => {
      const focusable = overlay.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable && typeof focusable.focus === 'function') {
        focusable.focus();
      }
    }, 50);
  }
}

export function closeModal(event) {
  if (event && event.target !== document.getElementById('modalOverlay')) return;
  closeModalDirect();
}

export function closeModalDirect() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
  if (_previousActiveElement && typeof _previousActiveElement.focus === 'function') {
    _previousActiveElement.focus();
    _previousActiveElement = null;
  }
}

window.addEventListener('keydown', (e) => {
  const modal = document.getElementById('modalOverlay');
  const isModalActive = modal && modal.classList.contains('active');

  if (e.key === 'Escape') {
    if (isModalActive) {
      closeModalDirect();
    }
  } else if (e.key === 'Tab' && isModalActive) {
    const focusable = Array.from(
      modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => {
      return (
        el.offsetWidth > 0 ||
        el.offsetHeight > 0 ||
        (el.getClientRects && el.getClientRects().length > 0) ||
        window.getComputedStyle?.(el).display !== 'none'
      );
    });

    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || !modal.contains(document.activeElement)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last || !modal.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  } else if (e.key === 'Enter' || e.key === ' ') {
    const target = e.target;
    if (
      target &&
      (target.getAttribute('role') === 'button' ||
        target.classList.contains('nav-item') ||
        target.classList.contains('mode-card') ||
        target.classList.contains('lesson-card') ||
        target.classList.contains('verb-card'))
    ) {
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === ' ') e.preventDefault();
      target.click();
    }
  }
});

export function initEventDelegation() {
  if (typeof document === 'undefined' || !document.addEventListener) return;

  // Keydown delegation for Enter on exercise and test inputs
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const target = e.target;
      if (target && target.id === 'exerciseInput') {
        if (typeof window !== 'undefined' && typeof window.validateExercise === 'function') {
          window.validateExercise();
        }
      } else if (target && target.id === 'testInput') {
        if (typeof window !== 'undefined' && typeof window.validateTestAnswer === 'function') {
          window.validateTestAnswer();
        }
      }
    }
  });

  // Input delegation for search inputs
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (target && target.id === 'verbSearch') {
      if (typeof window !== 'undefined' && typeof window.filterVerbs === 'function') {
        window.filterVerbs();
      }
    } else if (target && target.id === 'globalSearchInput') {
      if (typeof window !== 'undefined' && typeof window.performGlobalSearch === 'function') {
        window.performGlobalSearch();
      }
    }
  });

  document.addEventListener('click', (e) => {
    // 1. Navigation items: [data-page]
    const navItem = e.target.closest?.('[data-page]');
    if (
      navItem &&
      !navItem.closest?.('#modalContent') &&
      !navItem.closest?.('#lessonTabs') &&
      !navItem.closest?.('#tenseCategoryTabs') &&
      !navItem.closest?.('#comparisonTabs')
    ) {
      const page = navItem.dataset.page;
      if (page) {
        navigateTo(page);
        return;
      }
    }

    // 2. Mode cards: [data-mode]
    const modeCard = e.target.closest?.('[data-mode]');
    if (modeCard) {
      const mode = modeCard.dataset.mode;
      if (mode && typeof window !== 'undefined' && typeof window.startExercise === 'function') {
        window.startExercise(mode);
        return;
      }
    }

    // 3. Action buttons: [data-action]
    const actionEl = e.target.closest?.('[data-action]');
    if (actionEl) {
      const action = actionEl.dataset.action;
      switch (action) {
        case 'select-option': {
          const idx = Number(actionEl.dataset.index);
          if (typeof window !== 'undefined' && typeof window.selectOption === 'function') {
            window.selectOption(actionEl, idx);
          }
          break;
        }
        case 'select-test-option': {
          const idx = Number(actionEl.dataset.index);
          if (typeof window !== 'undefined' && typeof window.selectTestOption === 'function') {
            window.selectTestOption(actionEl, idx);
          }
          break;
        }
        case 'show-module': {
          const idx = Number(actionEl.dataset.index);
          if (typeof window !== 'undefined' && typeof window.showModule === 'function') {
            window.showModule(idx, actionEl);
          }
          break;
        }
        case 'open-lesson': {
          const lId = actionEl.dataset.lessonId;
          const tId = actionEl.dataset.tenseId;
          if (typeof window !== 'undefined' && typeof window.openLesson === 'function') {
            window.openLesson(lId, tId);
          }
          break;
        }
        case 'start-lesson': {
          closeModalDirect();
          const lId = actionEl.dataset.lessonId;
          if (typeof window !== 'undefined' && typeof window.startExerciseForLesson === 'function') {
            window.startExerciseForLesson(lId);
          }
          break;
        }
        case 'start-tense': {
          closeModalDirect();
          const tId = actionEl.dataset.tenseId;
          if (typeof window !== 'undefined' && typeof window.startExerciseForTense === 'function') {
            window.startExerciseForTense(tId);
          }
          break;
        }
        case 'start-revision': {
          if (typeof window !== 'undefined' && typeof window.startRevisionSession === 'function') {
            window.startRevisionSession();
          }
          break;
        }
        case 'new-test': {
          if (typeof window !== 'undefined' && typeof window.renderTestSetup === 'function') {
            window.renderTestSetup();
          }
          const setupEl = document.getElementById('testSetup');
          const resultsEl = document.getElementById('testResults');
          if (setupEl) setupEl.style.display = 'block';
          if (resultsEl) resultsEl.style.display = 'none';
          break;
        }
        case 'toggle-sidebar':
          toggleSidebar();
          break;
        case 'toggle-theme':
          toggleTheme();
          break;
        case 'set-theme':
          if (actionEl.dataset.theme) setTheme(actionEl.dataset.theme);
          break;
        case 'exit-exercise':
          if (typeof window !== 'undefined' && typeof window.exitExercise === 'function') window.exitExercise();
          break;
        case 'skip-exercise':
          if (typeof window !== 'undefined' && typeof window.skipExercise === 'function') window.skipExercise();
          break;
        case 'validate-exercise':
          if (typeof window !== 'undefined' && typeof window.validateExercise === 'function') window.validateExercise();
          break;
        case 'next-exercise':
          if (typeof window !== 'undefined' && typeof window.nextExercise === 'function') window.nextExercise();
          break;
        case 'restart-exercise':
          if (typeof window !== 'undefined' && typeof window.restartExercise === 'function') window.restartExercise();
          break;
        case 'reset-exercise-ui':
          if (typeof window !== 'undefined' && typeof window.resetExerciseUI === 'function') window.resetExerciseUI();
          break;
        case 'start-test':
          if (typeof window !== 'undefined' && typeof window.startTest === 'function') window.startTest();
          break;
        case 'validate-test':
          if (typeof window !== 'undefined' && typeof window.validateTestAnswer === 'function') window.validateTestAnswer();
          break;
        case 'next-test':
          if (typeof window !== 'undefined' && typeof window.nextTestQuestion === 'function') window.nextTestQuestion();
          break;
        case 'toggle-notifications':
          if (typeof window !== 'undefined' && window.NotificationManager?.toggle) {
            window.NotificationManager.toggle();
          }
          break;
        case 'export-data':
          if (typeof window !== 'undefined' && typeof window.exportData === 'function') window.exportData();
          break;
        case 'import-data-click':
          document.getElementById('importFile')?.click();
          break;
        case 'reset-progress':
          if (typeof window !== 'undefined' && typeof window.confirmReset === 'function') window.confirmReset();
          else if (typeof window !== 'undefined' && typeof window.resetProgress === 'function') window.resetProgress();
          break;
      }
      return;
    }

    // 4. Modal overlay click (outside modalContent)
    if (e.target === document.getElementById('modalOverlay')) {
      closeModalDirect();
      return;
    }

    // 5. Specific static button IDs for clean semantic HTML
    const btn = e.target.closest?.('button');
    if (btn) {
      if (btn.id === 'menuToggleBtn' || btn.classList.contains('menu-toggle')) {
        toggleSidebar();
      } else if (btn.id === 'themeBtn') {
        toggleTheme();
      } else if (btn.id === 'exSkipBtn') {
        if (typeof window !== 'undefined' && typeof window.skipExercise === 'function') window.skipExercise();
      } else if (btn.id === 'exValidateBtn') {
        if (typeof window !== 'undefined' && typeof window.validateExercise === 'function') window.validateExercise();
      } else if (btn.id === 'exNextBtn') {
        if (typeof window !== 'undefined' && typeof window.nextExercise === 'function') window.nextExercise();
      } else if (btn.id === 'testValidateBtn') {
        if (typeof window !== 'undefined' && typeof window.validateTestAnswer === 'function') window.validateTestAnswer();
      } else if (btn.id === 'testNextBtn') {
        if (typeof window !== 'undefined' && typeof window.nextTestQuestion === 'function') window.nextTestQuestion();
      } else if (btn.classList.contains('modal-close')) {
        closeModalDirect();
      }
    }
  });
}

if (typeof window !== 'undefined') {
  initEventDelegation();
}
