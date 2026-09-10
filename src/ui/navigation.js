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
      n.setAttribute('aria-selected', 'true');
    } else {
      n.classList.remove('active');
      n.setAttribute('aria-selected', 'false');
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
