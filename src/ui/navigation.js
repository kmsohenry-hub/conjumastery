import { renderDashboard } from './pages/dashboard.js';
import { renderLessons } from './pages/lessons.js';
import { resetExerciseUI } from './pages/exercises.js';
import { renderTestSetup } from './pages/test.js';
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

export function navigateTo(page) {
  if (!_cachedPages) _cachedPages = document.querySelectorAll('.page');
  if (!_cachedNavItems) _cachedNavItems = document.querySelectorAll('.nav-item');

  _cachedPages.forEach((p) => p.classList.remove('active'));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  _cachedNavItems.forEach((n) => {
    if (n.dataset.page === page) {
      n.classList.add('active');
    } else {
      n.classList.remove('active');
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
  const current = document.documentElement.getAttribute('data-theme');
  const target = current === 'dark' ? 'light' : 'dark';
  setTheme(target);
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeBtn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre',
    );
  }
  State.data.settings.theme = theme;
  State.save();
}

export function closeModal(event) {
  if (event && event.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay')?.classList.remove('active');
}

export function closeModalDirect() {
  document.getElementById('modalOverlay')?.classList.remove('active');
}

// Global keyboard navigation
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('modalOverlay');
      if (modal && modal.classList.contains('active')) {
        closeModalDirect();
      }
    }
  });
}
