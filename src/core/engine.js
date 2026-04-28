/**
 * Moteur complet de génération d'exercices (Parité app.js original)
 */
export class ExerciseEngine {
    constructor(data, state) {
        this.data = data;
        this.state = state;
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.answered = false;
        this.currentTenseFilter = null;
    }

    getIrregularForms(verb) {
        const irreg = this.data.irregularVerbs.find(v => v.base === verb);
        return {
            past: irreg ? irreg.past.split('/')[0] : this.getRegularPast(verb),
            pp: irreg ? irreg.pp.split('/')[0] : this.getRegularPast(verb)
        };
    }

    getRegularPast(verb) {
        if (verb.endsWith('e')) return `${verb}d`;
        if (verb.endsWith('y') && !'aeiou'.includes(verb[verb.length - 2])) return `${verb.slice(0, -1)}ied`;
        return `${verb}ed`;
    }

    getPresentSimpleForm(verb, is3rdSing) {
        if (!is3rdSing) return verb;
        if (verb.endsWith('s') || verb.endsWith('ch') || verb.endsWith('sh') || verb.endsWith('x') || verb.endsWith('o')) return `${verb}es`;
        if (verb.endsWith('y') && !'aeiou'.includes(verb[verb.length - 2])) return `${verb.slice(0, -1)}ies`;
        return `${verb}s`;
    }

    getIngForm(verb) {
        if (verb.endsWith('ie')) return `${verb.slice(0, -2)}ying`;
        if (verb.endsWith('e') && verb !== 'be') return `${verb.slice(0, -1)}ing`;
        return `${verb}ing`;
    }

    getConjugation(verb, tenseId, subject, is3rdSing) {
        const { pp, past } = this.getIrregularForms(verb);
        switch(tenseId) {
            case 'present_simple': return this.getPresentSimpleForm(verb, is3rdSing);
            case 'present_continuous': return this.getIngForm(verb);
            case 'present_perfect': return pp;
            case 'present_perfect_continuous': return this.getIngForm(verb);
            case 'past_simple': return past;
            case 'past_continuous': return this.getIngForm(verb);
            case 'past_perfect': return pp;
            case 'past_perfect_continuous': return this.getIngForm(verb);
            case 'future_will': return verb;
            case 'future_going_to': return verb;
            case 'future_continuous': return this.getIngForm(verb);
            case 'future_perfect': return pp;
            case 'future_perfect_continuous': return this.getIngForm(verb);
            default: return verb;
        }
    }

    getFullVerbPhrase(verb, tenseId, subject, is3rdSing) {
        const { pp, past } = this.getIrregularForms(verb);
        const bePres = subject === 'I' ? 'am' : (is3rdSing ? 'is' : 'are');
        const havePres = is3rdSing ? 'has' : 'have';
        const bePast = (subject === 'I' || is3rdSing) ? 'was' : 'were';

        switch(tenseId) {
            case 'present_simple': return this.getPresentSimpleForm(verb, is3rdSing);
            case 'present_continuous': return `${bePres} ${this.getIngForm(verb)}`;
            case 'present_perfect': return `${havePres} ${pp}`;
            case 'present_perfect_continuous': return `${havePres} been ${this.getIngForm(verb)}`;
            case 'past_simple': return past;
            case 'past_continuous': return `${bePast} ${this.getIngForm(verb)}`;
            case 'past_perfect': return `had ${pp}`;
            case 'past_perfect_continuous': return `had been ${this.getIngForm(verb)}`;
            case 'future_will': return `will ${verb}`;
            case 'future_going_to': return `${bePres} going to ${verb}`;
            default: return this.getConjugation(verb, tenseId, subject, is3rdSing);
        }
    }

    getUnlockedTenses() {
        const completed = this.state.data.completedLessons;
        const unlocked = new Set();
        const allLessons = this.data.modules.flatMap(m => m.lessons);
        allLessons.forEach((l, i) => {
            if (i === 0 || completed.includes(l.id) || (i > 0 && completed.includes(allLessons[i-1].id))) {
                if (l.tenseId) unlocked.add(l.tenseId);
            }
        });
        return Array.from(unlocked);
    }

    start(mode, tenseFilter, difficulty = 'intermediate', count = 10) {
        this.currentMode = mode;
        this.currentTenseFilter = tenseFilter;
        let tenses = (mode === 'mixed' && (!tenseFilter || !tenseFilter.length)) ? this.getUnlockedTenses() : (tenseFilter || ['present_simple']);
        if (!tenses.length) tenses = ['present_simple'];

        const subjects = ['I', 'You', 'He', 'She', 'We', 'They', 'John', 'Sarah', 'The children', 'My parents'];
        const verbs = ['work', 'play', 'study', 'cook', 'read', 'write', 'walk', 'talk', 'clean', 'watch', 'listen', 'help', 'ask', 'call', 'wait', 'start', 'finish', 'open', 'close', 'use'];
        const allVerbs = [...verbs, ...this.data.irregularVerbs.map(v => v.base)];

        this.questions = [];
        for (let i = 0; i < count; i++) {
            const tId = tenses[Math.floor(Math.random() * tenses.length)];
            const tense = this.data.tenses.find(t => t.id === tId);
            const modeType = mode === 'mixed' ? ['qcm', 'fill', 'transform', 'translation'][Math.floor(Math.random() * 4)] : mode;
            const q = this.generateSingleQuestion(modeType, tense, subjects, allVerbs, difficulty);
            if (q) { q.tenseId = tId; this.questions.push(q); }
        }
        this.currentIndex = 0; this.score = 0; this.answered = false;
    }

    generateSingleQuestion(mode, tense, subjects, verbs, difficulty) {
        const subj = subjects[Math.floor(Math.random() * subjects.length)];
        const verb = verbs[Math.floor(Math.random() * verbs.length)];
        const is3rdSing = !['I', 'You', 'We', 'They', 'The children', 'My parents'].includes(subj);
        const correctForm = this.getFullVerbPhrase(verb, tense.id, subj, is3rdSing);

        if (mode === 'qcm') {
            const distractors = new Set([verb, this.getIngForm(verb), this.getIrregularForms(verb).pp, this.getIrregularForms(verb).past]);
            distractors.delete(correctForm);
            let options = [correctForm, ...Array.from(distractors).filter(d => d !== correctForm).slice(0, 3)];
            options = options.sort(() => Math.random() - 0.5);
            return { type: 'qcm', sentence: `${subj} ___ recently.`, options, correct: options.indexOf(correctForm), answer: correctForm, explanation: `Forme correcte: ${correctForm} (${tense.nameFR}).` };
        }
        if (mode === 'fill') return { type: 'fill', sentence: `${subj} ___ (${verb}) right now.`, answer: correctForm, explanation: `Conjugué au ${tense.nameFR}.` };
        if (mode === 'transform') {
            const neg = tense.id === 'present_simple' ? (is3rdSing ? "doesn't " : "don't ") + verb : "not " + correctForm; // Simplifié pour parité rapide
            return { type: 'transform', sentence: `Affirmatif : "${subj} ${correctForm}."\nNégatif :`, answer: `${subj} ${neg}`, explanation: "Formation de la négation." };
        }
        if (mode === 'translation') return { type: 'translation', sentence: `Traduisez en ${tense.nameFR} : "${subj} [action de ${verb}]."`, answer: `${subj} ${correctForm}`, explanation: `Structure: ${tense.structure}` };
        return null;
    }

    getCurrent() { return this.questions[this.currentIndex]; }
    next() { this.currentIndex++; this.answered = false; return this.currentIndex < this.questions.length; }
    getProgress() { return { current: this.currentIndex + 1, total: this.questions.length, score: this.score }; }
}
