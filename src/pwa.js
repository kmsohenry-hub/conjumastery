const offlineIndicator = document.getElementById('offlineIndicator');

function updateOnlineStatus() {
  if (!offlineIndicator) return;
  offlineIndicator.hidden = navigator.onLine;
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
