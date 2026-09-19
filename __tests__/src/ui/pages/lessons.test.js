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
  openTenseModal,
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

  it('opens tense modal through the exported helper', () => {
    openTenseModal({
      id: 'present_simple',
      nameEN: 'Present Simple',
      nameFR: 'Présent simple',
      level: 'beginner',
      usage: 'Habitudes',
      structure: 'Subject + base verb',
      examples: { affirmative: 'I work.', negative: "I don't work.", interrogative: 'Do I work?' },
    });
    expect(document.getElementById('modalContent').innerHTML).toContain('Present Simple');
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

    const arrow = renderTimeline({
      timeline: { type: 'arrow', start: 20, end: 80, label: 'Continuous' },
    });
    expect(arrow).toContain('Continuous');

    const cycle = renderTimeline({
      timeline: { type: 'cycle' },
    });
    expect(cycle).toContain('timeline-cycle');

    const unknown = renderTimeline({ timeline: { type: 'unsupported' } });
    expect(unknown).toBe('');

    const noTimeline = renderTimeline({});
    expect(noTimeline).toBe('');
  });

  it('renders tense modal with signal words and common mistakes', () => {
    openTenseModal(
      {
        id: 'past_simple',
        nameEN: 'Past Simple',
        nameFR: 'Passé simple',
        level: 'beginner',
        usage: ['Action passée'],
        structure: 'Subject + V2',
        examples: { affirmative: 'I went.' },
        signalWords: ['yesterday', 'ago'],
        commonMistakes: [{ wrong: 'I did went', right: 'I went', note: 'Never use did with V2' }],
      },
      'l_past_simple',
    );

    const modalHtml = document.getElementById('modalContent').innerHTML;
    expect(modalHtml).toContain('yesterday');
    expect(modalHtml).toContain('I did went');
    expect(modalHtml).toContain('data-lesson-id="l_past_simple"');
  });

  it('switches tabs visually when a button is passed to showModule', () => {
    renderLessons();
    const btn = document.querySelectorAll('#lessonTabs .tab')[1];
    showModule(1, btn);
    expect(btn.classList.contains('active')).toBe(true);
  });
});
