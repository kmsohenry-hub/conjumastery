import { APP_DATA } from '../../data/index.js';
import { escapeHtml } from '../../core/security.js';
import { State } from '../../core/state/State.js';
import { openModal } from '../navigation.js';
import {
  UNLOCK_THRESHOLD,
  getLessonProgress,
  getPreviousLesson,
  isLessonUnlocked,
} from '../../core/progression.js';

export function renderLessons(initialModuleIndex = 0) {
  const tabs = document.getElementById('lessonTabs');
  const maxIdx = Math.max(0, APP_DATA.modules.length - 1);
  const safeIndex =
    Number.isInteger(initialModuleIndex) && initialModuleIndex >= 0 && initialModuleIndex <= maxIdx
      ? initialModuleIndex
      : 0;

  tabs.innerHTML = APP_DATA.modules
    .map(
      (m, i) => `
    <button class="tab ${i === safeIndex ? 'active' : ''}" data-action="show-module" data-index="${i}">
      ${escapeHtml(m.name)}
    </button>`,
    )
    .join('');

  showModule(safeIndex);
}

const LEVEL_LABELS = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

export function showModule(index, btn) {
  if (btn) {
    document.querySelectorAll('#lessonTabs .tab').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
  }
  const mod = APP_DATA.modules[index];
  const content = document.getElementById('lessonContent');

  if (!mod || !content) return;

  content.innerHTML = `
    <div style="margin-bottom:20px">
      <h3>${escapeHtml(mod.name)}</h3>
      <p style="color:var(--text-light)">${escapeHtml(mod.description || `Atteignez ${UNLOCK_THRESHOLD}% de réussite sur chaque leçon pour débloquer la suivante.`)}</p>
    </div>
    <div class="card-grid">
      ${mod.lessons
        .map((l) => {
          const progress = getLessonProgress(State.data, l);
          const isDone = progress.isMastered;
          const unlocked = isLessonUnlocked(State.data, l.id, APP_DATA.modules);
          const prevLesson = !unlocked ? getPreviousLesson(l.id, APP_DATA.modules) : null;
          const tense = l.tenseId ? APP_DATA.tensesById[l.tenseId] : null;
          const fillWidth = isDone ? 100 : unlocked ? progress.rawAccuracy : 0;
          const rawLevel = l.level || mod.level || '';
          const levelLabel = LEVEL_LABELS[rawLevel] || rawLevel || 'Débloqué';

          return `
        <div class="card lesson-card ${isDone ? 'completed' : ''} ${!unlocked ? 'locked' : ''}" role="button" tabindex="0" data-action="open-lesson" data-lesson-id="${escapeHtml(l.id)}" data-tense-id="${escapeHtml(l.tenseId || '')}" ${!unlocked ? 'data-locked="true" aria-disabled="true"' : ''}>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <span class="tag ${isDone ? 'tag-green' : unlocked ? 'tag-blue' : 'tag-locked'}">${isDone ? '✓ Terminé' : unlocked ? escapeHtml(levelLabel) : '🔒 Verrouillé'}</span>
            <span style="font-size:0.8rem;color:var(--text-light);font-variant-numeric:tabular-nums">${escapeHtml(String(l.exercises))} exercices</span>
          </div>
          <h3 style="margin-bottom:4px">${escapeHtml(l.title)}</h3>
          <p style="color:var(--text-light);font-size:0.88rem;margin-bottom:6px">${escapeHtml(l.desc)}</p>
          ${tense ? `<p class="lesson-formula">${escapeHtml(tense.structure)}</p>` : ''}
          ${
            !unlocked && prevLesson
              ? `<p class="lesson-prereq">🎯 ${UNLOCK_THRESHOLD}% requis : <strong>${escapeHtml(prevLesson.title)}</strong></p>`
              : unlocked && !isDone && progress.attempts > 0
                ? `<p class="lesson-prereq">Progression : <strong>${progress.rawAccuracy}%</strong> / ${UNLOCK_THRESHOLD}% requis</p>`
                : ''
          }
          <div class="progress-bar" style="margin-top:12px">
            <div class="fill" style="width:${fillWidth}%"></div>
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

function renderUsageHtml(usage) {
  if (Array.isArray(usage)) {
    return `<ul class="usage-list">${usage.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }
  return `<p>${escapeHtml(usage || '')}</p>`;
}

function renderExamplesHtml(examples) {
  if (Array.isArray(examples) && examples.length > 0) {
    return `
    <h4 style="margin:20px 0 12px">📖 Exemples</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <tr><th>Anglais</th><th>Traduction</th></tr>
        ${examples
          .map(
            (ex) =>
              `<tr><td><strong>${escapeHtml(ex.en || '')}</strong></td><td>${escapeHtml(ex.fr || '')}</td></tr>`,
          )
          .join('')}
      </table>
    </div>`;
  }

  return `
    <h4 style="margin:20px 0 12px">📖 Exemples par type de phrase</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <tr><th>Type</th><th>Exemple</th></tr>
        <tr><td><strong>Affirmatif</strong></td><td>${escapeHtml(examples?.affirmative || examples?.[0]?.en || '')}</td></tr>
        <tr><td><strong>Négatif</strong></td><td>${escapeHtml(examples?.negative || '')}</td></tr>
        <tr><td><strong>Interrogatif</strong></td><td>${escapeHtml(examples?.interrogative || '')}</td></tr>
      </table>
    </div>`;
}

function renderTenseModal(tense, lessonId) {
  const modal = document.getElementById('modalContent');
  if (!modal || !tense) return;
  const signalWords = Array.isArray(tense.signalWords) ? tense.signalWords : [];
  const commonMistakes = tense.commonErrors || tense.commonMistakes || [];
  const levelLabel = LEVEL_LABELS[tense.level] || tense.level || '';

  modal.innerHTML = `
    <div class="modal-header">
      <div>
        <div class="modal-title" id="modalTitle">${escapeHtml(tense.nameEN || tense.name || '')}</div>
        <div style="color:var(--text-light);font-size:0.9rem">${escapeHtml(tense.nameFR || '')}${levelLabel ? ` • ${escapeHtml(levelLabel)}` : ''}</div>
      </div>
      <button type="button" class="modal-close" data-action="close-modal" aria-label="Fermer">✕</button>
    </div>
    
    <div class="explain-block">
      <h4>📝 Utilisation</h4>
      ${renderUsageHtml(tense.usage)}
    </div>

    <div class="explain-block">
      <h4>🏗️ Structure</h4>
      <p><code>${escapeHtml(tense.structure || '')}</code></p>
      ${tense.structureNeg ? `<p style="margin-top:6px"><small>Négation : <code>${escapeHtml(tense.structureNeg)}</code></small></p>` : ''}
      ${tense.structureQ ? `<p style="margin-top:4px"><small>Question : <code>${escapeHtml(tense.structureQ)}</code></small></p>` : ''}
    </div>

    ${renderTimeline(tense)}

    ${renderExamplesHtml(tense.examples)}

    ${
      signalWords.length > 0
        ? `
    <h4 style="margin:20px 0 12px">🔑 Mots-clés / Marqueurs temporels</h4>
    <div class="signal-words">
      ${signalWords.map((w) => `<span class="signal-tag">${escapeHtml(w)}</span>`).join('')}
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
      <span class="wrong">${escapeHtml(e.wrong || '')}</span> → <span class="right">${escapeHtml(e.right || '')}</span>
      <br><small style="color:var(--text-light)">${escapeHtml(e.note || '')}</small>
    </div>`,
      )
      .join('')}`
        : ''
    }

    <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap">
      ${lessonId ? `<button type="button" class="btn btn-primary" data-action="start-lesson" data-lesson-id="${escapeHtml(lessonId)}">🎯 Commencer la leçon</button>` : ''}
      <button type="button" class="btn ${lessonId ? 'btn-outline' : 'btn-primary'}" data-action="start-tense" data-tense-id="${escapeHtml(tense.id)}">🎮 Entraînement libre</button>
      <button type="button" class="btn btn-outline" data-page="comparison">📊 Voir le comparatif</button>
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
      <button type="button" class="modal-close" data-action="close-modal" aria-label="Fermer">✕</button>
    </div>
    <div class="explain-block">
      <h4>📝 Explication</h4>
      <p>${escapeHtml(info.explanation)}</p>
    </div>
    <div class="explain-block">
      <h4>🏗️ Structure</h4>
      <p><code>${escapeHtml(info.structure)}</code></p>
    </div>
    <h4 style="margin:16px 0 12px">📖 Exemples</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <tr><th>Temps</th><th>Active</th><th>Passive</th></tr>
        ${info.examples.map((e) => `<tr><td>${escapeHtml(e.tense)}</td><td>${escapeHtml(e.active)}</td><td><strong>${escapeHtml(e.passive)}</strong></td></tr>`).join('')}
      </table>
    </div>
    <div class="explain-block" style="border-left-color:var(--accent);margin-top:16px">
      <h4>💡 Nuances</h4>
      <p>${escapeHtml(info.nuances)}</p>
    </div>
    <div style="margin-top:20px"><button type="button" class="btn btn-primary" data-action="start-lesson" data-lesson-id="${escapeHtml(lessonId)}">🎯 Commencer la leçon</button></div>`;
  openModal();
}

export function openReportedModal(lessonId = 'l_reported') {
  const modal = document.getElementById('modalContent');
  const info = APP_DATA.reportedSpeech;
  if (!modal || !info) return;
  modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-title" id="modalTitle">Discours Indirect (Reported Speech)</div>
      <button type="button" class="modal-close" data-action="close-modal" aria-label="Fermer">✕</button>
    </div>
    <div class="explain-block">
      <h4>📝 Explication</h4>
      <p>${escapeHtml(info.explanation)}</p>
    </div>
    <h4 style="margin:16px 0 12px">🔄 Concordance des temps</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <tr><th>Discours direct</th><th>Discours indirect</th><th>Exemple</th></tr>
        ${info.rules.map((r) => `<tr><td>${escapeHtml(r.direct)}</td><td><strong>${escapeHtml(r.reported)}</strong></td><td><em>${escapeHtml(r.example)}</em></td></tr>`).join('')}
      </table>
    </div>
    <h4 style="margin:16px 0 12px">📅 Changements de temps/mots</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <tr><th>Direct</th><th>Indirect</th></tr>
        ${info.timeChanges.map((t) => `<tr><td>${escapeHtml(t.direct)}</td><td><strong>${escapeHtml(t.reported)}</strong></td></tr>`).join('')}
      </table>
    </div>
    <div style="margin-top:20px"><button type="button" class="btn btn-primary" data-action="start-lesson" data-lesson-id="${escapeHtml(lessonId)}">🎯 Commencer la leçon</button></div>`;
  openModal();
}

export function renderTimeline(tense) {
  const tl = tense.timeline;
  if (!tl) return '';

  const safeLabel = escapeHtml(tl.label || '');
  const safeDesc = escapeHtml(tl.description || '');
  let visual;
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
          <div class="timeline-point" style="left:${tl.position}%" title="${safeLabel}">
            <span class="timeline-event" style="left:50%;bottom:calc(100% + 6px)">${safeLabel}</span>
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
          <div class="timeline-range" style="left:${tl.start}%;width:${Math.max(0, (tl.end ?? 50) - (tl.start ?? 0))}%">
            <span class="timeline-event" style="left:50%;bottom:calc(100% + 6px)">${safeLabel}</span>
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

    case 'arrow': {
      const start = tl.start ?? 0;
      const end = tl.end ?? tl.now ?? 50;
      const width = Math.max(0, end - start);
      visual = `
        <div class="timeline-axis">
          <div class="axis-past">Passé</div>
          <div class="axis-now">Maintenant</div>
          <div class="axis-future">Futur</div>
        </div>
        <div class="timeline-visual">
          <div class="timeline-now-line" style="left:50%"></div>
          <div class="timeline-arrow" style="left:${start}%;width:${width}%">
            <span class="timeline-event" style="left:50%;bottom:calc(100% + 6px)">${safeLabel || '→'}</span>
          </div>
        </div>`;
      break;
    }

    case 'cycle':
      visual = `
        <div class="timeline-axis">
          <div class="axis-past">Passé</div>
          <div class="axis-now">Maintenant</div>
          <div class="axis-future">Futur</div>
        </div>
        <div class="timeline-visual">
          <div class="timeline-now-line" style="left:50%"></div>
          <div class="timeline-cycle">↻${safeLabel ? ` <span>${safeLabel}</span>` : ''}</div>
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

  return `<div class="timeline-container">${visual}${safeDesc ? `<div class="timeline-desc">${safeDesc}</div>` : ''}</div>`;
}
