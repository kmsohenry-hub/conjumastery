import { State } from '../../core/state/State.js';

import { showToast } from './toast.js';

export const NotificationManager = {
  lastNotificationTime: 0,
  minInterval: 60 * 60 * 1000, // 1 hour between notifications to avoid spam

  init() {
    this.updateUI();
    // Check every minute
    setInterval(() => this.checkAndNotify(), 60 * 1000);
  },

  updateUI() {
    const btn = document.getElementById('notificationToggleBtn');
    if (!btn) return;

    if (!('Notification' in window)) {
      btn.textContent = 'Non supporté par votre navigateur';
      btn.disabled = true;
      return;
    }

    if (Notification.permission === 'granted') {
      btn.textContent = 'Désactiver les notifications (via navigateur)';
      btn.classList.add('active');
    } else if (Notification.permission === 'denied') {
      btn.textContent = 'Notifications bloquées (voir réglages navigateur)';
      btn.disabled = true;
    } else {
      btn.textContent = 'Activer les notifications';
      btn.classList.remove('active');
      btn.disabled = false;
    }
  },

  toggle() {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        this.updateUI();
        if (permission === 'granted') {
          showToast('✅ Notifications activées', 'success');
        }
      });
    } else if (Notification.permission === 'granted') {
      showToast('ℹ️ Désactivez-les depuis les paramètres de votre navigateur', 'info');
    }
  },

  checkAndNotify() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const now = Date.now();
    if (now - this.lastNotificationTime < this.minInterval) return;

    const queue = State.getReviewQueue();
    if (queue.length > 0) {
      this.sendNotification(
        'Temps de réviser !',
        `Vous avez ${queue.length} leçon(s) en attente de révision.`,
      );
      this.lastNotificationTime = now;
    } else if (State.data.lastActiveDate) {
      // Check if user has practiced today
      const today = new Date().toDateString();
      if (
        State.data.lastActiveDate !== today &&
        now - this.lastNotificationTime > this.minInterval * 4
      ) {
        this.sendNotification(
          "N'oubliez pas l'anglais !",
          "Gardez votre série d'apprentissage active en faisant un exercice aujourd'hui.",
        );
        this.lastNotificationTime = now;
      }
    }
  },

  sendNotification(title, body) {
    new Notification(title, {
      body: body,
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🇬🇧</text></svg>',
    });
  },
};
