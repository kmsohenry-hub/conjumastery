/**
 * Tests unitaires pour les fonctions de sécurité.
 *
 * Note: ce fichier s'exécute dans l'environnement jsdom configuré par
 * vitest.config.js, ce qui nous permet de tester escapeHtml() contre un
 * vrai DOM plutôt qu'un mock approximatif.
 */

// @vitest-environment jsdom

import { describe, test, expect } from 'vitest';
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
      // jsdom n'échappe pas les guillemets via textContent/innerHTML
      // (comportement conforme au navigateur réel).
      expect(out).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
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
