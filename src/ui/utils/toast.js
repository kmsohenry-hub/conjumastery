export function showToast(message, type = 'info', options = {}) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    container.setAttribute?.('aria-live', 'polite');
    container.setAttribute?.('aria-atomic', 'true');
    document.body.appendChild(container);
  } else if (
    typeof container.classList?.contains === 'function' &&
    !container.classList.contains('toast-container')
  ) {
    container.classList.add?.('toast-container');
  }

  const toastKey = `${type}:${message}`;
  if (typeof container.querySelectorAll === 'function') {
    const existingDuplicate = Array.from(container.querySelectorAll('.toast')).find(
      (el) => el.dataset?.toastKey === toastKey,
    );
    if (existingDuplicate) {
      existingDuplicate.remove?.();
    }
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  if (toast.dataset) {
    toast.dataset.toastKey = toastKey;
  }
  toast.setAttribute?.('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
  toast.textContent = message;

  const { actionLabel, onAction, duration = 3000 } = options;
  if (actionLabel && typeof onAction === 'function') {
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'toast-action';
    action.textContent = actionLabel;
    action.addEventListener('click', () => {
      onAction();
      toast.remove();
    });
    toast.appendChild(action);
  }

  container.appendChild(toast);
  if (duration > 0) {
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return toast;
}
