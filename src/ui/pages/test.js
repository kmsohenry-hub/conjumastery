import { answerMatches } from '../../core/exercises/validation.js';
import ExerciseEngine from '../../core/exercises/ExerciseEngine.js';
import { State } from '../../core/state/State.js';
import { APP_DATA } from '../../data/index.js';
import { escapeHtml } from '../../../src/core/security.js';
import { showToast } from '../utils/toast.js';

let testTimer = null;
let testSeconds = 0;
let selectedOptionIndex = -1;
let currentOptionButtons = [];

export function selectOption(btn, index) {
  if (ExerciseEngine.answered) return;
  currentOptionButtons.forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedOptionIndex = index;
}

export function renderTestSetup() {
  document.getElementById('testSetup').style.display = 'block';
  document.getElementById('testArea').style.display = 'none';
  document.getElementById('testResults').style.display = 'none';

  const container = document.getElementById('testTenseCheckboxes');
  container.innerHTML = APP_DATA.tenses
    .map(
      (t) =>
        `<label style="display:inline-flex;align-items:center;gap:4px;font-size:0.8rem;padding:4px 8px;background:var(--bg);border-radius:var(--radius-xs);cursor:pointer;margin:2px">
      <input type="checkbox" value="${t.id}" checked style="accent-color:var(--primary)"> ${t.nameFR.split(' ')[0]}
    </label>`,
    )
    .join('');
}

export function startTest() {
  const checked = document.querySelectorAll('#testTenseCheckboxes input:checked');
  const tenses = Array.from(checked).map((c) => c.value);

  if (tenses.length === 0) {
    showToast('Sélectionnez au moins un temps verbal', 'error');
    return;
  }

  const difficulty = document.getElementById('testDifficulty').value;
  ExerciseEngine.start('mixed', tenses, difficulty, 20);

  document.getElementById('testSetup').style.display = 'none';
  document.getElementById('testArea').style.display = 'block';
  document.getElementById('testResults').style.display = 'none';
  document.getElementById('testValidateBtn').style.display = 'inline-flex';
  document.getElementById('testNextBtn').style.display = 'none';

  testSeconds = 0;
  clearInterval(testTimer);
  testTimer = setInterval(() => {
    testSeconds++;
    const mins = Math.floor(testSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (testSeconds % 60).toString().padStart(2, '0');
    document.getElementById('testTimer').textContent = `${mins}:${secs}`;
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
    `${(ExerciseEngine.currentIndex / ExerciseEngine.questions.length) * 100}%`;
  document.getElementById('testFeedback').style.display = 'none';
  document.getElementById('testValidateBtn').style.display = 'inline-flex';
  document.getElementById('testNextBtn').style.display = 'none';
  selectedOptionIndex = -1;

  const container = document.getElementById('testQuestionContainer');
  let html = `<div class="exercise-card">`;
  html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <span class="tag tag-blue">${escapeHtml(APP_DATA.tensesById[q.tenseId]?.nameFR || q.tenseId)}</span>
  </div>`;
  html += `<div class="exercise-question">${escapeHtml(q.sentence).replace(/\n/g, '<br>')}</div>`;

  if (q.type === 'qcm') {
    const letters = ['A', 'B', 'C', 'D'];
    html += `<div class="options-grid">`;
    q.options.forEach((opt, i) => {
      html += `<button class="option-btn" onclick="selectTestOption(this, ${i})" data-index="${i}">
        <span class="option-letter">${letters[i]}</span>
        <span>${escapeHtml(opt)}</span>
      </button>`;
    });
    html += `</div>`;
  } else {
    html += `<div class="input-group" style="margin-top:16px">
      <input class="input" type="text" id="testInput" placeholder="Votre réponse..." onkeydown="if(event.key==='Enter')validateTestAnswer()">
    </div>`;
  }
  html += `</div>`;
  container.innerHTML = html;
  currentOptionButtons = Array.from(container.querySelectorAll('.option-btn'));

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
  if (correct) {
    ExerciseEngine.score++;
    State.addXP(15);
    State.recordAnswer(q.tenseId, true);
  } else {
    State.recordAnswer(q.tenseId, false);
  }

  const feedbackEl = document.getElementById('testFeedback');
  feedbackEl.style.display = 'block';
  const safeAnswer = escapeHtml(q.answer || q.options[q.correct]);
  const safeExplanation = escapeHtml(q.explanation);
  feedbackEl.innerHTML = `<div class="feedback-box ${correct ? 'correct' : 'incorrect'}">
    <strong>${correct ? '✅' : '❌'}</strong>
    ${!correct ? `<br>Réponse : <strong>${safeAnswer}</strong>` : ''}
    <br><em>${safeExplanation}</em>
  </div>`;

  document.getElementById('testValidateBtn').style.display = 'none';
  document.getElementById('testNextBtn').style.display = 'inline-flex';
  document.getElementById('testScore').textContent = ExerciseEngine.score;
}

export function nextTestQuestion() {
  const hasMore = ExerciseEngine.next();
  if (hasMore) {
    renderTestQuestion();
  } else {
    finishTest();
  }
}

export function finishTest() {
  clearInterval(testTimer);
  document.getElementById('testArea').style.display = 'none';
  document.getElementById('testResults').style.display = 'block';

  const p = ExerciseEngine.getProgress();
  const pct = Math.round((p.score / p.total) * 100);
  const mins = Math.floor(testSeconds / 60);
  const secs = testSeconds % 60;

  let grade;
  if (pct >= 90) grade = { emoji: '🏆', text: 'Exceptionnel !', color: 'var(--success)' };
  else if (pct >= 70) grade = { emoji: '🌟', text: 'Très bien !', color: 'var(--primary)' };
  else if (pct >= 50) grade = { emoji: '👍', text: 'Pas mal !', color: 'var(--warning)' };
  else grade = { emoji: '💪', text: 'Continuez vos efforts !', color: 'var(--danger)' };

  // Detailed results
  const resultsHTML = `
    <div class="card" style="text-align:center;padding:40px;margin-bottom:24px">
      <div style="font-size:4rem;margin-bottom:12px">${grade.emoji}</div>
      <h2 style="color:${grade.color}">${grade.text}</h2>
      <p style="font-size:2rem;font-weight:800;margin:12px 0">${p.score} / ${p.total} (${pct}%)</p>
      <p style="color:var(--text-light)">⏱️ Temps : ${mins}min ${secs}s • ⭐ +${p.score * 15} XP</p>
      <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="renderTestSetup()">🔄 Nouveau test</button>
        <button class="btn btn-outline" onclick="navigateTo('dashboard')">🏠 Tableau de bord</button>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:16px">📋 Détail des réponses</h3>
      ${ExerciseEngine.questions
        .map((q, _i) => {
          return `<div style="padding:10px 0;border-bottom:1px solid var(--border);font-size:0.85rem">
          <span style="color:${q.answeredCorrectly ? 'var(--success)' : 'var(--danger)'}">${q.answeredCorrectly ? '✅' : '❌'}</span>
          <strong>${APP_DATA.tensesById[q.tenseId]?.nameFR || ''}</strong>
          <span style="color:var(--text-light);margin-left:8px">${q.sentence.substring(0, 60)}...</span>
        </div>`;
        })
        .join('')}
    </div>`;

  document.getElementById('testResults').innerHTML = resultsHTML;
}
