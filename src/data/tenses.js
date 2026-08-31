export const tenses = [
  {
    id: 'present_simple',
    name: 'Present Simple',
    nameFR: 'Présent simple',
    category: 'present',
    level: 'beginner',
    structure: 'Sujet + base verbale (+ s/es à la 3e personne sing.)',
    structureNeg: 'Sujet + do/does + not + base verbale',
    structureQ: 'Do/Does + sujet + base verbale ?',
    explanation:
      "Le Present Simple exprime des habitudes, des vérités générales, des états permanents et des emplois du temps fixes. C'est le temps de base pour décrire ce qui est vrai de manière générale.",
    usage: [
      'Habitudes et routines : I wake up at 7 every morning.',
      'Vérités générales : Water boils at 100°C.',
      'États permanents : She lives in Manchester.',
      'Emplois du temps : The train leaves at 9:15.',
      'Commentaires sportifs en direct : He passes the ball to Smith!',
    ],
    examples: [
      { en: 'She drinks tea every morning.', fr: 'Elle boit du thé tous les matins.' },
      { en: "They don't like cold weather.", fr: "Ils n'aiment pas le temps froid." },
      { en: 'Does he work in London?', fr: 'Travaille-t-il à Londres ?' },
      { en: 'The sun rises in the east.', fr: "Le soleil se lève à l'est." },
    ],
    timeline: { type: 'dots', positions: [15, 30, 50, 70, 85], label: 'Répétition régulière' },
    commonErrors: [
      {
        wrong: 'He go to school every day.',
        right: 'He goes to school every day.',
        note: 'Ne pas oublier le -s à la 3e personne du singulier.',
      },
      {
        wrong: "She don't like fish.",
        right: "She doesn't like fish.",
        note: "On utilise 'doesn't' (et non 'don't') avec he/she/it.",
      },
    ],
    nuances:
      "Contrairement au français, le Present Simple anglais n'exprime PAS une action en cours de déroulement. Pour cela, utilisez le Present Continuous. De plus, les verbes d'état (stative verbs) comme know, believe, want s'utilisent presque toujours au Present Simple, jamais au Continuous.",
    comparison: ['present_continuous', 'present_perfect'],
    signalWords: [
      'always',
      'usually',
      'often',
      'sometimes',
      'never',
      'every day/week/month',
      'on Mondays',
      'once a week',
    ],
  },
  {
    id: 'present_continuous',
    name: 'Present Continuous',
    nameFR: 'Présent continu / progressif',
    category: 'present',
    level: 'beginner',
    structure: 'Sujet + am/is/are + verbe-ing',
    structureNeg: 'Sujet + am/is/are + not + verbe-ing',
    structureQ: 'Am/Is/Are + sujet + verbe-ing ?',
    explanation:
      "Le Present Continuous décrit une action en train de se dérouler au moment où l'on parle, une situation temporaire, ou un futur planifié et certain.",
    usage: [
      "Action en cours : I'm reading a book right now.",
      "Situation temporaire : She's staying with friends this week.",
      'Changement/évolution : The weather is getting warmer.',
      "Futur planifié : We're meeting John tomorrow at 6.",
      "Agacement (avec always) : He's always complaining!",
    ],
    examples: [
      { en: "I'm currently studying English.", fr: "J'étudie l'anglais en ce moment." },
      { en: "They aren't working today.", fr: "Ils ne travaillent pas aujourd'hui." },
      { en: 'Is she coming to the party?', fr: 'Vient-elle à la fête ?' },
      { en: "It's raining outside.", fr: 'Il pleut dehors.' },
    ],
    timeline: { type: 'range', start: 40, end: 60, label: 'En cours maintenant' },
    commonErrors: [
      {
        wrong: 'I am knowing the answer.',
        right: 'I know the answer.',
        note: "Know est un stative verb : il ne s'utilise pas au continuous.",
      },
      {
        wrong: 'She is wanting a coffee.',
        right: 'She wants a coffee.',
        note: "Want est un verbe d'état, pas d'action.",
      },
    ],
    nuances:
      "Les stative verbs (know, believe, understand, want, need, like, love, hate, prefer, seem, belong, own, remember, mean) ne s'utilisent généralement PAS au continuous. Certains verbes changent de sens : 'I think he's nice' (opinion = stative) vs 'I'm thinking about the problem' (action mentale = dynamic).",
    comparison: ['present_simple', 'past_continuous'],
    signalWords: [
      'now',
      'right now',
      'at the moment',
      'currently',
      'today',
      'this week',
      'look!',
      'listen!',
    ],
  },
  {
    id: 'present_perfect',
    name: 'Present Perfect',
    nameFR: 'Present Perfect',
    category: 'perfect',
    level: 'intermediate',
    structure: 'Sujet + have/has + participe passé',
    structureNeg: 'Sujet + have/has + not + participe passé',
    structureQ: 'Have/Has + sujet + participe passé ?',
    explanation:
      'Le Present Perfect fait le lien entre le passé et le présent. Il exprime une action passée qui a un impact sur le présent, une expérience de vie, ou une action commencée dans le passé qui continue.',
    usage: [
      "Expérience de vie : I've been to Paris three times.",
      "Action passée avec résultat présent : She's lost her keys (elle ne les a pas maintenant).",
      "Action commencée dans le passé et toujours vraie : I've known him since 2010.",
      'Nouvelles récentes : The Prime Minister has announced new measures.',
      'Avec ever/never/yet/already/just',
    ],
    examples: [
      { en: "I've already finished my homework.", fr: "J'ai déjà fini mes devoirs." },
      { en: 'Have you ever eaten haggis?', fr: 'As-tu déjà mangé du haggis ?' },
      { en: "She hasn't called me yet.", fr: "Elle ne m'a pas encore appelé." },
      { en: "We've lived here for ten years.", fr: 'Nous vivons ici depuis dix ans.' },
    ],
    timeline: { type: 'arrow', start: 10, now: 50, label: 'Passé → Présent' },
    commonErrors: [
      {
        wrong: 'I have seen him yesterday.',
        right: 'I saw him yesterday.',
        note: 'Avec un moment passé précisé (yesterday, last week...), on utilise le Past Simple, PAS le Present Perfect.',
      },
      {
        wrong: 'I am knowing him since 2015.',
        right: "I've known him since 2015.",
        note: 'Depuis + date = Present Perfect, pas Present Continuous.',
      },
    ],
    nuances:
      "C'est LE temps le plus difficile pour les francophones. En français, on utilise le passé composé pour les deux ('j'ai mangé hier' et 'j'ai déjà mangé'). En anglais : Past Simple avec un moment précis du passé, Present Perfect SANS moment précis ou avec un lien au présent. 'I've lost my keys' = je les ai perdues et je ne les ai toujours pas. 'I lost my keys yesterday' = fait passé daté.",
    comparison: ['present_simple', 'past_simple', 'present_perfect_continuous'],
    signalWords: [
      'already',
      'yet',
      'just',
      'ever',
      'never',
      'since',
      'for',
      'recently',
      'so far',
      'up to now',
      'lately',
    ],
  },
  {
    id: 'present_perfect_continuous',
    name: 'Present Perfect Continuous',
    nameFR: 'Present Perfect Continuous',
    category: 'perfect',
    level: 'intermediate',
    structure: 'Sujet + have/has + been + verbe-ing',
    structureNeg: 'Sujet + have/has + not + been + verbe-ing',
    structureQ: 'Have/Has + sujet + been + verbe-ing ?',
    explanation:
      "Le Present Perfect Continuous met l'accent sur la durée d'une action commencée dans le passé et qui continue (ou vient juste de finir avec un résultat visible).",
    usage: [
      "Action qui dure depuis un moment : I've been studying for three hours.",
      "Activité récente avec résultat visible : You're out of breath. Have you been running?",
      "Insister sur la durée : She's been working here since 2018.",
      "Action temporaire en cours : I've been reading that book you lent me.",
    ],
    examples: [
      { en: "I've been waiting for you for ages!", fr: "Je t'attends depuis des lustres !" },
      {
        en: "He's been playing football all afternoon.",
        fr: "Il joue au football depuis tout l'après-midi.",
      },
      { en: 'Have you been crying?', fr: 'As-tu pleuré ?' },
      { en: "It's been raining all day.", fr: 'Il pleut depuis toute la journée.' },
    ],
    timeline: { type: 'arrow', start: 5, now: 50, label: "Durée jusqu'à maintenant" },
    commonErrors: [
      {
        wrong: "I've been knowing him for years.",
        right: "I've known him for years.",
        note: "Les stative verbs ne s'utilisent pas au continuous, même au Present Perfect Continuous.",
      },
      {
        wrong: "I've been reading this book since three hours.",
        right: "I've been reading this book for three hours.",
        note: 'Since + point de départ (2010, Monday). For + durée (3 hours, 2 weeks).',
      },
    ],
    nuances:
      "La différence avec le Present Perfect simple est subtile : le continuous insiste sur la durée et l'activité en cours, le simple sur le résultat ou l'expérience. 'I've painted the room' (c'est fait, résultat) vs 'I've been painting the room' (j'étais occupé à peindre, pas forcément fini).",
    comparison: ['present_perfect', 'past_perfect_continuous'],
    signalWords: ['for', 'since', 'all day', 'all morning', 'how long', 'lately'],
  },
  {
    id: 'past_simple',
    name: 'Past Simple',
    nameFR: 'Prétérit (Past Simple)',
    category: 'past',
    level: 'beginner',
    structure: 'Sujet + verbe au prétérit (2e colonne irréguliers ou -ed)',
    structureNeg: 'Sujet + did + not + base verbale',
    structureQ: 'Did + sujet + base verbale ?',
    explanation:
      "Le Past Simple exprime une action terminée, située à un moment précis du passé. C'est le temps du récit et des événements passés datés.",
    usage: [
      'Action terminée dans le passé : I visited London last summer.',
      "Série d'actions passées : He woke up, had breakfast and left.",
      'Habitude passée : When I was a child, I played football every day.',
      "Vérité passée qui n'est plus vraie : She lived in York for five years (elle n'y habite plus).",
    ],
    examples: [
      { en: 'She bought a new dress yesterday.', fr: 'Elle a acheté une nouvelle robe hier.' },
      { en: "They didn't come to the meeting.", fr: 'Ils ne sont pas venus à la réunion.' },
      { en: 'Did you see the match last night?', fr: 'As-tu vu le match hier soir ?' },
      { en: 'Shakespeare wrote many plays.', fr: 'Shakespeare a écrit de nombreuses pièces.' },
    ],
    timeline: { type: 'point', position: 25, label: 'Point dans le passé' },
    commonErrors: [
      {
        wrong: "I didn't went to school.",
        right: "I didn't go to school.",
        note: "Après 'did/didn't', on utilise TOUJOURS la base verbale, jamais le prétérit.",
      },
      {
        wrong: 'She eated pizza.',
        right: 'She ate pizza.',
        note: 'Eat est irrégulier : eat → ate → eaten.',
      },
    ],
    nuances:
      "Le Past Simple est le temps du récit par excellence. Il contraste avec le Present Perfect : Past Simple = moment passé précisé et action terminée ; Present Perfect = pas de moment précisé ou lien avec le présent. 'I went to France in 2019' (daté) vs 'I've been to France' (expérience de vie).",
    comparison: ['past_continuous', 'present_perfect', 'past_perfect'],
    signalWords: [
      'yesterday',
      'last week/month/year',
      'ago',
      'in 2015',
      'when I was...',
      'then',
      'after that',
    ],
  },
  {
    id: 'past_continuous',
    name: 'Past Continuous',
    nameFR: 'Prétérit continu',
    category: 'past',
    level: 'intermediate',
    structure: 'Sujet + was/were + verbe-ing',
    structureNeg: 'Sujet + was/were + not + verbe-ing',
    structureQ: 'Was/Were + sujet + verbe-ing ?',
    explanation:
      'Le Past Continuous décrit une action en cours de déroulement à un moment précis du passé, ou une action longue interrompue par une action courte (Past Simple).',
    usage: [
      'Action en cours à un moment du passé : At 8pm, I was watching telly.',
      'Action longue interrompue : I was sleeping when the phone rang.',
      'Deux actions simultanées : While I was cooking, she was reading.',
      'Contexte/atmosphère dans un récit : The sun was shining, birds were singing...',
      'Politesse : I was wondering if you could help me.',
    ],
    examples: [
      {
        en: 'I was having a bath when you called.',
        fr: 'Je prenais un bain quand tu as appelé.',
      },
      { en: "They weren't listening to the teacher.", fr: "Ils n'écoutaient pas le professeur." },
      { en: 'What were you doing at midnight?', fr: 'Que faisiez-vous à minuit ?' },
      {
        en: 'While we were walking, it started to rain.',
        fr: 'Pendant que nous marchions, il a commencé à pleuvoir.',
      },
    ],
    timeline: { type: 'range', start: 20, end: 45, label: 'Action longue dans le passé' },
    commonErrors: [
      {
        wrong: 'I was knowing the answer.',
        right: 'I knew the answer.',
        note: "Les stative verbs ne s'utilisent pas au continuous.",
      },
      {
        wrong: 'When I was arriving, she left.',
        right: 'When I arrived, she was leaving.',
        note: "L'action courte (arrivée) = Past Simple. L'action longue (partir) = Past Continuous.",
      },
    ],
    nuances:
      "La combinaison Past Continuous + Past Simple est fondamentale : 'While/When + Past Continuous, Past Simple'. Le Continuous donne le contexte (action longue), le Simple l'événement (action courte). 'I was walking home when I saw a fox.'",
    comparison: ['past_simple', 'present_continuous'],
    signalWords: ['while', 'when', 'at 8pm yesterday', 'at that moment', 'all evening', 'as'],
  },
  {
    id: 'past_perfect',
    name: 'Past Perfect',
    nameFR: 'Past Perfect (Pluperfect)',
    category: 'perfect',
    level: 'advanced',
    structure: 'Sujet + had + participe passé',
    structureNeg: 'Sujet + had + not + participe passé',
    structureQ: 'Had + sujet + participe passé ?',
    explanation:
      "Le Past Perfect exprime une action passée qui s'est produite AVANT une autre action passée. C'est le 'passé du passé'.",
    usage: [
      'Action antérieure à une autre action passée : When I arrived, the film had already started.',
      "Cause d'un état passé : She was tired because she had worked all day.",
      'Dans le discours indirect : He said he had finished his work.',
      "With 'by the time', 'before', 'after', 'when'",
    ],
    examples: [
      {
        en: 'I had never seen the sea before I went to Cornwall.',
        fr: "Je n'avais jamais vu la mer avant d'aller en Cornouailles.",
      },
      {
        en: 'They had already eaten when we arrived.',
        fr: 'Ils avaient déjà mangé quand nous sommes arrivés.',
      },
      {
        en: 'Had you studied English before you moved to London?',
        fr: "Aviez-vous étudié l'anglais avant de déménager à Londres ?",
      },
      {
        en: 'By the time she was 30, she had travelled to 20 countries.',
        fr: 'À 30 ans, elle avait voyagé dans 20 pays.',
      },
    ],
    timeline: { type: 'double-point', first: 15, second: 40, label: 'Passé du passé' },
    commonErrors: [
      {
        wrong: 'When I arrived, the film already started.',
        right: 'When I arrived, the film had already started.',
        note: "Le film a commencé AVANT l'arrivée → Past Perfect.",
      },
      {
        wrong: 'She was tired because she worked all day.',
        right: 'She was tired because she had worked all day.',
        note: 'Le travail a eu lieu AVANT la fatigue → Past Perfect.',
      },
    ],
    nuances:
      "Le Past Perfect n'est pas toujours obligatoire. Si la chronologie est claire (avec 'before', 'after'), le Past Simple suffit : 'After she finished work, she went home.' Mais il est essentiel pour clarifier l'ordre des événements : 'When I got to the station, the train had left.' (le train était parti avant mon arrivée).",
    comparison: ['past_simple', 'past_perfect_continuous', 'present_perfect'],
    signalWords: ['already', 'just', 'never', 'before', 'by the time', 'after', 'when', 'until'],
  },
  {
    id: 'past_perfect_continuous',
    name: 'Past Perfect Continuous',
    nameFR: 'Past Perfect Continuous',
    category: 'perfect',
    level: 'advanced',
    structure: 'Sujet + had + been + verbe-ing',
    structureNeg: 'Sujet + had + not + been + verbe-ing',
    structureQ: 'Had + sujet + been + verbe-ing ?',
    explanation:
      "Le Past Perfect Continuous met l'accent sur la durée d'une action qui était en cours avant un autre moment du passé.",
    usage: [
      'Durée avant un moment passé : I had been waiting for two hours when the bus finally came.',
      "Cause d'un état passé : Her eyes were red because she had been crying.",
      'Activité récente avant un événement passé : The ground was wet because it had been raining.',
    ],
    examples: [
      {
        en: 'He had been working there for 10 years before he got promoted.',
        fr: "Il y travaillait depuis 10 ans avant d'être promu.",
      },
      { en: 'They had been arguing for hours.', fr: 'Ils se disputaient depuis des heures.' },
      {
        en: 'How long had you been studying before the exam?',
        fr: "Depuis combien de temps étudiez-vous avant l'examen ?",
      },
    ],
    timeline: { type: 'arrow', start: 5, end: 35, label: 'Durée avant un point passé' },
    commonErrors: [
      {
        wrong: 'I had been knowing her for years.',
        right: 'I had known her for years.',
        note: 'Stative verb → pas de continuous.',
      },
    ],
    nuances:
      "Comme le Present Perfect Continuous, il insiste sur la durée plutôt que sur le résultat. La différence avec le Past Perfect simple : 'I had painted the room' (résultat) vs 'I had been painting the room' (activité en cours).",
    comparison: ['past_perfect', 'present_perfect_continuous'],
    signalWords: ['for', 'since', 'how long', 'before', 'when', 'by the time'],
  },
  {
    id: 'future_will',
    name: 'Future Simple (will)',
    nameFR: 'Futur simple (will)',
    category: 'future',
    level: 'beginner',
    structure: 'Sujet + will + base verbale',
    structureNeg: "Sujet + will + not (won't) + base verbale",
    structureQ: 'Will + sujet + base verbale ?',
    explanation:
      "Le futur avec 'will' exprime une décision spontanée, une prédiction, une promesse, ou une offre. C'est le futur de l'improvisation et de la certitude.",
    usage: [
      "Décision spontanée : I'll have a coffee, please.",
      "Prédiction : I think it'll rain tomorrow.",
      "Promesse : I'll always love you.",
      "Offre/aide : I'll carry that bag for you.",
      "Menace/avertissement : Stop or I'll tell the teacher!",
    ],
    examples: [
      { en: "I'll help you with your homework.", fr: "Je t'aiderai avec tes devoirs." },
      { en: "She won't come to the party.", fr: 'Elle ne viendra pas à la fête.' },
      { en: 'Will you marry me?', fr: "Veux-tu m'épouser ?" },
      { en: "I'm sure he'll pass the exam.", fr: "Je suis sûr qu'il réussira l'examen." },
    ],
    timeline: { type: 'point', position: 75, label: 'Futur' },
    commonErrors: [
      {
        wrong: 'I will to go tomorrow.',
        right: 'I will go tomorrow.',
        note: "Après 'will', on utilise TOUJOURS la base verbale, sans 'to'.",
      },
      {
        wrong: 'She wills come.',
        right: 'She will come.',
        note: "'Will' est invariable : pas de -s à la 3e personne.",
      },
    ],
    nuances:
      "'Will' ne s'utilise PAS pour des plans déjà décidés (→ 'going to'). 'I'll meet you at 6' (décision maintenant) vs 'I'm going to meet him at 6' (déjà prévu). Avec 'think', 'hope', 'probably', 'I'm sure', on utilise généralement 'will'.",
    comparison: ['future_going_to', 'present_continuous'],
    signalWords: [
      'tomorrow',
      'next week/year',
      'soon',
      'in the future',
      'I think',
      'I hope',
      'probably',
      "I'm sure",
    ],
  },
  {
    id: 'future_going_to',
    name: 'Future (going to)',
    nameFR: "Futur avec 'going to'",
    category: 'future',
    level: 'beginner',
    structure: 'Sujet + am/is/are + going to + base verbale',
    structureNeg: 'Sujet + am/is/are + not + going to + base verbale',
    structureQ: 'Am/Is/Are + sujet + going to + base verbale ?',
    explanation:
      "'Going to' exprime une intention planifiée à l'avance ou une prédiction basée sur une évidence présente.",
    usage: [
      "Intention/plan : I'm going to study medicine at university.",
      "Prédiction avec évidence : Look at those clouds! It's going to rain.",
      "Décision prise avant le moment de parole : We're going to get married in June.",
    ],
    examples: [
      {
        en: "I'm going to visit my grandparents this weekend.",
        fr: 'Je vais rendre visite à mes grands-parents ce week-end.',
      },
      { en: "She's not going to accept the offer.", fr: "Elle ne va pas accepter l'offre." },
      { en: 'Are you going to apply for that job?', fr: 'Allez-vous postuler pour ce poste ?' },
      { en: 'Watch out! That vase is going to fall!', fr: 'Attention ! Ce vase va tomber !' },
    ],
    timeline: { type: 'point', position: 70, label: 'Intention → Futur' },
    commonErrors: [
      {
        wrong: "I'm going to studying.",
        right: "I'm going to study.",
        note: "Après 'going to', on utilise la base verbale, PAS le verbe-ing.",
      },
      {
        wrong: 'He going to leave.',
        right: "He's going to leave.",
        note: "Ne pas oublier le verbe 'be' (am/is/are).",
      },
    ],
    nuances:
      "La différence clé avec 'will' : 'going to' = planifié/intention, 'will' = décision spontanée. 'I'm going to buy a car' (j'y ai réfléchi, c'est prévu) vs 'I'll buy a car' (décision prise maintenant). Pour les prédictions : 'going to' quand il y a une évidence visible, 'will' pour une opinion.",
    comparison: ['future_will', 'present_continuous'],
    signalWords: [
      'tonight',
      'this weekend',
      'next month',
      "I've decided",
      'I plan to',
      'look!',
      'watch out!',
    ],
  },
  {
    id: 'future_continuous',
    name: 'Future Continuous',
    nameFR: 'Futur continu',
    category: 'future',
    level: 'advanced',
    structure: 'Sujet + will be + verbe-ing',
    structureNeg: 'Sujet + will not be + verbe-ing',
    structureQ: 'Will + sujet + be + verbe-ing ?',
    explanation:
      'Le Future Continuous décrit une action qui sera en cours de déroulement à un moment précis du futur.',
    usage: [
      "Action en cours à un moment futur : This time tomorrow, I'll be flying to Edinburgh.",
      "Action future prévue/attendue : She'll be waiting for you at the station.",
      'Question polie : Will you be using the car tonight?',
      "Événements inévitables : I'll be seeing him at the meeting anyway.",
    ],
    examples: [
      {
        en: "At 9pm tonight, I'll be watching the match.",
        fr: 'À 21h ce soir, je regarderai le match.',
      },
      {
        en: "This time next week, we'll be lying on a beach in Cornwall.",
        fr: 'La semaine prochaine à cette heure, nous serons allongés sur une plage en Cornouailles.',
      },
      {
        en: 'Will you be coming to the office tomorrow?',
        fr: 'Viendrez-vous au bureau demain ?',
      },
    ],
    timeline: { type: 'range', start: 65, end: 85, label: 'En cours dans le futur' },
    commonErrors: [
      {
        wrong: "I'll being working.",
        right: "I'll be working.",
        note: "La structure est 'will be + ing', pas 'will being'.",
      },
    ],
    nuances:
      "Le Future Continuous est souvent utilisé pour parler d'actions routinières futures ou pour poser des questions polies (moins direct que 'Will you...?'). 'Will you be staying for dinner?' est plus poli que 'Will you stay for dinner?'",
    comparison: ['future_will', 'future_perfect'],
    signalWords: [
      'this time tomorrow',
      'at 8pm tonight',
      'at this time next week',
      "in an hour's time",
    ],
  },
  {
    id: 'future_perfect',
    name: 'Future Perfect',
    nameFR: 'Futur antérieur',
    category: 'future',
    level: 'advanced',
    structure: 'Sujet + will have + participe passé',
    structureNeg: 'Sujet + will not have + participe passé',
    structureQ: 'Will + sujet + have + participe passé ?',
    explanation:
      'Le Future Perfect exprime une action qui sera terminée AVANT un moment précis du futur.',
    usage: [
      "Action terminée avant un moment futur : By 6pm, I'll have finished the report.",
      "Avec 'by', 'by the time', 'before' : By the time you arrive, we'll have left.",
      "Durée jusqu'à un point futur : By next year, I'll have worked here for a decade.",
    ],
    examples: [
      {
        en: "By the end of this month, I'll have read three books.",
        fr: "D'ici la fin du mois, j'aurai lu trois livres.",
      },
      { en: "She'll have graduated by 2028.", fr: "Elle aura obtenu son diplôme d'ici 2028." },
      { en: 'Will you have finished by Friday?', fr: "Aurez-vous fini d'ici vendredi ?" },
    ],
    timeline: { type: 'arrow', start: 10, end: 60, label: 'Terminé avant un point futur' },
    commonErrors: [
      {
        wrong: 'By tomorrow, I will finished.',
        right: 'By tomorrow, I will have finished.',
        note: "Il faut 'will have + participe passé', pas juste 'will + participe passé'.",
      },
    ],
    nuances:
      "Le mot-clé est 'by' (d'ici). Le Future Perfect regarde depuis un point futur vers le passé de ce point. C'est l'équivalent du futur antérieur français, mais utilisé beaucoup moins fréquemment en anglais qu'en français.",
    comparison: ['future_will', 'future_perfect_continuous'],
    signalWords: ['by', 'by the time', 'by then', 'before', 'by the end of', "in two years' time"],
  },
  {
    id: 'future_perfect_continuous',
    name: 'Future Perfect Continuous',
    nameFR: 'Futur Perfect Continuous',
    category: 'future',
    level: 'advanced',
    structure: 'Sujet + will have been + verbe-ing',
    structureNeg: 'Sujet + will not have been + verbe-ing',
    structureQ: 'Will + sujet + have been + verbe-ing ?',
    explanation:
      "Le Future Perfect Continuous met l'accent sur la durée d'une action qui aura été en cours jusqu'à un moment du futur.",
    usage: [
      "Durée jusqu'à un point futur : By December, I'll have been working here for five years.",
      "Insister sur la continuité : She'll have been studying for six hours by the time the exam starts.",
    ],
    examples: [
      {
        en: "By next month, we'll have been living in this house for 20 years.",
        fr: 'Le mois prochain, nous vivrons dans cette maison depuis 20 ans.',
      },
      {
        en: 'How long will you have been learning English by the end of this course?',
        fr: "Depuis combien de temps apprendrez-vous l'anglais à la fin de ce cours ?",
      },
    ],
    timeline: { type: 'arrow', start: 5, end: 55, label: "Durée jusqu'à un point futur" },
    commonErrors: [],
    nuances:
      "C'est le temps le plus rare en anglais. On l'utilise presque exclusivement avec 'for' + durée et 'by' + point futur. Souvent, on peut le remplacer par le Future Perfect simple sans perdre de sens significatif.",
    comparison: ['future_perfect', 'present_perfect_continuous'],
    signalWords: ['by... for...', 'by the time... for...'],
  },
  {
    id: 'conditional_0',
    name: 'Zero Conditional',
    nameFR: 'Conditionnel zéro',
    category: 'conditionals',
    level: 'intermediate',
    structure: 'If + Present Simple, Present Simple',
    explanation:
      "Le Zero Conditional exprime des vérités générales, des faits scientifiques, des règles. C'est une relation de cause à effet toujours vraie.",
    usage: [
      'Vérités scientifiques : If you heat ice, it melts.',
      'Règles/instructions : If the alarm rings, leave the building.',
      "Habitudes : If I'm tired, I go to bed early.",
    ],
    examples: [
      {
        en: 'If you mix red and blue, you get purple.',
        fr: 'Si vous mélangez du rouge et du bleu, vous obtenez du violet.',
      },
      { en: 'If it rains, the grass gets wet.', fr: "S'il pleut, l'herbe devient mouillée." },
    ],
    timeline: { type: 'cycle', label: 'Toujours vrai' },
    commonErrors: [
      {
        wrong: 'If you will heat water, it boils.',
        right: 'If you heat water, it boils.',
        note: "Pas de 'will' dans la proposition avec 'if' dans les conditionnels.",
      },
    ],
    nuances:
      "On peut remplacer 'if' par 'when' sans changer le sens : 'When you heat water to 100°C, it boils.' Les deux propositions sont au Present Simple.",
    comparison: ['conditional_1'],
    signalWords: ['if', 'when', 'whenever'],
  },
  {
    id: 'conditional_1',
    name: 'First Conditional',
    nameFR: 'Premier conditionnel',
    category: 'conditionals',
    level: 'intermediate',
    structure: 'If + Present Simple, will + base verbale',
    explanation:
      'Le First Conditional exprime une situation réelle ou très probable dans le futur.',
    usage: [
      "Conséquence probable : If it rains, I'll take an umbrella.",
      "Avertissements : If you don't hurry, you'll miss the train.",
      "Promesses conditionnelles : If you pass your exams, I'll buy you a car.",
    ],
    examples: [
      {
        en: "If she studies hard, she'll pass the exam.",
        fr: "Si elle étudie bien, elle réussira l'examen.",
      },
      {
        en: "If we don't leave now, we'll be late.",
        fr: 'Si nous ne partons pas maintenant, nous serons en retard.',
      },
      {
        en: "If the weather is nice, we'll go to the seaside.",
        fr: "S'il fait beau, nous irons à la mer.",
      },
    ],
    timeline: {
      type: 'conditional',
      condition: 30,
      result: 65,
      label: 'Possible → Futur probable',
    },
    commonErrors: [
      {
        wrong: "If it will rain, I'll stay home.",
        right: "If it rains, I'll stay home.",
        note: "Jamais de 'will' après 'if'. Le Present Simple suffit dans la condition.",
      },
      {
        wrong: "If I will have time, I'll call you.",
        right: "If I have time, I'll call you.",
        note: "Même règle : Present Simple dans la clause avec 'if'.",
      },
    ],
    nuances:
      "On peut utiliser d'autres modaux que 'will' dans la conséquence : 'If you study hard, you should pass.' On peut aussi utiliser l'impératif : 'If you see him, tell him to call me.' La condition est réelle et possible.",
    comparison: ['conditional_0', 'conditional_2'],
    signalWords: ['if', 'unless', 'as long as', 'provided that', 'in case'],
  },
  {
    id: 'conditional_2',
    name: 'Second Conditional',
    nameFR: 'Deuxième conditionnel',
    category: 'conditionals',
    level: 'intermediate',
    structure: 'If + Past Simple, would + base verbale',
    explanation:
      'Le Second Conditional exprime une situation hypothétique, imaginaire ou peu probable dans le présent ou le futur.',
    usage: [
      'Situation imaginaire : If I won the lottery, I would travel the world.',
      "Conseil : If I were you, I'd apologise.",
      'Situation irréelle : If I had more time, I would learn Japanese.',
    ],
    examples: [
      {
        en: 'If I were rich, I would buy a castle in Scotland.',
        fr: "Si j'étais riche, j'achèterais un château en Écosse.",
      },
      {
        en: 'If she spoke French, she would move to Paris.',
        fr: 'Si elle parlait français, elle déménagerait à Paris.',
      },
      {
        en: 'What would you do if you lost your job?',
        fr: 'Que feriez-vous si vous perdiez votre emploi ?',
      },
    ],
    timeline: { type: 'conditional', condition: 30, result: 65, label: 'Hypothèse → Irréel' },
    commonErrors: [
      {
        wrong: 'If I would be you, I would...',
        right: 'If I were you, I would...',
        note: "On utilise le Past Simple (were) dans la condition, pas 'would'. 'Were' est préférable à 'was' pour tous les sujets dans le conditionnel.",
      },
    ],
    nuances:
      "Avec 'be', on utilise traditionnellement 'were' pour tous les sujets : 'If I were you', 'If she were here'. Dans l'anglais courant, 'was' est accepté pour I/he/she/it, mais 'were' reste la forme recommandée dans un contexte formel et aux examens.",
    comparison: ['conditional_1', 'conditional_3'],
    signalWords: ['if', 'if I were you', 'what would you do if...'],
  },
  {
    id: 'conditional_3',
    name: 'Third Conditional',
    nameFR: 'Troisième conditionnel',
    category: 'conditionals',
    level: 'advanced',
    structure: 'If + Past Perfect, would have + participe passé',
    explanation:
      "Le Third Conditional exprime une situation imaginaire dans le passé (irréelle, car le passé ne peut pas être changé). C'est le conditionnel du regret.",
    usage: [
      'Regrets : If I had studied harder, I would have passed.',
      "Situations passées irréelles : If she had caught the train, she wouldn't have been late.",
      'Critique rétrospective : If you had told me, I would have helped.',
    ],
    examples: [
      {
        en: 'If I had known about the traffic, I would have left earlier.',
        fr: "Si j'avais su pour les embouteillages, je serais parti plus tôt.",
      },
      {
        en: 'If they had invested in Bitcoin, they would have made a fortune.',
        fr: "S'ils avaient investi dans le Bitcoin, ils auraient fait fortune.",
      },
      {
        en: "She wouldn't have missed the flight if she had set an alarm.",
        fr: "Elle n'aurait pas raté le vol si elle avait mis un réveil.",
      },
    ],
    timeline: { type: 'conditional', condition: 15, result: 40, label: 'Passé irréel → Regret' },
    commonErrors: [
      {
        wrong: 'If I would have known, I would have...',
        right: 'If I had known, I would have...',
        note: "Jamais de 'would' dans la clause avec 'if'. On utilise le Past Perfect.",
      },
    ],
    nuances:
      "Le Third Conditional est le temps du regret et de l'imagination rétrospective. La situation décrite ne s'est PAS produite. 'If I had studied harder' implique que je n'ai PAS étudié assez. On peut aussi exprimer la colère ou le soulagement : 'If you had told me the truth, I wouldn't have been so angry.'",
    comparison: ['conditional_2', 'mixed_conditional'],
    signalWords: ['if', 'if only', 'I wish'],
  },
  {
    id: 'mixed_conditional',
    name: 'Mixed Conditionals',
    nameFR: 'Conditionnels mixtes',
    category: 'conditionals',
    level: 'advanced',
    structure:
      'If + Past Perfect, would + base verbale (Type 3→2) OU If + Past Simple, would have + participe passé (Type 2→3)',
    explanation:
      'Les conditionnels mixtes combinent des temps différents pour exprimer une condition dans un temps et une conséquence dans un autre.',
    usage: [
      'Condition passée → conséquence présente : If I had studied medicine, I would be a doctor now.',
      "Condition permanente → conséquence passée : If she were more careful, she wouldn't have had that accident.",
    ],
    examples: [
      {
        en: 'If I had accepted that job, I would be living in London now.',
        fr: "Si j'avais accepté ce poste, je vivrais à Londres maintenant.",
      },
      {
        en: "If he weren't so stubborn, he would have apologised.",
        fr: "S'il n'était pas si têtu, il se serait excusé.",
      },
    ],
    timeline: { type: 'conditional', condition: 20, result: 60, label: 'Temps croisés' },
    commonErrors: [],
    nuances:
      'Les mixed conditionnels sont très courants dans la conversation naturelle. Il faut identifier si la condition est dans le passé (→ Past Perfect) ou permanente (→ Past Simple), et si la conséquence est dans le présent (→ would + base) ou le passé (→ would have + pp).',
    comparison: ['conditional_2', 'conditional_3'],
    signalWords: ['if', 'now', 'at that time'],
  },
];
