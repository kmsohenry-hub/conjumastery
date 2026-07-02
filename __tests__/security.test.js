/**
 * Tests unitaires pour les fonctions de sécurité.
 *
 * Note: ce fichier s'exécute dans l'environnement jsdom configuré par
 * vitest.config.js, ce qui nous permet de tester escapeHtml() contre un
 * vrai DOM plutôt qu'un mock approximatif.
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
  createElement: vi.fn(() => {
    const el = {
      style: {},
      classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn() },
      appendChild: vi.fn(),
      _textContent: '',
      get textContent() {
        return this._textContent;
      },
      set textContent(val) {
        this._textContent = val;
        // Basic escaping to simulate jsdom/browser behavior for tests
        // Browsers generally don't escape quotes when setting textContent
        this.innerHTML = val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      },
      innerHTML: '',
    };
    return el;
  }),
  getElementById: vi.fn(() => ({
    style: {},
    classList: { add: vi.fn(), remove: vi.fn(), toggle: vi.fn() },
    innerHTML: '',
    textContent: '',
  })),
  documentElement: { setAttribute: vi.fn() },
  DOMContentLoaded: 'DOMContentLoaded',
};
global.localStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.Notification = {
  permission: 'granted',
  requestPermission: vi.fn().mockResolvedValue('granted'),
};

// Global mocks for app.js
global.showToast = vi.fn();
global.launchConfetti = vi.fn();
global.updateUI = vi.fn();

// Mock APP_DATA
global.APP_DATA = {
  tenses: [],
  irregularVerbs: [],
};

// Load app.js
const appContent = fs.readFileSync(path.resolve(__dirname, '..', 'app.js'), 'utf8');

// Assign to global for evaluation
appContent
  .replace(/function\s+escapeHtml/g, 'global.escapeHtml = function')
  .replace(/function\s+sanitizeInput/g, 'global.sanitizeInput = function');

// @vitest-environment jsdom

import { escapeHtml, sanitizeInput } from '../src/core/security.js';

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    test('trims whitespace from both ends', () => {
      expect(sanitizeInput('  test string  ')).toBe('test string');
    });

    test('truncates string to 500 characters', () => {
      const longString = 'a'.repeat(600);
      const sanitized = sanitizeInput(longString);
      expect(sanitized.length).toBe(500);
      expect(sanitized).toBe('a'.repeat(500));
    });

    test('returns empty string for non-string inputs', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
      expect(sanitizeInput({ key: 'value' })).toBe('');
      expect(sanitizeInput(['a', 'b'])).toBe('');
    });

    test('preserves a normal string unchanged', () => {
      const input = 'just-a-normal-string';
      expect(sanitizeInput(input)).toBe(input);
    });

    test('handles empty string', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('escapeHtml', () => {
    test('escapes the canonical XSS payload', () => {
      const out = escapeHtml('<script>alert("xss")</script>');
      expect(out).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(out).not.toContain('<script>');
    });

    test('escapes ampersand and angle brackets', () => {
      expect(escapeHtml('a < b && c > d')).toBe('a &lt; b &amp;&amp; c &gt; d');
    });

    test('returns input as-is when not a string', () => {
      expect(escapeHtml(123)).toBe(123);
      expect(escapeHtml(null)).toBe(null);
      expect(escapeHtml(undefined)).toBe(undefined);
    });

    test('passes through plain text without modification', () => {
      expect(escapeHtml('Hello world!')).toBe('Hello world!');
    });

    test('escapes nested HTML elements', () => {
      const out = escapeHtml('<img src=x onerror="alert(1)">');
      expect(out).not.toContain('<img');
      expect(out).toContain('&lt;img');
    });
  });
});
