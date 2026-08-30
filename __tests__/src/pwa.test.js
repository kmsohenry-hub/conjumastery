import { beforeEach, describe, expect, it } from 'vitest';
import { updateOnlineStatus } from '../../src/pwa.js';

beforeEach(() => {
  document.body.innerHTML = '<div id="offlineIndicator" hidden></div>';
});

describe('pwa module', () => {
  it('updates offline indicator based on navigator.onLine', () => {
    const indicator = document.getElementById('offlineIndicator');
    updateOnlineStatus();
    expect(indicator.hidden).toBe(navigator.onLine);
  });
});
