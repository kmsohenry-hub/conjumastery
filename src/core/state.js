/**
 * Module de gestion des données et de l'état de l'application
 */

import { Storage } from '../storage/storage.js';
import { UI } from '../ui/ui.js';

// ============================================================
// UTILITAIRES DE SÉCURITÉ
// ============================================================

/**
 * Échappe les caractères HTML spéciaux pour prévenir les attaques XSS
 * @param {string} str - La chaîne à échapper
 * @returns {string} - La chaîne échappée
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Valide et nettoie une entrée utilisateur
 * @param {string} input - L'entrée à valider
 * @returns {string} - L'entrée nettoyée
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 500); // Limite de longueur
}

// ============================================================
// STATE MANAGEMENT
// ============================================================

export const State = {
  data: {
    xp: 0,
    level: 1,
    totalExercises: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    bestStreak: 0,
    currentStreak: 0,
    daysStreak: 0,
    lastActiveDate: null,
    completedLessons: [],
    tenseStats: {},
    errorLog: [],
    activityLog: [],
    favorites: [],
    spacedRepetition: {},
    settings: { theme: 'light' }
  },

  /**
   * Initialise l'état depuis le localStorage
   */
  init() {
    const saved = Storage.load(Storage.KEYS.DATA, null);
    if (saved) {
      this.data = { ...this.data, ...saved };
    }
    this.checkStreak();
    this.save();
  },

  /**
   * Sauvegarde l'état dans le localStorage
   */
  save() {
    Storage.save(Storage.KEYS.DATA, this.data);
  },

  /**
   * Vérifie et met à jour la série de jours consécutifs
   */
  checkStreak() {
    const today = new Date().toDateString();
    if (this.data.lastActiveDate) {
      const last = new Date(this.data.lastActiveDate);
      const diff = Math.floor((new Date(today) - last) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        this.data.daysStreak++;
      } else if (diff > 1) {
        this.data.daysStreak = 0;
      }
    }
  },

  /**
   * Ajoute des points d'expérience
   * @param {number} amount - Quantité d'XP à ajouter
   */
  addXP(amount) {
    this.data.xp += amount;
    const newLevel = Math.floor(this.data.xp / 100) + 1;
    if (newLevel > this.data.level) {
      this.data.level = newLevel;
      UI.showToast(`🎉 Niveau ${newLevel} atteint !`, 'success');
      launchConfetti();
    }
    this.data.lastActiveDate = new Date().toDateString();
    this.data.activityLog.push({ date: new Date().toISOString(), xp: amount });
    if (this.data.activityLog.length > 100) {
      this.data.activityLog = this.data.activityLog.slice(-100);
    }
    this.save();
    UI.updateAll();
  },

  /**
   * Enregistre une réponse à un exercice
   * @param {string} tenseId - ID du temps verbal
   * @param {boolean} correct - Si la réponse est correcte
   */
  recordAnswer(tenseId, correct) {
    this.data.totalExercises++;
    if (!this.data.tenseStats[tenseId]) {
      this.data.tenseStats[tenseId] = { correct: 0, total: 0 };
    }
    this.data.tenseStats[tenseId].total++;
    
    if (correct) {
      this.data.correctAnswers++;
      this.data.tenseStats[tenseId].correct++;
      this.data.currentStreak++;
      if (this.data.currentStreak > this.data.bestStreak) {
        this.data.bestStreak = this.data.currentStreak;
      }
    } else {
      this.data.incorrectAnswers++;
      this.data.currentStreak = 0;
    }
    
    this.save();
  },

  /**
   * Marque une leçon comme complétée
   * @param {string} lessonId - ID de la leçon
   */
  completeLesson(lessonId) {
    if (!this.data.completedLessons.includes(lessonId)) {
      this.data.completedLessons.push(lessonId);
      this.addXP(50);
      UI.showToast('✅ Leçon terminée ! +50 XP', 'success');
      this.save();
    }
  },

  /**
   * Ajoute ou retire un favori
   * @param {string} itemId - ID de l'élément
   * @param {string} type - Type d'élément ('verb', 'lesson', etc.)
   */
  toggleFavorite(itemId, type) {
    const index = this.data.favorites.findIndex(f => f.id === itemId && f.type === type);
    if (index >= 0) {
      this.data.favorites.splice(index, 1);
      UI.showToast('Retiré des favoris', 'info');
    } else {
      this.data.favorites.push({ id: itemId, type, addedAt: new Date().toISOString() });
      UI.showToast('Ajouté aux favoris ⭐', 'success');
    }
    this.save();
    UI.updateAll();
  },

  /**
   * Vérifie si un élément est en favori
   * @param {string} itemId - ID de l'élément
   * @param {string} type - Type d'élément
   * @returns {boolean}
   */
  isFavorite(itemId, type) {
    return this.data.favorites.some(f => f.id === itemId && f.type === type);
  },

  /**
   * Met à jour la répétition espacée pour un élément
   * @param {string} itemId - ID de l'élément
   * @param {boolean} correct - Si la réponse était correcte
   */
  updateSpacedRepetition(itemId, correct) {
    if (!this.data.spacedRepetition[itemId]) {
      this.data.spacedRepetition[itemId] = { interval: 1, dueDate: Date.now(), ease: 2.5 };
    }
    
    const item = this.data.spacedRepetition[itemId];
    if (correct) {
      item.interval = Math.round(item.interval * item.ease);
      item.ease = Math.min(3.0, item.ease + 0.1);
    } else {
      item.interval = 1;
      item.ease = Math.max(1.3, item.ease - 0.2);
    }
    item.dueDate = Date.now() + (item.interval * 24 * 60 * 60 * 1000);
    this.save();
  },

  /**
   * Retourne les éléments à réviser aujourd'hui
   * @returns {Array}
   */
  getRevisionQueue() {
    const now = Date.now();
    return Object.entries(this.data.spacedRepetition)
      .filter(([_, data]) => data.dueDate <= now)
      .map(([id, data]) => ({ id, ...data }));
  },

  /**
   * Identifie les points faibles de l'utilisateur
   * @returns {Array}
   */
  getWeakPoints() {
    return Object.entries(this.data.tenseStats)
      .filter(([_, stats]) => {
        const accuracy = stats.total > 0 ? (stats.correct / stats.total) : 0;
        return stats.total >= 5 && accuracy < 0.7;
      })
      .sort((a, b) => {
        const accA = a[1].correct / a[1].total;
        const accB = b[1].correct / b[1].total;
        return accA - accB;
      })
      .slice(0, 5)
      .map(([tenseId, stats]) => ({
        tenseId,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        total: stats.total
      }));
  },

  /**
   * Réinitialise toutes les données
   */
  reset() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes vos données ? Cette action est irréversible.')) {
      Storage.remove(Storage.KEYS.DATA);
      location.reload();
    }
  },

  /**
   * Exporte les données au format JSON
   * @returns {string}
   */
  exportData() {
    return JSON.stringify(this.data, null, 2);
  },

  /**
   * Importe des données depuis un fichier JSON
   * @param {string} jsonString - Données JSON à importer
   */
  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      this.data = { ...this.data, ...parsed };
      this.save();
      UI.showToast('Données importées avec succès !', 'success');
      UI.updateAll();
    } catch(e) {
      console.error('Import failed', e);
      UI.showToast('Erreur lors de l\'import des données', 'error');
    }
  }
};
