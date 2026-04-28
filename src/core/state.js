/**
 * Gestion de l'état (Store)
 */
export class Store {
    constructor() {
        this.data = this.load();
        this.listeners = [];
        this.checkStreak();
    }

    load() {
        const defaultData = {
            xp: 0, level: 1, totalExercises: 0, correctAnswers: 0, incorrectAnswers: 0,
            bestStreak: 0, currentStreak: 0, daysStreak: 0, lastActiveDate: null,
            completedLessons: [], tenseStats: {}, errorLog: [], activityLog: [],
            favorites: [], spacedRepetition: {}, settings: { theme: 'light' }
        };
        try {
            const saved = localStorage.getItem('conjumaster_data');
            return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
        } catch (e) { return defaultData; }
    }

    save() {
        try {
            localStorage.setItem('conjumaster_data', JSON.stringify(this.data));
        } catch (e) {}
        this.notify();
    }

    subscribe(fn) {
        this.listeners.push(fn);
        return () => this.listeners = this.listeners.filter(l => l !== fn);
    }

    notify() { this.listeners.forEach(l => l(this.data)); }

    checkStreak() {
        const today = new Date().toDateString();
        if (this.data.lastActiveDate) {
            const last = new Date(this.data.lastActiveDate);
            const diff = Math.floor((new Date(today) - last) / (1000 * 60 * 60 * 24));
            if (diff === 1) this.data.daysStreak++;
            else if (diff > 1) this.data.daysStreak = 0;
        }
    }

    addXP(amount) {
        this.data.xp += amount;
        const newLevel = Math.floor(this.data.xp / 100) + 1;
        const levelUp = newLevel > this.data.level;
        if (levelUp) this.data.level = newLevel;
        this.data.lastActiveDate = new Date().toDateString();
        this.data.activityLog.push({ date: new Date().toISOString(), xp: amount });
        if (this.data.activityLog.length > 50) this.data.activityLog.shift();
        this.save();
        return { levelUp, newLevel: this.data.level };
    }

    recordAnswer(tenseId, isCorrect) {
        this.data.totalExercises++;
        if (!this.data.tenseStats[tenseId]) this.data.tenseStats[tenseId] = { correct: 0, total: 0 };
        this.data.tenseStats[tenseId].total++;
        if (isCorrect) {
            this.data.tenseStats[tenseId].correct++;
            this.data.correctAnswers++;
            this.data.currentStreak++;
            if (this.data.currentStreak > this.data.bestStreak) this.data.bestStreak = this.data.currentStreak;
        } else {
            this.data.incorrectAnswers++;
            this.data.currentStreak = 0;
            this.data.errorLog.push({ tenseId, date: new Date().toISOString() });
            if (this.data.errorLog.length > 50) this.data.errorLog.shift();
        }
        this.save();
    }

    completeLesson(lessonId) {
        if (!this.data.completedLessons.includes(lessonId)) {
            this.data.completedLessons.push(lessonId);
            return this.addXP(25);
        }
        return { levelUp: false };
    }

    toggleFavorite(type, id) {
        const index = this.data.favorites.findIndex(f => f.type === type && f.id === id);
        if (index === -1) this.data.favorites.push({ type, id });
        else this.data.favorites.splice(index, 1);
        this.save();
    }
}
