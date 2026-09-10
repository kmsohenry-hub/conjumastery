import { renderDashboard } from './pages/dashboard.js';
import { renderLessons, openLesson, showModule } from './pages/lessons.js';
import {
  resetExerciseUI,
  restartExercise,
  startExercise,
  startExerciseForLesson,
  startExerciseForTense,
  selectOption,
  validateExercise,
  nextExercise,
  skipExercise,
  exitExercise,
} from './pages/exercises.js';
import {
  renderTestSetup,
  startTest,
  selectOption as selectTestOption,
  validateTestAnswer,
  nextTestQuestion,
  cancelTest,
} from './pages/test.js';
import {
  renderTenses,
  renderComparison,
  showTenseCategory,
  showComparison,
  openTenseModal,
} from './pages/tenses.js';
import { renderVerbs, filterVerbs, toggleVerbCard } from './pages/verbs.js';
import { renderRevision, startRevisionSession } from './pages/reviews.js';
import { renderWeakpoints } from './pages/weakpoints.js';
import { performGlobalSearch } from './pages/search.js';
import { renderFavorites, toggleFav } from './pages/favorites.js';
import { renderStats } from './pages/stats.js';
import { State } from '../core/state/State.js';
import { APP_DATA } from '../data/index.js';

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
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('active');
  }
}

export function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sidebarOverlay')?.classList.toggle('active');
}

export function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
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
        target.classList.contains('verb-card') ||
        target.classList.contains('search-result-item'))
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
        validateExercise();
      } else if (target && target.id === 'testInput') {
        validateTestAnswer();
      }
    }
  });

  // Input delegation for search inputs
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (target && target.id === 'verbSearch') {
      filterVerbs();
    } else if (target && (target.id === 'globalSearchInput' || target.id === 'globalSearch')) {
      performGlobalSearch();
    }
  });

  document.addEventListener('click', (e) => {
    // 0. Toggle Favorite (MUST run before verb-card/lesson-card to prevent event bubbling)
    const favBtn = e.target.closest?.('[data-action="toggle-fav"]');
    if (favBtn) {
      const favId = favBtn.dataset.favId;
      if (favId) {
        toggleFav(favId, favBtn);
      }
      return;
    }

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
      if (mode) {
        startExercise(mode);
        return;
      }
    }

    // 3. Action buttons & cards: [data-action]
    const actionEl = e.target.closest?.('[data-action]');
    if (actionEl) {
      const action = actionEl.dataset.action;
      switch (action) {
        case 'toggle-verb': {
          const idx = Number(actionEl.dataset.index);
          toggleVerbCard(idx);
          break;
        }
        case 'open-tense-modal': {
          const tenseId = actionEl.dataset.tenseId;
          const tense = APP_DATA.tensesById[tenseId];
          if (tense) {
            openTenseModal(tense);
          }
          break;
        }
        case 'show-tense-category': {
          const catId = actionEl.dataset.catId;
          showTenseCategory(catId, actionEl);
          break;
        }
        case 'show-comparison': {
          const compId = actionEl.dataset.compId;
          showComparison(compId, actionEl);
          break;
        }
        case 'select-option': {
          const idx = Number(actionEl.dataset.index);
          selectOption(actionEl, idx);
          break;
        }
        case 'select-test-option': {
          const idx = Number(actionEl.dataset.index);
          selectTestOption(actionEl, idx);
          break;
        }
        case 'show-module': {
          const idx = Number(actionEl.dataset.index);
          showModule(idx, actionEl);
          break;
        }
        case 'open-lesson': {
          const lId = actionEl.dataset.lessonId;
          const tId = actionEl.dataset.tenseId;
          openLesson(lId, tId);
          break;
        }
        case 'start-lesson': {
          closeModalDirect();
          const lId = actionEl.dataset.lessonId;
          startExerciseForLesson(lId);
          break;
        }
        case 'start-tense': {
          closeModalDirect();
          const tId = actionEl.dataset.tenseId;
          startExerciseForTense(tId);
          break;
        }
        case 'start-revision': {
          startRevisionSession();
          break;
        }
        case 'new-test': {
          renderTestSetup();
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
          exitExercise();
          break;
        case 'skip-exercise':
          skipExercise();
          break;
        case 'validate-exercise':
          validateExercise();
          break;
        case 'next-exercise':
          nextExercise();
          break;
        case 'restart-exercise':
          restartExercise();
          break;
        case 'reset-exercise-ui':
          resetExerciseUI();
          break;
        case 'start-test':
          startTest();
          break;
        case 'validate-test':
          validateTestAnswer();
          break;
        case 'next-test':
          nextTestQuestion();
          break;
        case 'close-modal':
          closeModalDirect();
          break;
        case 'toggle-notifications':
          if (typeof window !== 'undefined' && window.NotificationManager?.toggle) {
            window.NotificationManager.toggle();
          }
          break;
        case 'export-data':
          if (typeof window !== 'undefined' && typeof window.exportData === 'function') {
            window.exportData();
          }
          break;
        case 'import-data-click':
          document.getElementById('importFile')?.click();
          break;
        case 'reset-progress':
          if (typeof window !== 'undefined' && typeof window.confirmReset === 'function') {
            window.confirmReset();
          } else if (typeof window !== 'undefined' && typeof window.resetProgress === 'function') {
            window.resetProgress();
          }
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
        skipExercise();
      } else if (btn.id === 'exValidateBtn') {
        validateExercise();
      } else if (btn.id === 'exNextBtn') {
        nextExercise();
      } else if (btn.id === 'testValidateBtn') {
        validateTestAnswer();
      } else if (btn.id === 'testNextBtn') {
        nextTestQuestion();
      } else if (btn.classList.contains('modal-close')) {
        closeModalDirect();
      }
    }
  });
}

if (typeof window !== 'undefined') {
  initEventDelegation();
}
