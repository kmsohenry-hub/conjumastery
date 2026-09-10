import { APP_DATA } from '../../data/index.js';
import { State } from '../../core/state/State.js';
import { openModal } from '../navigation.js';

export function renderLessons() {
  const tabs = document.getElementById('lessonTabs');
  const content = document.getElementById('lessonContent');
  const completed = State.data.completedLessons;

  tabs.innerHTML = APP_DATA.modules
    .map(
      (m, i) => `
    <button class="tab ${i === 0 ? 'active' : ''}" data-action="show-module" data-index="${i}">
      ${m.name}
    </button>`,
    )
    .join('');

  showModule(0);
}

export function showModule(index, btn) {
  if (btn) {
    document.querySelectorAll('#lessonTabs .tab').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
  }
  const mod = APP_DATA.modules[index];
  const completed = State.data.completedLessons;
  const content = document.getElementById('lessonContent');

  if (!mod || !content) return;

  content.innerHTML = `
    <div style="margin-bottom:20px">
      <h3>${mod.name}</h3>
      <p style="color:var(--text-light)">${mod.description || ''}</p>
    </div>
    <div class="card-grid">
      ${mod.lessons
        .map((l) => {
          const isDone = completed.includes(l.id);
          const tense = l.tenseId ? APP_DATA.tensesById[l.tenseId] : null;
          return `
        <div class="card lesson-card ${isDone ? 'completed' : ''}" role="button" tabindex="0" data-action="open-lesson" data-lesson-id="${l.id}" data-tense-id="${l.tenseId || ''}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
            <span class="tag ${isDone ? 'tag-green' : 'tag-blue'}">${isDone ? '✓ Terminé' : l.level || mod.level || ''}</span>
            <span style="font-size:0.8rem;color:var(--text-light)">${l.exercises} exercices</span>
          </div>
          <h3 style="margin-bottom:8px">${l.title}</h3>
          <p style="color:var(--text-light);font-size:0.9rem;margin-bottom:12px">${l.desc}</p>
          ${tense ? `<p style="font-size:0.85rem;color:var(--primary);font-family:monospace">${tense.structure}</p>` : ''}
          <div class="progress-bar" style="margin-top:12px">
            <div class="fill" style="width:${isDone ? '100%' : '0%'}"></div>
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
      renderTenseModal(tense, lessonId);
      return;
    }
  }
  if (lessonId === 'l_passive') openPassiveModal(lessonId);
  else if (lessonId === 'l_reported') openReportedModal(lessonId);
}

export function openTenseModal(tense, lessonId = null) {
  renderTenseModal(tense, lessonId);
}

function renderTenseModal(tense, lessonId) {
  const modal = document.getElementById('modalContent');
  if (!modal || !tense) return;
  const signalWords = tense.signalWords || [];
  const commonMistakes = tense.commonMistakes || [];

  modal.innerHTML = `
    <div class="modal-header">
      <div>
        <div class="modal-title" id="modalTitle">${tense.nameEN || tense.name || ''}</div>
        <div style="color:var(--text-light);font-size:0.9rem">${tense.nameFR || ''} • ${tense.level || ''}</div>
      </div>
      <button class="modal-close" data-action="close-modal" aria-label="Fermer">✕</button>
    </div>
    
    <div class="explain-block">
      <h4>📝 Utilisation</h4>
      <p>${Array.isArray(tense.usage) ? tense.usage.join(',') : tense.usage || ''}</p>
    </div>

    <div class="explain-block">
      <h4>🏗️ Structure</h4>
      <p><code>${tense.structure || ''}</code></p>
    </div>

    ${renderTimeline(tense)}

    <h4 style="margin:20px 0 12px">📖 Exemples par type de phrase</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <tr><th>Type</th><th>Exemple</th></tr>
        <tr><td><strong>Affirmatif</strong></td><td>${tense.examples?.affirmative || tense.examples?.[0]?.en || ''}</td></tr>
        <tr><td><strong>Négatif</strong></td><td>${tense.examples?.negative || ''}</td></tr>
        <tr><td><strong>Interrogatif</strong></td><td>${tense.examples?.interrogative || ''}</td></tr>
      </table>
    </div>

    ${
      signalWords.length > 0
        ? `
    <h4 style="margin:20px 0 12px">🔑 Mots-clés / Marqueurs temporels</h4>
    <div class="signal-words">
      ${signalWords.map((w) => `<span class="signal-tag">${w}</span>`).join('')}
    </div>`
        : ''
    }

    ${
      commonMistakes.length > 0
        ? `
    <h4 style="margin:20px 0 12px">⚠️ Erreurs fréquentes à éviter</h4>
    ${commonMistakes
      .map(
        (e) => `
    <div class="mistake-item">
      <span class="wrong">${e.wrong}</span> → <span class="right">${e.right}</span>
      <br><small style="color:var(--text-light)">${e.note}</small>
    </div>`,
      )
      .join('')}`
        : ''
    }

    <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap">
      ${lessonId ? `<button class="btn btn-primary" data-action="start-lesson" data-lesson-id="${lessonId}">🎯 Commencer la leçon</button>` : ''}
      <button class="btn ${lessonId ? 'btn-outline' : 'btn-primary'}" data-action="start-tense" data-tense-id="${tense.id}">🎮 Entraînement libre</button>
      <button class="btn btn-outline" data-page="comparison">📊 Voir le comparatif</button>
    </div>`;

  openModal();
}

export function openPassiveModal(lessonId = 'l_passive') {
  const modal = document.getElementById('modalContent');
  const info = APP_DATA.passiveInfo;
  if (!modal || !info) return;
  modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-title" id="modalTitle">Voix Passive</div>
      <button class="modal-close" data-action="close-modal" aria-label="Fermer">✕</button>
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
    <div style="margin-top:20px"><button class="btn btn-primary" data-action="start-lesson" data-lesson-id="l_passive">🎯 Commencer la leçon</button></div>`;
  openModal();
}

export function openReportedModal(lessonId = 'l_reported') {
  const modal = document.getElementById('modalContent');
  const info = APP_DATA.reportedSpeech;
  if (!modal || !info) return;
  modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-title" id="modalTitle">Discours Indirect (Reported Speech)</div>
      <button class="modal-close" data-action="close-modal" aria-label="Fermer">✕</button>
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
    <div style="margin-top:20px"><button class="btn btn-primary" data-action="start-lesson" data-lesson-id="l_reported">🎯 Commencer la leçon</button></div>`;
  openModal();
}

export function renderTimeline(tense) {
  const tl = tense.timeline;
  if (!tl) return '';

  let visual = '';
  switch (tl.type) {
    case 'point':
      visual = `
        <div class="timeline-axis">
          <div class="axis-past">Passé</div>
          <div class="axis-now">Maintenant</div>
          <div class="axis-future">Futur</div>
        </div>
        <div class="timeline-visual">
          <div class="timeline-now-line" style="left:50%"></div>
          <div class="timeline-point" style="left:${tl.position}%" title="${tl.label}">
            <span class="timeline-event" style="left:50%;bottom:calc(100% + 6px)">${tl.label}</span>
          </div>
        </div>`;
      break;

    case 'range':
      visual = `
        <div class="timeline-axis">
          <div class="axis-past">Passé</div>
          <div class="axis-now">Maintenant</div>
          <div class="axis-future">Futur</div>
        </div>
        <div class="timeline-visual">
          <div class="timeline-now-line" style="left:50%"></div>
          <div class="timeline-range" style="left:${tl.start}%;width:${tl.end - tl.start}%">
            <span class="timeline-event" style="left:50%;bottom:calc(100% + 6px)">${tl.label}</span>
          </div>
        </div>`;
      break;

    case 'dots':
      visual = `
        <div class="timeline-axis">
          <div class="axis-past">Passé</div>
          <div class="axis-now">Maintenant</div>
          <div class="axis-future">Futur</div>
        </div>
        <div class="timeline-visual">
          <div class="timeline-now-line" style="left:50%"></div>
          ${tl.positions
            .map(
              (pos) => `
            <div class="timeline-point" style="left:${pos}%">
              <span class="timeline-event" style="left:50%;bottom:calc(100% + 6px)">●</span>
            </div>`,
            )
            .join('')}
        </div>`;
      break;

    case 'double-point':
      visual = `
        <div class="timeline-axis">
          <div class="axis-past">Passé</div>
          <div class="axis-now">Maintenant</div>
          <div class="axis-future">Futur</div>
        </div>
        <div class="timeline-visual">
          <div class="timeline-now-line" style="left:50%"></div>
          <div class="timeline-point" style="left:${tl.first}%">
            <span class="timeline-event" style="left:50%;bottom:calc(100% + 6px)">1er événement</span>
          </div>
          <div class="timeline-point" style="left:${tl.second}%">
            <span class="timeline-event" style="left:50%;bottom:calc(100% + 6px)">2e événement</span>
          </div>
        </div>`;
      break;

    case 'arrow':
      visual = `
        <div class="timeline-axis">
          <div class="axis-past">Passé</div>
          <div class="axis-now">Maintenant</div>
          <div class="axis-future">Futur</div>
        </div>
        <div class="timeline-visual">
          <div class="timeline-now-line" style="left:50%"></div>
          <div class="timeline-arrow" style="left:${tl.start}%;width:${tl.end - tl.start}%">
            <span class="timeline-event" style="left:50%;bottom:calc(100% + 6px)">${tl.label || '→'}</span>
          </div>
        </div>`;
      break;

    case 'cycle':
      visual = `
        <div class="timeline-axis">
          <div class="axis-past">Passé</div>
          <div class="axis-now">Maintenant</div>
          <div class="axis-future">Futur</div>
        </div>
        <div class="timeline-visual">
          <div class="timeline-now-line" style="left:50%"></div>
          <div class="timeline-cycle">↻</div>
        </div>`;
      break;

    case 'conditional':
      visual = `
        <div class="timeline-axis">
          <div class="axis-past">Passé</div>
          <div class="axis-now">Maintenant</div>
          <div class="axis-future">Futur</div>
        </div>
        <div class="timeline-visual">
          <div class="timeline-now-line" style="left:50%"></div>
          <div class="timeline-point" style="left:${tl.condition}%">
            <span class="timeline-event" style="left:50%;bottom:calc(100% + 6px)">Condition</span>
          </div>
          <div class="timeline-point" style="left:${tl.result}%">
            <span class="timeline-event" style="left:50%;bottom:calc(100% + 6px)">Résultat</span>
          </div>
        </div>`;
      break;

    default:
      return '';
  }

  return `<div class="timeline-container">${visual}<div class="timeline-desc">${tl.description || ''}</div></div>`;
}
