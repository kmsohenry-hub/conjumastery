import { showToast } from './ui/utils/toast.js';

const promptedRegistrations = new WeakSet();

export function updateOnlineStatus() {
  const indicator = document.getElementById('offlineIndicator');
  if (!indicator) return;
  indicator.hidden = navigator.onLine;
}

export function announceUpdate(registration, { reload }) {
  if (promptedRegistrations.has(registration) || !registration?.waiting) return null;
  promptedRegistrations.add(registration);

  const applyUpdate = () => {
    const waitingWorker = registration.waiting;
    if (!waitingWorker) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => reload(), { once: true });
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  };

  return showToast('🎉 Une nouvelle version de ConjuMaster est disponible.', 'info', {
    actionLabel: 'Mettre à jour',
    onAction: applyUpdate,
    duration: 0,
  });
}

export function registerServiceWorker({ reload } = {}) {
  const reloadPage = reload ?? window.location.reload.bind(window.location);
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        if (registration.waiting) {
          announceUpdate(registration, { reload: reloadPage });
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                announceUpdate(registration, { reload: reloadPage });
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('[PWA] Service worker registration failed:', error);
      });
  });
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();
registerServiceWorker();
