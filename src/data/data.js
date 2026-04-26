/**
 * Module de données de l'application ConjuMaster UK
 * Contient toutes les données pédagogiques (temps, verbes, exercices, etc.)
 */

export const APP_DATA = {
  // Tous les temps verbaux anglais avec contenu pédagogique complet
  tenses: [
    {
      id: "present_simple",
      name: "Present Simple",
      nameFR: "Présent simple",
      category: "present",
      level: "beginner",
      structure: "Sujet + base verbale (+ s/es à la 3e personne sing.)",
      structureNeg: "Sujet + do/does + not + base verbale",
      structureQ: "Do/Does + sujet + base verbale ?",
      explanation: "Le Present Simple exprime des habitudes, des vérités générales, des états permanents et des emplois du temps fixes.",
      usage: [
        "Habitudes et routines : I wake up at 7 every morning.",
        "Vérités générales : Water boils at 100°C.",
        "États permanents : She lives in Manchester.",
        "Emplois du temps : The train leaves at 9:15."
      ],
      examples: [
        { en: "She drinks tea every morning.", fr: "Elle boit du thé tous les matins." },
        { en: "They don't like cold weather.", fr: "Ils n'aiment pas le temps froid." },
        { en: "Does he work in London?", fr: "Travaille-t-il à Londres ?" }
      ],
      timeline: { type: "dots", positions: [15, 30, 50, 70, 85], label: "Répétition régulière" },
      commonErrors: [
        { wrong: "He go to school every day.", right: "He goes to school every day.", note: "Ne pas oublier le -s" }
      ],
      comparison: ["present_continuous", "present_perfect"],
      signalWords: ["always", "usually", "often", "sometimes", "never", "every day"]
    },
    {
      id: "present_continuous",
      name: "Present Continuous",
      nameFR: "Présent continu",
      category: "present",
      level: "beginner",
      structure: "Sujet + am/is/are + verbe-ing",
      structureNeg: "Sujet + am/is/are + not + verbe-ing",
      structureQ: "Am/Is/Are + sujet + verbe-ing ?",
      explanation: "Le Present Continuous décrit une action en cours au moment où l'on parle ou une situation temporaire.",
      usage: [
        "Action en cours : I am reading now.",
        "Situation temporaire : She is staying with us this week.",
        "Futur proche : We are meeting them tomorrow."
      ],
      examples: [
        { en: "I am studying English.", fr: "Je suis en train d'étudier l'anglais." },
        { en: "They are playing football.", fr: "Ils jouent au football." }
      ],
      timeline: { type: "range", start: 45, end: 55, label: "Maintenant" },
      comparison: ["present_simple", "past_continuous"],
      signalWords: ["now", "at the moment", "currently", "today", "this week"]
    },
    {
      id: "past_simple",
      name: "Past Simple",
      nameFR: "Prétérit",
      category: "past",
      level: "beginner",
      structure: "Sujet + verbe-ed (ou forme irrégulière)",
      structureNeg: "Sujet + did + not + base verbale",
      structureQ: "Did + sujet + base verbale ?",
      explanation: "Le Past Simple exprime une action achevée dans le passé, située à un moment précis.",
      usage: [
        "Action passée datée : I visited London last year.",
        "Suite d'actions : He woke up, showered, and left.",
        "Habitude passée : When I was young, I played piano."
      ],
      examples: [
        { en: "She arrived yesterday.", fr: "Elle est arrivée hier." },
        { en: "They didn't come to the party.", fr: "Ils ne sont pas venus à la fête." }
      ],
      timeline: { type: "point", position: 20, label: "Passé" },
      comparison: ["past_continuous", "present_perfect"],
      signalWords: ["yesterday", "last week", "ago", "in 2010", "when I was young"]
    },
    {
      id: "past_continuous",
      name: "Past Continuous",
      nameFR: "Prétérit continu",
      category: "past",
      level: "intermediate",
      structure: "Sujet + was/were + verbe-ing",
      explanation: "Le Past Continuous décrit une action en cours dans le passé, souvent interrompue par une autre action.",
      usage: [
        "Action en cours dans le passé : At 8pm, I was watching TV.",
        "Action interrompue : I was sleeping when the phone rang."
      ],
      examples: [
        { en: "It was raining when we left.", fr: "Il pleuvait quand nous sommes partis." }
      ],
      timeline: { type: "range", start: 15, end: 35, label: "En cours dans le passé" },
      comparison: ["past_simple", "present_continuous"],
      signalWords: ["while", "when", "at 8pm yesterday", "all morning"]
    },
    {
      id: "present_perfect",
      name: "Present Perfect",
      nameFR: "Present Perfect",
      category: "perfect",
      level: "intermediate",
      structure: "Sujet + have/has + participe passé",
      explanation: "Le Present Perfect relie le passé au présent. Action passée avec conséquence présente ou expérience de vie.",
      usage: [
        "Expérience de vie : I have been to Japan.",
        "Action récente : She has just finished.",
        "Action commencée dans le passé et continue : We have lived here for 5 years."
      ],
      examples: [
        { en: "I have seen that movie.", fr: "J'ai vu ce film." },
        { en: "He hasn't finished yet.", fr: "Il n'a pas encore fini." }
      ],
      timeline: { type: "range", start: 0, end: 50, label: "Du passé à maintenant" },
      comparison: ["past_simple", "present_perfect_continuous"],
      signalWords: ["already", "yet", "just", "ever", "never", "since", "for"]
    },
    {
      id: "present_perfect_continuous",
      name: "Present Perfect Continuous",
      nameFR: "Present Perfect continu",
      category: "perfect",
      level: "advanced",
      structure: "Sujet + have/has + been + verbe-ing",
      explanation: "Insiste sur la durée d'une action commencée dans le passé et qui continue ou vient de finir.",
      usage: [
        "Durée : I have been waiting for 2 hours.",
        "Action qui vient de finir avec trace visible : You're out of breath. Have you been running?"
      ],
      examples: [
        { en: "She has been studying all day.", fr: "Elle étudie depuis toute la journée." }
      ],
      timeline: { type: "range-arrow", start: 0, end: 50, label: "Durée jusqu'à maintenant" },
      comparison: ["present_perfect", "past_continuous"],
      signalWords: ["for", "since", "all day", "lately", "recently"]
    },
    {
      id: "future_simple",
      name: "Future Simple (will)",
      nameFR: "Futur simple",
      category: "future",
      level: "beginner",
      structure: "Sujet + will + base verbale",
      explanation: "Le Future Simple exprime une décision spontanée, une prédiction, ou un fait futur.",
      usage: [
        "Décision spontanée : I'll help you!",
        "Prédiction : It will rain tomorrow.",
        "Promesse : I won't tell anyone."
      ],
      examples: [
        { en: "I will call you later.", fr: "Je t'appellerai plus tard." },
        { en: "Will you marry me?", fr: "Veux-tu m'épouser ?" }
      ],
      timeline: { type: "point", position: 80, label: "Futur" },
      comparison: ["going_to", "present_continuous"],
      signalWords: ["tomorrow", "next week", "soon", "in a year", "probably"]
    },
    {
      id: "going_to",
      name: "Be going to",
      nameFR: "Futur proche",
      category: "future",
      level: "beginner",
      structure: "Sujet + am/is/are + going to + base verbale",
      explanation: "Exprime une intention prémeditée ou une prédiction basée sur des indices présents.",
      usage: [
        "Intention : I'm going to learn Spanish.",
        "Prédiction avec indice : Look at those clouds! It's going to rain."
      ],
      examples: [
        { en: "We are going to travel next summer.", fr: "Nous allons voyager l'été prochain." }
      ],
      timeline: { type: "point", position: 75, label: "Futur proche" },
      comparison: ["future_simple", "present_continuous"],
      signalWords: ["going to", "planning to"]
    },
    {
      id: "future_continuous",
      name: "Future Continuous",
      nameFR: "Futur continu",
      category: "future",
      level: "advanced",
      structure: "Sujet + will be + verbe-ing",
      explanation: "Action qui sera en cours à un moment précis du futur.",
      usage: [
        "Action future en cours : This time tomorrow, I'll be flying to Paris."
      ],
      examples: [
        { en: "At 9pm, I will be watching the game.", fr: "À 21h, je regarderai le match." }
      ],
      timeline: { type: "range", start: 70, end: 90, label: "En cours dans le futur" },
      comparison: ["future_simple", "past_continuous"],
      signalWords: ["at this time tomorrow", "at 8pm tonight", "next week at Monday"]
    },
    {
      id: "future_perfect",
      name: "Future Perfect",
      nameFR: "Futur antérieur",
      category: "future",
      level: "advanced",
      structure: "Sujet + will have + participe passé",
      explanation: "Action qui sera terminée avant un moment précis du futur.",
      usage: [
        "Action achevée dans le futur : By 2025, I will have graduated."
      ],
      examples: [
        { en: "By tomorrow, I will have finished.", fr: "D'ici demain, j'aurai fini." }
      ],
      timeline: { type: "point-before", position: 85, label: "Avant un moment futur" },
      comparison: ["future_simple", "present_perfect"],
      signalWords: ["by", "by the time", "before", "by 2030"]
    },
    {
      id: "conditional",
      name: "Conditional (would)",
      nameFR: "Conditionnel",
      category: "conditional",
      level: "intermediate",
      structure: "Sujet + would + base verbale",
      explanation: "Exprime une hypothèse, une politesse, ou une action conditionnelle.",
      usage: [
        "Hypothèse : I would travel if I had money.",
        "Politesse : Would you open the window?",
        "Souhait : I would love to come."
      ],
      examples: [
        { en: "I would help you if I could.", fr: "Je t'aiderais si je pouvais." }
      ],
      comparison: ["second_conditional", "third_conditional"],
      signalWords: ["would", "if"]
    },
    {
      id: "passive_present",
      name: "Passive Voice (Present)",
      nameFR: "Voix passive (présent)",
      category: "passive",
      level: "intermediate",
      structure: "Sujet + am/is/are + participe passé",
      explanation: "La voix passive met l'accent sur l'action ou l'objet plutôt que sur le sujet.",
      usage: [
        "Quand l'agent est inconnu : My car was stolen.",
        "Quand l'action est plus importante : The building was constructed in 1990."
      ],
      examples: [
        { en: "English is spoken worldwide.", fr: "L'anglais est parlé dans le monde entier." }
      ],
      comparison: ["passive_past", "active_voice"],
      signalWords: ["by", "is/are + pp"]
    },
    {
      id: "passive_past",
      name: "Passive Voice (Past)",
      nameFR: "Voix passive (passé)",
      category: "passive",
      level: "intermediate",
      structure: "Sujet + was/were + participe passé",
      explanation: "Voix passive au passé.",
      examples: [
        { en: "The letter was sent yesterday.", fr: "La lettre a été envoyée hier." }
      ],
      comparison: ["passive_present", "active_voice"],
      signalWords: ["was/were + pp", "by"]
    }
  ],

  // Verbes irréguliers
  irregularVerbs: [
    { base: "be", past: "was/were", pp: "been", trad: "être" },
    { base: "have", past: "had", pp: "had", trad: "avoir" },
    { base: "do", past: "did", pp: "done", trad: "faire" },
    { base: "go", past: "went", pp: "gone", trad: "aller" },
    { base: "get", past: "got", pp: "got/gotten", trad: "obtenir" },
    { base: "make", past: "made", pp: "made", trad: "fabriquer" },
    { base: "take", past: "took", pp: "taken", trad: "prendre" },
    { base: "come", past: "came", pp: "come", trad: "venir" },
    { base: "see", past: "saw", pp: "seen", trad: "voir" },
    { base: "know", past: "knew", pp: "known", trad: "savoir" },
    { base: "think", past: "thought", pp: "thought", trad: "penser" },
    { base: "give", past: "gave", pp: "given", trad: "donner" },
    { base: "find", past: "found", pp: "found", trad: "trouver" },
    { base: "tell", past: "told", pp: "told", trad: "dire" },
    { base: "become", past: "became", pp: "become", trad: "devenir" },
    { base: "leave", past: "left", pp: "left", trad: "partir" },
    { base: "feel", past: "felt", pp: "felt", trad: "ressentir" },
    { base: "bring", past: "brought", pp: "brought", trad: "apporter" },
    { base: "begin", past: "began", pp: "begun", trad: "commencer" },
    { base: "keep", past: "kept", pp: "kept", trad: "garder" },
    { base: "hold", past: "held", pp: "held", trad: "tenir" },
    { base: "write", past: "wrote", pp: "written", trad: "écrire" },
    { base: "stand", past: "stood", pp: "stood", trad: "se tenir debout" },
    { base: "hear", past: "heard", pp: "heard", trad: "entendre" },
    { base: "let", past: "let", pp: "let", trad: "laisser" },
    { base: "mean", past: "meant", pp: "meant", trad: "signifier" },
    { base: "set", past: "set", pp: "set", trad: "placer" },
    { base: "meet", past: "met", pp: "met", trad: "rencontrer" },
    { base: "run", past: "ran", pp: "run", trad: "courir" },
    { base: "pay", past: "paid", pp: "paid", trad: "payer" },
    { base: "sit", past: "sat", pp: "sat", trad: "s'asseoir" },
    { base: "speak", past: "spoke", pp: "spoken", trad: "parler" },
    { base: "lie", past: "lay", pp: "lain", trad: "être allongé" },
    { base: "lead", past: "led", pp: "led", trad: "mener" },
    { base: "read", past: "read", pp: "read", trad: "lire" },
    { base: "grow", past: "grew", pp: "grown", trad: "grandir" },
    { base: "lose", past: "lost", pp: "lost", trad: "perdre" },
    { base: "fall", past: "fell", pp: "fallen", trad: "tomber" },
    { base: "send", past: "sent", pp: "sent", trad: "envoyer" },
    { base: "build", past: "built", pp: "built", trad: "construire" },
    { base: "understand", past: "understood", pp: "understood", trad: "comprendre" },
    { base: "draw", past: "drew", pp: "drawn", trad: "dessiner" },
    { base: "break", past: "broke", pp: "broken", trad: "casser" },
    { base: "spend", past: "spent", pp: "spent", trad: "dépenser" },
    { base: "cut", past: "cut", pp: "cut", trad: "couper" },
    { base: "rise", past: "rose", pp: "risen", trad: "s'élever" },
    { base: "drive", past: "drove", pp: "driven", trad: "conduire" },
    { base: "buy", past: "bought", pp: "bought", trad: "acheter" },
    { base: "wear", past: "wore", pp: "worn", trad: "porter (vêtement)" },
    { base: "choose", past: "chose", pp: "chosen", trad: "choisir" }
  ],

  // Modules de leçons
  modules: [
    {
      id: "beginner",
      title: "Débutant",
      icon: "🌱",
      color: "#10b981",
      lessons: [
        { id: "lesson_1", title: "Present Simple", tenseId: "present_simple", description: "Apprenez le présent simple" },
        { id: "lesson_2", title: "Present Continuous", tenseId: "present_continuous", description: "Actions en cours" },
        { id: "lesson_3", title: "Past Simple", tenseId: "past_simple", description: "Le passé simple" }
      ]
    },
    {
      id: "intermediate",
      title: "Intermédiaire",
      icon: "📈",
      color: "#3b82f6",
      lessons: [
        { id: "lesson_4", title: "Present Perfect", tenseId: "present_perfect", description: "Le present perfect" },
        { id: "lesson_5", title: "Future Forms", tenseId: "future_simple", description: "Les formes du futur" },
        { id: "lesson_6", title: "Conditionnel", tenseId: "conditional", description: "Would et les hypothèses" }
      ]
    },
    {
      id: "advanced",
      title: "Avancé",
      icon: "🎓",
      color: "#8b5cf6",
      lessons: [
        { id: "lesson_7", title: "Perfect Continuous", tenseId: "present_perfect_continuous", description: "Formes continues parfaites" },
        { id: "lesson_8", title: "Voix Passive", tenseId: "passive_present", description: "La voix passive" },
        { id: "lesson_9", title: "Future Perfect", tenseId: "future_perfect", description: "Le futur antérieur" }
      ]
    }
  ],

  // Modèles d'exercices par temps verbal
  exerciseTemplates: {
    present_simple: {
      qcm: [
        { template: "She ___ to school every day.", answers: ["go", "goes", "going", "gone"], correct: 1 },
        { template: "___ they like pizza?", answers: ["Do", "Does", "Are", "Is"], correct: 0 },
        { template: "He ___ not watch TV.", answers: ["do", "does", "is", "are"], correct: 1 }
      ],
      fill: [
        { template: "I _____ (work) in a bank.", answer: "work" },
        { template: "She _____ (study) French.", answer: "studies" }
      ]
    },
    present_continuous: {
      qcm: [
        { template: "I ___ right now.", answers: ["study", "am studying", "studied", "studies"], correct: 1 },
        { template: "They ___ football at the moment.", answers: ["play", "are playing", "played", "plays"], correct: 1 }
      ],
      fill: [
        { template: "He _____ (read) a book now.", answer: "is reading" }
      ]
    },
    past_simple: {
      qcm: [
        { template: "Yesterday, I ___ to the cinema.", answers: ["go", "went", "gone", "going"], correct: 1 },
        { template: "___ she call you?", answers: ["Did", "Does", "Do", "Was"], correct: 0 }
      ],
      fill: [
        { template: "We _____ (visit) London last year.", answer: "visited" }
      ]
    },
    present_perfect: {
      qcm: [
        { template: "I ___ never been to Japan.", answers: ["have", "has", "had", "am"], correct: 0 },
        { template: "She ___ just finished.", answers: ["have", "has", "had", "is"], correct: 1 }
      ],
      fill: [
        { template: "They _____ (live) here for 5 years.", answer: "have lived" }
      ]
    }
  },

  // Informations sur la voix passive
  passiveInfo: {
    title: "La Voix Passive",
    explanation: "La voix passive met l'accent sur l'action plutôt que sur celui qui la fait.",
    structure: {
      present: "am/is/are + participe passé",
      past: "was/were + participe passé",
      perfect: "have/has been + participe passé"
    },
    examples: [
      { active: "Someone stole my car.", passive: "My car was stolen." },
      { active: "They built this house in 1990.", passive: "This house was built in 1990." }
    ],
    whenToUse: [
      "Quand l'agent est inconnu ou évident",
      "Quand l'action est plus importante que l'agent",
      "Dans les textes scientifiques ou formels"
    ]
  },

  // Discours rapporté
  reportedSpeech: {
    title: "Le Discours Rapporté",
    explanation: "Quand on rapporte les paroles de quelqu'un, les temps verbaux changent généralement.",
    transformations: [
      { direct: "Present Simple", reported: "Past Simple", example: "\"I like it\" → He said he liked it" },
      { direct: "Present Continuous", reported: "Past Continuous", example: "\"I am working\" → He said he was working" },
      { direct: "Past Simple", reported: "Past Perfect", example: "\"I went\" → He said he had gone" },
      { direct: "will", reported: "would", example: "\"I will help\" → He said he would help" }
    ]
  },

  // Phrasal verbs courants
  phrasalVerbs: [
    { verb: "give up", meaning: "abandonner", example: "Don't give up!" },
    { verb: "look after", meaning: "s'occuper de", example: "Can you look after my cat?" },
    { verb: "turn off", meaning: "éteindre", example: "Turn off the lights." },
    { verb: "put on", meaning: "mettre (vêtement)", example: "Put on your coat." },
    { verb: "take off", meaning: "décoller / enlever", example: "The plane takes off." },
    { verb: "get up", meaning: "se lever", example: "I get up at 7." },
    { verb: "look for", meaning: "chercher", example: "I'm looking for my keys." },
    { verb: "find out", meaning: "découvrir", example: "I need to find out the truth." }
  ],

  // Verbes modaux
  modals: [
    { modal: "can", usage: "Capacité, permission", example: "I can swim." },
    { modal: "could", usage: "Capacité passée, politesse", example: "Could you help me?" },
    { modal: "may", usage: "Permission, possibilité", example: "It may rain." },
    { modal: "might", usage: "Possibilité faible", example: "I might come." },
    { modal: "must", usage: "Obligation", example: "You must stop." },
    { modal: "should", usage: "Conseil", example: "You should study." },
    { modal: "would", usage: "Conditionnel, habitude passée", example: "I would go if I could." }
  ],

  // Catégories de temps pour filtrage
  categories: [
    { id: "present", name: "Présent", icon: "📍" },
    { id: "past", name: "Passé", icon: "🔙" },
    { id: "perfect", name: "Perfect", icon: "✨" },
    { id: "future", name: "Futur", icon: "🔮" },
    { id: "conditional", name: "Conditionnel", icon: "🤔" },
    { id: "passive", name: "Passif", icon: "🔄" }
  ],

  // Niveaux de difficulté
  difficulties: [
    { id: "beginner", name: "Débutant", icon: "🌱" },
    { id: "intermediate", name: "Intermédiaire", icon: "📈" },
    { id: "advanced", name: "Avancé", icon: "🎓" }
  ]
};

// Export des utilitaires de données
export function getTenseById(id) {
  return APP_DATA.tenses.find(t => t.id === id);
}

export function getTensesByCategory(category) {
  return APP_DATA.tenses.filter(t => t.category === category);
}

export function getIrregularVerb(base) {
  return APP_DATA.irregularVerbs.find(v => v.base === base);
}

export function searchInData(query) {
  const q = query.toLowerCase();
  const results = {
    tenses: [],
    verbs: [],
    phrasalVerbs: [],
    modals: []
  };

  APP_DATA.tenses.forEach(t => {
    if (t.name.toLowerCase().includes(q) || t.nameFR.toLowerCase().includes(q) || 
        t.explanation.toLowerCase().includes(q)) {
      results.tenses.push(t);
    }
  });

  APP_DATA.irregularVerbs.forEach(v => {
    if (v.base.includes(q) || v.trad.toLowerCase().includes(q)) {
      results.verbs.push(v);
    }
  });

  APP_DATA.phrasalVerbs.forEach(pv => {
    if (pv.verb.includes(q) || pv.meaning.toLowerCase().includes(q)) {
      results.phrasalVerbs.push(pv);
    }
  });

  APP_DATA.modals.forEach(m => {
    if (m.modal.includes(q) || m.usage.toLowerCase().includes(q)) {
      results.modals.push(m);
    }
  });

  return results;
}
