/**
 * Point d'entrée principal de l'application ConjuMaster UK
 * Initialise tous les modules et gère le cycle de vie de l'application
 */

import { State } from './core/state.js';
import { UI } from './ui/ui.js';
import { Storage } from './storage/storage.js';
import { ExerciseEngine } from './logic/exercise.js';
import { APP_DATA } from './data/data.js';

// ============================================================
// FONCTIONS GLOBALES POUR L'INTERFACE
// ============================================================

/**
 * Lance l'effet de confettis
 */
window.launchConfetti = function() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const colors = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50', '#ff9800', '#9c27b0'];
  
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1
    });
  }
  
  let animationId;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      
      p.y += p.speedY;
      p.x += p.speedX;
      
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
    
    animationId = requestAnimationFrame(animate);
  }
  
  animate();
  
  setTimeout(() => {
    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 3000);
};

/**
 * Fonction d'initialisation principale
 */
function init() {
  console.log('🇬🇧 ConjuMaster UK - Initialisation...');
  
  // Initialiser les modules
  State.init();
  UI.init();
  
  // Configuration des gestionnaires d'événements globaux
  setupGlobalEventListeners();
  
  // Afficher la page par défaut
  UI.navigateTo('dashboard');
  
  console.log('✅ Application prête!');
}

/**
 * Configure les écouteurs d'événements globaux
 */
function setupGlobalEventListeners() {
  // Gestion du bouton de thème
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => UI.toggleTheme());
  }
  
  // Gestion du menu hamburger
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => UI.toggleSidebar());
  }
  
  // Navigation dans la sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const page = item.dataset.page;
      if (page) {
        UI.navigateTo(page);
      }
    });
  });
  
  // Fermeture des modales au clic extérieur
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        UI.closeModals();
      }
    });
  });
  
  // Export des données
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }
  
  // Import des données
  const importInput = document.getElementById('importInput');
  if (importInput) {
    importInput.addEventListener('change', importData);
  }
  
  // Réinitialisation des données
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => State.reset());
  }
}

/**
 * Exporte les données utilisateur
 */
function exportData() {
  const data = State.exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conjumaster-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  UI.showToast('📤 Données exportées avec succès', 'success');
}

/**
 * Importe les données utilisateur
 */
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      State.importData(e.target.result);
      UI.showToast('📥 Données importées avec succès', 'success');
    } catch (err) {
      UI.showToast('❌ Fichier invalide', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ============================================================
// DÉMARRAGE DE L'APPLICATION
// ============================================================

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export pour utilisation dans d'autres modules
export { State, UI, Storage, ExerciseEngine, APP_DATA };
