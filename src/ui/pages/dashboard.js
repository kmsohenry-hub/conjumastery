import { State } from '../../core/state/State.js';
import { APP_DATA } from '../../../data.js';


export function renderDashboard() {
  const d = State.data;
  renderDashboardStats(d);

  renderDashboardNextLesson(d.completedLessons);

  const queue = State.getReviewQueue();
  renderDashboardRevisionQueue(queue);

  // Chart
  renderDashboardChart();
}

export function renderDashboardNextLesson(completedLessons) {
  const nextLessonEl = document.getElementById('dashNextLesson');
  const incompleteLessons = [];
  const completedSet = new Set(completedLessons);
  APP_DATA.modules.forEach((mod) => {
    mod.lessons.forEach((l) => {
      if (!completedSet.has(l.id)) {
        incompleteLessons.push({ ...l, module: mod });
      }
    });
  });

  if (incompleteLessons.length > 0) {
    const next = incompleteLessons[0];
    nextLessonEl.innerHTML = `
      <div class="lesson-card" onclick="('lessons')">
        <div class="lesson-icon" style="background:${next.module.color}20;color:${next.module.color}">${next.module.icon}</div>
        <div class="lesson-info">
          <div class="lesson-title">${next.title}</div>
          <div class="lesson-desc">${next.desc}</div>
          <div class="lesson-meta">
            <span class="level-badge level-${next.module.level}">${next.module.name}</span>
            <span>📝 ${next.exercises} exercices</span>
          </div>
        </div>
      </div>`;
  } else {
    nextLessonEl.innerHTML =
      '<p style="color:var(--text-light);font-size:0.9rem">🎉 Toutes les leçons sont terminées !</p>';
  }
}

export function renderDashboardRevisionQueue(queue) {
  const queueEl = document.getElementById('dashRevisionQueue');
  if (queue.length > 0) {
    queueEl.innerHTML = queue
      .slice(0, 5)
      .map((q) => {
        const tense = APP_DATA.tensesById[q.tenseId];
        return `<div class="revision-item">
        <span class="ri-icon">📖</span>
        <div class="ri-info">
          <div class="ri-title">${tense ? tense.nameFR : q.tenseId}</div>
          <div class="ri-meta">Erreurs : ${q.errors} • Intervalle : ${q.interval}min</div>
        </div>
        <span class="ri-priority ${q.errors > 3 ? 'priority-high' : q.errors > 1 ? 'priority-medium' : 'priority-low'}">${q.errors > 3 ? 'Urgent' : q.errors > 1 ? 'Moyen' : 'Faible'}</span>
      </div>`;
      })
      .join('');
  } else {
    queueEl.innerHTML =
      '<p style="color:var(--text-light);font-size:0.9rem">✅ Aucune révision en attente. Continuez les leçons !</p>';
  }
  document.getElementById('revisionBadge').textContent = queue.length;
}

export function renderDashboardStats(d) {
  document.getElementById('dashXP').textContent = d.xp;
  document.getElementById('dashLevel').textContent = d.level;
  document.getElementById('dashExercises').textContent = d.totalExercises;
  const accuracy =
    d.totalExercises > 0 ? Math.round((d.correctAnswers / d.totalExercises) * 100) : 0;
  document.getElementById('dashAccuracy').textContent = accuracy + '%';
}

export function renderDashboardChart() {
  const chartEl = document.getElementById('dashChart');
  const stats = State.data.tenseStats;
  const tenses = APP_DATA.tenses.slice(0, 8);

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < tenses.length; i++) {
    const t = tenses[i];
    const s = stats[t.id];
    const accuracy = s ? Math.round((s.correct / s.total) * 100) : 0;
    const height = s ? Math.max(accuracy, 5) : 5;
    const color =
      accuracy >= 80 ? 'var(--success)' : accuracy >= 50 ? 'var(--warning)' : 'var(--danger)';

    const barItem = document.createElement('div');
    barItem.className = 'bar-item';

    const barValue = document.createElement('div');
    barValue.className = 'bar-value';
    barValue.textContent = s ? accuracy + '%' : '—';

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = height + '%';
    bar.style.background = color;

    const barLabel = document.createElement('div');
    barLabel.className = 'bar-label';
    barLabel.textContent = t.nameFR.split(' ')[0];

    barItem.appendChild(barValue);
    barItem.appendChild(bar);
    barItem.appendChild(barLabel);
    fragment.appendChild(barItem);
  }
  chartEl.replaceChildren(fragment);
}
