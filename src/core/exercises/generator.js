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
  const present = getPresentSimpleForm(verb, is3rdSing, subj);
  const beNow = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
  const bePast = subj === 'I' || is3rdSing ? 'was' : 'were';
  const hasHave = is3rdSing ? 'has' : 'have';
  const pastForm = verb === 'be' ? bePast : past;

  const sentences = {
    present_simple: `${subj} ${present} every day.`,
    present_continuous: `${subj} ${beNow} ${ing} right now.`,
    present_perfect: `${subj} ${hasHave} ${pp} already.`,
    present_perfect_continuous: `${subj} ${hasHave} been ${ing} for two hours.`,
    past_simple: `${subj} ${pastForm} yesterday.`,
    past_continuous: `${subj} ${bePast} ${ing} when I arrived.`,
    past_perfect: `${subj} had ${pp} before I arrived.`,
    past_perfect_continuous: `${subj} had been ${ing} for two hours before I arrived.`,
    future_will: `${subj} will ${verb} tomorrow.`,
    future_going_to: `${subj} ${beNow} going to ${verb} next week.`,
    future_continuous: `${subj} will be ${ing} tomorrow evening.`,
    future_perfect: `${subj} will have ${pp} by tomorrow.`,
    future_perfect_continuous: `${subj} will have been ${ing} for two hours by then.`,
    conditional_0: `If ${subj} ${present}, ${subj} ${present}.`,
    conditional_1: `If ${subj} ${present}, ${subj} will ${verb}.`,
    conditional_2: `If ${subj} ${pastForm}, ${subj} would ${verb}.`,
    conditional_3: `If ${subj} had ${pp}, ${subj} would have ${pp}.`,
    mixed_conditional: `If ${subj} had ${pp}, ${subj} would ${verb}.`,
  };

  return sentences[tenseId] || `${subj} ${present} ${context}.`;
}

function buildIncorrectSentenceForTense(tenseId, subj, verb, is3rdSing) {
  const correct = buildSentenceForTense(tenseId, subj, verb, is3rdSing);
  const ing = getIngForm(verb);
  const { past, pp } = getIrregularForms(APP_DATA.verbsByBase, verb);
  const present = getPresentSimpleForm(verb, is3rdSing, subj);
  const bePast = subj === 'I' || is3rdSing ? 'was' : 'were';
  const pastForm = verb === 'be' ? bePast : past;

  let wrongPresent;
  if (verb === 'be') {
    wrongPresent = is3rdSing ? 'are' : 'is';
  } else if (verb === 'have') {
    wrongPresent = is3rdSing ? 'have' : 'has';
  } else {
    wrongPresent = is3rdSing ? verb : getPresentSimpleForm(verb, true, subj);
  }

  const incorrect = {
    present_simple: `${subj} ${wrongPresent} every day.`,
    present_continuous: `${subj} ${present} right now.`,
    present_perfect: `${subj} ${pastForm} already.`,
    present_perfect_continuous: `${subj} has been ${verb} for two hours.`,
    past_simple: `${subj} ${verb} yesterday.`,
    past_continuous: `${subj} ${pastForm} when I arrived.`,
    past_perfect: `${subj} had ${pastForm} before I arrived.`,
    past_perfect_continuous: `${subj} had ${ing} for two hours before I arrived.`,
    future_will: `${subj} ${verb} tomorrow.`,
    future_going_to: `${subj} will going to ${verb} next week.`,
    future_continuous: `${subj} will ${ing} tomorrow evening.`,
    future_perfect: `${subj} will ${pp} by tomorrow.`,
    future_perfect_continuous: `${subj} will have ${ing} for two hours by then.`,
    conditional_0: `If ${subj} ${verb}, ${subj} ${present}.`,
    conditional_1: `If ${subj} ${pastForm}, ${subj} will ${verb}.`,
    conditional_2: `If ${subj} ${present}, ${subj} would ${verb}.`,
    conditional_3: `If ${subj} ${pastForm}, ${subj} would have ${pp}.`,
    mixed_conditional: `If ${subj} ${present}, ${subj} would ${verb}.`,
  };

  return incorrect[tenseId] === correct ? `${subj} ${verb} yesterday.` : incorrect[tenseId];
}

export function generateQCM(tense, subj, verb, is3rdSing, _difficulty) {
  let fullSentence, correctAnswer;
  let options;

  const correctForm = getConjugation(APP_DATA.verbsByBase, verb, tense.id, subj, is3rdSing);
  const aux = getAuxiliary(tense.id, subj, is3rdSing);

  // HYBRID ENGINE: Try curated rich templates first (70% probability)
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
  if (tense.id === 'conditional_0') {
    correctAnswer = getPresentSimpleForm(verb, is3rdSing, subj);
    fullSentence = `If ${subj} ___, ${subj} ${correctAnswer}.`;
  } else if (tense.id === 'conditional_1') {
    correctAnswer = getPresentSimpleForm(verb, is3rdSing, subj);
    fullSentence = `If ${subj} ___, ${subj} will ${verb}.`;
  } else if (tense.id === 'conditional_2') {
    const { past: pastForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    correctAnswer = verb === 'be' ? (subj === 'I' || is3rdSing ? 'was' : 'were') : pastForm;
    fullSentence = `If ${subj} ___, ${subj} would ${verb}.`;
  } else if (tense.id === 'conditional_3') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    correctAnswer = ppForm;
    fullSentence = `If ${subj} had ___, ${subj} would have ${ppForm}.`;
  } else if (tense.id === 'mixed_conditional') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    correctAnswer = ppForm;
    fullSentence = `If ${subj} had ___, ${subj} would ${verb}.`;
  } else if (
    tense.id.includes('perfect') ||
    tense.id.includes('continuous') ||
    tense.id.includes('future')
  ) {
    if (tense.id === 'present_perfect') {
      fullSentence = `${subj} ${aux} ${correctForm} recently.`;
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
    } else if (tense.id === 'future_will') {
      fullSentence = `${subj} will ${correctForm} tomorrow.`;
      correctAnswer = `will ${correctForm}`;
    } else if (tense.id === 'future_going_to') {
      const goAux = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
      fullSentence = `${subj} ${goAux} going to ${correctForm} next week.`;
      correctAnswer = `${goAux} going to ${correctForm}`;
    } else {
      fullSentence = `${subj} ${correctForm} tomorrow.`;
      correctAnswer = correctForm;
    }
  } else {
    // present_simple or past_simple
    if (tense.id === 'present_simple') {
      fullSentence = `${subj} ${correctForm} every day.`;
      correctAnswer = correctForm;
    } else {
      fullSentence = `${subj} ${correctForm} yesterday.`;
      correctAnswer = correctForm;
    }
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

  if (verb === 'be') {
    ['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being'].forEach((f) => allForms.add(f));
  } else if (verb === 'have') {
    ['have', 'has', 'had', 'having'].forEach((f) => allForms.add(f));
  } else {
    allForms.add(getRegularPast(verb));
    allForms.add(getIngForm(verb));
    allForms.add(getPresentSimpleForm(verb, is3rdSing, subj));
    allForms.add(getPresentSimpleForm(verb, true, subj));
  }

  allForms.delete('bes');
  allForms.delete('haves');

  for (const f of allForms) {
    if (f !== correctAnswer && !distractors.has(f)) distractors.add(f);
    if (distractors.size >= 3) break;
  }

  // Add common wrong forms
  if (tense.id === 'present_simple') {
    if (verb === 'be') {
      ['am', 'is', 'are', 'be', 'was', 'were'].forEach((f) => {
        if (f !== correctAnswer) distractors.add(f);
      });
    } else if (verb === 'have') {
      ['have', 'has', 'had', 'having'].forEach((f) => {
        if (f !== correctAnswer) distractors.add(f);
      });
    } else {
      if (is3rdSing) {
        distractors.add(verb); // missing -s
      } else {
        distractors.add(getPresentSimpleForm(verb, true, subj)); // extra -s
      }
    }
  }

  distractors.delete('bes');
  distractors.delete('haves');

  options = [correctAnswer];
  for (const d of distractors) {
    if (options.length >= 4) break;
    options.push(d);
  }

  const fillers =
    verb === 'be'
      ? ['is', 'are', 'am', 'was', 'were', 'be']
      : verb === 'have'
        ? ['has', 'have', 'had', 'having']
        : [getRegularPast(verb), getIngForm(verb), getPresentSimpleForm(verb, true, subj), verb];

  let fi = 0;
  while (options.length < 4 && fi < fillers.length) {
    const filler = fillers[fi];
    if (filler !== 'bes' && filler !== 'haves' && !options.includes(filler)) {
      options.push(filler);
    }
    fi++;
  }
  options = options.filter((opt) => opt !== 'bes' && opt !== 'haves').slice(0, 4);

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
  // HYBRID ENGINE: Try curated rich templates first (70% probability)
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

  // DYNAMIC GENERATION (Fallback)
  let fullSentence, answer;

  if (tense.id === 'present_simple') {
    fullSentence = `${subj} ___ (${verb}) every morning.`;
    answer = getPresentSimpleForm(verb, is3rdSing, subj);
  } else if (tense.id === 'present_continuous') {
    const contAux = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
    fullSentence = `${subj} ___ (${verb}) at the moment.`;
    answer = `${contAux} ${getIngForm(verb)}`;
  } else if (tense.id === 'past_simple') {
    const { past: pastForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    const actualPast = verb === 'be' ? (subj === 'I' || is3rdSing ? 'was' : 'were') : pastForm;
    fullSentence = `${subj} ___ (${verb}) last week.`;
    answer = actualPast;
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
    const contAux = subj === 'I' || is3rdSing ? 'was' : 'were';
    fullSentence = `${subj} ___ (${verb}) when I arrived.`;
    answer = `${contAux} ${getIngForm(verb)}`;
  } else if (tense.id === 'present_perfect_continuous') {
    const hasAux = is3rdSing ? 'has' : 'have';
    fullSentence = `${subj} ___ (${verb}) for two hours.`;
    answer = `${hasAux} been ${getIngForm(verb)}`;
  } else if (tense.id === 'past_perfect') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    fullSentence = `${subj} ___ (${verb}) before I arrived.`;
    answer = `had ${ppForm}`;
  } else if (tense.id === 'past_perfect_continuous') {
    fullSentence = `${subj} ___ (${verb}) for two hours before I arrived.`;
    answer = `had been ${getIngForm(verb)}`;
  } else if (tense.id === 'future_continuous') {
    fullSentence = `${subj} ___ (${verb}) tomorrow evening.`;
    answer = `will be ${getIngForm(verb)}`;
  } else if (tense.id === 'future_perfect') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    fullSentence = `${subj} ___ (${verb}) by tomorrow.`;
    answer = `will have ${ppForm}`;
  } else if (tense.id === 'future_perfect_continuous') {
    fullSentence = `${subj} ___ (${verb}) for two hours by then.`;
    answer = `will have been ${getIngForm(verb)}`;
  } else if (tense.id === 'conditional_0') {
    const present = getPresentSimpleForm(verb, is3rdSing, subj);
    fullSentence = `If ${subj} ___, ${subj} ${present}.`;
    answer = present;
  } else if (tense.id === 'conditional_1') {
    const present = getPresentSimpleForm(verb, is3rdSing, subj);
    fullSentence = `If ${subj} ___, ${subj} will ${verb}.`;
    answer = present;
  } else if (tense.id === 'conditional_2') {
    const { past: pastForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    const actualPast = verb === 'be' ? (subj === 'I' || is3rdSing ? 'was' : 'were') : pastForm;
    fullSentence = `If ${subj} ___, ${subj} would ${verb}.`;
    answer = actualPast;
  } else if (tense.id === 'conditional_3') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    fullSentence = `If ${subj} had ___, ${subj} would have ${ppForm}.`;
    answer = ppForm;
  } else if (tense.id === 'mixed_conditional') {
    const { pp: ppForm } = getIrregularForms(APP_DATA.verbsByBase, verb);
    fullSentence = `If ${subj} had ___, ${subj} would ${verb}.`;
    answer = ppForm;
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
  let affirmative, negative, question;
  const s = ['I', 'John', 'Sarah'].includes(subj) ? subj : subj.toLowerCase();
  const ing = getIngForm(verb);
  const { past, pp } = getIrregularForms(APP_DATA.verbsByBase, verb);
  const present = getPresentSimpleForm(verb, is3rdSing, subj);
  const beNow = subj === 'I' ? 'am' : is3rdSing ? 'is' : 'are';
  const beNowCap = subj === 'I' ? 'Am' : is3rdSing ? 'Is' : 'Are';
  const bePast = subj === 'I' || is3rdSing ? 'was' : 'were';
  const bePastCap = subj === 'I' || is3rdSing ? 'Was' : 'Were';
  const hasHave = is3rdSing ? 'has' : 'have';
  const hasHaveCap = is3rdSing ? 'Has' : 'Have';
  const pastForm = verb === 'be' ? bePast : past;

  affirmative = buildSentenceForTense(tense.id, subj, verb, is3rdSing);

  if (tense.id === 'present_simple') {
    affirmative = `${subj} ${present} every day.`;
    if (verb === 'be') {
      const beNowNeg = subj === 'I' ? 'am not' : is3rdSing ? "isn't" : "aren't";
      negative = `${subj} ${beNowNeg} every day.`;
      question = `${beNowCap} ${s} every day?`;
    } else {
      negative = `${subj} ${is3rdSing ? "doesn't" : "don't"} ${verb} every day.`;
      question = `${is3rdSing ? 'Does' : 'Do'} ${s} ${verb} every day?`;
    }
  } else if (tense.id === 'past_simple') {
    affirmative = `${subj} ${pastForm} yesterday.`;
    if (verb === 'be') {
      const bePastNeg = subj === 'I' || is3rdSing ? "wasn't" : "weren't";
      negative = `${subj} ${bePastNeg} yesterday.`;
      question = `${bePastCap} ${s} yesterday?`;
    } else {
      negative = `${subj} didn't ${verb} yesterday.`;
      question = `Did ${s} ${verb} yesterday?`;
    }
  } else if (tense.id === 'present_continuous') {
    const beNowNeg = subj === 'I' ? 'am not' : is3rdSing ? 'is not' : 'are not';
    negative = `${subj} ${beNowNeg} ${ing}.`;
    question = `${beNowCap} ${s} ${ing}?`;
  } else if (tense.id === 'past_continuous') {
    const bePastNeg = subj === 'I' || is3rdSing ? 'was not' : 'were not';
    negative = `${subj} ${bePastNeg} ${ing}.`;
    question = `${bePastCap} ${s} ${ing}?`;
  } else if (tense.id === 'present_perfect') {
    negative = `${subj} ${hasHave}n't ${pp}.`;
    question = `${hasHaveCap} ${s} ${pp}?`;
  } else if (tense.id === 'present_perfect_continuous') {
    negative = `${subj} ${hasHave}n't been ${ing}.`;
    question = `${hasHaveCap} ${s} been ${ing}?`;
  } else if (tense.id === 'past_perfect') {
    negative = `${subj} hadn't ${pp}.`;
    question = `Had ${s} ${pp}?`;
  } else if (tense.id === 'past_perfect_continuous') {
    negative = `${subj} hadn't been ${ing}.`;
    question = `Had ${s} been ${ing}?`;
  } else if (tense.id === 'future_will') {
    negative = `${subj} won't ${verb}.`;
    question = `Will ${s} ${verb}?`;
  } else if (tense.id === 'future_going_to') {
    negative = `${subj} ${beNow} not going to ${verb}.`;
    question = `${beNowCap} ${s} going to ${verb}?`;
  } else if (tense.id === 'future_continuous') {
    negative = `${subj} won't be ${ing}.`;
    question = `Will ${s} be ${ing}?`;
  } else if (tense.id === 'future_perfect') {
    negative = `${subj} won't have ${pp}.`;
    question = `Will ${s} have ${pp}?`;
  } else if (tense.id === 'future_perfect_continuous') {
    negative = `${subj} won't have been ${ing}.`;
    question = `Will ${s} have been ${ing}?`;
  } else if (tense.id === 'conditional_0') {
    negative = `If ${subj} ${is3rdSing ? "doesn't" : "don't"} ${verb}, ${subj} ${is3rdSing ? "doesn't" : "don't"} ${verb}.`;
    question = `If ${subj} ${present}, ${is3rdSing ? 'Does' : 'Do'} ${s} ${verb}?`;
  } else if (tense.id === 'conditional_1') {
    negative = `If ${subj} ${is3rdSing ? "doesn't" : "don't"} ${verb}, ${subj} won't ${verb}.`;
    question = `If ${subj} ${present}, will ${s} ${verb}?`;
  } else if (tense.id === 'conditional_2') {
    negative = `If ${subj} didn't ${verb}, ${subj} wouldn't ${verb}.`;
    question = `If ${subj} ${pastForm}, would ${s} ${verb}?`;
  } else if (tense.id === 'conditional_3') {
    negative = `If ${subj} hadn't ${pp}, ${subj} wouldn't have ${pp}.`;
    question = `If ${subj} had ${pp}, would ${s} have ${pp}?`;
  } else if (tense.id === 'mixed_conditional') {
    negative = `If ${subj} hadn't ${pp}, ${subj} wouldn't ${verb}.`;
    question = `If ${subj} had ${pp}, would ${s} ${verb}?`;
  } else {
    negative = `${subj} didn't ${verb}.`;
    question = `Did ${s} ${verb}?`;
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
      return generateFill(tense, subj, verb, is3rdSing);
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

export function generateQuestions(mode, tenseFilter, difficulty, count = 10, isRevision = false) {
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
    const tenseId = isRevision
      ? tenses[i % tenses.length]
      : tenses[Math.floor(Math.random() * tenses.length)];
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
