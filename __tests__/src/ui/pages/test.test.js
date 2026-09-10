import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cancelTest,
  finishTest,
  renderTestQuestion,
  renderTestSetup,
  startTest,
} from '../../../../src/ui/pages/test.js';

describe('test page lifecycle and timer cancel', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="testSetup"></div>
      <div id="testArea" style="display:none">
        <span id="testCurrent"></span>
        <span id="testTotal"></span>
        <span id="testScore"></span>
        <div id="testProgressBar"></div>
        <div id="testQuestionContainer"></div>
        <div id="testFeedback"></div>
        <button id="testValidateBtn"></button>
        <button id="testNextBtn"></button>
        <span id="testTimer">00:00</span>
      </div>
      <div id="testResults" style="display:none"></div>
      <div id="testTenseCheckboxes"></div>
      <select id="testDifficulty"><option value="intermediate" selected>Intermédiaire</option></select>
    `;
  });

  describe('cancelTest and timer cleanup (Issue #104)', () => {
    it('records and displays actual elapsed time in finishTest (125s -> 2min 5s) (Issue P-01)', () => {
      vi.useFakeTimers();
      renderTestSetup();
      startTest();

      // Advance 125 seconds
      vi.advanceTimersByTime(125000);

      finishTest();
      const resultsEl = document.getElementById('testResults');
      expect(resultsEl.style.display).toBe('block');
      expect(resultsEl.innerHTML).toContain('2min 5s');
      expect(resultsEl.innerHTML).not.toContain('0min 0s');

      vi.useRealTimers();
    });

    it('immediately resets DOM #testTimer to 00:00 on cancelTest (Issue P-09)', () => {
      vi.useFakeTimers();
      renderTestSetup();
      startTest();
      vi.advanceTimersByTime(45000);
      const timerEl = document.getElementById('testTimer');
      expect(timerEl.textContent).toBe('00:45');

      cancelTest();
      expect(timerEl.textContent).toBe('00:00');
      vi.useRealTimers();
    });

    it('clears active interval and resets seconds counter', () => {
      vi.useFakeTimers();
      renderTestSetup();
      startTest();

      // Advance timer by 5 seconds
      vi.advanceTimersByTime(5000);
      const timerEl = document.getElementById('testTimer');
      expect(timerEl.textContent).toBe('00:05');

      // Cancel the active test
      cancelTest();

      // Advance further — timer should NOT tick
      vi.advanceTimersByTime(5000);
      expect(timerEl.textContent).toBe('00:00');

      vi.useRealTimers();
    });

    it('handles multiple cancelTest calls safely', () => {
      expect(() => {
        cancelTest();
        cancelTest();
      }).not.toThrow();
    });

    it('resets timer when a new test starts', () => {
      vi.useFakeTimers();
      renderTestSetup();
      startTest();
      vi.advanceTimersByTime(3000);
      expect(document.getElementById('testTimer').textContent).toBe('00:03');

      // Start a second test immediately — should cancel previous timer
      startTest();
      expect(document.getElementById('testTimer').textContent).toBe('00:00');

      vi.advanceTimersByTime(2000);
      expect(document.getElementById('testTimer').textContent).toBe('00:02');

      cancelTest();
      vi.useRealTimers();
    });
  });

  describe('renderTestQuestion', () => {
    it('populates question details and updates progress bar', () => {
      renderTestSetup();
      startTest();

      expect(document.getElementById('testCurrent').textContent).toBe('1');
      expect(document.getElementById('testTotal').textContent).toBe('20');
      expect(document.getElementById('testScore').textContent).toBe('0');
      expect(document.getElementById('testProgressBar').style.width).toBe('5%');
      expect(document.getElementById('testQuestionContainer').children.length).toBeGreaterThan(0);

      cancelTest();
    });
  });
});
