import { UI } from './renderer.js';

export class AppController {
    constructor(store, engine, validator, renderer, data) {
        this.store = store;
        this.engine = engine;
        this.validator = validator;
        this.renderer = renderer;
        this.data = data;
        this.selectedOption = -1;
    }

    init() {
        this.store.subscribe(s => this.updateHeader(s));
        this.bindGlobalEvents();
        this.navigateTo('dashboard');
    }

    bindGlobalEvents() {
        document.querySelectorAll('.nav-item').forEach(item => {
            const page = item.getAttribute('data-page');
            if (page) item.onclick = () => this.navigateTo(page);
        });
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) menuToggle.onclick = () => this.toggleSidebar();

        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) themeBtn.onclick = () => this.toggleTheme();

        const verbSearch = document.getElementById('verbSearch');
        if (verbSearch) verbSearch.oninput = (e) => this.renderer.renderVerbs(e.target.value);
    }

    toggleSidebar() {
        document.getElementById('sidebar')?.classList.toggle('open');
        document.getElementById('sidebarOverlay')?.classList.toggle('active');
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        document.getElementById('themeBtn').textContent = next === 'dark' ? '☀️' : '🌙';
    }

    navigateTo(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`page-${page}`)?.classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.getAttribute('data-page') === page));

        const titles = { dashboard: 'Tableau de bord', lessons: 'Leçons', exercises: 'Exercices', tenses: 'Temps verbaux', verbs: 'Verbes irréguliers', stats: 'Statistiques' };
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = titles[page] || page;

        this.renderPage(page);
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar')?.classList.remove('open');
            document.getElementById('sidebarOverlay')?.classList.remove('active');
        }
    }

    renderPage(page) {
        switch(page) {
            case 'dashboard': this.renderer.renderDashboard(); break;
            case 'lessons': this.renderer.renderLessons(); break;
            case 'tenses': this.renderer.renderTenses(); break;
            case 'verbs': this.renderer.renderVerbs(); break;
            case 'stats': this.renderer.renderStats(); break;
            case 'revision': this.renderer.renderRevision(); break;
            case 'exercises': this.resetExerciseUI(); break;
        }
    }

    updateHeader(s) {
        ['headerXP', 'dashXP'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = s.xp; });
        ['headerLevel', 'dashLevel', 'sidebarLevel'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = s.level; });
        const sidebarXP = document.getElementById('sidebarXP');
        if (sidebarXP) sidebarXP.textContent = `${s.xp % 100} / 100 XP`;
        UI.renderProgressBar('sidebarXPBar', s.xp % 100);
        document.getElementById('streakCount').textContent = s.daysStreak;
    }

    showModule(index) {
        this.renderer.showModule(index);
    }

    handleLessonClick(lessonId, isLocked) {
        if (isLocked) {
            UI.showToast("🔒 Terminez la leçon précédente pour débloquer celle-ci", "warning");
            return;
        }
        const lesson = this.data.modules.flatMap(m => m.lessons).find(l => l.id === lessonId);
        if (lesson && lesson.tenseId) this.startExercise('mixed', [lesson.tenseId]);
    }

    resetExerciseUI() {
        document.getElementById('exerciseModeSelector').style.display = 'block';
        document.getElementById('exerciseArea').style.display = 'none';
    }

    startExercise(mode, filter) {
        this.navigateTo('exercises');
        this.engine.start(mode, filter);
        document.getElementById('exerciseModeSelector').style.display = 'none';
        document.getElementById('exerciseArea').style.display = 'block';
        document.getElementById('exerciseFeedback').style.display = 'none';
        document.getElementById('exValidateBtn').style.display = 'inline-flex';
        document.getElementById('exNextBtn').style.display = 'none';
        this.renderer.renderQuestion(this.engine.getCurrent(), this.engine.getProgress());
    }

    selectOption(index) {
        if (this.engine.answered) return;
        this.selectedOption = index;
        document.querySelectorAll('.option-btn').forEach((btn, i) => btn.classList.toggle('selected', i === index));
    }

    validateExercise() {
        if (this.engine.answered) return;
        const q = this.engine.getCurrent();
        if (!q) return;

        let isCorrect = false;
        if (q.type === 'qcm') {
            if (this.selectedOption === -1) return;
            isCorrect = this.selectedOption === q.correct;
            document.querySelectorAll('.option-btn').forEach((btn, i) => {
                if (i === q.correct) btn.classList.add('correct');
                else if (i === this.selectedOption && !isCorrect) btn.classList.add('incorrect');
            });
        } else {
            const input = document.getElementById('exerciseInput');
            if (!input || !input.value.trim()) return;
            isCorrect = this.validator.check(input.value, q.answer);
        }

        this.engine.answered = true;
        if (isCorrect) {
            this.engine.score++;
            const res = this.store.addXP(10);
            if (res.levelUp) UI.showToast(`🎉 Niveau ${res.newLevel} atteint !`, 'success');
        }
        this.store.recordAnswer(q.tenseId, isCorrect);
        this.renderer.showFeedback(isCorrect, q);
        document.getElementById('exValidateBtn').style.display = 'none';
        document.getElementById('exNextBtn').style.display = 'inline-flex';
        UI.renderProgressBar('exProgressBar', (this.engine.currentIndex + 1) / this.engine.questions.length * 100);
    }

    nextExercise() {
        if (this.engine.next()) {
            this.selectedOption = -1;
            this.renderer.renderQuestion(this.engine.getCurrent(), this.engine.getProgress());
            document.getElementById('exerciseFeedback').style.display = 'none';
            document.getElementById('exValidateBtn').style.display = 'inline-flex';
            document.getElementById('exNextBtn').style.display = 'none';
        } else {
            this.renderer.renderFinish(this.engine.score, this.engine.questions.length);
            if (this.engine.score / this.engine.questions.length >= 0.8 && this.engine.currentTenseFilter?.length === 1) {
                const tId = this.engine.currentTenseFilter[0];
                const l = this.data.modules.flatMap(m => m.lessons).find(x => x.tenseId === tId);
                if (l) this.store.completeLesson(l.id);
            }
        }
    }
}
