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
  it('creates 30 animated confetti pieces with expected styling', () => {
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
    launchConfetti();
    expect(document.querySelectorAll('.confetti-piece')).toHaveLength(30);

    vi.advanceTimersByTime(2499);
    expect(document.querySelectorAll('.confetti-piece')).toHaveLength(30);

    vi.advanceTimersByTime(1);
    expect(document.querySelectorAll('.confetti-piece')).toHaveLength(0);
  });
});
