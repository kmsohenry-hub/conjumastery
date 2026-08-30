import { State } from '../../core/state/State.js';
import { APP_DATA } from '../../data/index.js';
import { openModal } from '../navigation.js';

export function renderLessons() {
  const tabsEl = document.getElementById('lessonTabs');

  const fragment = document.createDocumentFragment();
  const len = APP_DATA.modules.length;
  for (let i = 0; i < len; i++) {
    const mod = APP_DATA.modules[i];
    const btn = document.createElement('button');
    btn.className = `tab ${i === 0 ? 'active' : ''}`;
    btn.setAttribute('onclick', `showModule(${i}, this)`);
    btn.innerHTML = `${mod.icon} ${mod.name}`;
    fragment.appendChild(btn);
  }
  tabsEl.innerHTML = '';
  tabsEl.appendChild(fragment);

  showModule(0);
}

export function showModule(index, tabEl) {
  if (tabEl) {
    const active = tabEl.parentElement.querySelector('.active');
    if (active) active.classList.remove('active');
    tabEl.classList.add('active');
  }
  const mod = APP_DATA.modules[index];
  const contentEl = document.getElementById('lessonContent');
  const completed = State.data.completedLessons;
  const completedSet = new Set(completed);

  contentEl.innerHTML = `
    <div style="margin-bottom:20px">
      <h2 style="font-size:1.2rem;margin-bottom:4px">${mod.icon} ${mod.name}</h2>
      <p style="font-size:0.85rem;color:var(--text-light)">Niveau ${mod.level} • ${mod.lessons.length} leçons</p>
    </div>
    <div class="grid" style="gap:12px">
      ${mod.lessons
        .map((lesson, i) => {
          const isCompleted = completedSet.has(lesson.id);
          const isLocked = i > 0 && !completedSet.has(mod.lessons[i - 1].id) && !isCompleted;
          const tense = lesson.tenseId ? APP_DATA.tensesById[lesson.tenseId] : null;
          return `<div class="lesson-card ${isLocked ? 'locked' : ''}" role="button" tabindex="${isLocked ? '-1' : '0'}" onclick="${isLocked ? '' : `openLesson('${lesson.id}', '${lesson.tenseId || ''}')`}">
          <div class="lesson-icon" style="background:${isCompleted ? 'var(--success)20' : isLocked ? 'var(--text-light)10' : mod.color + '20'};color:${isCompleted ? 'var(--success)' : isLocked ? 'var(--text-light)' : mod.color}">
            ${isCompleted ? '✅' : isLocked ? '🔒' : mod.icon}
          </div>
          <div class="lesson-info">
            <div class="lesson-title">${lesson.title}</div>
            <div class="lesson-desc">${lesson.desc}</div>
            <div class="lesson-meta">
              <span class="level-badge level-${mod.level}">${mod.level === 'beginner' ? 'Débutant' : mod.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}</span>
              <span>📝 ${lesson.exercises} exercices</span>
              ${tense ? `<span>⏱️ ${tense.nameFR}</span>` : ''}
            </div>
          </div>
        </div>`;
        })
        .join('')}
    </div>`;
}

export function openLesson(lessonId, tenseId) {
  if (tenseId) {
    const tense = APP_DATA.tensesById[tenseId];
    if (tense) {
      openTenseModal(tense);
    }
  } else {
    // Special lessons (passive, reported speech)
    if (lessonId === 'l_passive') openPassiveModal();
    else if (lessonId === 'l_reported') openReportedModal();
  }
}

export function openTenseModal(tense) {
  const modal = document.getElementById('modalContent');
  const isFav = State.isFavorite(tense.id);

  modal.innerHTML = `
    <div class="modal-header">
      <div>
        <div class="modal-title">${tense.nameFR}</div>
        <span class="level-badge level-${tense.level}" style="margin-top:6px">${tense.level === 'beginner' ? '🌱 Débutant' : tense.level === 'intermediate' ? '🌿 Intermédiaire' : '🌳 Avancé'}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFav('${tense.id}', this)" aria-label="Ajouter aux favoris">${isFav ? '★' : '☆'}</button>
        <button class="modal-close" onclick="closeModal()" aria-label="Fermer la modale">✕</button>
      </div>
    </div>

    <div class="explain-block">
      <h4>📝 Explication</h4>
      <p>${tense.explanation}</p>
    </div>

    <div class="explain-block">
      <h4>🏗️ Structure</h4>
      <p><strong>Affirmatif :</strong> <code>${tense.structure}</code></p>
      <p><strong>Négatif :</strong> <code>${tense.structureNeg}</code></p>
      <p><strong>Interrogatif :</strong> <code>${tense.structureQ}</code></p>
    </div>

    <h4 style="margin:20px 0 12px">📅 Timeline</h4>
    ${renderTimeline(tense)}

    <h4 style="margin:20px 0 12px">📖 Exemples</h4>
    ${tense.examples
      .map(
        (e) => `<div class="example-sentence">
      <div class="en">${e.en}</div>
      <div class="fr">${e.fr}</div>
    </div>`,
      )
      .join('')}

    <h4 style="margin:20px 0 12px">🎯 Usages</h4>
    <ul style="padding-left:20px;font-size:0.9rem;color:var(--text-light);line-height:2">
      ${tense.usage.map((u) => `<li>${u}</li>`).join('')}
    </ul>

    ${
      tense.signalWords
        ? `
    <h4 style="margin:20px 0 12px">🔑 Mots indicateurs</h4>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${tense.signalWords.map((w) => `<span class="tag tag-blue">${w}</span>`).join('')}
    </div>`
        : ''
    }

    ${
      tense.nuances
        ? `
    <div class="explain-block" style="border-left-color:var(--accent);margin-top:16px">
      <h4>💡 Nuances d'usage</h4>
      <p>${tense.nuances}</p>
    </div>`
        : ''
    }

    ${
      tense.commonErrors.length > 0
        ? `
    <h4 style="margin:20px 0 12px">⚠️ Erreurs fréquentes</h4>
    ${tense.commonErrors
      .map(
        (e) => `<div class="error-alert">
      <span class="wrong">${e.wrong}</span> → <span class="right">${e.right}</span>
      <br><small style="color:var(--text-light)">${e.note}</small>
    </div>`,
      )
      .join('')}`
        : ''
    }

    <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="closeModal();startExerciseForTense('${tense.id}')">🎮 Pratiquer ce temps</button>
      <button class="btn btn-outline" onclick="closeModal();navigateTo('comparison')">📊 Voir le comparatif</button>
    </div>`;

  openModal();
}

export function openPassiveModal() {
  const modal = document.getElementById('modalContent');
  const info = APP_DATA.passiveInfo;
  modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">Voix Passive</div>
      <button class="modal-close" onclick="closeModal()" aria-label="Fermer la modale">✕</button>
    </div>
    <div class="explain-block">
      <h4>📝 Explication</h4>
      <p>${info.explanation}</p>
    </div>
    <div class="explain-block">
      <h4>🏗️ Structure</h4>
      <p><code>${info.structure}</code></p>
    </div>
    <h4 style="margin:16px 0 12px">📖 Exemples</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <tr><th>Temps</th><th>Active</th><th>Passive</th></tr>
        ${info.examples.map((e) => `<tr><td>${e.tense}</td><td>${e.active}</td><td><strong>${e.passive}</strong></td></tr>`).join('')}
      </table>
    </div>
    <div class="explain-block" style="border-left-color:var(--accent);margin-top:16px">
      <h4>💡 Nuances</h4>
      <p>${info.nuances}</p>
    </div>
    <div style="margin-top:20px"><button class="btn btn-primary" onclick="closeModal();startExercise('mixed')">🎮 Pratiquer</button></div>`;
  openModal();
}

export function openReportedModal() {
  const modal = document.getElementById('modalContent');
  const info = APP_DATA.reportedSpeech;
  modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">Discours Indirect (Reported Speech)</div>
      <button class="modal-close" onclick="closeModal()" aria-label="Fermer la modale">✕</button>
    </div>
    <div class="explain-block">
      <h4>📝 Explication</h4>
      <p>${info.explanation}</p>
    </div>
    <h4 style="margin:16px 0 12px">🔄 Concordance des temps</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <tr><th>Discours direct</th><th>Discours indirect</th><th>Exemple</th></tr>
        ${info.rules.map((r) => `<tr><td>${r.direct}</td><td><strong>${r.reported}</strong></td><td><em>${r.example}</em></td></tr>`).join('')}
      </table>
    </div>
    <h4 style="margin:16px 0 12px">📅 Changements de temps/mots</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <tr><th>Direct</th><th>Indirect</th></tr>
        ${info.timeChanges.map((t) => `<tr><td>${t.direct}</td><td><strong>${t.reported}</strong></td></tr>`).join('')}
      </table>
    </div>
    <div style="margin-top:20px"><button class="btn btn-primary" onclick="closeModal();startExercise('mixed')">🎮 Pratiquer</button></div>`;
  openModal();
}

export function renderTimeline(tense) {
  const tl = tense.timeline;
  if (!tl) return '';

  let html =
    '<div class="timeline-visual"><div class="timeline-line"></div><div class="timeline-now"></div>';
  html += '<div class="timeline-label" style="left:5%">Past</div>';
  html += '<div class="timeline-label" style="left:50%">NOW</div>';
  html += '<div class="timeline-label" style="left:85%">Future</div>';

  if (tl.type === 'dots') {
    tl.positions.forEach((pos) => {
      html += `<div class="timeline-event" style="left:${pos}%">•</div>`;
    });
  } else if (tl.type === 'range') {
    html += `<div class="timeline-range" style="left:${tl.start}%;width:${tl.end - tl.start}%"></div>`;
  } else if (tl.type === 'point') {
    html += `<div class="timeline-event" style="left:${tl.position}%">${tl.label}</div>`;
  } else if (tl.type === 'arrow') {
    html += `<div class="timeline-range" style="left:${tl.start}%;width:${50 - tl.start}%"></div>`;
  } else if (tl.type === 'double-point') {
    html += `<div class="timeline-event" style="left:${tl.first}%">1er événement</div>`;
    html += `<div class="timeline-event" style="left:${tl.second}%;background:var(--danger)">2e événement</div>`;
  } else if (tl.type === 'cycle') {
    html += `<div class="timeline-event" style="left:20%">Toujours vrai</div>`;
    html += `<div class="timeline-event" style="left:50%">Toujours vrai</div>`;
    html += `<div class="timeline-event" style="left:80%">Toujours vrai</div>`;
  } else if (tl.type === 'conditional') {
    html += `<div class="timeline-event" style="left:${tl.condition}%;background:var(--warning)">Condition</div>`;
    html += `<div class="timeline-event" style="left:${tl.result}%;background:var(--success)">Conséquence</div>`;
  }

  html += '</div>';
  return html;
}
