// ============================================================
// UTILITAIRES DE SÉCURITÉ
// ============================================================

/**
 * Échappe les caractères HTML spéciaux pour prévenir les attaques XSS
 * @param {string} str - La chaîne à échapper
 * @returns {string} - La chaîne échappée
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Valide et nettoie une entrée utilisateur
 * @param {string} input - L'entrée à valider
 * @returns {string} - L'entrée nettoyée
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 500); // Limite de longueur
}

// ============================================================
// 1. STATE MANAGEMENT
// ============================================================

const State = {
  data: {
    xp: 0,
    level: 1,
    totalExercises: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    bestStreak: 0,
    currentStreak: 0,
    daysStreak: 0,
    lastActiveDate: null,
    completedLessons: [],
    tenseStats: {},
    errorLog: [],
    activityLog: [],
    favorites: [],
    spacedRepetition: {},
    settings: { theme: 'light' }
  },

  init() {
    const saved = localStorage.getItem('conjumaster_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.data = { ...this.data, ...parsed };
      } catch(e) { console.error('Failed to load data'); }
    }
    this.checkStreak();
    this.save();
  },

  save() {
    try {
      localStorage.setItem('conjumaster_data', JSON.stringify(this.data));
    } catch(e) { console.error('Failed to save data'); }
  },

  checkStreak() {
    const today = new Date().toDateString();
    if (this.data.lastActiveDate) {
      const last = new Date(this.data.lastActiveDate);
      const diff = Math.floor((new Date(today) - last) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        this.data.daysStreak++;
      } else if (diff > 1) {
        this.data.daysStreak = 0;
      }
    }
  },

  addXP(amount) {
    this.data.xp += amount;
    const newLevel = Math.floor(this.data.xp / 100) + 1;
    if (newLevel > this.data.level) {
      this.data.level = newLevel;
      showToast(`🎉 Niveau ${newLevel} atteint !`, 'success');
      launchConfetti();
    }
    this.data.lastActiveDate = new Date().toDateString();
    this.data.activityLog.push({ date: new Date().toISOString(), xp: amount });
    if (this.data.activityLog.length > 100) this.data.activityLog = this.data.activityLog.slice(-100);
    this.save();
    updateUI();
  },

  recordAnswer(tenseId, correct) {
    this.data.totalExercises++;
    if (!this.data.tenseStats[tenseId]) {
      this.data.tenseStats[tenseId] = { correct: 0, total: 0 };
    }
    this.data.tenseStats[tenseId].total++;
    if (correct) {
      this.data.tenseStats[tenseId].correct++;
      this.data.correctAnswers++;
      this.data.currentStreak++;
      if (this.data.currentStreak > this.data.bestStreak) {
        this.data.bestStreak = this.data.currentStreak;
      }
    } else {
      this.data.incorrectAnswers++;
      this.data.currentStreak = 0;
      // Add to spaced repetition queue
      if (!this.data.spacedRepetition[tenseId]) {
        this.data.spacedRepetition[tenseId] = { interval: 1, nextReview: Date.now(), ease: 2.5, errors: 0 };
      }
      this.data.spacedRepetition[tenseId].errors++;
      this.data.spacedRepetition[tenseId].nextReview = Date.now();
      this.data.spacedRepetition[tenseId].interval = 1;
      // Log error
      this.data.errorLog.push({ tenseId, date: new Date().toISOString() });
    }
    this.save();
  },

  completeLesson(lessonId) {
    if (!this.data.completedLessons.includes(lessonId)) {
      this.data.completedLessons.push(lessonId);
      this.addXP(25);
    }
  },

  addFavorite(item) {
    if (!this.data.favorites.includes(item)) {
      this.data.favorites.push(item);
      this.save();
    }
  },

  removeFavorite(item) {
    this.data.favorites = this.data.favorites.filter(f => f !== item);
    this.save();
  },

  isFavorite(item) {
    return this.data.favorites.includes(item);
  },

  getWeakPoints() {
    const weak = [];
    for (const [tenseId, stats] of Object.entries(this.data.tenseStats)) {
      const accuracy = stats.correct / stats.total;
      if (stats.total >= 3 && accuracy < 0.7) {
        weak.push({ tenseId, accuracy, total: stats.total, errors: stats.total - stats.correct });
      }
    }
    weak.sort((a, b) => a.accuracy - b.accuracy);
    return weak;
  },

  getReviewQueue() {
    const now = Date.now();
    const queue = [];
    for (const [tenseId, data] of Object.entries(this.data.spacedRepetition)) {
      if (data.nextReview <= now) {
        queue.push({ tenseId, ...data });
      }
    }
    queue.sort((a, b) => a.nextReview - b.nextReview);
    return queue;
  },

  updateSpacedRepetition(tenseId, correct) {
    if (!this.data.spacedRepetition[tenseId]) {
      this.data.spacedRepetition[tenseId] = { interval: 1, nextReview: Date.now(), ease: 2.5, errors: 0 };
    }
    const sr = this.data.spacedRepetition[tenseId];
    if (correct) {
      sr.interval = Math.round(sr.interval * sr.ease);
      sr.ease += 0.1;
      sr.errors = Math.max(0, sr.errors - 1);
    } else {
      sr.interval = 1;
      sr.ease = Math.max(1.3, sr.ease - 0.2);
      sr.errors++;
    }
    sr.nextReview = Date.now() + sr.interval * 60 * 1000; // minutes
    this.save();
  },

  reset() {
    this.data = {
      xp: 0, level: 1, totalExercises: 0, correctAnswers: 0, incorrectAnswers: 0,
      bestStreak: 0, currentStreak: 0, daysStreak: 0, lastActiveDate: null,
      completedLessons: [], tenseStats: {}, errorLog: [], activityLog: [],
      favorites: [], spacedRepetition: {}, settings: { theme: 'light' }
    };
    this.save();
    updateUI();
    showToast('Progression réinitialisée', 'info');
  }
};

// ============================================================
// 3. EXERCISE ENGINE
// ============================================================

const ExerciseEngine = {
  currentExercise: null,
  currentMode: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  answered: false,

  getIrregularForms(verb) {
    const irreg = APP_DATA.irregularVerbs.find(v => v.base === verb);
    return {
      past: irreg ? irreg.past.split('/')[0] : this.getRegularPast(verb),
      pp: irreg ? irreg.pp.split('/')[0] : this.getRegularPast(verb)
    };
  },

  getRegularPast(verb) {
    if (verb.endsWith('e')) return `${verb}d`;
    if (verb.endsWith('y') && !'aeiou'.includes(verb[verb.length - 2])) return `${verb.slice(0, -1)}ied`;
    return `${verb}ed`;
  },

  getPresentSimpleForm(verb, is3rdSing) {
    if (!is3rdSing) return verb;
    if (verb.endsWith('s') || verb.endsWith('ch') || verb.endsWith('sh') || verb.endsWith('x') || verb.endsWith('o')) return `${verb}es`;
    if (verb.endsWith('y') && !'aeiou'.includes(verb[verb.length - 2])) return `${verb.slice(0, -1)}ies`;
    return `${verb}s`;
  },

  getIngForm(verb) {
    if (verb.endsWith('ie')) return `${verb.slice(0, -2)}ying`;
    if (verb.endsWith('ee')) return `${verb}ing`;
    if (verb.endsWith('e') && verb !== 'be') return `${verb.slice(0, -1)}ing`;
    return `${verb}ing`;
  },

  generateQuestions(mode, tenseFilter, difficulty, count = 10) {
    const questions = [];
    const subjects = ['I', 'You', 'He', 'She', 'We', 'They', 'My friend', 'The teacher', 'The students', 'John', 'Sarah', 'The children', 'The dog', 'My parents'];
    const regularVerbs = ['work', 'play', 'study', 'cook', 'read', 'write', 'walk', 'talk', 'clean', 'watch', 'listen', 'help', 'ask', 'call', 'wait', 'start', 'finish', 'open', 'close', 'use'];
    const allVerbs = [...regularVerbs, ...APP_DATA.irregularVerbs.map(v => v.base)];

    const tenses = tenseFilter && tenseFilter.length > 0 ? tenseFilter : APP_DATA.tenses.map(t => t.id);

    for (let i = 0; i < count; i++) {
      const tenseId = tenses[Math.floor(Math.random() * tenses.length)];
      const tense = APP_DATA.tenses.find(t => t.id === tenseId);
      if (!tense) continue;

      const modeType = mode === 'mixed' ? ['qcm', 'fill', 'transform', 'correction', 'translation'][Math.floor(Math.random() * 5)] : mode;
      const question = this.generateSingleQuestion(modeType, tense, subjects, allVerbs, difficulty);
      if (question) {
        question.tenseId = tenseId;
        questions.push(question);
      }
    }
    return questions;
  },

  generateSingleQuestion(mode, tense, subjects, verbs, difficulty) {
    const subj = subjects[Math.floor(Math.random() * subjects.length)];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const non3rdSingSubjects = ['I', 'You', 'We', 'They', 'The students', 'The children', 'My parents'];
    const is3rdSing = !non3rdSingSubjects.includes(subj);

    switch(mode) {
      case 'qcm': return this.generateQCM(tense, subj, verb, is3rdSing, difficulty);
      case 'fill': return this.generateFill(tense, subj, verb, is3rdSing, difficulty);
      case 'transform': return this.generateTransform(tense, subj, verb, is3rdSing);
      case 'correction': return this.generateCorrection(tense, subj, verb, is3rdSing);
      case 'translation': return this.generateTranslation(tense, subj, verb, is3rdSing);
      default: return this.generateQCM(tense, subj, verb, is3rdSing, difficulty);
    }
  },

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
  },

  getAuxiliary(tenseId, subject, is3rdSing, negative = false) {
    const aux = {
      present_simple: is3rdSing ? (negative ? "doesn't" : "does") : (negative ? "don't" : "do"),
      present_continuous: subject === 'I' ? (negative ? "am not" : "am") : (!is3rdSing && subject !== 'I') ? (negative ? "aren't" : "are") : (negative ? "isn't" : "is"),
      present_perfect: is3rdSing ? (negative ? "hasn't" : "has") : (negative ? "haven't" : "have"),
      past_simple: negative ? "didn't" : "did",
      past_continuous: (subject === 'I' || is3rdSing) ? (negative ? "wasn't" : "was") : (negative ? "weren't" : "were"),
      past_perfect: negative ? "hadn't" : "had",
      future_will: negative ? "won't" : "will",
      future_going_to: subject === 'I' ? (negative ? "am not going to" : "am going to") : is3rdSing ? (negative ? "isn't going to" : "is going to") : (negative ? "aren't going to" : "are going to")
    };
    return aux[tenseId] || (negative ? "don't" : "do");
  },

  generateQCM(tense, subj, verb, is3rdSing, difficulty) {
    // MOTEUR HYBRIDE : On cherche d'abord dans la base de données de phrases riches (70% de chances)
    if (APP_DATA.exerciseTemplates[tense.id] && APP_DATA.exerciseTemplates[tense.id].qcm && Math.random() < 0.7) {
      const templates = APP_DATA.exerciseTemplates[tense.id].qcm;
      const tpl = templates[Math.floor(Math.random() * templates.length)];
      return {
        type: 'qcm',
        sentence: tpl.sentence,
        options: tpl.options,
        correct: tpl.correct,
        explanation: tpl.explanation,
        tenseId: tense.id,
        hint: `Temps : ${tense.nameFR}`
      };
    }

    // GÉNÉRATION DYNAMIQUE (Secours)
    const correctForm = this.getConjugation(verb, tense.id, subj, is3rdSing);
    const aux = this.getAuxiliary(tense.id, subj, is3rdSing);

    let fullSentence, correctAnswer, options;

    if (['present_simple', 'present_continuous', 'past_simple', 'past_continuous',
     'present_perfect', 'past_perfect', 'future_will', 'future_going_to'].includes(tense.id)) {
      if (tense.id === 'present_perfect') {
        fullSentence = `${subj} ${aux} ${correctForm} recently.`;
        correctAnswer = `${aux} ${correctForm}`;
      } else if (tense.id === 'past_perfect') {
        fullSentence = `${subj} ${aux} ${correctForm} before I arrived.`;
        correctAnswer = `${aux} ${correctForm}`;
      } else if (tense.id.includes('continuous')) {
        const contAux = tense.id.startsWith('past') ? (is3rdSing ? 'was' : 'were') : (subj === 'I' ? 'am' : (is3rdSing ? 'is' : 'are'));
        fullSentence = `${subj} ${contAux} ${correctForm}.`;
        correctAnswer = `${contAux} ${correctForm}`;
      } else if (tense.id === 'future_will') {
        fullSentence = `${subj} will ${correctForm} tomorrow.`;
        correctAnswer = `will ${correctForm}`;
      } else if (tense.id === 'future_going_to') {
        const goAux = subj === 'I' ? 'am' : (is3rdSing ? 'is' : 'are');
        fullSentence = `${subj} ${goAux} going to ${correctForm} next week.`;
        correctAnswer = `${goAux} going to ${correctForm}`;
      } else if (tense.id === 'present_continuous') {
        const contAux = subj === 'I' ? 'am' : (is3rdSing ? 'is' : 'are');
        fullSentence = `${subj} ${contAux} ${correctForm} right now.`;
        correctAnswer = `${contAux} ${correctForm}`;
      } else if (tense.id === 'past_continuous') {
        const contAux = is3rdSing ? 'was' : 'were';
        fullSentence = `${subj} ${contAux} ${correctForm} yesterday evening.`;
        correctAnswer = `${contAux} ${correctForm}`;
      } else {
        // present_simple or past_simple
        if (tense.id === 'present_simple') {
          fullSentence = `${subj} ${correctForm} every day.`;
        } else {
          fullSentence = `${subj} ${correctForm} yesterday.`;
        }
        correctAnswer = correctForm;
      }
    } else {
      fullSentence = `${subj} ${correctForm} recently.`;
      correctAnswer = correctForm;
    }

    // Generate distractors
    const distractors = new Set();
    const allForms = new Set();
    APP_DATA.irregularVerbs.forEach(v => {
      if (v.base === verb) {
        allForms.add(v.past.split('/')[0]);
        allForms.add(v.pp.split('/')[0]);
      }
    });
    allForms.add(this.getRegularPast(verb));
    allForms.add(this.getIngForm(verb));
    allForms.add(this.getPresentSimpleForm(verb, true));

    for (const f of allForms) {
      if (f !== correctForm && !distractors.has(f)) distractors.add(f);
      if (distractors.size >= 3) break;
    }

    // Add common wrong forms
    if (is3rdSing && tense.id === 'present_simple') {
      distractors.add(verb); // missing -s
    }
    if (!is3rdSing && tense.id === 'present_simple') {
      distractors.add(this.getPresentSimpleForm(verb, true)); // extra -s
    }

    options = [correctAnswer];
    for (const d of distractors) {
      if (options.length >= 4) break;
      if (!options.includes(d)) options.push(d);
    }
    const fillers = [this.getRegularPast(verb), this.getIngForm(verb), this.getPresentSimpleForm(verb, true), verb];
    let fi = 0;
    while (options.length < 4 && fi < fillers.length) {
      if (!options.includes(fillers[fi])) options.push(fillers[fi]);
      fi++;
    }
    options = options.slice(0, 4);

    const shuffled = options.sort(() => Math.random() - 0.5);
const correctIndex = shuffled.indexOf(correctAnswer);

return {
  type: 'qcm',
  sentence: fullSentence.replace(correctAnswer, '___'),
  options: shuffled,
  correct: correctIndex,
  explanation: `La forme correcte est "${correctAnswer}". ${tense.name} : ${tense.structure}`,
  tenseId: tense.id,
  hint: `Temps : ${tense.nameFR}`
};
  },

  generateFill(tense, subj, verb, is3rdSing) {
    // MOTEUR HYBRIDE : On cherche d'abord dans la base de données de phrases riches (70% de chances)
    if (APP_DATA.exerciseTemplates[tense.id] && APP_DATA.exerciseTemplates[tense.id].fill && Math.random() < 0.7) {
      const templates = APP_DATA.exerciseTemplates[tense.id].fill;
      const tpl = templates[Math.floor(Math.random() * templates.length)];
      return {
        type: 'fill',
        sentence: tpl.sentence,
        answer: tpl.answer,
        tenseId: tense.id,
        explanation: tpl.explanation
      };
    }

    // GÉNÉRATION DYNAMIQUE (Secours)
    const correctForm = this.getConjugation(verb, tense.id, subj, is3rdSing);
    let fullSentence, answer, aux;

    if (tense.id === 'present_simple') {
      fullSentence = `${subj} ___ (${verb}) every morning.`;
      answer = this.getPresentSimpleForm(verb, is3rdSing);
    } else if (tense.id === 'present_continuous') {
      const contAux = subj === 'I' ? 'am' : (is3rdSing ? 'is' : 'are');
      fullSentence = `${subj} ___ (${verb}) at the moment.`;
      answer = `${contAux} ${this.getIngForm(verb)}`;
    } else if (tense.id === 'past_simple') {
      const { past: pastForm } = this.getIrregularForms(verb);
      fullSentence = `${subj} ___ (${verb}) last week.`;
      answer = pastForm;
    } else if (tense.id === 'present_perfect') {
      const { pp: ppForm } = this.getIrregularForms(verb);
      const hasAux = is3rdSing ? 'has' : 'have';
      fullSentence = `${subj} ___ (${verb}) already.`;
      answer = `${hasAux} ${ppForm}`;
    } else if (tense.id === 'future_will') {
      fullSentence = `${subj} ___ (${verb}) tomorrow.`;
      answer = `will ${verb}`;
    } else if (tense.id === 'future_going_to') {
      const goAux = subj === 'I' ? 'am' : (is3rdSing ? 'is' : 'are');
      fullSentence = `${subj} ___ (${verb}) next month.`;
      answer = `${goAux} going to ${verb}`;
    } else if (tense.id === 'past_continuous') {
      const contAux = is3rdSing ? 'was' : 'were';
      fullSentence = `${subj} ___ (${verb}) when I arrived.`;
      answer = `${contAux} ${this.getIngForm(verb)}`;
    } else {
      const { pp: ppForm } = this.getIrregularForms(verb);
      const hasAux = is3rdSing ? 'has' : 'have';
      fullSentence = `${subj} ___ (${verb}) recently.`;
      answer = `${hasAux} ${ppForm}`;
    }

    return {
      type: 'fill',
      sentence: fullSentence,
      answer: answer,
      tenseId: tense.id,
      explanation: `La réponse est "${answer}". ${tense.name} : ${tense.structure}`
    };
  },

  generateTransform(tense, subj, verb, is3rdSing) {
    const correctForm = this.getConjugation(verb, tense.id, subj, is3rdSing);
    let affirmative, negative, question;

    if (tense.id === 'present_simple') {
      const form = this.getPresentSimpleForm(verb, is3rdSing);
      affirmative = `${subj} ${form} every day.`;
      negative = `${subj} ${is3rdSing ? "doesn't" : "don't"} ${verb} every day.`;
      const s = ['I', 'John', 'Sarah'].includes(subj) ? subj : subj.toLowerCase();
      question = `${is3rdSing ? 'Does' : 'Do'} ${s} ${verb} every day?`;
    } else if (tense.id === 'past_simple') {
      const { past: pastForm } = this.getIrregularForms(verb);
      affirmative = `${subj} ${pastForm} yesterday.`;
      negative = `${subj} didn't ${verb} yesterday.`;
      const s = ['I', 'John', 'Sarah'].includes(subj) ? subj : subj.toLowerCase();
      question = `Did ${s} ${verb} yesterday?`;
    } else {
      affirmative = `${subj} ${correctForm}.`;
      const s = ['I', 'John', 'Sarah'].includes(subj) ? subj : subj.toLowerCase();
      if (tense.id === 'present_continuous' || tense.id === 'past_continuous') {
        const aux = correctForm.split(' ')[0]; // am/is/are/was/were
        const ingForm = this.getIngForm(verb);
        negative = `${subj} ${aux} not ${ingForm}.`;
        question = `${aux.charAt(0).toUpperCase() + aux.slice(1)} ${s} ${ingForm}?`;
      } else if (tense.id === 'present_perfect') {
        const aux = is3rdSing ? 'has' : 'have';
        const pp = this.getConjugation(verb, 'present_perfect', subj, is3rdSing);
        negative = `${subj} ${aux}n't ${pp}.`;
        question = `${aux.charAt(0).toUpperCase() + aux.slice(1)} ${s} ${pp}?`;
      } else if (tense.id === 'future_will') {
        negative = `${subj} won't ${verb}.`;
        question = `Will ${s} ${verb}?`;
      } else if (tense.id === 'future_going_to') {
        const goAux = subj === 'I' ? 'am' : (is3rdSing ? 'is' : 'are');
        negative = `${subj} ${goAux} not going to ${verb}.`;
        question = `${goAux.charAt(0).toUpperCase() + goAux.slice(1)} ${s} going to ${verb}?`;
      } else {
        negative = `${subj} didn't ${verb}.`;
        question = `Did ${s} ${verb}?`;
      }
    }

    const directions = [
      { dir: "Mettez cette phrase à la forme négative :", answer: negative },
      { dir: "Transformez en question :", answer: question }
    ];
    const chosen = directions[Math.floor(Math.random() * directions.length)];

    return {
      type: 'transform',
      sentence: `Phrase affirmative : "${affirmative}"\n${chosen.dir}`,
      answer: chosen.answer,
      tenseId: tense.id,
      explanation: `La forme ${chosen.dir.includes('négative') ? 'négative' : 'interrogative'} est : "${chosen.answer}"`
    };
  },

  generateCorrection(tense, subj, verb, is3rdSing) {
    let correctSentence, incorrectSentence, explanation;

    if (tense.id === 'present_simple') {
      const form = this.getPresentSimpleForm(verb, is3rdSing);
      if (is3rdSing) {
        correctSentence = `${subj} ${form} every day.`;
        incorrectSentence = `${subj} ${verb} every day.`;
        explanation = `Avec he/she/it au Present Simple, on ajoute -s/-es au verbe.`;
      } else {
        correctSentence = `${subj} ${verb} every day.`;
        incorrectSentence = `${subj} ${verb}s every day.`;
        explanation = `Avec I/you/we/they, on utilise la base verbale sans -s.`;
      }
    } else if (tense.id === 'past_simple') {
      const irreg = APP_DATA.irregularVerbs.find(v => v.base === verb);
      const { past: pastForm } = this.getIrregularForms(verb);
      correctSentence = `${subj} ${pastForm} yesterday.`;
      incorrectSentence = irreg ? `${subj} ${verb}ed yesterday.` : `${subj} ${verb} yesterday.`;
      explanation = irreg ? `"${verb}" est irrégulier : ${verb} → ${pastForm}.` : `Il faut ajouter -ed pour le Past Simple : "${pastForm}".`;
    } else {
      correctSentence = `${subj} ${verb}ed yesterday.`;
      incorrectSentence = `${subj} ${verb} yesterday.`;
      explanation = `Il faut utiliser le Past Simple pour une action passée datée.`;
    }

    return {
      type: 'correction',
      sentence: `Trouvez l'erreur et corrigez-la :\n"${incorrectSentence}"`,
      answer: correctSentence,
      tenseId: tense.id,
      explanation: explanation
    };
  },

  generateTranslation(tense, subj, verb, is3rdSing) {
    const frSentences = [
      { fr: `Traduisez : "[sujet] fait l'action (${verb}) tous les jours."`, tense: 'present_simple' },
      { fr: `Traduisez : "[sujet] est en train de faire l'action (${verb}) en ce moment."`, tense: 'present_continuous' },
      { fr: `Traduisez : "[sujet] a fait l'action (${verb}) hier."`, tense: 'past_simple' },
      { fr: `Traduisez : "[sujet] fera l'action (${verb}) demain."`, tense: 'future_will' }
    ];

    const relevant = frSentences.filter(s => s.tense === tense.id);
    const chosen = relevant.length > 0 ? relevant[Math.floor(Math.random() * relevant.length)] : frSentences[Math.floor(Math.random() * frSentences.length)];

    let answer;
    if (chosen.tense === 'present_simple') {
      const form = this.getPresentSimpleForm(verb, is3rdSing);
      answer = `${subj} ${form} every day.`;
    } else if (chosen.tense === 'present_continuous') {
      const contAux = subj === 'I' ? 'am' : (is3rdSing ? 'is' : 'are');
      answer = `${subj} ${contAux} ${this.getIngForm(verb)} right now.`;
    } else if (chosen.tense === 'past_simple') {
      const { past: pastForm } = this.getIrregularForms(verb);
      answer = `${subj} ${pastForm} yesterday.`;
    } else {
      answer = `${subj} will ${verb} tomorrow.`;
    }

    return {
      type: 'translation',
      sentence: `Traduisez en anglais :\n"${chosen.fr}"`,
      answer: answer,
      tenseId: tense.id,
      explanation: `La traduction correcte est : "${answer}"`
    };
  },

  start(mode, tenseFilter, difficulty, count = 10) {
    this.questions = this.generateQuestions(mode, tenseFilter, difficulty, count);
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    return this.questions;
  },

  getCurrent() {
    return this.questions[this.currentIndex] || null;
  },

  next() {
    this.currentIndex++;
    this.answered = false;
    return this.currentIndex < this.questions.length;
  },

  isComplete() {
    return this.currentIndex >= this.questions.length;
  },

  getProgress() {
    return { current: this.currentIndex + 1, total: this.questions.length, score: this.score };
  }
};

// ============================================================
// 4. UI CONTROLLER
// ============================================================

let currentPage = 'dashboard';

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

  const titles = {
    dashboard: 'Tableau de bord',
    lessons: 'Leçons',
    exercises: 'Exercices',
    test: 'Mode Test',
    tenses: 'Temps verbaux',
    verbs: 'Verbes irréguliers',
    comparison: 'Comparatif',
    revision: 'Révisions',
    weakpoints: 'Points faibles',
    search: 'Recherche',
    favorites: 'Favoris',
    stats: 'Statistiques',
    settings: 'Paramètres'
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;

  // Render page content
  switch(page) {
    case 'dashboard': renderDashboard(); break;
    case 'lessons': renderLessons(); break;
    case 'exercises': resetExerciseUI(); break;
    case 'test': renderTestSetup(); break;
    case 'tenses': renderTenses(); break;
    case 'verbs': renderVerbs(); break;
    case 'comparison': renderComparison(); break;
    case 'revision': renderRevision(); break;
    case 'weakpoints': renderWeakpoints(); break;
    case 'search': performGlobalSearch(); break;
    case 'favorites': renderFavorites(); break;
    case 'stats': renderStats(); break;
    case 'settings': break;
  }

  // Close mobile sidebar
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  setTheme(next);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeBtn').textContent = theme === 'dark' ? '☀️' : '🌙';
  State.data.settings.theme = theme;
  State.save();
}

// ============================================================
// 5. PAGE RENDERERS
// ============================================================

function renderDashboard() {
  const d = State.data;
  document.getElementById('dashXP').textContent = d.xp;
  document.getElementById('dashLevel').textContent = d.level;
  document.getElementById('dashExercises').textContent = d.totalExercises;
  const accuracy = d.totalExercises > 0 ? Math.round((d.correctAnswers / d.totalExercises) * 100) : 0;
  document.getElementById('dashAccuracy').textContent = accuracy + '%';

  // Next lesson
  const nextLessonEl = document.getElementById('dashNextLesson');
  const incompleteLessons = [];
  APP_DATA.modules.forEach(mod => {
    mod.lessons.forEach(l => {
      if (!d.completedLessons.includes(l.id)) {
        incompleteLessons.push({ ...l, module: mod });
      }
    });
  });

  if (incompleteLessons.length > 0) {
    const next = incompleteLessons[0];
    nextLessonEl.innerHTML = `
      <div class="lesson-card" onclick="navigateTo('lessons')">
        <div class="lesson-icon" style="background:${next.module.color}20;color:${next.module.color}">${next.module.icon}</div>
        <div class="lesson-info">
          <div class="lesson-title">${next.title}</div>
          <div class="lesson-desc">${next.desc}</div>
          <div class="lesson-meta">
            <span class="level-badge level-${next.module.level}">${next.module.name}</span>
            <span>📝 ${next.exercises} exercices</span>
          </div>
        </div>
      </div>`;
  } else {
    nextLessonEl.innerHTML = '<p style="color:var(--text-light);font-size:0.9rem">🎉 Toutes les leçons sont terminées !</p>';
  }

  // Revision queue
  const queue = State.getReviewQueue();
  const queueEl = document.getElementById('dashRevisionQueue');
  if (queue.length > 0) {
    queueEl.innerHTML = queue.slice(0, 5).map(q => {
      const tense = APP_DATA.tenses.find(t => t.id === q.tenseId);
      return `<div class="revision-item">
        <span class="ri-icon">📖</span>
        <div class="ri-info">
          <div class="ri-title">${tense ? tense.nameFR : q.tenseId}</div>
          <div class="ri-meta">Erreurs : ${q.errors} • Intervalle : ${q.interval}min</div>
        </div>
        <span class="ri-priority ${q.errors > 3 ? 'priority-high' : q.errors > 1 ? 'priority-medium' : 'priority-low'}">${q.errors > 3 ? 'Urgent' : q.errors > 1 ? 'Moyen' : 'Faible'}</span>
      </div>`;
    }).join('');
  } else {
    queueEl.innerHTML = '<p style="color:var(--text-light);font-size:0.9rem">✅ Aucune révision en attente. Continuez les leçons !</p>';
  }

  // Chart
  renderDashboardChart();
  document.getElementById('revisionBadge').textContent = queue.length;
}

function renderDashboardChart() {
  const chartEl = document.getElementById('dashChart');
  const stats = State.data.tenseStats;
  const tenses = APP_DATA.tenses.slice(0, 8);

  chartEl.innerHTML = tenses.map(t => {
    const s = stats[t.id];
    const accuracy = s ? Math.round((s.correct / s.total) * 100) : 0;
    const height = s ? Math.max(accuracy, 5) : 5;
    const color = accuracy >= 80 ? 'var(--success)' : accuracy >= 50 ? 'var(--warning)' : 'var(--danger)';
    return `<div class="bar-item">
      <div class="bar-value">${s ? accuracy + '%' : '—'}</div>
      <div class="bar" style="height:${height}%;background:${color}"></div>
      <div class="bar-label">${t.nameFR.split(' ')[0]}</div>
    </div>`;
  }).join('');
}

function renderLessons() {
  const tabsEl = document.getElementById('lessonTabs');
  const contentEl = document.getElementById('lessonContent');

  tabsEl.innerHTML = APP_DATA.modules.map((mod, i) =>
    `<button class="tab ${i === 0 ? 'active' : ''}" onclick="showModule(${i}, this)">${mod.icon} ${mod.name}</button>`
  ).join('');

  showModule(0);
}

function showModule(index, tabEl) {
  if (tabEl) {
    document.querySelectorAll('#lessonTabs .tab').forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
  }
  const mod = APP_DATA.modules[index];
  const contentEl = document.getElementById('lessonContent');
  const completed = State.data.completedLessons;

  contentEl.innerHTML = `
    <div style="margin-bottom:20px">
      <h2 style="font-size:1.2rem;margin-bottom:4px">${mod.icon} ${mod.name}</h2>
      <p style="font-size:0.85rem;color:var(--text-light)">Niveau ${mod.level} • ${mod.lessons.length} leçons</p>
    </div>
    <div class="grid" style="gap:12px">
      ${mod.lessons.map((lesson, i) => {
        const isCompleted = completed.includes(lesson.id);
        const isLocked = i > 0 && !completed.includes(mod.lessons[i-1].id) && !isCompleted;
        const tense = lesson.tenseId ? APP_DATA.tenses.find(t => t.id === lesson.tenseId) : null;
        return `<div class="lesson-card ${isLocked ? 'locked' : ''}" onclick="${isLocked ? '' : `openLesson('${lesson.id}', '${lesson.tenseId || ''}')`}">
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
      }).join('')}
    </div>`;
}

function openLesson(lessonId, tenseId) {
  if (tenseId) {
    const tense = APP_DATA.tenses.find(t => t.id === tenseId);
    if (tense) {
      openTenseModal(tense);
    }
  } else {
    // Special lessons (passive, reported speech)
    if (lessonId === 'l_passive') openPassiveModal();
    else if (lessonId === 'l_reported') openReportedModal();
  }
}

function openTenseModal(tense) {
  const modal = document.getElementById('modalContent');
  const isFav = State.isFavorite(tense.id);

  modal.innerHTML = `
    <div class="modal-header">
      <div>
        <div class="modal-title">${tense.nameFR}</div>
        <span class="level-badge level-${tense.level}" style="margin-top:6px">${tense.level === 'beginner' ? '🌱 Débutant' : tense.level === 'intermediate' ? '🌿 Intermédiaire' : '🌳 Avancé'}</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFav('${tense.id}', this)">${isFav ? '★' : '☆'}</button>
        <button class="modal-close" onclick="closeModal()">✕</button>
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
    ${tense.examples.map(e => `<div class="example-sentence">
      <div class="en">${e.en}</div>
      <div class="fr">${e.fr}</div>
    </div>`).join('')}

    <h4 style="margin:20px 0 12px">🎯 Usages</h4>
    <ul style="padding-left:20px;font-size:0.9rem;color:var(--text-light);line-height:2">
      ${tense.usage.map(u => `<li>${u}</li>`).join('')}
    </ul>

    ${tense.signalWords ? `
    <h4 style="margin:20px 0 12px">🔑 Mots indicateurs</h4>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${tense.signalWords.map(w => `<span class="tag tag-blue">${w}</span>`).join('')}
    </div>` : ''}

    ${tense.nuances ? `
    <div class="explain-block" style="border-left-color:var(--accent);margin-top:16px">
      <h4>💡 Nuances d'usage</h4>
      <p>${tense.nuances}</p>
    </div>` : ''}

    ${tense.commonErrors.length > 0 ? `
    <h4 style="margin:20px 0 12px">⚠️ Erreurs fréquentes</h4>
    ${tense.commonErrors.map(e => `<div class="error-alert">
      <span class="wrong">${e.wrong}</span> → <span class="right">${e.right}</span>
      <br><small style="color:var(--text-light)">${e.note}</small>
    </div>`).join('')}` : ''}

    <div style="margin-top:24px;display:flex;gap:12px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="closeModal();startExerciseForTense('${tense.id}')">🎮 Pratiquer ce temps</button>
      <button class="btn btn-outline" onclick="closeModal();navigateTo('comparison')">📊 Voir le comparatif</button>
    </div>`;

  document.getElementById('modalOverlay').classList.add('active');
}

function openPassiveModal() {
  const modal = document.getElementById('modalContent');
  const info = APP_DATA.passiveInfo;
  modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">Voix Passive</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
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
        ${info.examples.map(e => `<tr><td>${e.tense}</td><td>${e.active}</td><td><strong>${e.passive}</strong></td></tr>`).join('')}
      </table>
    </div>
    <div class="explain-block" style="border-left-color:var(--accent);margin-top:16px">
      <h4>💡 Nuances</h4>
      <p>${info.nuances}</p>
    </div>
    <div style="margin-top:20px"><button class="btn btn-primary" onclick="closeModal();startExercise('mixed')">🎮 Pratiquer</button></div>`;
  document.getElementById('modalOverlay').classList.add('active');
}

function openReportedModal() {
  const modal = document.getElementById('modalContent');
  const info = APP_DATA.reportedSpeech;
  modal.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">Discours Indirect (Reported Speech)</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="explain-block">
      <h4>📝 Explication</h4>
      <p>${info.explanation}</p>
    </div>
    <h4 style="margin:16px 0 12px">🔄 Concordance des temps</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <tr><th>Discours direct</th><th>Discours indirect</th><th>Exemple</th></tr>
        ${info.rules.map(r => `<tr><td>${r.direct}</td><td><strong>${r.reported}</strong></td><td><em>${r.example}</em></td></tr>`).join('')}
      </table>
    </div>
    <h4 style="margin:16px 0 12px">📅 Changements de temps/mots</h4>
    <div class="table-wrapper">
      <table class="data-table">
        <tr><th>Direct</th><th>Indirect</th></tr>
        ${info.timeChanges.map(t => `<tr><td>${t.direct}</td><td><strong>${t.reported}</strong></td></tr>`).join('')}
      </table>
    </div>
    <div style="margin-top:20px"><button class="btn btn-primary" onclick="closeModal();startExercise('mixed')">🎮 Pratiquer</button></div>`;
  document.getElementById('modalOverlay').classList.add('active');
}

function renderTimeline(tense) {
  const tl = tense.timeline;
  if (!tl) return '';

  let html = '<div class="timeline-visual"><div class="timeline-line"></div><div class="timeline-now"></div>';
  html += '<div class="timeline-label" style="left:5%">Past</div>';
  html += '<div class="timeline-label" style="left:50%">NOW</div>';
  html += '<div class="timeline-label" style="left:85%">Future</div>';

  if (tl.type === 'dots') {
    tl.positions.forEach(pos => {
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

// ============================================================
// 6. EXERCISE UI
// ============================================================

function resetExerciseUI() {
  document.getElementById('exerciseModeSelector').style.display = 'block';
  document.getElementById('exerciseArea').style.display = 'none';
}

function startExercise(mode, tenseFilter, difficulty) {
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

function startExerciseForTense(tenseId) {
  navigateTo('exercises');
  setTimeout(() => startExercise('mixed', [tenseId], 'intermediate'), 100);
}

function renderExerciseQuestion(q) {
  const container = document.getElementById('exerciseQuestionContainer');
  document.getElementById('exCurrent').textContent = ExerciseEngine.currentIndex + 1;
  document.getElementById('exTotal').textContent = ExerciseEngine.questions.length;

  let html = `<div class="exercise-card">`;
  html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <span class="tag tag-blue">${escapeHtml(APP_DATA.tenses.find(t => t.id === q.tenseId)?.nameFR || q.tenseId)}</span>
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

  if (q.type !== 'qcm') {
    setTimeout(() => document.getElementById('exerciseInput')?.focus(), 100);
  }
}

let selectedOptionIndex = -1;

function selectOption(btn, index) {
  if (ExerciseEngine.answered) return;
  document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedOptionIndex = index;
}

function validateExercise() {
  if (ExerciseEngine.answered) return;

  const q = ExerciseEngine.getCurrent();
  let correct = false;
  let userAnswer = '';

  if (q.type === 'qcm') {
    if (selectedOptionIndex === -1) return;
    correct = selectedOptionIndex === q.correct;
    userAnswer = q.options[selectedOptionIndex];

    document.querySelectorAll('.option-btn').forEach((btn, i) => {
      if (i === q.correct) btn.classList.add('correct');
      else if (i === selectedOptionIndex && !correct) btn.classList.add('incorrect');
    });
  } else {
    const input = document.getElementById('exerciseInput');
    if (!input || !input.value.trim()) return;
    userAnswer = input.value.trim();
    correct = normalizeAnswer(userAnswer) === normalizeAnswer(q.answer);
  }

  ExerciseEngine.answered = true;
  if (correct) {
    ExerciseEngine.score++;
    State.addXP(10);
    State.recordAnswer(q.tenseId, true);
    State.updateSpacedRepetition(q.tenseId, true);
  } else {
    State.recordAnswer(q.tenseId, false);
    State.updateSpacedRepetition(q.tenseId, false);
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

function normalizeAnswer(str) {
  return str.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ').trim();
}

function skipExercise() {
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

function nextExercise() {
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

function updateExerciseProgress() {
  const p = ExerciseEngine.getProgress();
  document.getElementById('exProgressBar').style.width = `${(p.current / p.total) * 100}%`;
}

function finishExercise() {
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
      APP_DATA.modules.forEach(mod => {
        mod.lessons.forEach(lesson => {
          if (lesson.tenseId === ExerciseEngine.currentTenseFilter[0]) {
            State.completeLesson(lesson.id);
          }
        });
      });
    }
  }
}

function exitExercise() {
  resetExerciseUI();
}

// ============================================================
// 7. TEST MODE
// ============================================================

let testTimer = null;
let testSeconds = 0;

function renderTestSetup() {
  document.getElementById('testSetup').style.display = 'block';
  document.getElementById('testArea').style.display = 'none';
  document.getElementById('testResults').style.display = 'none';

  const container = document.getElementById('testTenseCheckboxes');
  container.innerHTML = APP_DATA.tenses.map(t =>
    `<label style="display:inline-flex;align-items:center;gap:4px;font-size:0.8rem;padding:4px 8px;background:var(--bg);border-radius:var(--radius-xs);cursor:pointer;margin:2px">
      <input type="checkbox" value="${t.id}" checked style="accent-color:var(--primary)"> ${t.nameFR.split(' ')[0]}
    </label>`
  ).join('');
}

function startTest() {
  const checked = document.querySelectorAll('#testTenseCheckboxes input:checked');
  const tenses = Array.from(checked).map(c => c.value);

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
    const mins = Math.floor(testSeconds / 60).toString().padStart(2, '0');
    const secs = (testSeconds % 60).toString().padStart(2, '0');
    document.getElementById('testTimer').textContent = `${mins}:${secs}`;
  }, 1000);

  renderTestQuestion();
}

function renderTestQuestion() {
  const q = ExerciseEngine.getCurrent();
  if (!q) return;

  document.getElementById('testCurrent').textContent = ExerciseEngine.currentIndex + 1;
  document.getElementById('testTotal').textContent = ExerciseEngine.questions.length;
  document.getElementById('testScore').textContent = ExerciseEngine.score;
  document.getElementById('testProgressBar').style.width = `${(ExerciseEngine.currentIndex / ExerciseEngine.questions.length) * 100}%`;
  document.getElementById('testFeedback').style.display = 'none';
  document.getElementById('testValidateBtn').style.display = 'inline-flex';
  document.getElementById('testNextBtn').style.display = 'none';
  selectedOptionIndex = -1;

  const container = document.getElementById('testQuestionContainer');
  let html = `<div class="exercise-card">`;
  html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
    <span class="tag tag-blue">${escapeHtml(APP_DATA.tenses.find(t => t.id === q.tenseId)?.nameFR || q.tenseId)}</span>
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
  } else {
    html += `<div class="input-group" style="margin-top:16px">
      <input class="input" type="text" id="testInput" placeholder="Votre réponse..." onkeydown="if(event.key==='Enter')validateTestAnswer()">
    </div>`;
  }
  html += `</div>`;
  container.innerHTML = html;

  if (q.type !== 'qcm') {
    setTimeout(() => document.getElementById('testInput')?.focus(), 100);
  }
}

function validateTestAnswer() {
  if (ExerciseEngine.answered) return;

  const q = ExerciseEngine.getCurrent();
  let correct = false;
  let userAnswer = '';

  if (q.type === 'qcm') {
    if (selectedOptionIndex === -1) return;
    correct = selectedOptionIndex === q.correct;
    userAnswer = q.options[selectedOptionIndex];
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
      if (i === q.correct) btn.classList.add('correct');
      else if (i === selectedOptionIndex && !correct) btn.classList.add('incorrect');
    });
  } else {
    const input = document.getElementById('testInput');
    if (!input || !input.value.trim()) return;
    userAnswer = input.value.trim();
    correct = normalizeAnswer(userAnswer) === normalizeAnswer(q.answer);
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

function nextTestQuestion() {
  const hasMore = ExerciseEngine.next();
  if (hasMore) {
    renderTestQuestion();
  } else {
    finishTest();
  }
}

function finishTest() {
  clearInterval(testTimer);
  document.getElementById('testArea').style.display = 'none';
  document.getElementById('testResults').style.display = 'block';

  const p = ExerciseEngine.getProgress();
  const pct = Math.round((p.score / p.total) * 100);
  const mins = Math.floor(testSeconds / 60);
  const secs = testSeconds % 60;

  let grade = '';
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
      ${ExerciseEngine.questions.map((q, i) => {
        return `<div style="padding:10px 0;border-bottom:1px solid var(--border);font-size:0.85rem">
          <span style="color:${q.answeredCorrectly ? 'var(--success)' : 'var(--danger)'}">${q.answeredCorrectly ? '✅' : '❌'}</span>
          <strong>${APP_DATA.tenses.find(t => t.id === q.tenseId)?.nameFR || ''}</strong>
          <span style="color:var(--text-light);margin-left:8px">${q.sentence.substring(0, 60)}...</span>
        </div>`;
      }).join('')}
    </div>`;

  document.getElementById('testResults').innerHTML = resultsHTML;
}

// ============================================================
// 8. TENSES REFERENCE PAGE
// ============================================================

function renderTenses() {
  const categories = [
    { id: 'present', name: 'Présent' },
    { id: 'past', name: 'Passé' },
    { id: 'perfect', name: 'Perfect' },
    { id: 'future', name: 'Futur' },
    { id: 'conditionals', name: 'Conditionnels' }
  ];

  const tabsEl = document.getElementById('tenseCategoryTabs');
  tabsEl.innerHTML = categories.map((cat, i) =>
    `<button class="tab ${i === 0 ? 'active' : ''}" onclick="showTenseCategory('${cat.id}', this)">${cat.name}</button>`
  ).join('');

  showTenseCategory('present');
}

function showTenseCategory(category, tabEl) {
  if (tabEl) {
    document.querySelectorAll('#tenseCategoryTabs .tab').forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
  }

  const tenses = APP_DATA.tenses.filter(t => t.category === category);
  const contentEl = document.getElementById('tenseContent');

  contentEl.innerHTML = `<div class="grid" style="gap:16px">
    ${tenses.map(t => `
      <div class="lesson-card" onclick="openTenseModal(APP_DATA.tenses.find(x => x.id === '${t.id}'))">
        <div class="lesson-icon" style="background:var(--primary)15;color:var(--primary)">${t.level === 'beginner' ? '🌱' : t.level === 'intermediate' ? '🌿' : '🌳'}</div>
        <div class="lesson-info">
          <div class="lesson-title">${t.nameFR}</div>
          <div class="lesson-desc">${t.explanation.substring(0, 120)}...</div>
          <div class="lesson-meta">
            <span class="level-badge level-${t.level}">${t.level === 'beginner' ? 'Débutant' : t.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}</span>
          </div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ============================================================
// 9. VERBS DICTIONARY
// ============================================================

function renderVerbs() {
  filterVerbs();
}

function filterVerbs() {
  const search = (document.getElementById('verbSearch')?.value || '').toLowerCase();
  const container = document.getElementById('verbsList');

  const filtered = APP_DATA.irregularVerbs.filter(v =>
    v.base.includes(search) || v.past.includes(search) || v.pp.includes(search) || v.meaning.includes(search)
  );

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><h3>Aucun verbe trouvé</h3><p>Essayez un autre terme de recherche.</p></div>';
    return;
  }

  container.innerHTML = filtered.map((v, i) => {
    const isFav = State.isFavorite('verb_' + v.base);
    return `<div class="verb-card" id="verb-card-${i}" onclick="toggleVerbCard(${i})">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <span class="verb-base">${v.base}</span>
          <span style="color:var(--text-light);margin:0 8px">→</span>
          <span style="font-weight:600;color:var(--accent)">${v.past}</span>
          <span style="color:var(--text-light);margin:0 8px">→</span>
          <span style="font-weight:600;color:var(--secondary)">${v.pp}</span>
          <span style="color:var(--text-light);margin-left:8px;font-size:0.85rem">${v.meaning}</span>
        </div>
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation();toggleFav('verb_${v.base}', this)">${isFav ? '★' : '☆'}</button>
      </div>
      <div class="verb-conjugation-table">
        <div class="conj-grid">
          <div class="conj-item"><div class="tense-label">Present Simple</div><div class="tense-form">${v.base}${v.base === 'be' ? ' (am/is/are)' : ''}</div></div>
          <div class="conj-item"><div class="tense-label">Present Continuous</div><div class="tense-form">${v.base === 'be' ? 'being' : v.base + 'ing'}</div></div>
          <div class="conj-item"><div class="tense-label">Past Simple</div><div class="tense-form">${v.past}</div></div>
          <div class="conj-item"><div class="tense-label">Past Continuous</div><div class="tense-form">${v.base}ing</div></div>
          <div class="conj-item"><div class="tense-label">Present Perfect</div><div class="tense-form">have/has ${v.pp}</div></div>
          <div class="conj-item"><div class="tense-label">Past Perfect</div><div class="tense-form">had ${v.pp}</div></div>
          <div class="conj-item"><div class="tense-label">Future</div><div class="tense-form">will ${v.base}</div></div>
          <div class="conj-item"><div class="tense-label">Participe présent</div><div class="tense-form">${v.base}ing</div></div>
          <div class="conj-item"><div class="tense-label">Participe passé</div><div class="tense-form">${v.pp}</div></div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleVerbCard(index) {
  const card = document.getElementById(`verb-card-${index}`);
  card.classList.toggle('expanded');
}

// ============================================================
// 10. COMPARISON TABLE
// ============================================================

function renderComparison() {
  const tabs = [
    { id: 'present', name: 'Présent' },
    { id: 'past', name: 'Passé' },
    { id: 'future', name: 'Futur' },
    { id: 'conditionals', name: 'Conditionnels' }
  ];

  document.getElementById('comparisonTabs').innerHTML = tabs.map((t, i) =>
    `<button class="tab ${i === 0 ? 'active' : ''}" onclick="showComparison('${t.id}', this)">${t.name}</button>`
  ).join('');

  showComparison('present');
}

function showComparison(category, tabEl) {
  if (tabEl) {
    document.querySelectorAll('#comparisonTabs .tab').forEach(t => t.classList.remove('active'));
    tabEl.classList.add('active');
  }

  const tenses = APP_DATA.tenses.filter(t => t.category === category);
  const content = document.getElementById('comparisonContent');

  content.innerHTML = `
    <div class="table-wrapper">
      <table class="comparison-table">
        <tr>
          <th>Temps</th>
          <th>Structure</th>
          <th>Usage principal</th>
          <th>Exemple</th>
          <th>Mots-clés</th>
        </tr>
        ${tenses.map(t => `
          <tr>
            <td><strong>${t.nameFR}</strong></td>
            <td><code style="font-size:0.75rem">${t.structure}</code></td>
            <td>${t.usage[0].split(':')[1]?.trim() || t.usage[0]}</td>
            <td><em>${t.examples[0]?.en}</em></td>
            <td>${t.signalWords?.slice(0, 4).map(w => `<span class="tag tag-blue" style="margin:2px">${w}</span>`).join('')}</td>
          </tr>
        `).join('')}
      </table>
    </div>

    ${tenses.length >= 2 ? `
    <h3 style="margin:24px 0 12px">🔍 Comparaison détaillée</h3>
    ${tenses.slice(0, 2).map(t => `
      <div class="card" style="margin-bottom:12px;cursor:pointer" onclick="openTenseModal(APP_DATA.tenses.find(x => x.id === '${t.id}'))">
        <h4>${t.nameFR}</h4>
        <p style="font-size:0.9rem;color:var(--text-light);margin-top:8px">${t.nuances || t.explanation.substring(0, 200)}</p>
      </div>
    `).join('')}` : ''}`;
}

// ============================================================
// 11. REVISION PAGE
// ============================================================

function renderRevision() {
  const queue = State.getReviewQueue();
  const container = document.getElementById('revisionContent');

  if (queue.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>Aucune révision en attente</h3>
        <p>Votre programme de répétition espacée est à jour. Continuez à apprendre de nouvelles leçons !</p>
        <button class="btn btn-primary" style="margin-top:16px" onclick="navigateTo('lessons')">📚 Voir les leçons</button>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div style="margin-bottom:20px">
      <p style="color:var(--text-light)">${queue.length} point${queue.length > 1 ? 's' : ''} à réviser</p>
      <button class="btn btn-primary" style="margin-top:12px" onclick="startRevisionSession()">🚀 Démarrer la session de révision</button>
    </div>
    ${queue.map(q => {
      const tense = APP_DATA.tenses.find(t => t.id === q.tenseId);
      return `<div class="revision-item">
        <span class="ri-icon">📖</span>
        <div class="ri-info">
          <div class="ri-title">${tense ? tense.nameFR : q.tenseId}</div>
          <div class="ri-meta">Prochaine révision : maintenant • Intervalle : ${q.interval}min • Erreurs : ${q.errors}</div>
        </div>
        <span class="ri-priority ${q.errors > 3 ? 'priority-high' : q.errors > 1 ? 'priority-medium' : 'priority-low'}">
          ${q.errors > 3 ? 'Urgent' : q.errors > 1 ? 'Moyen' : 'Faible'}
        </span>
      </div>`;
    }).join('')}`;
}

function startRevisionSession() {
  const queue = State.getReviewQueue();
  if (queue.length === 0) return;
  const tenses = queue.map(q => q.tenseId);
  navigateTo('exercises');
  setTimeout(() => startExercise('mixed', tenses, 'intermediate'), 100);
}

// ============================================================
// 12. WEAKPOINTS PAGE
// ============================================================

function renderWeakpoints() {
  const weak = State.getWeakPoints();
  const container = document.getElementById('weakpointsContent');

  if (weak.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <h3>Aucun point faible identifié</h3>
        <p>Continuez les exercices pour que le système identifie vos points à améliorer.</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <p style="color:var(--text-light);margin-bottom:20px">${weak.length} point${weak.length > 1 ? 's' : ''} faible${weak.length > 1 ? 's' : ''} détecté${weak.length > 1 ? 's' : ''}</p>
    <div class="grid" style="gap:12px">
      ${weak.map(w => {
        const tense = APP_DATA.tenses.find(t => t.id === w.tenseId);
        const accuracy = Math.round(w.accuracy * 100);
        return `<div class="card" style="display:flex;align-items:center;gap:16px">
          <div style="text-align:center;min-width:80px">
            <div style="font-size:1.5rem;font-weight:800;color:${accuracy < 40 ? 'var(--danger)' : accuracy < 60 ? 'var(--warning)' : 'var(--success)'}">${accuracy}%</div>
            <div style="font-size:0.7rem;color:var(--text-light)">précision</div>
          </div>
          <div style="flex:1">
            <div style="font-weight:700">${tense ? tense.nameFR : w.tenseId}</div>
            <div style="font-size:0.8rem;color:var(--text-light)">${w.total} exercices • ${w.errors} erreurs</div>
            <div class="progress-bar" style="margin-top:8px;height:6px">
              <div class="progress-fill ${accuracy < 50 ? 'warning' : 'success'}" style="width:${accuracy}%"></div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="startExerciseForTense('${w.tenseId}')">🎯 Pratiquer</button>
        </div>`;
      }).join('')}
    </div>`;
}

// ============================================================
// 13. SEARCH
// ============================================================

function performGlobalSearch() {
  const query = (document.getElementById('globalSearch')?.value || '').toLowerCase().trim();
  const container = document.getElementById('searchResults');

  if (!query) {
    container.innerHTML = '';
    return;
  }

  const results = [];

  // Search tenses
  APP_DATA.tenses.forEach(t => {
    if (t.name.toLowerCase().includes(query) || t.nameFR.toLowerCase().includes(query) || t.explanation.toLowerCase().includes(query)) {
      results.push({ type: 'temps', title: t.nameFR, desc: t.explanation.substring(0, 100), action: `openTenseModal(APP_DATA.tenses.find(x => x.id === '${t.id}'))` });
    }
  });

  // Search verbs
  APP_DATA.irregularVerbs.forEach(v => {
    if (v.base.includes(query) || v.past.includes(query) || v.pp.includes(query) || v.meaning.includes(query)) {
      results.push({ type: 'verbe', title: `${v.base} → ${v.past} → ${v.pp}`, desc: v.meaning, action: `navigateTo('verbs')` });
    }
  });

  // Search phrasal verbs
  APP_DATA.phrasalVerbs.forEach(pv => {
    if (pv.pv.includes(query) || pv.meaning.includes(query)) {
      results.push({ type: 'phrasal verb', title: pv.pv, desc: pv.meaning, action: '' });
    }
  });

  // Search modals
  APP_DATA.modals.forEach(m => {
    if (m.name.toLowerCase().includes(query) || m.ability.toLowerCase().includes(query)) {
      results.push({ type: 'modal', title: m.name, desc: m.ability, action: '' });
    }
  });

  if (results.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>Aucun résultat</h3><p>Essayez un autre terme.</p></div>';
    return;
  }

  container.innerHTML = results.map(r => `
    <div class="search-result-item" onclick="${r.action || ''}">
      <div class="sr-type">${r.type}</div>
      <div class="sr-title">${r.title}</div>
      <div class="sr-desc">${r.desc}</div>
    </div>
  `).join('');
}

// ============================================================
// 14. FAVORITES
// ============================================================

function renderFavorites() {
  const container = document.getElementById('favoritesContent');
  const favs = State.data.favorites;

  if (favs.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">⭐</div><h3>Aucun favori</h3><p>Marquez des leçons ou des verbes comme favoris pour les retrouver ici.</p></div>';
    return;
  }

  container.innerHTML = favs.map(f => {
    if (f.startsWith('verb_')) {
      const verbName = f.replace('verb_', '');
      const verb = APP_DATA.irregularVerbs.find(v => v.base === verbName);
      if (verb) {
        return `<div class="verb-card" style="cursor:default">
          <span class="verb-base">${verb.base}</span> → <span style="color:var(--accent)">${verb.past}</span> → <span style="color:var(--secondary)">${verb.pp}</span>
          <span style="color:var(--text-light);margin-left:8px">${verb.meaning}</span>
          <button class="fav-btn active" style="margin-left:auto" onclick="toggleFav('${f}', this)">★</button>
        </div>`;
      }
    } else {
      const tense = APP_DATA.tenses.find(t => t.id === f);
      if (tense) {
        return `<div class="lesson-card" onclick="openTenseModal(APP_DATA.tenses.find(x => x.id === '${f}'))">
          <div class="lesson-icon" style="background:var(--primary)15;color:var(--primary)">📖</div>
          <div class="lesson-info">
            <div class="lesson-title">${tense.nameFR}</div>
            <div class="lesson-desc">${tense.explanation.substring(0, 80)}...</div>
          </div>
          <button class="fav-btn active" onclick="event.stopPropagation();toggleFav('${f}', this)">★</button>
        </div>`;
      }
    }
    return '';
  }).filter(Boolean).join('');
}

function toggleFav(item, btn) {
  if (State.isFavorite(item)) {
    State.removeFavorite(item);
    if (btn) {
      btn.classList.remove('active');
      btn.innerText = '☆';
    }
  } else {
    State.addFavorite(item);
    if (btn) {
      btn.classList.add('active');
      btn.innerText = '★';
    }
  }
}

// ============================================================
// 15. STATS PAGE
// ============================================================

function renderStats() {
  const d = State.data;
  document.getElementById('statTotal').textContent = d.totalExercises;
  document.getElementById('statCorrect').textContent = d.correctAnswers;
  document.getElementById('statIncorrect').textContent = d.incorrectAnswers;
  document.getElementById('statStreak').textContent = d.bestStreak;

  // Chart
  const chartEl = document.getElementById('statsChart');
  const stats = d.tenseStats;
  const tenses = APP_DATA.tenses.filter(t => stats[t.id] && stats[t.id].total > 0);

  if (tenses.length === 0) {
    chartEl.innerHTML = '<div class="empty-state" style="padding:20px"><p>Aucune donnée disponible</p></div>';
  } else {
    chartEl.innerHTML = tenses.map(t => {
      const s = stats[t.id];
      const accuracy = Math.round((s.correct / s.total) * 100);
      const height = Math.max(accuracy, 5);
      const color = accuracy >= 80 ? 'var(--success)' : accuracy >= 50 ? 'var(--warning)' : 'var(--danger)';
      return `<div class="bar-item">
        <div class="bar-value">${accuracy}%</div>
        <div class="bar" style="height:${height}%;background:${color}"></div>
        <div class="bar-label">${t.nameFR.split(' ')[0]}</div>
      </div>`;
    }).join('');
  }

  // Activity log
  const logEl = document.getElementById('activityLog');
  const recent = d.activityLog.slice(-10).reverse();
  if (recent.length === 0) {
    logEl.innerHTML = '<p style="color:var(--text-light);font-size:0.85rem;padding:12px">Aucune activité récente</p>';
  } else {
    logEl.innerHTML = recent.map(a => {
      const date = new Date(a.date);
      return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.8rem">
        <span>${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})}</span>
        <span style="color:var(--primary);font-weight:600">+${a.xp} XP</span>
      </div>`;
    }).join('');
  }

  // Common errors
  const errorsEl = document.getElementById('commonErrors');
  if (d.errorLog.length === 0) {
    errorsEl.innerHTML = '<p style="color:var(--text-light);font-size:0.85rem">Aucune erreur enregistrée</p>';
  } else {
    const tenseErrors = {};
    d.errorLog.forEach(e => {
      tenseErrors[e.tenseId] = (tenseErrors[e.tenseId] || 0) + 1;
    });
    const sorted = Object.entries(tenseErrors).sort((a, b) => b[1] - a[1]).slice(0, 8);
    errorsEl.innerHTML = sorted.map(([tenseId, count]) => {
      const tense = APP_DATA.tenses.find(t => t.id === tenseId);
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:0.9rem">${tense ? tense.nameFR : tenseId}</span>
        <span style="background:rgba(225,112,85,0.1);color:var(--danger);padding:4px 10px;border-radius:12px;font-size:0.75rem;font-weight:700">${count} erreur${count > 1 ? 's' : ''}</span>
      </div>`;
    }).join('');
  }
}

// ============================================================
// 16. MODAL
// ============================================================

function closeModal(event) {
  if (event && event.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay').classList.remove('active');
}
function closeModalDirect() {
  document.getElementById('modalOverlay').classList.remove('active');
}

// ============================================================
// 17. TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================
// 18. CONFETTI
// ============================================================

function launchConfetti() {
  const colors = ['#6C5CE7', '#00CEC9', '#FD79A8', '#FDCB6E', '#00B894', '#E17055'];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.top = (80 + Math.random() * 20) + 'vh';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (6 + Math.random() * 8) + 'px';
    piece.style.animationDuration = (0.8 + Math.random() * 1.2) + 's';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2500);
  }
}

// ============================================================
// 19. SETTINGS FUNCTIONS
// ============================================================

function exportData() {
  const data = JSON.stringify(State.data, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conjumaster_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 Données exportées avec succès', 'success');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        State.data = { ...State.data, ...data };
        State.save();
        updateUI();
        showToast('📥 Données importées avec succès', 'success');
      } catch(err) {
        showToast('❌ Fichier invalide', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function resetProgress() {
  if (confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser toute votre progression ? Cette action est irréversible.')) {
    State.reset();
    navigateTo('dashboard');
  }
}

// ============================================================
// 20. UI UPDATE
// ============================================================

function updateUI() {
  const d = State.data;
  document.getElementById('headerXP').textContent = d.xp;
  document.getElementById('headerLevel').textContent = d.level;
  document.getElementById('sidebarLevel').textContent = d.level;
  const displayXP = d.xp - (d.level - 1) * 100;
document.getElementById('sidebarXP').textContent = `${displayXP} / 100 XP`;
document.getElementById('sidebarXPBar').style.width = `${displayXP}%`;
  document.getElementById('streakCount').textContent = d.daysStreak;
  document.getElementById('streakPlural').textContent = d.daysStreak > 1 ? 's' : '';

  // Update revision badge
  const queue = State.getReviewQueue();
  const badge = document.getElementById('revisionBadge');
  if (badge) badge.textContent = queue.length;
  const lessonsBadge = document.getElementById('lessonsBadge');
  if (lessonsBadge) {
    let incomplete = 0;
    APP_DATA.modules.forEach(mod => mod.lessons.forEach(l => { if (!d.completedLessons.includes(l.id)) incomplete++; }));
    lessonsBadge.textContent = incomplete;
  }
}

// ============================================================
// 21. NOTIFICATIONS
// ============================================================

const NotificationManager = {
  lastNotificationTime: 0,
  minInterval: 60 * 60 * 1000, // 1 hour between notifications to avoid spam

  init() {
    this.updateUI();
    // Check every minute
    setInterval(() => this.checkAndNotify(), 60 * 1000);
  },

  updateUI() {
    const btn = document.getElementById('notificationToggleBtn');
    if (!btn) return;

    if (!('Notification' in window)) {
      btn.textContent = 'Non supporté par votre navigateur';
      btn.disabled = true;
      return;
    }

    if (Notification.permission === 'granted') {
      btn.textContent = 'Désactiver les notifications (via navigateur)';
      btn.classList.add('active');
    } else if (Notification.permission === 'denied') {
      btn.textContent = 'Notifications bloquées (voir réglages navigateur)';
      btn.disabled = true;
    } else {
      btn.textContent = 'Activer les notifications';
      btn.classList.remove('active');
      btn.disabled = false;
    }
  },

  toggle() {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        this.updateUI();
        if (permission === 'granted') {
          showToast('✅ Notifications activées', 'success');
        }
      });
    } else if (Notification.permission === 'granted') {
      showToast('ℹ️ Désactivez-les depuis les paramètres de votre navigateur', 'info');
    }
  },

  checkAndNotify() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const now = Date.now();
    if (now - this.lastNotificationTime < this.minInterval) return;

    const queue = State.getReviewQueue();
    if (queue.length > 0) {
      this.sendNotification(
        "Temps de réviser !",
        `Vous avez ${queue.length} leçon(s) en attente de révision.`
      );
      this.lastNotificationTime = now;
    } else if (State.data.lastActiveDate) {
      // Check if user has practiced today
      const today = new Date().toDateString();
      if (State.data.lastActiveDate !== today && now - this.lastNotificationTime > this.minInterval * 4) {
         this.sendNotification(
          "N'oubliez pas l'anglais !",
          "Gardez votre série d'apprentissage active en faisant un exercice aujourd'hui."
        );
        this.lastNotificationTime = now;
      }
    }
  },

  sendNotification(title, body) {
    new Notification(title, {
      body: body,
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🇬🇧</text></svg>'
    });
  }
};

// ============================================================
// 22. INITIALIZATION
// ============================================================

function init() {
  State.init();
  NotificationManager.init();
  updateUI();
  navigateTo('dashboard');

  // Apply saved theme
  if (State.data.settings.theme === 'dark') {
    setTheme('dark');
  }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
