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
import { showToast } from './utils/toast.js';
import { getOrderedLessons, getPreviousLesson, UNLOCK_THRESHOLD } from '../core/progression.js';

let _cachedPages = null;
let _cachedNavItems = null;
let _previousActiveElement = null;

function syncMainContentInertState() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;
  const isSidebarOpen = document.getElementById('sidebar')?.classList?.contains('open') ?? false;
  const isModalOpen =
    document.getElementById('modalOverlay')?.classList?.contains('active') ?? false;

  if (isSidebarOpen || isModalOpen) {
    mainContent.setAttribute('inert', '');
    mainContent.setAttribute('aria-hidden', 'true');
  } else {
    mainContent.removeAttribute('inert');
    mainContent.removeAttribute('aria-hidden');
  }
}

export function setSidebarOpenState(isOpen) {
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const menuBtn = document.getElementById('menuToggleBtn');

  if (sidebar) sidebar.classList.toggle('open', isOpen);
  if (sidebarOverlay) sidebarOverlay.classList.toggle('active', isOpen);
  document.body?.classList?.toggle('sidebar-open', isOpen);
  document.documentElement?.classList?.toggle('sidebar-open', isOpen);

  syncMainContentInertState();

  if (menuBtn) {
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
}

export function setModalOpenState(isOpen) {
  const overlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');
  if (overlay) {
    overlay.classList.toggle('active', isOpen);
    overlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }
  if (isOpen && modalContent) {
    modalContent.scrollTop = 0;
  }
  document.body?.classList?.toggle('modal-open', isOpen);
  document.documentElement?.classList?.toggle('modal-open', isOpen);
  syncMainContentInertState();
}

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
  if (
    window.innerWidth <= 768 ||
    document.body?.classList?.contains('sidebar-open') ||
    document.getElementById('sidebar')?.classList?.contains('open')
  ) {
    setSidebarOpenState(false);
  }

  // Close active modal if navigating away
  if (
    document.body?.classList?.contains('modal-open') ||
    document.getElementById('modalOverlay')?.classList?.contains('active')
  ) {
    setModalOpenState(false);
  }
}

export function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const isOpen = !(sidebar?.classList.contains('open') ?? false);
  setSidebarOpenState(isOpen);
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
  const lightBtn = document.getElementById('lightModeBtn');
  const darkBtn = document.getElementById('darkModeBtn');
  if (lightBtn) {
    lightBtn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    lightBtn.classList.toggle('btn-primary', theme === 'light');
    lightBtn.classList.toggle('btn-outline', theme !== 'light');
  }
  if (darkBtn) {
    darkBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    darkBtn.classList.toggle('btn-primary', theme === 'dark');
    darkBtn.classList.toggle('btn-outline', theme !== 'dark');
  }
  State.data.settings.theme = theme;
  State.save();
}

export function openModal() {
  _previousActiveElement = document.activeElement;
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    setModalOpenState(true);
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
  setModalOpenState(false);
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
    } else if (document.getElementById('sidebar')?.classList.contains('open')) {
      setSidebarOpenState(false);
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

function resolveActiveOverlayScrollContainer(target) {
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay?.classList?.contains('active')) {
    const modalContainer =
      target?.closest?.('.modal, #modalContent') ||
      (!modalOverlay.querySelector('.modal, #modalContent') && target?.closest?.('#modalOverlay'));
    return { active: true, container: modalContainer || null };
  }

  const sidebar = document.getElementById('sidebar');
  if (sidebar?.classList?.contains('open')) {
    const sidebarContainer =
      target?.closest?.('.sidebar-nav') ||
      (!sidebar.querySelector('.sidebar-nav') && target?.closest?.('#sidebar'));
    return { active: true, container: sidebarContainer || null };
  }

  return { active: false, container: null };
}

export function initEventDelegation() {
  if (typeof document === 'undefined' || !document.addEventListener) return;

  let _touchStartY = 0;

  // Prevent scroll chaining to background page when modal or mobile sidebar is open
  document.addEventListener(
    'touchstart',
    (e) => {
      const { active } = resolveActiveOverlayScrollContainer(e.target);
      if (!active) return;
      if (e.touches && e.touches.length > 0) {
        _touchStartY = e.touches[0].clientY;
      }
    },
    { passive: true },
  );

  document.addEventListener(
    'touchmove',
    (e) => {
      const { active, container } = resolveActiveOverlayScrollContainer(e.target);
      if (!active) return;

      if (!container) {
        if (e.cancelable) e.preventDefault();
        return;
      }

      const currentY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : _touchStartY;
      const deltaY = currentY - _touchStartY;
      _touchStartY = currentY;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrollable = scrollHeight > clientHeight;
      const isAtTop = scrollTop <= 0 && deltaY > 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && deltaY < 0;

      if (!isScrollable || isAtTop || isAtBottom) {
        if (e.cancelable) e.preventDefault();
      }
    },
    { passive: false },
  );

  document.addEventListener(
    'wheel',
    (e) => {
      const { active, container } = resolveActiveOverlayScrollContainer(e.target);
      if (!active) return;

      if (!container) {
        if (e.cancelable) e.preventDefault();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrollable = scrollHeight > clientHeight;
      const isAtTop = scrollTop <= 0 && e.deltaY < 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;

      if (!isScrollable || isAtTop || isAtBottom) {
        if (e.cancelable) e.preventDefault();
      }
    },
    { passive: false },
  );

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
    // Block background interactions while mobile sidebar or modal is open
    const sidebar = document.getElementById('sidebar');
    const modalOverlay = document.getElementById('modalOverlay');
    const isOverlayBlockingMain =
      sidebar?.classList.contains('open') || modalOverlay?.classList.contains('active');
    if (
      isOverlayBlockingMain &&
      e.target?.closest?.('.main-content') &&
      !e.target?.closest?.('#menuToggleBtn')
    ) {
      e.preventDefault();
      return;
    }

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
      if (actionEl.dataset.locked === 'true') {
        const lId =
          actionEl.dataset.lessonId ||
          (actionEl.dataset.tenseId
            ? getOrderedLessons().find((l) => l.tenseId === actionEl.dataset.tenseId)?.id
            : null);
        const prevLesson = lId ? getPreviousLesson(lId) : null;
        const prereqTitle = prevLesson ? `« ${prevLesson.title} »` : 'la leçon précédente';
        showToast(
          `🔒 Cours verrouillé : validez ${prereqTitle} avec au moins ${UNLOCK_THRESHOLD}% de réussite pour débloquer la suite.`,
          'warning',
        );
        return;
      }

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
