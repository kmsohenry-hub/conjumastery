import { escapeHtml } from '../../core/security.js';
import { State } from '../../core/state/State.js';
import { APP_DATA } from '../../data/index.js';

export function renderDashboard() {
  const d = State.data;
  renderDashboardStats(d);
  renderDashboardNextLesson(d.completedLessons);
  const queue = State.getReviewQueue();
  renderDashboardRevisionQueue(queue);
  renderDashboardChart();
}

export function renderDashboardNextLesson(completedLessons) {
  const nextLessonEl = document.getElementById('dashNextLesson');
  const incompleteLessons = [];
  const completedSet = new Set(completedLessons);

  APP_DATA.modules.forEach((mod, modIndex) => {
    mod.lessons.forEach((l) => {
      if (!completedSet.has(l.id)) {
        incompleteLessons.push({ ...l, module: mod, moduleIndex: modIndex });
      }
    });
  });

  if (incompleteLessons.length > 0) {
    const next = incompleteLessons[0];
    const durationLabel =
      next.duration || `${Math.max(5, Math.round((next.exercises || 10) * 0.8))} min`;
    nextLessonEl.innerHTML = `
      <div class="lesson-card" data-page="lessons" data-module-index="${next.moduleIndex}" role="button" tabindex="0">
        <div class="lesson-icon" style="background:var(--primary-soft);color:${escapeHtml(next.module.color)}">${escapeHtml(next.module.icon)}</div>
        <div class="lesson-info">
          <div class="lesson-title">${escapeHtml(next.title)}</div>
          <div class="lesson-desc">${escapeHtml(next.desc)}</div>
          <div class="lesson-meta">
            <span>📚 ${escapeHtml(String(next.exercises))} exercices</span>
            <span>⏱️ ${escapeHtml(durationLabel)}</span>
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
      .slice(0, 3)
      .map((q) => {
        const topic = APP_DATA.tensesById?.[q.tenseId] || APP_DATA.specialTopicsById?.[q.tenseId];
        return `<div class="revision-item">
        <span class="ri-icon">📖</span>
        <div class="ri-info">
          <div class="ri-title">${escapeHtml(topic ? topic.nameFR : q.tenseId)}</div>
          <div class="ri-meta">Prochaine révision : maintenant • ${escapeHtml(String(q.interval))}min d'intervalle</div>
        </div>
        <span class="ri-priority ${q.errors > 3 ? 'priority-high' : q.errors > 1 ? 'priority-medium' : 'priority-low'}">
          ${q.errors > 3 ? 'Urgent' : q.errors > 1 ? 'Moyen' : 'Faible'}
        </span>
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
    const hasAttempts = Boolean(s && s.total > 0);
    const accuracy = hasAttempts ? Math.round((s.correct / s.total) * 100) : 0;
    const height = hasAttempts ? Math.max(accuracy, 5) : 5;
    const color =
      accuracy >= 70
        ? 'var(--success)'
        : accuracy >= 40
          ? 'var(--warning)'
          : hasAttempts
            ? 'var(--danger)'
            : 'var(--border)';

    const barItem = document.createElement('div');
    barItem.className = 'bar-item';

    const barValue = document.createElement('div');
    barValue.className = 'bar-value';
    barValue.textContent = hasAttempts ? accuracy + '%' : '—';

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = height + '%';
    bar.style.background = color;

    const barLabel = document.createElement('div');
    barLabel.className = 'bar-label';
    const cleanLabel = t.nameFR
      .replace(/\s*\([^)]*\)/, '')
      .replace(/Continuous/gi, 'Cont.')
      .replace(/continu/gi, 'cont.')
      .replace(/Perfect/gi, 'Perf.')
      .trim();
    barLabel.textContent = cleanLabel;
    barLabel.title = t.nameFR;

    barItem.appendChild(barValue);
    barItem.appendChild(bar);
    barItem.appendChild(barLabel);

    fragment.appendChild(barItem);
  }

  chartEl.replaceChildren(fragment);
}
