/**
 * Tests unitaires pour les fonctions de sécurité
 */

import { describe, test, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Mock DOM & globals
global.window = global;
global.document = {
  addEventListener: vi.fn(),
  createElement: vi.fn(() => ({
    style: {},
    classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn() },
    appendChild: vi.fn(),
    innerHTML: '',
    textContent: ''
  })),
  getElementById: vi.fn(() => ({
    style: {},
    classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn() },
    innerHTML: '',
    textContent: ''
  })),
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
global.showToast = vi.fn();
global.launchConfetti = vi.fn();
global.updateUI = vi.fn();

// Mock APP_DATA
global.APP_DATA = {
  tenses: [],
  irregularVerbs: []
};

// Load app.js
const appContent = fs.readFileSync(path.resolve(__dirname, '..', 'app.js'), 'utf8');

// Assign to global for evaluation
const sanitizedContent = appContent
  .replace(/function\s+escapeHtml/g, 'global.escapeHtml = function')
  .replace(/function\s+sanitizeInput/g, 'global.sanitizeInput = function');

eval(sanitizedContent);

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    test('should trim whitespace from both ends', () => {
      expect(sanitizeInput('  test string  ')).toBe('test string');
    });

    test('should truncate string to 500 characters', () => {
      const longString = 'a'.repeat(600);
      const sanitized = sanitizeInput(longString);
      expect(sanitized.length).toBe(500);
      expect(sanitized).toBe('a'.repeat(500));
    });

    test('should return empty string for non-string inputs', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
      expect(sanitizeInput({ key: 'value' })).toBe('');
      expect(sanitizeInput(['a', 'b'])).toBe('');
    });

    test('should return original string if within limit and no whitespace', () => {
      const input = 'just-a-normal-string';
      expect(sanitizeInput(input)).toBe(input);
    });

    test('should handle empty string', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('escapeHtml', () => {
    test('should escape HTML special characters', () => {
      // Note: Since we're mocking document.createElement and div.innerHTML,
      // we might need to adjust the mock to actually perform escaping if we want to test it properly,
      // but here we just check if it's called correctly if we used the mock.
      // However, the original function uses document.createElement('div').textContent = str; return div.innerHTML;

      // Let's refine the mock to act like a real DOM element for this test
      const mockDiv = {
        textContent: '',
        get innerHTML() {
          return this.textContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        }
      };
      global.document.createElement = vi.fn().mockReturnValue(mockDiv);

      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    test('should return input as is if not a string', () => {
      expect(escapeHtml(123)).toBe(123);
      expect(escapeHtml(null)).toBe(null);
    });
  });
});
