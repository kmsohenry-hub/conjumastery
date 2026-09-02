import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateOnlineStatus } from '../../src/pwa.js';

beforeEach(() => {
  document.body.innerHTML = '<div id="offlineIndicator" hidden></div>';
});

describe('pwa module', () => {
  it('shows the offline indicator when the browser is offline', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });

    updateOnlineStatus();

    expect(document.getElementById('offlineIndicator').hidden).toBe(false);
  });

  it('hides the offline indicator when the browser is online', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });

    updateOnlineStatus();

    expect(document.getElementById('offlineIndicator').hidden).toBe(true);
  });

  it('does nothing when the offline indicator is absent', () => {
    document.body.innerHTML = '';
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });

    expect(() => updateOnlineStatus()).not.toThrow();
  });
});

describe('service worker registration', () => {
  it('registers and handles an installed worker update', async () => {
    const original = navigator.serviceWorker;
    const listeners = {};
    const installing = {
      state: 'installed',
      addEventListener: vi.fn((event, cb) => {
        listeners[event] = cb;
      }),
    };
    const registration = { installing, addEventListener: vi.fn() };
    const register = vi.fn().mockResolvedValue(registration);
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register, controller: {} },
    });
    try {
      const { registerServiceWorker } = await import('../../src/pwa.js');
      registerServiceWorker();
      window.dispatchEvent(new Event('load'));
      await Promise.resolve();
      await Promise.resolve();
      expect(register).toHaveBeenCalledWith('./sw.js');
      registration.addEventListener.mock.calls[0][1]();
      listeners.statechange();
    } finally {
      Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: original });
    }
  });

  it('handles registration with no installing worker', async () => {
    const original = navigator.serviceWorker;
    const registration = { installing: null, addEventListener: vi.fn() };
    const register = vi.fn().mockResolvedValue(registration);
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register, controller: null },
    });
    try {
      const { registerServiceWorker } = await import('../../src/pwa.js');
      registerServiceWorker();
      window.dispatchEvent(new Event('load'));
      await Promise.resolve();
      await Promise.resolve();
      registration.addEventListener.mock.calls.at(-1)[1]();
      expect(register).toHaveBeenCalled();
    } finally {
      Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: original });
    }
  });

  it('swallows worker registration failures', async () => {
    const original = navigator.serviceWorker;
    const register = vi.fn().mockRejectedValue(new Error('offline'));
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { register } });
    try {
      const { registerServiceWorker } = await import('../../src/pwa.js');
      registerServiceWorker();
      window.dispatchEvent(new Event('load'));
      await Promise.resolve();
      await Promise.resolve();
      expect(register).toHaveBeenCalled();
    } finally {
      Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: original });
    }
  });
});
