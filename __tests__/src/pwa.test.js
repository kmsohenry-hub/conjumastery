import { beforeEach, describe, expect, it } from 'vitest';
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
