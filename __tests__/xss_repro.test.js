/**
 * Reproduction test for XSS vulnerability in showToast
 */

import { describe, test, expect } from 'vitest';
import { showToast } from '../app.js';

// Vitest compatibility for Bun
if (typeof vi === 'undefined') {
  global.vi = {
    fn: (fn) => {
      const mock = (...args) => {
        mock.calls.push(args);
        return fn ? fn(...args) : undefined;
      };
      mock.calls = [];
      mock.mockReturnValue = (val) => {
        fn = () => val;
        return mock;
      };
      mock.mockResolvedValue = (val) => {
        fn = () => Promise.resolve(val);
        return mock;
      };
      mock.mockClear = () => {
        mock.calls = [];
        return mock;
      };
      return mock;
    },
  };
}

// Helper for Mock elements
const createMockElement = () => ({
  style: {},
  classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn() },
  appendChild: vi.fn(),
  querySelector: vi.fn(() => null),
  querySelectorAll: vi.fn(() => []),
  setAttribute: vi.fn(),
  removeAttribute: vi.fn(),
  click: vi.fn(),
  innerHTML: '',
  textContent: '',
  remove: vi.fn()
});

// Mock DOM & globals
global.window = global;
global.document = {
  addEventListener: vi.fn(),
  createElement: vi.fn(createMockElement),
  getElementById: vi.fn((_id) => createMockElement()),
  documentElement: { setAttribute: vi.fn() },
  DOMContentLoaded: 'DOMContentLoaded'
};
global.localStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.Notification = {
  permission: 'granted',
  requestPermission: vi.fn().mockResolvedValue('granted')
};

// Global mocks for app.js
global.launchConfetti = vi.fn();
global.updateUI = vi.fn();

// Mock APP_DATA
global.APP_DATA = {
  tenses: [],
  irregularVerbs: []
};


describe('showToast XSS Vulnerability', () => {
  test('showToast should NOT render HTML in the message', () => {
    const containerMock = createMockElement();
    const toastMock = createMockElement();

    global.document.getElementById = vi.fn((id) => {
      if (id === 'toastContainer') return containerMock;
      return null;
    });

    global.document.createElement = vi.fn((tag) => {
      if (tag === 'div') return toastMock;
      return createMockElement();
    });

    const maliciousPayload = '<img src=x onerror=alert(1)>';

    // Call the vulnerable function
    showToast(maliciousPayload, 'error');

    // Check if innerHTML was used (vulnerable) or textContent (secure)
    expect(toastMock.innerHTML).toBe('');
    expect(toastMock.textContent).toBe(maliciousPayload);
  });
});
