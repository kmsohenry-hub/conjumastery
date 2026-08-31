import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockState } = vi.hoisted(() => ({
  mockState: {
    data: {
      completedLessons: ['l_present_simple'],
    },
    isFavorite: vi.fn().mockReturnValue(false),
  },
}));

vi.mock('../../../../src/core/state/State.js', () => ({
  State: mockState,
}));

import {
  renderLessons,
  showModule,
  openLesson,
  renderTimeline,
} from '../../../../src/ui/pages/lessons.js';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="lessonTabs"></div>
    <div id="lessonContent"></div>
    <div id="modalOverlay"></div>
    <div id="modalContent"></div>
  `;
});

describe('lessons page', () => {
  it('renders lesson module tabs and content', () => {
    renderLessons();
    expect(document.getElementById('lessonTabs').children.length).toBeGreaterThan(0);
    expect(document.getElementById('lessonContent').innerHTML).toContain('Les bases');
  });

  it('switches lesson module', () => {
    renderLessons();
    showModule(1);
    expect(document.getElementById('lessonContent').innerHTML).toContain('Intermédiaire');
  });

  it('opens tense modal when openLesson is called with tenseId', () => {
    openLesson('l_present_simple', 'present_simple');
    expect(document.getElementById('modalContent').innerHTML).toContain('Present Simple');
    expect(document.getElementById('modalOverlay').classList.contains('active')).toBe(true);
  });

  it('opens special modals for passive and reported speech', () => {
    openLesson('l_passive', null);
    expect(document.getElementById('modalContent').innerHTML).toContain('Voix Passive');

    openLesson('l_reported', null);
    expect(document.getElementById('modalContent').innerHTML).toContain('Discours Indirect');
  });

  it('renders different timeline types', () => {
    const dots = renderTimeline({ timeline: { type: 'dots', positions: [10, 20] } });
    expect(dots).toContain('timeline-event');

    const range = renderTimeline({ timeline: { type: 'range', start: 10, end: 50 } });
    expect(range).toContain('timeline-range');

    const point = renderTimeline({ timeline: { type: 'point', position: 30, label: 'X' } });
    expect(point).toContain('X');

    const double = renderTimeline({ timeline: { type: 'double-point', first: 10, second: 40 } });
    expect(double).toContain('1er événement');

    const conditional = renderTimeline({
      timeline: { type: 'conditional', condition: 10, result: 50 },
    });
    expect(conditional).toContain('Condition');
  });
});
