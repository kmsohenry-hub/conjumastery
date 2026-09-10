import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { showToast } from '../../../../src/ui/utils/toast.js';

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div id="toastContainer"></div>';
});

afterEach(() => {
  vi.useRealTimers();
});

describe('showToast', () => {
  it('creates and appends a toast with the requested type', () => {
    const toast = showToast('Bienvenue', 'success');

    expect(toast).toBeTruthy();
    expect(toast.className).toBe('toast toast-success');
    expect(toast.textContent).toBe('Bienvenue');
    expect(document.querySelector('#toastContainer .toast')).toBe(toast);
  });

  it('uses info as the default type', () => {
    const toast = showToast('Information');
    expect(toast.className).toBe('toast toast-info');
  });

  it('starts the exit transition after three seconds and removes the toast 300ms later', () => {
    const toast = showToast('Temporaire');

    vi.advanceTimersByTime(2999);
    expect(toast.style.opacity).toBe('');
    expect(document.querySelector('.toast')).toBe(toast);

    vi.advanceTimersByTime(1);
    expect(toast.style.opacity).toBe('0');
    expect(toast.style.transform).toBe('translateX(100px)');
    expect(toast.style.transition).toBe('all 0.3s ease');
    expect(document.querySelector('.toast')).toBe(toast);

    vi.advanceTimersByTime(299);
    expect(document.querySelector('.toast')).toBe(toast);

    vi.advanceTimersByTime(1);
    expect(document.querySelector('.toast')).toBeNull();
  });
});

describe('showToast resilience', () => {
  it('creates the toast container lazily when it is absent', () => {
    document.body.innerHTML = '';

    const toast = showToast('Impossible à afficher');

    expect(toast).not.toBeNull();
    expect(document.getElementById('toastContainer')).toBeTruthy();
    expect(document.getElementById('toastContainer')).toContain(toast);
  });
});

describe('showToast actions', () => {
  it('renders a persistent action button and runs its callback', () => {
    const onAction = vi.fn();

    showToast('Mise à jour disponible', 'info', {
      actionLabel: 'Mettre à jour',
      onAction,
      duration: 0,
    });

    const button = document.querySelector('.toast-action');
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Mettre à jour');

    button.click();

    expect(onAction).toHaveBeenCalledOnce();
    expect(document.querySelector('.toast')).toBeNull();
  });
});
