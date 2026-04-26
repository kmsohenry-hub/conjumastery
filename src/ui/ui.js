/**
 * Module de gestion de l'interface utilisateur et du rendu DOM
 */

import { State } from '../core/state.js';
import { APP_DATA, getTenseById } from '../data/data.js';
import { formatNumber, formatRelativeDate, calculatePercentage } from '../utils/helpers.js';

export const UI = {
  /**
   * Initialisation de l'interface
   */
  init() {
    this.bindEvents();
    this.updateAll();
  },

  /**
   * Lie les événements globaux
   */
  bindEvents() {
    // Gestion du thème
    const savedTheme = localStorage.getItem('conjumaster_theme') || 'light';
    this.setTheme(savedTheme);

    // Navigation clavier
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });

    // Gestionnaire de toast
    window.showToast = this.showToast.bind(this);
  },

  /**
   * Met à jour toute l'interface
   */
  updateAll() {
    this.updateHeader();
    this.updateSidebar();
    this.updateDashboard();
    this.updatePageTitles();
  },

  /**
   * Met à jour l'en-tête
   */
  updateHeader() {
    const { xp, level, daysStreak } = State.data;
    
    const streakEl = document.getElementById('streakCount');
    const streakPlural = document.getElementById('streakPlural');
    const headerXP = document.getElementById('headerXP');
    const headerLevel = document.getElementById('headerLevel');

    if (streakEl) streakEl.textContent = formatNumber(daysStreak);
    if (streakPlural) streakPlural.textContent = daysStreak > 1 ? 's' : '';
    if (headerXP) headerXP.textContent = formatNumber(xp);
    if (headerLevel) headerLevel.textContent = formatNumber(level);
  },

  /**
   * Met à jour la barre latérale
   */
  updateSidebar() {
    const { xp, level } = State.data;
    const xpForNextLevel = level * 100;
    const xpProgress = ((xp % 100) / 100) * 100;

    const sidebarLevel = document.getElementById('sidebarLevel');
    const sidebarXP = document.getElementById('sidebarXP');
    const sidebarXPBar = document.getElementById('sidebarXPBar');

    if (sidebarLevel) sidebarLevel.textContent = formatNumber(level);
    if (sidebarXP) sidebarXP.textContent = `${xp % 100} / 100 XP`;
    if (sidebarXPBar) sidebarXPBar.style.width = `${xpProgress}%`;

    // Badge de révisions
    const revisionQueue = State.getRevisionQueue();
    const revisionBadge = document.getElementById('revisionBadge');
    if (revisionBadge) {
      revisionBadge.textContent = revisionQueue.length;
      revisionBadge.style.display = revisionQueue.length > 0 ? 'block' : 'none';
    }
  },

  /**
   * Met à jour le tableau de bord
   */
  updateDashboard() {
    const { xp, level, totalExercises, correctAnswers, incorrectAnswers } = State.data;
    
    // Stats principales
    const dashXP = document.getElementById('dashXP');
    const dashLevel = document.getElementById('dashLevel');
    const dashExercises = document.getElementById('dashExercises');
    const dashAccuracy = document.getElementById('dashAccuracy');

    if (dashXP) dashXP.textContent = formatNumber(xp);
    if (dashLevel) dashLevel.textContent = formatNumber(level);
    if (dashExercises) dashExercises.textContent = formatNumber(totalExercises);
    
    if (dashAccuracy) {
      const total = correctAnswers + incorrectAnswers;
      const accuracy = total > 0 ? calculatePercentage(correctAnswers, total) : 0;
      dashAccuracy.textContent = `${accuracy}%`;
    }

    // Graphique de performance
    this.renderTenseChart('dashChart');
  },

  /**
   * Rendu du graphique des temps verbaux
   * @param {string} containerId - ID du conteneur
   */
  renderTenseChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stats = State.data.tenseStats;
    const tenseIds = Object.keys(stats);

    if (tenseIds.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-light)">
          📊 Complétez des exercices pour voir vos statistiques
        </div>
      `;
      return;
    }

    const maxTotal = Math.max(...tenseIds.map(id => stats[id].total), 10);

    container.innerHTML = tenseIds.map(tenseId => {
      const { correct, total } = stats[tenseId];
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      const width = Math.max((total / maxTotal) * 100, 5);
      
      // Récupérer le nom du temps
      const tenseInfo = getTenseById(tenseId) || { nameFR: tenseId };
      
      let barClass = 'bar-error';
      if (percentage >= 80) barClass = 'bar-success';
      else if (percentage >= 60) barClass = 'bar-warning';

      return `
        <div class="bar-item">
          <div class="bar-label">${tenseInfo.nameFR}</div>
          <div class="bar-container">
            <div class="bar-fill ${barClass}" style="width:${width}%" 
                 data-tooltip="${correct}/${total} (${percentage}%)"></div>
          </div>
          <div class="bar-value">${percentage}%</div>
        </div>
      `;
    }).join('');
  },

  /**
   * Affiche un message toast
   * @param {string} message - Message à afficher
   * @param {string} type - Type (success, error, warning, info)
   * @param {number} duration - Durée en ms
   */
  showToast(message, type = 'info', duration = 3000) {
    // Supprime les toasts existants
    const existing = document.querySelector('.toast-container');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.className = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    };

    container.innerHTML = `
      <div style="
        background: white;
        color: #1f2937;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 280px;
        border-left: 4px solid ${colors[type]};
      ">
        <span style="font-size: 1.2rem">${icons[type]}</span>
        <span style="flex: 1; font-weight: 500">${message}</span>
      </div>
    `;

    document.body.appendChild(container);

    setTimeout(() => {
      container.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => container.remove(), 300);
    }, duration);
  },

  /**
   * Définit le thème de l'application
   * @param {string} theme - 'light' ou 'dark'
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('conjumaster_theme', theme);
    
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  },

  /**
   * Bascule entre les thèmes clair et sombre
   */
  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    this.showToast(`Thème ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`, 'info');
  },

  /**
   * Ferme toutes les modales
   */
  closeModals() {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
      modal.classList.remove('active');
      modal.style.display = 'none';
    });
  },

  /**
   * Met à jour les titres de page
   */
  updatePageTitles() {
    const pages = {
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

    const activePage = document.querySelector('.page.active');
    if (activePage) {
      const pageId = activePage.id.replace('page-', '');
      const titleEl = document.getElementById('pageTitle');
      if (titleEl && pages[pageId]) {
        titleEl.textContent = pages[pageId];
      }
    }
  },

  /**
   * Navigation vers une page
   * @param {string} pageName - Nom de la page
   */
  navigateTo(pageName) {
    // Cache toutes les pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
      page.style.display = 'none';
    });

    // Désactive tous les items de nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // Affiche la page demandée
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
      targetPage.classList.add('active');
      targetPage.style.display = 'block';
    }

    // Active l'item de nav correspondant
    const navItem = document.querySelector(`.nav-item[data-page="${pageName}"]`);
    if (navItem) {
      navItem.classList.add('active');
    }

    // Sur mobile, ferme la sidebar
    if (window.innerWidth < 768) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebarOverlay');
      if (sidebar) sidebar.classList.remove('active');
      if (overlay) overlay.style.display = 'none';
    }

    this.updatePageTitles();
  },

  /**
   * Bascule l'affichage de la sidebar
   */
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
      const isActive = sidebar.classList.contains('active');
      
      if (isActive) {
        sidebar.classList.remove('active');
        overlay.style.display = 'none';
      } else {
        sidebar.classList.add('active');
        overlay.style.display = 'block';
      }
    }
  },
};

// Export des fonctions globales utilisées dans app.js
window.updateUI = () => UI.updateAll();
window.navigateTo = (page) => UI.navigateTo(page);
window.toggleSidebar = () => UI.toggleSidebar();
window.toggleTheme = () => UI.toggleTheme();
