import { beforeEach, describe, expect, it, vi } from 'vitest';
import { announceUpdate, updateOnlineStatus } from '../../src/pwa.js';

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

describe('service worker update lifecycle', () => {
  it('announces an already waiting update with an explicit action', async () => {
    const original = navigator.serviceWorker;
    const worker = { postMessage: vi.fn() };
    const registration = { waiting: worker, installing: null, addEventListener: vi.fn() };
    const register = vi.fn().mockResolvedValue(registration);
    const controllerListeners = [];
    const reload = vi.fn();
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register,
        controller: {},
        addEventListener: vi.fn((event, cb) => {
          controllerListeners.push({ event, cb });
        }),
      },
    });
    document.body.innerHTML = '<div id="toastContainer"></div>';
    try {
      const { registerServiceWorker } = await import('../../src/pwa.js');
      registerServiceWorker({ reload });
      window.dispatchEvent(new Event('load'));
      await Promise.resolve();
      await Promise.resolve();
      document.querySelector('.toast-action').click();
      expect(worker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
      expect(controllerListeners[0].event).toBe('controllerchange');
      controllerListeners[0].cb();
      expect(reload).toHaveBeenCalledOnce();
    } finally {
      Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: original });
    }
  });

  it('logs registration failures without interrupting the app', async () => {
    const original = navigator.serviceWorker;
    const register = vi.fn().mockRejectedValue(new Error('offline'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: { register } });
    try {
      const { registerServiceWorker } = await import('../../src/pwa.js');
      registerServiceWorker();
      window.dispatchEvent(new Event('load'));
      await Promise.resolve();
      await Promise.resolve();
      expect(warn).toHaveBeenCalledWith(
        '[PWA] Service worker registration failed:',
        expect.any(Error),
      );
    } finally {
      warn.mockRestore();
      Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: original });
    }
  });
});

describe('announceUpdate edge cases', () => {
  it('does not send a message when the waiting worker disappears before applying the update', () => {
    const worker = { postMessage: vi.fn() };
    const registration = { waiting: worker };
    const original = navigator.serviceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { addEventListener: vi.fn(), controller: {} },
    });
    document.body.innerHTML = '<div id="toastContainer"></div>';

    try {
      announceUpdate(registration, { reload: vi.fn() });
      registration.waiting = null;
      document.querySelector('.toast-action').click();

      expect(worker.postMessage).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: original });
    }
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
