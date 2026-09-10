import { answerMatches } from '../../core/exercises/validation.js';
import ExerciseEngine from '../../core/exercises/ExerciseEngine.js';
import { State } from '../../core/state/State.js';
import { APP_DATA } from '../../data/index.js';
import { escapeHtml } from '../../../src/core/security.js';
import { showToast } from '../utils/toast.js';

let testTimer = null;
let testSeconds = 0;

export function cancelTest() {
  if (testTimer) {
    clearInterval(testTimer);
    testTimer = null;
  }
  testSeconds = 0;
  const timerEl = document.getElementById('testTimer');
  if (timerEl) {
    timerEl.textContent = '00:00';
  }
}
let selectedOptionIndex = -1;
let currentOptionButtons = [];

export function selectOption(btn, index) {
  if (ExerciseEngine.answered) return;
  currentOptionButtons.forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedOptionIndex = index;
}

export function renderTestSetup() {
  const container = document.getElementById('testTenseCheckboxes');
  container.innerHTML = APP_DATA.tenses
    .map(
      (t) => `
    <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer">
      <input type="checkbox" value="${t.id}" checked> ${t.nameFR}
    </label>`,
    )
    .join('');
}

export function startTest() {
  const checkboxes = document.querySelectorAll('#testTenseCheckboxes input:checked');
  const tenses = Array.from(checkboxes).map((cb) => cb.value);

  if (tenses.length === 0) {
    showToast('Sélectionnez au moins un temps verbal', 'error');
    return;
  }

  const difficulty = document.getElementById('testDifficulty').value;
  ExerciseEngine.start('mixed', tenses, difficulty, 20);

  document.getElementById('testSetup').style.display = 'none';
  document.getElementById('testArea').style.display = 'block';
  document.getElementById('testResults').style.display = 'none';

  cancelTest();
  testTimer = setInterval(() => {
    testSeconds++;
    const mins = Math.floor(testSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (testSeconds % 60).toString().padStart(2, '0');
    const timerEl = document.getElementById('testTimer');
    if (timerEl) {
      timerEl.textContent = `${mins}:${secs}`;
    }
  }, 1000);

  renderTestQuestion();
}

export function renderTestQuestion() {
  const q = ExerciseEngine.getCurrent();
  if (!q) return;

  document.getElementById('testCurrent').textContent = ExerciseEngine.currentIndex + 1;
  document.getElementById('testTotal').textContent = ExerciseEngine.questions.length;
  document.getElementById('testScore').textContent = ExerciseEngine.score;
  document.getElementById('testProgressBar').style.width =
    `${((ExerciseEngine.currentIndex + 1) / ExerciseEngine.questions.length) * 100}%`;

  const container = document.getElementById('testQuestionContainer');
  let html = `<div class="exercise-card">`;
  html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <span class="tag tag-blue">${escapeHtml(APP_DATA.tensesById[q.tenseId]?.nameFR || q.tenseId || '')}</span>
    <span style="font-size:0.8rem;color:var(--text-light)">Question ${ExerciseEngine.currentIndex + 1} / ${ExerciseEngine.questions.length}</span>
  </div>`;
  html += `<div class="exercise-question">${escapeHtml(q.sentence || '').replace(/\n/g, '<br>')}</div>`;

  if (q.type === 'qcm') {
    const letters = ['A', 'B', 'C', 'D'];
    html += `<div class="options-grid">`;
    (q.options || []).forEach((opt, i) => {
      html += `<button class="option-btn" data-action="select-test-option" data-index="${i}">
        <span class="option-letter">${letters[i]}</span>
        <span>${escapeHtml(opt)}</span>
      </button>`;
    });
    html += `</div>`;
  } else {
    html += `<div class="input-group" style="margin-top:16px">
      <input class="input" type="text" id="testInput" data-action="submit-test" placeholder="Votre réponse...">
    </div>`;
  }

  html += `</div>`;
  container.innerHTML = html;
  currentOptionButtons = Array.from(container.querySelectorAll('.option-btn'));

  document.getElementById('testFeedback').style.display = 'none';
  document.getElementById('testValidateBtn').style.display = 'inline-flex';
  document.getElementById('testNextBtn').style.display = 'none';
  selectedOptionIndex = -1;

  if (q.type !== 'qcm') {
    setTimeout(() => document.getElementById('testInput')?.focus(), 100);
  }
}

export function validateTestAnswer() {
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
    const input = document.getElementById('testInput');
    if (!input || !input.value.trim()) return;
    userAnswer = input.value.trim();
    correct = answerMatches(userAnswer, q.answer);
  }

  ExerciseEngine.answered = true;
  q.answeredCorrectly = correct;
  q.userAnswer = userAnswer;

  if (correct) {
    ExerciseEngine.score++;
    State.addXP(15);
    State.recordAnswer(q.tenseId, true);
  } else {
    State.recordAnswer(q.tenseId, false);
  }

  const feedbackEl = document.getElementById('testFeedback');
  feedbackEl.style.display = 'block';
  const safeAnswer = escapeHtml(q.answer || (q.options ? q.options[q.correct] : ''));
  const safeExplanation = escapeHtml(q.explanation || '');
  feedbackEl.innerHTML = `<div class="feedback-box ${correct ? 'correct' : 'incorrect'}">
    <strong>${correct ? '✅ Correct !' : '❌ Incorrect'}</strong>
    ${!correct ? `<br>Réponse : <strong>${safeAnswer}</strong>` : ''}
    <br><br><em>${safeExplanation}</em>
  </div>`;

  document.getElementById('testValidateBtn').style.display = 'none';
  document.getElementById('testNextBtn').style.display = 'inline-flex';
  document.getElementById('testScore').textContent = ExerciseEngine.score;
}

export function nextTestQuestion() {
  const hasMore = ExerciseEngine.next();
  selectedOptionIndex = -1;

  if (hasMore) {
    renderTestQuestion();
  } else {
    finishTest();
  }
}

export function finishTest() {
  const elapsedSeconds = testSeconds;
  cancelTest();
  document.getElementById('testArea').style.display = 'none';
  const resultsEl = document.getElementById('testResults');
  resultsEl.style.display = 'block';

  const total = ExerciseEngine.questions.length;
  const score = ExerciseEngine.score;
  const pct = Math.round((score / total) * 100);
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;

  let levelRecommendation = '';
  if (pct >= 80) levelRecommendation = 'Niveau recommandé : 🌳 Avancé';
  else if (pct >= 50) levelRecommendation = 'Niveau recommandé : 🌿 Intermédiaire';
  else levelRecommendation = 'Niveau recommandé : 🌱 Débutant';

  resultsEl.innerHTML = `
    <div class="card" style="text-align:center;padding:48px">
      <div style="font-size:4rem;margin-bottom:16px">${pct >= 80 ? '🏆' : pct >= 50 ? '🎯' : '📚'}</div>
      <h2 style="margin-bottom:8px">Test terminé !</h2>
      <p style="font-size:2rem;font-weight:700;color:var(--primary);margin:16px 0">${score} / ${total} (${pct}%)</p>
      <p style="color:var(--text-light);margin-bottom:8px">Temps : ${mins}min ${secs}s</p>
      <p style="font-size:1.1rem;font-weight:600;color:var(--success);margin-bottom:24px">${levelRecommendation}</p>

      <h3 style="text-align:left;margin:24px 0 12px">Détail des réponses</h3>
      <div style="text-align:left;max-height:300px;overflow-y:auto;margin-bottom:24px">
        ${ExerciseEngine.questions
          .map((q, _i) => {
            return `<div style="padding:10px 0;border-bottom:1px solid var(--border);font-size:0.85rem">
          <span style="color:${q.answeredCorrectly ? 'var(--success)' : 'var(--danger)'}">${q.answeredCorrectly ? '✅' : '❌'}</span>
          <strong>${escapeHtml(APP_DATA.tensesById[q.tenseId]?.nameFR || '')}</strong>
          <span style="color:var(--text-light);margin-left:8px">${escapeHtml((q.sentence || '').substring(0, 60))}...</span>
        </div>`;
          })
          .join('')}
      </div>

      <div style="display:flex;gap:12px;justify-content:center">
        <button class="btn btn-primary" data-action="new-test">🔄 Nouveau test</button>
        <button class="btn btn-outline" data-page="dashboard">🏠 Tableau de bord</button>
      </div>
    </div>`;
}

if (typeof window !== 'undefined') {
  window.cancelTest = cancelTest;
}
