import { navigateTo } from '../navigation.js';
import { answerMatches } from '../../core/exercises/validation.js';
import ExerciseEngine from '../../core/exercises/ExerciseEngine.js';
import { State } from '../../core/state/State.js';
import { APP_DATA } from '../../../data.js';
import { escapeHtml } from '../../../src/core/security.js';
import { launchConfetti } from '../utils/confetti.js';




let selectedOptionIndex = -1;
let currentOptionButtons = [];

export function resetExerciseUI() {
  document.getElementById('exerciseModeSelector').style.display = 'block';
  document.getElementById('exerciseArea').style.display = 'none';
}

export function startExercise(mode, tenseFilter, difficulty) {
  if (tenseFilter === undefined || tenseFilter === null) {
    tenseFilter = mode === 'mixed' ? [] : null;
  }
  if (!difficulty) difficulty = 'intermediate';

  ExerciseEngine.currentTenseFilter = tenseFilter;
  ExerciseEngine.start(mode, tenseFilter, difficulty);

  document.getElementById('exerciseModeSelector').style.display = 'none';
  document.getElementById('exerciseArea').style.display = 'block';
  document.getElementById('exerciseFeedback').style.display = 'none';
  document.getElementById('exValidateBtn').style.display = 'inline-flex';
  document.getElementById('exNextBtn').style.display = 'none';
  document.getElementById('exSkipBtn').style.display = 'inline-flex';

  const q = ExerciseEngine.getCurrent();
  renderExerciseQuestion(q);
  updateExerciseProgress();
}

export function startExerciseForTense(tenseId) {
  navigateTo('exercises');
  setTimeout(() => startExercise('mixed', [tenseId], 'intermediate'), 100);
}

export function renderExerciseQuestion(q) {
  const container = document.getElementById('exerciseQuestionContainer');
  document.getElementById('exCurrent').textContent = ExerciseEngine.currentIndex + 1;
  document.getElementById('exTotal').textContent = ExerciseEngine.questions.length;

  let html = `<div class="exercise-card">`;
  html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <span class="tag tag-blue">${escapeHtml(APP_DATA.tensesById[q.tenseId]?.nameFR || q.tenseId)}</span>
    <span style="font-size:0.8rem;color:var(--text-light)">Type : ${escapeHtml(q.type === 'qcm' ? 'QCM' : q.type === 'fill' ? 'Compléter' : q.type === 'transform' ? 'Transformer' : q.type === 'correction' ? 'Corriger' : 'Traduire')}</span>
  </div>`;

  html += `<div class="exercise-question">${escapeHtml(q.sentence).replace(/\n/g, '<br>')}</div>`;

  if (q.type === 'qcm') {
    const letters = ['A', 'B', 'C', 'D'];
    html += `<div class="options-grid">`;
    q.options.forEach((opt, i) => {
      html += `<button class="option-btn" onclick="selectOption(this, ${i})" data-index="${i}">
        <span class="option-letter">${letters[i]}</span>
        <span>${escapeHtml(opt)}</span>
      </button>`;
    });
    html += `</div>`;
  } else if (q.type === 'fill' || q.type === 'translation') {
    html += `<div class="input-group" style="margin-top:16px">
      <input class="input" type="text" id="exerciseInput" placeholder="Votre réponse..." onkeydown="if(event.key==='Enter')validateExercise()">
    </div>`;
  } else if (q.type === 'transform') {
    html += `<div class="input-group" style="margin-top:16px">
      <textarea class="textarea" id="exerciseInput" placeholder="Écrivez la phrase transformée..." rows="2"></textarea>
    </div>`;
  } else if (q.type === 'correction') {
    html += `<div class="input-group" style="margin-top:16px">
      <textarea class="textarea" id="exerciseInput" placeholder="Écrivez la phrase corrigée..." rows="2"></textarea>
    </div>`;
  }

  html += `</div>`;
  container.innerHTML = html;
  currentOptionButtons = Array.from(container.querySelectorAll('.option-btn'));

  if (q.type !== 'qcm') {
    setTimeout(() => document.getElementById('exerciseInput')?.focus(), 100);
  }
}



export function selectOption(btn, index) {
  if (ExerciseEngine.answered) return;
  currentOptionButtons.forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedOptionIndex = index;
}

export function validateExercise() {
  if (ExerciseEngine.answered) return;

  const q = ExerciseEngine.getCurrent();
  let correct = false;
  let userAnswer;

  if (q.type === 'qcm') {
    if (selectedOptionIndex === -1) return;
    correct = selectedOptionIndex === q.correct;
    userAnswer = q.options[selectedOptionIndex];

    currentOptionButtons.forEach((btn, i) => {
      if (i === q.correct) btn.classList.add('correct');
      else if (i === selectedOptionIndex && !correct) btn.classList.add('incorrect');
    });
  } else {
    const input = document.getElementById('exerciseInput');
    if (!input || !input.value.trim()) return;
    userAnswer = input.value.trim();
    correct = answerMatches(userAnswer, q.answer);
  }

  ExerciseEngine.answered = true;
  if (correct) {
    ExerciseEngine.score++;
    State.addXP(10);
    State.recordAnswer(q.tenseId, true);
    // State.updateSpacedRepetition(q.tenseId, true);
  } else {
    State.recordAnswer(q.tenseId, false);
    // // State.updateSpacedRepetition(q.tenseId, false);
  }

  // Show feedback
  const feedbackEl = document.getElementById('exerciseFeedback');
  feedbackEl.style.display = 'block';
  const safeAnswer = escapeHtml(q.answer || q.options[q.correct]);
  const safeUserAnswer = escapeHtml(userAnswer);
  const safeExplanation = escapeHtml(q.explanation);
  feedbackEl.innerHTML = `<div class="feedback-box ${correct ? 'correct' : 'incorrect'}">
    <strong>${correct ? '✅ Correct !' : '❌ Incorrect'}</strong>
    ${!correct ? `<br>Réponse attendue : <strong>${safeAnswer}</strong><br>Votre réponse : ${safeUserAnswer}` : ''}
    <br><br><em>${safeExplanation}</em>
  </div>`;

  document.getElementById('exValidateBtn').style.display = 'none';
  document.getElementById('exNextBtn').style.display = 'inline-flex';
  document.getElementById('exSkipBtn').style.display = 'none';

  updateExerciseProgress();
}

export function skipExercise() {
  if (ExerciseEngine.answered) return;
  ExerciseEngine.answered = true;
  const q = ExerciseEngine.getCurrent();
  State.recordAnswer(q.tenseId, false);
  State.updateSpacedRepetition(q.tenseId, false);

  const feedbackEl = document.getElementById('exerciseFeedback');
  feedbackEl.style.display = 'block';
  const safeAnswer = escapeHtml(q.answer || q.options[q.correct]);
  const safeExplanation = escapeHtml(q.explanation);
  feedbackEl.innerHTML = `<div class="feedback-box info">
    <strong>⏭️ Question passée</strong><br>
    Réponse : <strong>${safeAnswer}</strong><br>
    <em>${safeExplanation}</em>
  </div>`;

  document.getElementById('exValidateBtn').style.display = 'none';
  document.getElementById('exNextBtn').style.display = 'inline-flex';
  document.getElementById('exSkipBtn').style.display = 'none';
}

export function nextExercise() {
  const hasMore = ExerciseEngine.next();
  selectedOptionIndex = -1;

  if (hasMore) {
    const q = ExerciseEngine.getCurrent();
    renderExerciseQuestion(q);
    document.getElementById('exerciseFeedback').style.display = 'none';
    document.getElementById('exValidateBtn').style.display = 'inline-flex';
    document.getElementById('exNextBtn').style.display = 'none';
    document.getElementById('exSkipBtn').style.display = 'inline-flex';
    updateExerciseProgress();
  } else {
    finishExercise();
  }
}

export function updateExerciseProgress() {
  const p = ExerciseEngine.getProgress();
  document.getElementById('exProgressBar').style.width = `${(p.current / p.total) * 100}%`;
}

export function finishExercise() {
  const p = ExerciseEngine.getProgress();
  const pct = Math.round((p.score / p.total) * 100);

  const container = document.getElementById('exerciseQuestionContainer');
  container.innerHTML = `
    <div class="card" style="text-align:center;padding:48px">
      <div style="font-size:4rem;margin-bottom:16px">${pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
      <h2 style="margin-bottom:8px">${pct >= 80 ? 'Excellent !' : pct >= 50 ? 'Bien joué !' : 'Continuez vos efforts !'}</h2>
      <p style="font-size:1.2rem;color:var(--text-light);margin-bottom:20px">${p.score} / ${p.total} bonnes réponses (${pct}%)</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="resetExerciseUI()">🏠 Retour</button>
        <button class="btn btn-secondary" onclick="startExercise(ExerciseEngine.currentMode)">🔄 Recommencer</button>
      </div>
    </div>`;

  document.getElementById('exerciseFeedback').style.display = 'none';
  document.getElementById('exValidateBtn').style.display = 'none';
  document.getElementById('exNextBtn').style.display = 'none';
  document.getElementById('exSkipBtn').style.display = 'none';

  if (pct >= 80) {
    launchConfetti();
    if (ExerciseEngine.currentTenseFilter && ExerciseEngine.currentTenseFilter.length === 1) {
      APP_DATA.modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => {
          if (lesson.tenseId === ExerciseEngine.currentTenseFilter[0]) {
            State.completeLesson(lesson.id);
          }
        });
      });
    }
  }
}

export function exitExercise() {
  resetExerciseUI();
}
