import fs from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initEventDelegation, navigateTo } from '../../../src/ui/navigation.js';

describe('CSP Hardening and Event Delegation (Issue #116)', () => {
  let indexHtmlContent;

  beforeEach(() => {
    indexHtmlContent = fs.readFileSync('index.html', 'utf8');
    document.body.innerHTML = indexHtmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
    initEventDelegation();
  });

  it('verifies that CSP script-src does not allow unsafe-inline', () => {
    const cspMatch = indexHtmlContent.match(
      /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*content=["']([^"']+)["']/i,
    );
    expect(cspMatch).toBeTruthy();

    const csp = cspMatch[1];
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });

  it('verifies that index.html contains zero inline onclick handlers', () => {
    const inlineOnclicks = indexHtmlContent.match(/onclick=["'][^"']*["']/gi) || [];
    expect(inlineOnclicks).toHaveLength(0);
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
    expect(window.startExercise).toHaveBeenCalledWith('qcm');
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
});
