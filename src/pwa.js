export function updateOnlineStatus() {
  const indicator = document.getElementById('offlineIndicator');
  if (!indicator) return;
  indicator.hidden = navigator.onLine;
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

if ('serviceWorker' in navigator && typeof window !== 'undefined' && !window.__VITEST__) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available
              }
            });
          }
        });
      })
      .catch(() => {});
  });
}
