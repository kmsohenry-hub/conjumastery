import { APP_DATA } from '../../data/index.js';
import {
  getIrregularForms,
  getRegularPast,
  getPresentSimpleForm,
  getIngForm,
  getConjugation,
  getAuxiliary,
} from './conjugation.js';
import { shuffle } from './shuffle.js';

function buildSentenceForTense(tenseId, subj, verb, is3rdSing, context = 'practice') {
  const ing = getIngForm(verb);
  const { past, pp } = getIrregularForms(APP_DATA.verbsByBase, verb);
  const present = getPresentSimpleForm(verb, is3rdSing);
  const beNow = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
  const bePast = subj === 'I' || is3rdSing ? 'was' : 'were';
  const hasHave = is3rdSing ? 'has' : 'have';

  const sentences = {
    present_simple: `${subj} ${present} every day.`,
    present_continuous: `${subj} ${beNow} ${ing} right now.`,
    present_perfect: `${subj} ${hasHave} ${pp} already.`,
    present_perfect_continuous: `${subj} ${hasHave} been ${ing} for two hours.`,
    past_simple: `${subj} ${past} yesterday.`,
    past_continuous: `${subj} ${bePast} ${ing} when I arrived.`,
    past_perfect: `${subj} had ${pp} before I arrived.`,
    past_perfect_continuous: `${subj} had been ${ing} for two hours before I arrived.`,
    future_will: `${subj} will ${verb} tomorrow.`,
    future_going_to: `${subj} ${beNow} going to ${verb} next week.`,
    future_continuous: `${subj} will be ${ing} tomorrow evening.`,
    future_perfect: `${subj} will have ${pp} by tomorrow.`,
    future_perfect_continuous: `${subj} will have been ${ing} for two hours by then.`,
  };

  return sentences[tenseId] || `${subj} ${present} ${context}.`;
}

function buildIncorrectSentenceForTense(tenseId, subj, verb, is3rdSing) {
  const correct = buildSentenceForTense(tenseId, subj, verb, is3rdSing);
  const ing = getIngForm(verb);
  const { past, pp } = getIrregularForms(APP_DATA.verbsByBase, verb);
  const present = getPresentSimpleForm(verb, is3rdSing);

  const incorrect = {
    present_simple: is3rdSing
      ? `${subj} ${verb} every day.`
      : `${subj} ${getPresentSimpleForm(verb, true)} every day.`,
    present_continuous: `${subj} ${present} right now.`,
    present_perfect: `${subj} ${past} already.`,
    present_perfect_continuous: `${subj} has been ${verb} for two hours.`,
    past_simple: `${subj} ${verb} yesterday.`,
    past_continuous: `${subj} ${past} when I arrived.`,
    past_perfect: `${subj} had ${past} before I arrived.`,
    past_perfect_continuous: `${subj} had ${ing} for two hours before I arrived.`,
    future_will: `${subj} ${verb} tomorrow.`,
    future_going_to: `${subj} will going to ${verb} next week.`,
    future_continuous: `${subj} will ${ing} tomorrow evening.`,
    future_perfect: `${subj} will ${pp} by tomorrow.`,
    future_perfect_continuous: `${subj} will have ${ing} for two hours by then.`,
  };

  return incorrect[tenseId] === correct ? `${subj} ${verb} yesterday.` : incorrect[tenseId];
}

export function generateQCM(tense, subj, verb, is3rdSing, _difficulty) {
  let fullSentence, correctAnswer;
  let options;

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
    const originalAnswer = tpl.options[tpl.correct];
    const shuf = shuffle(tpl.options);
    return {
      type: 'qcm',
      sentence: tpl.sentence,
      options: shuf,
      correct: shuf.indexOf(originalAnswer),
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
    } else if (tense.id === 'present_perfect_continuous') {
      fullSentence = `${subj} ${aux} ${correctForm} for two hours.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id === 'past_perfect_continuous') {
      fullSentence = `${subj} ${aux} ${correctForm} before I arrived.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id === 'future_perfect') {
      fullSentence = `${subj} ${aux} ${correctForm} by tomorrow.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id === 'future_perfect_continuous') {
      fullSentence = `${subj} ${aux} ${correctForm} for two hours by then.`;
      correctAnswer = `${aux} ${correctForm}`;
    } else if (tense.id === 'future_continuous') {
      fullSentence = `${subj} ${aux} ${correctForm} tomorrow evening.`;
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
      // present_simple, past_simple, or a not-yet-specialised tense fallback
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

  const shuffled = shuffle(options);
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
  const correctSentence = buildSentenceForTense(tense.id, subj, verb, is3rdSing);
  const incorrectSentence = buildIncorrectSentenceForTense(tense.id, subj, verb, is3rdSing);

  return {
    type: 'correction',
    sentence: `Trouvez l'erreur et corrigez-la :\n"${incorrectSentence}"`,
    answer: correctSentence,
    tenseId: tense.id,
    explanation: `La phrase correcte au ${tense.nameFR} est : "${correctSentence}"`,
  };
}

export function generateTranslation(tense, subj, verb, is3rdSing) {
  const answer = buildSentenceForTense(tense.id, subj, verb, is3rdSing);

  return {
    type: 'translation',
    sentence: `Traduisez en anglais en utilisant le temps ${tense.nameFR} :\n"${subj} / ${verb}"`,
    answer,
    tenseId: tense.id,
    explanation: `La traduction correcte au ${tense.nameFR} est : "${answer}"`,
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
