import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { launchConfetti } from '../../../../src/ui/utils/confetti.js';

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '';
  vi.spyOn(Math, 'random').mockReturnValue(0.25);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('launchConfetti', () => {
  it('creates 30 animated confetti pieces with expected styling in normal mode', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
    }));

    launchConfetti();

    const pieces = [...document.querySelectorAll('.confetti-piece')];
    expect(pieces).toHaveLength(30);
    expect(pieces[0].className).toBe('confetti-piece');
    expect(pieces[0].style.left).toBe('25vw');
    expect(pieces[0].style.top).toBe('85vh');
    expect(pieces[0].style.background).toBe('rgb(0, 206, 201)');
    expect(pieces[0].style.borderRadius).toBe('2px');
    expect(pieces[0].style.width).toBe('8px');
    expect(pieces[0].style.height).toBe('8px');
    expect(pieces[0].style.animationDuration).toBe('1.1s');
  });

  it('removes every confetti piece after 2.5 seconds', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
    }));

    launchConfetti();
    expect(document.querySelectorAll('.confetti-piece')).toHaveLength(30);

    vi.advanceTimersByTime(2499);
    expect(document.querySelectorAll('.confetti-piece')).toHaveLength(30);

    vi.advanceTimersByTime(1);
    expect(document.querySelectorAll('.confetti-piece')).toHaveLength(0);
  });

  it('does not create any confetti pieces when prefers-reduced-motion is active (Issue #117)', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
    }));

    launchConfetti();
    expect(document.querySelectorAll('.confetti-piece')).toHaveLength(0);
  });
});
