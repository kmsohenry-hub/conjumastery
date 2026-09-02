import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { showToast } from '../../../../src/ui/utils/toast.js';

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div id="toastContainer"></div>';
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('showToast', () => {
  it('creates and appends a toast with the requested type', () => {
    showToast('Message de test', 'success');

    const toast = document.querySelector('#toastContainer .toast');
    expect(toast).not.toBeNull();
    expect(toast.className).toBe('toast toast-success');
    expect(toast.textContent).toBe('Message de test');
  });

  it('uses info as the default type', () => {
    showToast('Information');

    expect(document.querySelector('.toast').className).toBe('toast toast-info');
  });

  it('starts the exit transition after three seconds and removes the toast 300ms later', () => {
    showToast('À supprimer', 'error');
    const toast = document.querySelector('.toast');

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
