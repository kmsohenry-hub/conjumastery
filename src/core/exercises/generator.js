import { APP_DATA } from '../../../data.js';
import {
  getIrregularForms,
  getRegularPast,
  getPresentSimpleForm,
  getIngForm,
  getConjugation,
} from './conjugation.js';

export function getAuxiliary(tenseId, subject, is3rdSing, negative = false) {
  // Helper "to be" en fonction du sujet et du temps
  const beNow =
    subject === 'I'
      ? negative
        ? 'am not'
        : 'am'
      : is3rdSing
        ? negative
          ? "isn't"
          : 'is'
        : negative
          ? "aren't"
          : 'are';
  const bePast =
    subject === 'I' || is3rdSing ? (negative ? "wasn't" : 'was') : negative ? "weren't" : 'were';

  switch (tenseId) {
    case 'present_simple':
      return is3rdSing ? (negative ? "doesn't" : 'does') : negative ? "don't" : 'do';
    case 'past_simple':
      return negative ? "didn't" : 'did';
    case 'present_continuous':
      return beNow;
    case 'past_continuous':
      return bePast;
    case 'present_perfect':
    case 'present_perfect_continuous':
      return is3rdSing ? (negative ? "hasn't" : 'has') : negative ? "haven't" : 'have';
    case 'past_perfect':
    case 'past_perfect_continuous':
      return negative ? "hadn't" : 'had';
    case 'future_will':
    case 'future_continuous':
    case 'future_perfect':
      return negative ? "won't" : 'will';
    case 'future_going_to':
      return beNow + ' going to';
    default:
      return '';
  }
}

export function generateQCM(tense, subj, verb, is3rdSing, _difficulty) {
  let fullSentence, correctAnswer;
  let options = [];

  const correctForm = getConjugation(APP_DATA.verbsByBase, verb, tense.id, subj, is3rdSing);
  const aux = getAuxiliary(tense.id, subj, is3rdSing);

  // Use pre-defined templates in priority (70% chance)
  if (
    APP_DATA.exerciseTemplates[tense.id] &&
    APP_DATA.exerciseTemplates[tense.id].qcm &&
    Math.random() < 0.7
  ) {
    const templates = APP_DATA.exerciseTemplates[tense.id].qcm;
    const tpl = templates[Math.floor(Math.random() * templates.length)];
    const shuf = [...tpl.options].sort(() => Math.random() - 0.5);
    return {
      type: 'qcm',
      sentence: tpl.sentence,
      options: shuf,
      correct: shuf.indexOf(tpl.answer),
      explanation: tpl.explanation,
      tenseId: tense.id,
      hint: `Temps : ${tense.nameFR}`,
    };
  }

  // DYNAMIC GENERATION (Fallback)
  if (
    tense.id.includes('perfect') ||
    tense.id.includes('continuous') ||
    tense.id.includes('future')
  ) {
    if (tense.id === 'present_perfect') {
      fullSentence = `${subj} ${aux} ${correctForm} the work already.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id === 'past_perfect') {
      fullSentence = `${subj} ${aux} ${correctForm} before I arrived.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id.includes('continuous')) {
      const contAux = tense.id.startsWith('past')
        ? is3rdSing
          ? 'was'
          : 'were'
        : subj === 'I'
          ? 'am'
          : is3rdSing
            ? 'is'
            : 'are';
      fullSentence = `${subj} ${contAux} ${correctForm}.`;
      correctAnswer = `${contAux} ${correctForm}`;
    } else if (tense.id === 'future_will') {
      fullSentence = `${subj} will ${correctForm} tomorrow.`;
      correctAnswer = `will ${correctForm}`;
    } else if (tense.id === 'future_going_to') {
      const goAux = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
      fullSentence = `${subj} ${goAux} going to ${correctForm} next week.`;
      correctAnswer = `${goAux} going to ${correctForm}`;
    } else if (tense.id === 'present_continuous') {
      const contAux = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
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
  APP_DATA.irregularVerbs.forEach((v) => {
    if (v.base === verb) {
      v.past.split('/').forEach((p) => allForms.add(p.trim()));
      v.pp.split('/').forEach((p) => allForms.add(p.trim()));
    }
  });
  allForms.add(getRegularPast(verb));
  allForms.add(getIngForm(verb));
  allForms.add(getPresentSimpleForm(verb, true));

  for (const f of allForms) {
    if (f !== correctForm && !distractors.has(f)) distractors.add(f);
    if (distractors.size >= 3) break;
  }

  // Add common wrong forms
  if (is3rdSing && tense.id === 'present_simple') {
    distractors.add(verb); // missing -s
  }
  if (!is3rdSing && tense.id === 'present_simple') {
    distractors.add(getPresentSimpleForm(verb, true)); // extra -s
  }

  options = [correctAnswer];
  for (const d of distractors) {
    if (options.length >= 4) break;
    if (!options.includes(d)) options.push(d);
  }
  const fillers = [getRegularPast(verb), getIngForm(verb), getPresentSimpleForm(verb, true), verb];
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
    explanation: `La forme correcte est "${correctAnswer}". ${tense.nameFR} : ${tense.structure}`,
    tenseId: tense.id,
    hint: `Temps : ${tense.nameFR}`,
  };
}

export function generateFill(tense, subj, verb, is3rdSing) {
  // MOTEUR HYBRIDE : On cherche d'abord dans la base de données de phrases riches (70% de chances)
  if (
    APP_DATA.exerciseTemplates[tense.id] &&
    APP_DATA.exerciseTemplates[tense.id].fill &&
    Math.random() < 0.7
  ) {
    const templates = APP_DATA.exerciseTemplates[tense.id].fill;
    const tpl = templates[Math.floor(Math.random() * templates.length)];
    return {
      type: 'fill',
      sentence: tpl.sentence,
      answer: tpl.answer,
      tenseId: tense.id,
      explanation: tpl.explanation,
    };
  }

  // GÉNÉRATION DYNAMIQUE (Secours)
  let fullSentence, answer;

  if (tense.id === 'present_simple') {
    fullSentence = `${subj} ___ (${verb}) every morning.`;
    answer = getPresentSimpleForm(verb, is3rdSing);
  } else if (tense.id === 'present_continuous') {
    const contAux = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
    fullSentence = `${subj} ___ (${verb}) at the moment.`;
    answer = `${contAux} ${getIngForm(verb)}`;
  } else if (tense.id === 'past_simple') {
    const { past: pastForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    fullSentence = `${subj} ___ (${verb}) last week.`;
    answer = pastForm;
  } else if (tense.id === 'present_perfect') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    const hasAux = is3rdSing ? 'has' : 'have';
    fullSentence = `${subj} ___ (${verb}) already.`;
    answer = `${hasAux} ${ppForm}`;
  } else if (tense.id === 'future_will') {
    fullSentence = `${subj} ___ (${verb}) tomorrow.`;
    answer = `will ${verb}`;
  } else if (tense.id === 'future_going_to') {
    const goAux = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
    fullSentence = `${subj} ___ (${verb}) next month.`;
    answer = `${goAux} going to ${verb}`;
  } else if (tense.id === 'past_continuous') {
    const contAux = is3rdSing ? 'was' : 'were';
    fullSentence = `${subj} ___ (${verb}) when I arrived.`;
    answer = `${contAux} ${getIngForm(verb)}`;
  } else {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    const hasAux = is3rdSing ? 'has' : 'have';
    fullSentence = `${subj} ___ (${verb}) recently.`;
    answer = `${hasAux} ${ppForm}`;
  }

  return {
    type: 'fill',
    sentence: fullSentence,
    answer: answer,
    tenseId: tense.id,
    explanation: `La réponse est "${answer}". ${tense.nameFR} : ${tense.structure}`,
  };
}

export function generateTransform(tense, subj, verb, is3rdSing) {
  const correctForm = getConjugation(APP_DATA.verbsByBase, verb, tense.id, subj, is3rdSing);
  let affirmative, negative, question;

  if (tense.id === 'present_simple') {
    const form = getPresentSimpleForm(verb, is3rdSing);
    affirmative = `${subj} ${form} every day.`;
    negative = `${subj} ${is3rdSing ? "doesn't" : "don't"} ${verb} every day.`;
    const s = ['I', 'John', 'Sarah'].includes(subj) ? subj : subj.toLowerCase();
    question = `${is3rdSing ? 'Does' : 'Do'} ${s} ${verb} every day?`;
  } else if (tense.id === 'past_simple') {
    const { past: pastForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    affirmative = `${subj} ${pastForm} yesterday.`;
    negative = `${subj} didn't ${verb} yesterday.`;
    const s = ['I', 'John', 'Sarah'].includes(subj) ? subj : subj.toLowerCase();
    question = `Did ${s} ${verb} yesterday?`;
  } else {
    affirmative = `${subj} ${correctForm}.`;
    const s = ['I', 'John', 'Sarah'].includes(subj) ? subj : subj.toLowerCase();
    if (tense.id === 'present_continuous' || tense.id === 'past_continuous') {
      const aux = correctForm.split(' ')[0]; // am/is/are/was/were
      const ingForm = getIngForm(verb);
      negative = `${subj} ${aux} not ${ingForm}.`;
      question = `${aux.charAt(0).toUpperCase() + aux.slice(1)} ${s} ${ingForm}?`;
    } else if (tense.id === 'present_perfect') {
      const aux = is3rdSing ? 'has' : 'have';
      const pp = getConjugation(APP_DATA.verbsByBase, verb, 'present_perfect', subj, is3rdSing);
      negative = `${subj} ${aux}n't ${pp}.`;
      question = `${aux.charAt(0).toUpperCase() + aux.slice(1)} ${s} ${pp}?`;
    } else if (tense.id === 'future_will') {
      negative = `${subj} won't ${verb}.`;
      question = `Will ${s} ${verb}?`;
    } else if (tense.id === 'future_going_to') {
      const goAux = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
      negative = `${subj} ${goAux} not going to ${verb}.`;
      question = `${goAux.charAt(0).toUpperCase() + goAux.slice(1)} ${s} going to ${verb}?`;
    } else {
      negative = `${subj} didn't ${verb}.`;
      question = `Did ${s} ${verb}?`;
    }
  }

  const directions = [
    { dir: 'Mettez cette phrase à la forme négative :', answer: negative },
    { dir: 'Transformez en question :', answer: question },
  ];
  const chosen = directions[Math.floor(Math.random() * directions.length)];

  return {
    type: 'transform',
    sentence: `Phrase affirmative : "${affirmative}"\n${chosen.dir}`,
    answer: chosen.answer,
    tenseId: tense.id,
    explanation: `La forme ${chosen.dir.includes('négative') ? 'négative' : 'interrogative'} est : "${chosen.answer}"`,
  };
}

export function generateCorrection(tense, subj, verb, is3rdSing) {
  let correctSentence, incorrectSentence, explanation;

  if (tense.id === 'present_simple') {
    const form = getPresentSimpleForm(verb, is3rdSing);
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
    const irreg = APP_DATA.verbsByBase[verb];
    const { past: pastForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    correctSentence = `${subj} ${pastForm} yesterday.`;
    incorrectSentence = irreg ? `${subj} ${verb}ed yesterday.` : `${subj} ${verb} yesterday.`;
    explanation = irreg
      ? `"${verb}" est irrégulier : ${verb} → ${pastForm}.`
      : `Il faut ajouter -ed pour le Past Simple : "${pastForm}".`;
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
    explanation: explanation,
  };
}

export function generateTranslation(tense, subj, verb, is3rdSing) {
  const frSentences = [
    {
      fr: `Traduisez : "[sujet] fait l'action (${verb}) tous les jours."`,
      tense: 'present_simple',
    },
    {
      fr: `Traduisez : "[sujet] est en train de faire l'action (${verb}) en ce moment."`,
      tense: 'present_continuous',
    },
    { fr: `Traduisez : "[sujet] a fait l'action (${verb}) hier."`, tense: 'past_simple' },
    { fr: `Traduisez : "[sujet] fera l'action (${verb}) demain."`, tense: 'future_will' },
  ];

  const relevant = frSentences.filter((s) => s.tense === tense.id);
  const chosen =
    relevant.length > 0
      ? relevant[Math.floor(Math.random() * relevant.length)]
      : frSentences[Math.floor(Math.random() * frSentences.length)];

  let answer;
  if (chosen.tense === 'present_simple') {
    const form = getPresentSimpleForm(verb, is3rdSing);
    answer = `${subj} ${form} every day.`;
  } else if (chosen.tense === 'present_continuous') {
    const contAux = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
    answer = `${subj} ${contAux} ${getIngForm(verb)} right now.`;
  } else if (chosen.tense === 'past_simple') {
    const { past: pastForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    answer = `${subj} ${pastForm} yesterday.`;
  } else {
    answer = `${subj} will ${verb} tomorrow.`;
  }

  return {
    type: 'translation',
    sentence: `Traduisez en anglais :\n"${chosen.fr}"`,
    answer: answer,
    tenseId: tense.id,
    explanation: `La traduction correcte est : "${answer}"`,
  };
}

export function generateSingleQuestion(mode, tense, subjects, verbs, difficulty) {
  const subj = subjects[Math.floor(Math.random() * subjects.length)];
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const non3rdSingSubjects = [
    'I',
    'You',
    'We',
    'They',
    'The students',
    'The children',
    'My parents',
  ];
  const is3rdSing = !non3rdSingSubjects.includes(subj);

  switch (mode) {
    case 'qcm':
      return generateQCM(tense, subj, verb, is3rdSing, difficulty);
    case 'fill':
      return generateFill(tense, subj, verb, is3rdSing, difficulty);
    case 'transform':
      return generateTransform(tense, subj, verb, is3rdSing);
    case 'correction':
      return generateCorrection(tense, subj, verb, is3rdSing);
    case 'translation':
      return generateTranslation(tense, subj, verb, is3rdSing);
    default:
      return generateQCM(tense, subj, verb, is3rdSing, difficulty);
  }
}

export function generateQuestions(mode, tenseFilter, difficulty, count = 10) {
  const questions = [];
  const subjects = [
    'I',
    'You',
    'He',
    'She',
    'We',
    'They',
    'My friend',
    'The teacher',
    'The students',
    'John',
    'Sarah',
    'The children',
    'The dog',
    'My parents',
  ];
  const regularVerbs = [
    'work',
    'play',
    'study',
    'cook',
    'read',
    'write',
    'walk',
    'talk',
    'clean',
    'watch',
    'listen',
    'help',
    'ask',
    'call',
    'wait',
    'start',
    'finish',
    'open',
    'close',
    'use',
  ];
  const allVerbs = [...regularVerbs, ...APP_DATA.irregularVerbs.map((v) => v.base)];

  const tenses =
    tenseFilter && tenseFilter.length > 0 ? tenseFilter : APP_DATA.tenses.map((t) => t.id);

  for (let i = 0; i < count; i++) {
    const tenseId = tenses[Math.floor(Math.random() * tenses.length)];
    const tense = APP_DATA.tensesById[tenseId];
    if (!tense) continue;

    const modeType =
      mode === 'mixed'
        ? ['qcm', 'fill', 'transform', 'correction', 'translation'][Math.floor(Math.random() * 5)]
        : mode;
    const question = generateSingleQuestion(modeType, tense, subjects, allVerbs, difficulty);
    if (question) {
      question.tenseId = tenseId;
      questions.push(question);
    }
  }
  return questions;
}
