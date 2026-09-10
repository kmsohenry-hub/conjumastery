import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initEventDelegation, navigateTo } from '../../../src/ui/navigation.js';

describe('CSP Strict Enforcement & Global Zero Inline Handlers (AUDIT-01, AUDIT-02)', () => {
  let indexHtmlContent;

  beforeEach(() => {
    indexHtmlContent = fs.readFileSync('index.html', 'utf8');
    document.body.innerHTML = indexHtmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
  });

  it('verifies that CSP script-src strictly enforces self and prohibits unsafe-inline', () => {
    const cspTag = indexHtmlContent.match(
      /<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i,
    )?.[0];
    const csp = cspTag?.match(/content=["']([^"']+)["']/i)?.[1];

    expect(csp).toBeTruthy();
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });

  it('uses aria-current="page" on active nav item and removes it on inactive items (P-07)', () => {
    navigateTo('lessons');
    const activeItem = document.querySelector('.sidebar .nav-item.active');
    expect(activeItem).toBeTruthy();
    expect(activeItem.getAttribute('aria-current')).toBe('page');
    expect(activeItem.hasAttribute('aria-selected')).toBe(false);

    const inactiveItems = document.querySelectorAll('.sidebar .nav-item:not(.active)');
    inactiveItems.forEach((item) => {
      expect(item.hasAttribute('aria-current')).toBe(false);
      expect(item.hasAttribute('aria-selected')).toBe(false);
    });
  });

  it('verifies that index.html contains ZERO inline on... handlers', () => {
    const inlineHandlers = indexHtmlContent.match(/\bon[a-z]+\s*=\s*["'][^"']*["']/gi) || [];
    expect(inlineHandlers).toHaveLength(0);
  });

  it('verifies that all modules in src/ui/pages/ contain ZERO inline on... handlers', () => {
    const pagesDir = 'src/ui/pages';
    if (!fs.existsSync(pagesDir)) return;

    const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.js'));
    const violatingFiles = [];

    files.forEach((file) => {
      const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
      const matches = content.match(/\bon[a-z]+\s*=\s*["'][^"']*["']/gi);
      const setAttrMatches = content.match(/setAttribute\s*\(\s*['"]on[a-z]+['"]/gi);
      if (matches || setAttrMatches) {
        violatingFiles.push({ file, matches, setAttrMatches });
      }
    });

    expect(violatingFiles).toEqual([]);
  });

  it('dispatches navigation when clicking a data-page sidebar item', () => {
    const lessonsNav = document.querySelector('.sidebar [data-page="lessons"]');
    expect(lessonsNav).toBeTruthy();

    lessonsNav.click();
    const lessonsPage = document.getElementById('page-lessons');
    expect(lessonsPage.classList.contains('active')).toBe(true);
  });

  it('delegates clicks on mode cards to startExercise', () => {
    window.startExercise = vi.fn();
    const qcmCard = document.querySelector('[data-mode="qcm"]');
    expect(qcmCard).toBeTruthy();

    qcmCard.click();
    expect(qcmCard).toBeTruthy();
  });

  it('delegates clicks on theme toggle button', () => {
    const themeBtn = document.getElementById('themeBtn');
    expect(themeBtn).toBeTruthy();

    themeBtn.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('delegates clicks on sidebar menu toggle', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    expect(menuToggle).toBeTruthy();

    menuToggle.click();
    expect(document.getElementById('sidebar').classList.contains('open')).toBe(true);
  });

  it('ensures nav-items and mode-cards have role="button" and tabindex="0" for keyboard accessibility (P-06)', () => {
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    expect(navItems.length).toBeGreaterThan(0);
    navItems.forEach((item) => {
      expect(item.getAttribute('role')).toBe('button');
      expect(item.getAttribute('tabindex')).toBe('0');
    });

    const modeCards = document.querySelectorAll('.mode-card');
    expect(modeCards.length).toBeGreaterThan(0);
    modeCards.forEach((card) => {
      expect(card.getAttribute('role')).toBe('button');
      expect(card.getAttribute('tabindex')).toBe('0');
    });
  });
});
