/**
 * Renderer UI complet (Parité app.js original)
 */
export const UI = {
    escape(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} show`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    renderProgressBar(id, percentage) {
        const el = document.getElementById(id);
        if (el) el.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    }
};

export class Renderer {
    constructor(data, store) {
        this.data = data;
        this.store = store;
    }

    renderDashboard() {
        const s = this.store.data;
        document.getElementById('dashXP').textContent = s.xp;
        document.getElementById('dashLevel').textContent = s.level;
        document.getElementById('dashExercises').textContent = s.totalExercises;
        const acc = s.totalExercises > 0 ? Math.round((s.correctAnswers / s.totalExercises) * 100) : 0;
        document.getElementById('dashAccuracy').textContent = acc + '%';

        this.renderNextLessonDash();
    }

    renderNextLessonDash() {
        const incomplete = this.data.modules.flatMap(m => m.lessons).filter(l => !this.store.data.completedLessons.includes(l.id));
        const c = document.getElementById('dashNextLesson');
        if (c) c.innerHTML = incomplete.length > 0 ? `<div class="card lesson-card-dash" onclick="app.navigateTo('lessons')" style="cursor:pointer; border-left: 4px solid var(--primary)"><div class="lesson-title" style="font-weight:bold">${incomplete[0].title}</div><div class="lesson-desc" style="font-size:0.85rem; color:var(--text-light)">${incomplete[0].desc}</div></div>` : "Tout est fini !";
    }

    renderLessons() {
        const tabsEl = document.getElementById('lessonTabs');
        if (tabsEl) tabsEl.innerHTML = this.data.modules.map((mod, i) => `<button class="tab ${i === 0 ? 'active' : ''}" onclick="app.showModule(${i}, this)">${mod.icon} ${mod.name}</button>`).join('');
        this.showModule(0);
    }

    showModule(index) {
        const mod = this.data.modules[index];
        const completed = this.store.data.completedLessons;
        const allLessonsBefore = this.data.modules.slice(0, index).flatMap(m => m.lessons);

        document.getElementById('lessonContent').innerHTML = `
            <div style="margin-bottom:20px"><h2>${mod.icon} ${mod.name}</h2><p>Niveau ${mod.level} • ${mod.lessons.length} leçons</p></div>
            <div class="grid" style="gap:12px">
                ${mod.lessons.map((lesson, i) => {
                    const isCompleted = completed.includes(lesson.id);
                    const prevLessonId = i > 0 ? mod.lessons[i-1].id : (allLessonsBefore.length > 0 ? allLessonsBefore[allLessonsBefore.length-1].id : null);
                    const isLocked = prevLessonId && !completed.includes(prevLessonId) && !isCompleted;
                    return `<div class="lesson-card ${isLocked ? 'locked' : ''}" onclick="app.handleLessonClick('${lesson.id}', ${isLocked})">
                        <div class="lesson-icon" style="color:${isCompleted ? 'var(--success)' : isLocked ? 'var(--text-light)' : mod.color}">${isCompleted ? '✅' : isLocked ? '🔒' : mod.icon}</div>
                        <div class="lesson-info"><div class="lesson-title">${lesson.title}</div><div class="lesson-desc">${lesson.desc}</div></div>
                    </div>`;
                }).join('')}
            </div>`;
    }

    renderTenses() {
        const c = document.getElementById('tenseContent');
        if (!c) return;
        c.innerHTML = this.data.tenses.map(t => `<div class="card" style="margin-bottom:16px"><h3>${t.name} (${t.nameFR})</h3><p><strong>Structure:</strong> ${t.structure}</p><p>${t.explanation}</p></div>`).join('');
    }

    renderVerbs(filter = "") {
        const c = document.getElementById('verbsList');
        if (!c) return;
        const filtered = this.data.irregularVerbs.filter(v => v.base.includes(filter.toLowerCase()));
        c.innerHTML = `<div class="grid grid-3">${filtered.map(v => `<div class="card"><strong>${v.base}</strong><br><small>${v.past} / ${v.pp}</small><br><i>${v.fr}</i></div>`).join('')}</div>`;
    }

    renderStats() {
        const s = this.store.data;
        const c = document.getElementById('activityLog');
        if (c) c.innerHTML = `
            <div class="card"><p>XP Total: ${s.xp}</p><p>Niveau: ${s.level}</p><p>Précision: ${s.totalExercises > 0 ? Math.round(s.correctAnswers/s.totalExercises*100) : 0}%</p></div>
            <div class="card" style="margin-top:10px"><h4>Dernières erreurs</h4><ul>${s.errorLog.map(e => `<li>${e.tenseId} (${new Date(e.date).toLocaleDateString()})</li>`).join('')}</ul></div>
        `;
    }

    renderRevision() {
        const c = document.getElementById('revisionContent');
        if (c) c.innerHTML = `<div class="card"><p>Utilisez le mode mixte pour réviser tous les temps débloqués.</p><button class="btn btn-primary" onclick="app.startExercise('mixed')">Démarrer une révision</button></div>`;
    }

    renderQuestion(q, progress) {
        const c = document.getElementById('exerciseQuestionContainer');
        if (!c || !q) return;
        let html = `<div class="exercise-card"><div class="exercise-type">${q.type.toUpperCase()}</div><div class="exercise-sentence">${q.sentence.replace(/\n/g, '<br>')}</div>`;
        if (q.type === 'qcm') {
            html += `<div class="options-grid">${q.options.map((o, i) => `<button class="option-btn" onclick="app.selectOption(${i})"><span class="option-text">${UI.escape(o)}</span></button>`).join('')}</div>`;
        } else {
            html += `<input type="text" class="input" id="exerciseInput" placeholder="Votre réponse..." onkeyup="if(event.key==='Enter') app.validateExercise()">`;
        }
        html += `</div>`;
        c.innerHTML = html;
        document.getElementById('exCurrent').textContent = progress.current;
        document.getElementById('exTotal').textContent = progress.total;
    }

    showFeedback(isCorrect, q) {
        const f = document.getElementById('exerciseFeedback');
        if (!f) return;
        f.style.display = 'block';
        f.className = `feedback feedback-${isCorrect ? 'success' : 'error'}`;
        f.innerHTML = `<div>${isCorrect ? '✅ Excellent !' : '❌ ' + UI.escape(q.answer)}</div><div style="font-size:0.8rem">${UI.escape(q.explanation)}</div>`;
    }

    renderFinish(score, total) {
        const c = document.getElementById('exerciseQuestionContainer');
        c.innerHTML = `<div class="card" style="text-align:center;padding:40px"><h2>Terminé !</h2><p style="font-size:2rem">${score}/${total}</p><button class="btn btn-primary" onclick="app.navigateTo('dashboard')">Continuer</button></div>`;
        document.getElementById('exerciseFeedback').style.display = 'none';
        document.getElementById('exValidateBtn').style.display = 'none';
    }
}
