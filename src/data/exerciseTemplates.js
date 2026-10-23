export const exerciseTemplates = {
  present_simple: {
    qcm: [
      {
        sentence: 'She ___ to work by train every morning.',
        options: ['goes', 'go', 'is going', 'went'],
        correct: 0,
        explanation:
          "Habitude régulière ('every morning') + 3e personne du singulier → 'goes' (Present Simple).",
      },
      {
        sentence: 'Water ___ at 100 degrees Celsius.',
        options: ['boils', 'is boiling', 'boil', 'boiled'],
        correct: 0,
        explanation: "Vérité scientifique → Present Simple. 'Water' = 3e pers. sing. → 'boils'.",
      },
      {
        sentence: 'They ___ not like spicy food.',
        options: ['do', 'does', 'are', 'did'],
        correct: 0,
        explanation: "Négation au Present Simple avec 'they' → 'do not' (don't).",
      },
      {
        sentence: '___ your brother speak Spanish?',
        options: ['Does', 'Do', 'Is', 'Has'],
        correct: 0,
        explanation: "Question au Present Simple avec 3e pers. sing. ('your brother') → 'Does'.",
      },
      {
        sentence: 'The train to Manchester ___ at 8:15 every weekday.',
        options: ['leaves', 'is leaving', 'leave', 'has left'],
        correct: 0,
        explanation: 'Horaire officiel / programme fixe → Present Simple (leaves).',
      },
      {
        sentence: 'My parents ___ in a quiet village near Oxford.',
        options: ['live', 'lives', 'are living', 'living'],
        correct: 0,
        explanation:
          "Situation permanente avec un sujet pluriel ('My parents') → base verbale 'live'.",
      },
      {
        sentence: 'How often ___ she visit her grandparents?',
        options: ['does', 'do', 'is', 'has'],
        correct: 0,
        explanation: "Question de fréquence au Present Simple avec 'she' → 'does'.",
      },
      {
        sentence: 'This museum ___ over two thousand ancient paintings.',
        options: ['contains', 'is containing', 'contain', 'has containing'],
        correct: 0,
        explanation:
          "Verbe d'état ('contain') à la 3e personne du singulier → 'contains' (jamais en -ing).",
      },
    ],
    fill: [
      {
        sentence: 'My brother ___ (work) in a bank.',
        answer: 'works',
        explanation: "3e personne du singulier au Present Simple → on ajoute -s : 'works'.",
      },
      {
        sentence: 'I ___ (not / drink) coffee in the evening.',
        answer: "don't drink",
        explanation: "Négation au Present Simple avec 'I' → don't (do not) + base verbale.",
      },
      {
        sentence: 'The sun ___ (rise) in the east.',
        answer: 'rises',
        explanation: "Vérité générale, 3e pers. sing. → 'rises'.",
      },
      {
        sentence: '___ you ___ (like) chocolate?',
        answer: 'Do like',
        explanation: "Question avec 'you' au Present Simple → Do + you + base verbale.",
      },
      {
        sentence: 'Emma ___ (teach) English at a local secondary school.',
        answer: 'teaches',
        explanation:
          "Verbe terminé par -ch à la 3e pers. du singulier → on ajoute -es : 'teaches'.",
      },
      {
        sentence: 'He ___ (not / understand) this German sentence.',
        answer: "doesn't understand",
        explanation:
          "Négation au Present Simple à la 3e pers. sing. → doesn't (does not) + base verbale.",
      },
      {
        sentence: 'Our flight ___ (depart) at 6:45 a.m. tomorrow.',
        answer: 'departs',
        explanation: 'Horaire de transport fixe → Present Simple à la 3e pers. sing. (departs).',
      },
      {
        sentence: 'Babies ___ (cry) when they are hungry.',
        answer: 'cry',
        explanation: "Vérité générale avec un sujet pluriel ('Babies') → base verbale 'cry'.",
      },
    ],
    correction: [
      {
        wrong: "She don't like coffee in the morning.",
        answer: "She doesn't like coffee in the morning.",
        acceptedAnswers: [
          'She does not like coffee in the morning.',
          "doesn't like",
          'does not like',
          "She doesn't like",
        ],
        explanation:
          "Au Present Simple, la négation à la 3e personne du singulier ('She') utilise 'doesn't' (does not).",
      },
      {
        wrong: 'My brother work in a hospital every day.',
        answer: 'My brother works in a hospital every day.',
        acceptedAnswers: ['works', 'My brother works'],
        explanation:
          "Au Present Simple, la 3e personne du singulier ('My brother') prend un -s : 'works'.",
      },
      {
        wrong: 'Does she lives in London?',
        answer: 'Does she live in London?',
        acceptedAnswers: ['live', 'Does she live'],
        explanation:
          "Après l'auxiliaire 'Does' au Present Simple, le verbe reste à la base verbale sans -s ('live').",
      },
      {
        wrong: 'I am knowing the answer to this question.',
        answer: 'I know the answer to this question.',
        acceptedAnswers: ['know', 'I know'],
        explanation:
          "Le verbe d'état 'know' ne s'utilise pas à la forme continue : on utilise le Present Simple ('I know').",
      },
    ],
    translation: [
      {
        fr: 'Elle travaille dans une banque tous les jours.',
        hint: 'She / work / in a bank',
        answer: 'She works in a bank every day.',
        acceptedAnswers: ['She works in a bank.', 'She works every day.'],
        explanation: "Present Simple à la 3e pers. sing. : 'She works in a bank every day.'",
      },
      {
        fr: 'Je ne bois pas de café le soir.',
        hint: 'I / not drink / coffee / in the evening',
        answer: "I don't drink coffee in the evening.",
        acceptedAnswers: ['I do not drink coffee in the evening.', "I don't drink coffee."],
        explanation: "Négation au Present Simple : 'I don't (do not) drink coffee in the evening.'",
      },
      {
        fr: 'Le train part à huit heures.',
        hint: 'The train / leave / at eight',
        answer: 'The train leaves at eight.',
        acceptedAnswers: [
          "The train leaves at 8 o'clock.",
          "The train leaves at eight o'clock.",
          'The train leaves at 8.',
          'The train departs at eight.',
        ],
        explanation: "Horaire fixe au Present Simple : 'The train leaves at eight.'",
      },
      {
        fr: 'Parlez-vous anglais ?',
        hint: 'you / speak / English',
        answer: 'Do you speak English?',
        acceptedAnswers: ['Do you speak English'],
        explanation: "Question au Present Simple : 'Do you speak English?'",
      },
    ],
  },
  present_continuous: {
    qcm: [
      {
        sentence: 'Look! It ___ outside.',
        options: ['is raining', 'rains', 'rained', 'rain'],
        correct: 0,
        explanation: "'Look!' indique une action en cours sous nos yeux → Present Continuous.",
      },
      {
        sentence: 'Wait, I ___ my keys right now.',
        options: ['am looking for', 'look for', 'looked for', 'have looked for'],
        correct: 0,
        explanation: "'right now' = en ce moment → Present Continuous (am + V-ing).",
      },
      {
        sentence: 'She ___ with her aunt this week.',
        options: ['is staying', 'stays', 'stayed', 'stay'],
        correct: 0,
        explanation: "Situation temporaire ('this week') → Present Continuous.",
      },
      {
        sentence: 'Listen! Someone ___ the piano upstairs.',
        options: ['is playing', 'plays', 'played', 'has played'],
        correct: 0,
        explanation: "'Listen!' signale une action qui se déroule maintenant → 'is playing'.",
      },
      {
        sentence: 'Why ___ you wearing a coat indoors?',
        options: ['are', 'do', 'have', 'is'],
        correct: 0,
        explanation: "Question au Present Continuous avec 'you' + V-ing → 'are'.",
      },
      {
        sentence: 'More and more people ___ electric cars nowadays.',
        options: ['are buying', 'buy', 'bought', 'buys'],
        correct: 0,
        explanation: "Évolution / tendance actuelle ('nowadays') → Present Continuous.",
      },
      {
        sentence: 'We ___ dinner with the Smiths tonight at 7 p.m.',
        options: ['are having', 'have', 'had', 'having'],
        correct: 0,
        explanation: 'Arrangement personnel fixé dans un futur proche → Present Continuous.',
      },
    ],
    fill: [
      {
        sentence: 'Be quiet! The baby ___ (sleep).',
        answer: 'is sleeping',
        explanation: "'Be quiet!' indique que l'action est en cours → is sleeping.",
      },
      {
        sentence: 'They ___ (not / watch) TV at the moment.',
        answer: "aren't watching",
        explanation: "Négation au Present Continuous avec 'they' → aren't (are not) watching.",
      },
      {
        sentence: 'What ___ you ___ (do) right now?',
        answer: 'are doing',
        explanation: 'Question au Present Continuous → Are + you + doing.',
      },
      {
        sentence: 'I ___ (write) an important email right now.',
        answer: 'am writing',
        explanation:
          "Avec 'I' au Present Continuous → am + V-ing (write perd le -e final : writing).",
      },
      {
        sentence: 'Look! The bus ___ (come).',
        answer: 'is coming',
        explanation: 'Action en cours sous nos yeux → is coming (come → coming).',
      },
      {
        sentence: 'She ___ (not / work) today because she is on holiday.',
        answer: "isn't working",
        explanation: "Situation temporaire négative → isn't (is not) working.",
      },
      {
        sentence: 'The children ___ (run) in the garden at the moment.',
        answer: 'are running',
        explanation: 'Sujet pluriel + doublement de la consonne finale CVC (run → running).',
      },
    ],
    correction: [
      {
        wrong: 'Look! It rains heavily outside.',
        answer: 'Look! It is raining heavily outside.',
        acceptedAnswers: [
          "Look! It's raining heavily outside.",
          'It is raining heavily outside.',
          "It's raining heavily outside.",
          'is raining',
        ],
        explanation:
          "'Look!' indique une action en cours au moment où l'on parle → Present Continuous ('is raining').",
      },
      {
        wrong: 'They are study for their exam right now.',
        answer: 'They are studying for their exam right now.',
        acceptedAnswers: [
          "They're studying for their exam right now.",
          'are studying',
          'They are studying',
        ],
        explanation:
          'Au Present Continuous, le verbe après am/is/are doit prendre -ing (studying).',
      },
      {
        wrong: 'She watching a documentary at the moment.',
        answer: 'She is watching a documentary at the moment.',
        acceptedAnswers: [
          "She's watching a documentary at the moment.",
          'is watching',
          'She is watching',
        ],
        explanation:
          "Au Present Continuous, il ne faut jamais oublier l'auxiliaire 'be' (is watching).",
      },
      {
        wrong: 'Why you are laughing so loudly?',
        answer: 'Why are you laughing so loudly?',
        acceptedAnswers: ['are you laughing', 'Why are you laughing'],
        explanation:
          "Dans une question au Present Continuous, on inverse l'auxiliaire et le sujet : 'are you'.",
      },
    ],
    translation: [
      {
        fr: 'Écoute ! Il pleut dehors.',
        hint: 'Listen! / it / rain / outside',
        answer: 'Listen! It is raining outside.',
        acceptedAnswers: [
          'It is raining outside.',
          "Listen! It's raining outside.",
          "It's raining outside.",
        ],
        explanation: "Action en cours au Present Continuous : 'Listen! It is raining outside.'",
      },
      {
        fr: 'Je cherche mes clés en ce moment.',
        hint: 'I / look for / my keys / right now',
        answer: 'I am looking for my keys right now.',
        acceptedAnswers: ['I am looking for my keys at the moment.', 'I am looking for my keys.'],
        explanation: "Present Continuous avec 'I' : 'I am (I'm) looking for my keys right now.'",
      },
      {
        fr: 'Ils ne regardent pas la télévision.',
        hint: 'They / not watch / TV',
        answer: "They aren't watching TV.",
        acceptedAnswers: [
          'They are not watching TV.',
          'They are not watching television.',
          "They aren't watching television.",
        ],
        explanation: "Négation au Present Continuous : 'They aren't (are not) watching TV.'",
      },
    ],
  },
  past_simple: {
    qcm: [
      {
        sentence: 'We ___ to London last summer.',
        options: ['went', 'go', 'have gone', 'were going'],
        correct: 0,
        explanation: "'last summer' = moment précis terminé dans le passé → Past Simple ('went').",
      },
      {
        sentence: 'She ___ not see him at the party yesterday.',
        options: ['did', 'was', 'has', 'does'],
        correct: 0,
        explanation: "Négation au Past Simple → 'did not' (didn't) + base verbale.",
      },
      {
        sentence: 'Shakespeare ___ Romeo and Juliet.',
        options: ['wrote', 'has written', 'writes', 'was writing'],
        correct: 0,
        explanation: 'Action historique révolue → Past Simple (wrote).',
      },
      {
        sentence: 'Where ___ you spend your holidays in 2022?',
        options: ['did', 'have', 'were', 'was'],
        correct: 0,
        explanation: "Date passée révolue ('in 2022') + question → 'did' + sujet + base verbale.",
      },
      {
        sentence: 'I ___ a strange noise in the attic ten minutes ago.',
        options: ['heard', 'have heard', 'hear', 'was hearing'],
        correct: 0,
        explanation:
          "'ten minutes ago' ancre l'action dans le passé révolu → Past Simple ('heard').",
      },
      {
        sentence: 'They ___ very tired after the marathon last Sunday.',
        options: ['were', 'was', 'did', 'have been'],
        correct: 0,
        explanation: "Verbe 'be' au Past Simple avec 'they' → 'were'.",
      },
      {
        sentence: 'He ___ his phone on the train yesterday evening.',
        options: ['lost', 'loses', 'has lost', 'losed'],
        correct: 0,
        explanation: "'yesterday evening' + verbe irrégulier lose → Past Simple 'lost'.",
      },
    ],
    fill: [
      {
        sentence: 'I ___ (buy) a new phone two days ago.',
        answer: 'bought',
        explanation: "'two days ago' → Past Simple. 'buy' est irrégulier → 'bought'.",
      },
      {
        sentence: 'She ___ (not / go) to school yesterday.',
        answer: "didn't go",
        explanation: "Négation au Past Simple → didn't + base verbale ('go', pas 'went').",
      },
      {
        sentence: '___ they ___ (win) the match last night?',
        answer: 'Did win',
        explanation: 'Question au Past Simple → Did + sujet + base verbale.',
      },
      {
        sentence: 'Mozart ___ (compose) his first symphony at the age of eight.',
        answer: 'composed',
        explanation: 'Fait historique terminé → Past Simple régulier (composed).',
      },
      {
        sentence: 'We ___ (see) a wonderful play at the theatre last Friday.',
        answer: 'saw',
        explanation: "'last Friday' → Past Simple. 'see' est irrégulier → 'saw'.",
      },
      {
        sentence: 'The train ___ (stop) suddenly in the tunnel.',
        answer: 'stopped',
        explanation: 'Verbe CVC régulier au Past Simple → doublement du p : stopped.',
      },
      {
        sentence: 'He ___ (be) in Edinburgh last weekend.',
        answer: 'was',
        explanation: "Verbe 'be' au Past Simple avec 'He' → 'was'.",
      },
    ],
    correction: [
      {
        wrong: "She didn't went to the cinema last night.",
        answer: "She didn't go to the cinema last night.",
        acceptedAnswers: [
          'She did not go to the cinema last night.',
          "didn't go",
          'did not go',
          "She didn't go",
        ],
        explanation:
          "Au Past Simple négatif, après 'didn't', le verbe reste à la base verbale ('go', jamais 'went').",
      },
      {
        wrong: 'I have seen him at the station yesterday.',
        answer: 'I saw him at the station yesterday.',
        acceptedAnswers: ['saw', 'I saw', 'I saw him yesterday.'],
        explanation:
          "Avec un marqueur de temps passé révolu comme 'yesterday', on utilise le Past Simple ('I saw'), jamais le Present Perfect.",
      },
      {
        wrong: 'Did you bought the tickets for the concert?',
        answer: 'Did you buy the tickets for the concert?',
        acceptedAnswers: ['buy', 'Did you buy'],
        explanation:
          "Après 'Did' dans une question au Past Simple, on utilise la base verbale ('buy').",
      },
      {
        wrong: 'We was very happy to see them.',
        answer: 'We were very happy to see them.',
        acceptedAnswers: ['were', 'We were'],
        explanation: "Avec 'We' au Past Simple, le verbe 'be' se conjugue 'were' (et non 'was').",
      },
    ],
    translation: [
      {
        fr: 'Nous sommes allés à Londres l’été dernier.',
        hint: 'We / go / to London / last summer',
        answer: 'We went to London last summer.',
        acceptedAnswers: ['We went to London.'],
        explanation:
          "Past Simple avec marqueur passé ('last summer') : 'We went to London last summer.'",
      },
      {
        fr: "Elle n'est pas venue à la réunion hier.",
        hint: 'She / not come / to the meeting / yesterday',
        answer: "She didn't come to the meeting yesterday.",
        acceptedAnswers: [
          'She did not come to the meeting yesterday.',
          "She didn't come yesterday.",
        ],
        explanation:
          "Négation au Past Simple : 'She didn't (did not) come to the meeting yesterday.'",
      },
      {
        fr: 'As-tu vu ce film hier soir ?',
        hint: 'you / see / this film / last night',
        answer: 'Did you see this film last night?',
        acceptedAnswers: [
          'Did you see that film last night?',
          'Did you watch this film last night?',
          'Did you see this movie last night?',
        ],
        explanation: "Question au Past Simple : 'Did you see this film last night?'",
      },
    ],
  },
  present_perfect: {
    qcm: [
      {
        sentence: 'I ___ never ___ sushi before.',
        options: ['have / eaten', 'did / eat', 'am / eating', 'had / eaten'],
        correct: 0,
        explanation:
          "Expérience de vie ('never...before') → Present Perfect (have + participe passé).",
      },
      {
        sentence: 'She ___ just ___ her homework.',
        options: ['has / finished', 'did / finish', 'is / finishing', 'have / finished'],
        correct: 0,
        explanation:
          "'just' avec un résultat présent → Present Perfect. 3e pers. → 'has finished'.",
      },
      {
        sentence: 'We ___ each other since 2015.',
        options: ['have known', 'know', 'knew', 'are knowing'],
        correct: 0,
        explanation:
          "'since 2015' = depuis un point dans le passé jusqu'à maintenant → Present Perfect.",
      },
      {
        sentence: 'Oh no! I ___ my passport! I cannot board the plane.',
        options: ['have lost', 'lost', 'lose', 'am losing'],
        correct: 0,
        explanation:
          'Action passée avec une conséquence directe dans le présent → Present Perfect.',
      },
      {
        sentence: '___ you ever ___ to Scotland?',
        options: ['Have / been', 'Did / go', 'Were / being', 'Have / gone'],
        correct: 0,
        explanation:
          "Expérience de vie ('ever') → 'Have you ever been to...' ('been' = allé et revenu).",
      },
      {
        sentence: 'He ___ three cups of coffee so far this morning.',
        options: ['has drunk', 'drank', 'drinks', 'is drinking'],
        correct: 0,
        explanation:
          "Période non terminée ('so far this morning') → Present Perfect ('has drunk').",
      },
      {
        sentence: 'They haven’t replied to our invitation ___.',
        options: ['yet', 'already', 'just', 'ago'],
        correct: 0,
        explanation:
          "En fin de phrase négative au Present Perfect, 'pas encore' se traduit par 'yet'.",
      },
    ],
    fill: [
      {
        sentence: 'He ___ (live) here for ten years.',
        answer: 'has lived',
        explanation: "'for ten years' (et c'est toujours le cas) → Present Perfect : has lived.",
      },
      {
        sentence: '___ you ever ___ (be) to Japan?',
        answer: 'Have been',
        explanation: "Expérience de vie ('ever') → Have + you + been.",
      },
      {
        sentence: 'I ___ (not / see) that film yet.',
        answer: "haven't seen",
        explanation: "'yet' en phrase négative → Present Perfect : haven't seen.",
      },
      {
        sentence: 'She ___ already ___ (read) that book twice.',
        answer: 'has read',
        explanation: "Avec 'already' et 'She' → Present Perfect : has read.",
      },
      {
        sentence: 'We ___ (know) Sarah since primary school.',
        answer: 'have known',
        explanation: "Verbe d'état 'know' + 'since' → Present Perfect : have known.",
      },
      {
        sentence: 'Someone ___ (break) the kitchen window! Look at the glass.',
        answer: 'has broken',
        explanation: 'Résultat visible dans le présent → Present Perfect : has broken.',
      },
    ],
    correction: [
      {
        wrong: 'I live in Manchester since 2019.',
        answer: 'I have lived in Manchester since 2019.',
        acceptedAnswers: ["I've lived in Manchester since 2019.", 'have lived', 'I have lived'],
        explanation:
          "Avec 'since' (depuis un point de départ jusqu'à maintenant), l'anglais utilise le Present Perfect ('have lived'), pas le Present Simple.",
      },
      {
        wrong: 'She has went to the supermarket.',
        answer: 'She has gone to the supermarket.',
        acceptedAnswers: ["She's gone to the supermarket.", 'has gone', 'She has gone'],
        explanation:
          "Au Present Perfect, après 'has', il faut le participe passé ('gone') et non le prétérit ('went').",
      },
      {
        wrong: 'Have you ever took the Eurostar to London?',
        answer: 'Have you ever taken the Eurostar to London?',
        acceptedAnswers: ['taken', 'Have you ever taken'],
        explanation: "Le participe passé de 'take' est 'taken' (et non 'took').",
      },
    ],
    translation: [
      {
        fr: 'J’ai perdu mes clés, je ne peux pas entrer.',
        hint: 'I / lose / my keys',
        answer: 'I have lost my keys.',
        acceptedAnswers: ["I've lost my keys.", 'I have lost my keys, I cannot get in.'],
        explanation: "Conséquence présente au Present Perfect : 'I have (I've) lost my keys.'",
      },
      {
        fr: 'Elle habite ici depuis dix ans.',
        hint: 'She / live / here / for ten years',
        answer: 'She has lived here for ten years.',
        acceptedAnswers: ['She has lived here for 10 years.'],
        explanation:
          "Durée jusqu'au présent au Present Perfect : 'She has lived here for ten years.'",
      },
      {
        fr: 'Nous n’avons pas encore terminé le rapport.',
        hint: 'We / not finish / the report / yet',
        answer: "We haven't finished the report yet.",
        acceptedAnswers: [
          'We have not finished the report yet.',
          "We haven't finished the report.",
        ],
        explanation: "Present Perfect négatif avec 'yet' : 'We haven't finished the report yet.'",
      },
    ],
  },
  present_perfect_continuous: {
    qcm: [
      {
        sentence: 'I ___ for you for over an hour!',
        options: ['have been waiting', 'am waiting', 'waited', 'wait'],
        correct: 0,
        explanation:
          "Action commencée dans le passé, toujours en cours ('for over an hour') → Present Perfect Continuous.",
      },
      {
        sentence: 'She is tired because she ___ all day.',
        options: ['has been working', 'worked', 'works', 'is working'],
        correct: 0,
        explanation:
          'Activité récente dont la conséquence est visible maintenant (elle est fatiguée) → Present Perfect Continuous.',
      },
      {
        sentence: 'Look at the ground! It ___ all morning.',
        options: ['has been raining', 'is raining', 'rained', 'rains'],
        correct: 0,
        explanation:
          'Indice visible dans le présent (le sol mouillé) + durée → Present Perfect Continuous.',
      },
      {
        sentence: 'How long ___ you ___ English?',
        options: ['have / been learning', 'are / learning', 'did / learn', 'do / learn'],
        correct: 0,
        explanation: "'How long' pour une action toujours en cours → Present Perfect Continuous.",
      },
      {
        sentence: 'His hands are covered in paint because he ___ the kitchen.',
        options: ['has been painting', 'painted', 'paints', 'had painted'],
        correct: 0,
        explanation: 'Trace visible immédiate dans le présent → Present Perfect Continuous.',
      },
    ],
    fill: [
      {
        sentence: 'It ___ (rain) since this morning.',
        answer: 'has been raining',
        explanation: "'since this morning' + action toujours en cours → has been raining.",
      },
      {
        sentence: 'They ___ (study) for three hours non-stop.',
        answer: 'have been studying',
        explanation: 'Durée continue jusqu’au présent → have been studying.',
      },
      {
        sentence: 'How long ___ she ___ (wait) for the bus?',
        answer: 'has been waiting',
        explanation: "Question de durée jusqu'au présent avec 'she' → has been waiting.",
      },
      {
        sentence: 'I ___ (run), that is why I am out of breath.',
        answer: 'have been running',
        explanation:
          'Cause d’un état présent visible → Present Perfect Continuous : have been running.',
      },
      {
        sentence: 'We ___ (try) to reach you all afternoon.',
        answer: 'have been trying',
        explanation: "Effort répété sur une période jusqu'au présent → have been trying.",
      },
    ],
    correction: [
      {
        wrong: 'I am waiting for the bus for forty minutes.',
        answer: 'I have been waiting for the bus for forty minutes.',
        acceptedAnswers: [
          "I've been waiting for the bus for forty minutes.",
          'have been waiting',
          'I have been waiting',
        ],
        explanation:
          "Pour une action en cours depuis une durée ('for forty minutes'), on utilise le Present Perfect Continuous ('have been waiting').",
      },
      {
        wrong: 'She has been know him for years.',
        answer: 'She has known him for years.',
        acceptedAnswers: ['has been knowing', 'has known', 'She has known'],
        explanation:
          "Attention : 'know' est un verbe d'état, mais dans tous les cas 'has been + base verbale' est grammaticalement impossible.",
      },
      {
        wrong: 'They have been worked all day long.',
        answer: 'They have been working all day long.',
        acceptedAnswers: [
          "They've been working all day long.",
          'have been working',
          'They have been working',
        ],
        explanation:
          'Au Present Perfect Continuous, après have/has been, le verbe prend toujours la terminaison -ing (working).',
      },
    ],
    translation: [
      {
        fr: 'Il pleut depuis ce matin.',
        hint: 'It / rain / since this morning',
        answer: 'It has been raining since this morning.',
        acceptedAnswers: ["It's been raining since this morning."],
        explanation:
          "Action continue depuis le passé jusqu'au présent (Present Perfect Continuous) : 'It has been raining since this morning.'",
      },
      {
        fr: 'Je t’attends depuis une heure !',
        hint: 'I / wait / for you / for an hour',
        answer: 'I have been waiting for you for an hour!',
        acceptedAnswers: [
          'I have been waiting for an hour.',
          'I have been waiting for you for one hour.',
        ],
        explanation:
          "Mise en relief de la durée au Present Perfect Continuous : 'I have been waiting for you for an hour.'",
      },
    ],
  },
  past_continuous: {
    qcm: [
      {
        sentence: 'I ___ TV when the phone rang.',
        options: ['was watching', 'watched', 'am watching', 'have watched'],
        correct: 0,
        explanation:
          'Action longue en cours dans le passé interrompue par une action courte → Past Continuous.',
      },
      {
        sentence: 'At 8 PM last night, they ___ dinner.',
        options: ['were having', 'had', 'are having', 'have had'],
        correct: 0,
        explanation:
          'Action en cours à un moment précis du passé (8 PM last night) → Past Continuous.',
      },
      {
        sentence: 'While she ___ a book, her brother was playing video games.',
        options: ['was reading', 'read', 'is reading', 'had read'],
        correct: 0,
        explanation:
          'Deux actions longues simultanées dans le passé avec "while" → Past Continuous.',
      },
      {
        sentence: 'What ___ you doing when the storm started?',
        options: ['were', 'was', 'did', 'are'],
        correct: 0,
        explanation: "Question au Past Continuous avec 'you' + V-ing → 'were'.",
      },
      {
        sentence: 'The sun ___ brightly when we left the hotel.',
        options: ['was shining', 'shone', 'is shining', 'shines'],
        correct: 0,
        explanation: "Décor / arrière-plan d'un récit au passé → Past Continuous ('was shining').",
      },
    ],
    fill: [
      {
        sentence: 'While I ___ (walk) home, it started to rain.',
        answer: 'was walking',
        explanation: "Action longue ('while') interrompue → Past Continuous : was walking.",
      },
      {
        sentence: 'What ___ you ___ (do) at 10 PM yesterday?',
        answer: 'were doing',
        explanation: 'Question sur une action en cours à un moment précis du passé → were doing.',
      },
      {
        sentence: 'They ___ (not / listen) to the teacher during the lesson.',
        answer: "weren't listening",
        explanation: "Négation au Past Continuous avec 'they' → weren't (were not) listening.",
      },
      {
        sentence: 'She ___ (sleep) when the alarm went off.',
        answer: 'was sleeping',
        explanation: 'Action en cours au moment où le réveil a sonné → was sleeping.',
      },
      {
        sentence: 'At this time last week, we ___ (fly) over the Atlantic.',
        answer: 'were flying',
        explanation: "Action en cours à un moment précis du passé avec 'we' → were flying.",
      },
    ],
    correction: [
      {
        wrong: 'They was watching a film when the lights went out.',
        answer: 'They were watching a film when the lights went out.',
        acceptedAnswers: ['were watching', 'They were watching'],
        explanation: "Avec 'They' au Past Continuous, l'auxiliaire est 'were' (et non 'was').",
      },
      {
        wrong: 'While I walked home, I was meeting an old friend.',
        answer: 'While I was walking home, I met an old friend.',
        acceptedAnswers: ['was walking', 'While I was walking home'],
        explanation:
          "L'action longue après 'While' se met au Past Continuous ('was walking') et l'action brève au Past Simple ('met').",
      },
      {
        wrong: 'She was drive too fast when the police stopped her.',
        answer: 'She was driving too fast when the police stopped her.',
        acceptedAnswers: ['was driving', 'She was driving'],
        explanation: 'Au Past Continuous, après was/were, le verbe prend la forme -ing (driving).',
      },
    ],
    translation: [
      {
        fr: 'Je regardais la télévision quand le téléphone a sonné.',
        hint: 'I / watch / TV / when the phone rang',
        answer: 'I was watching TV when the phone rang.',
        acceptedAnswers: ['I was watching television when the phone rang.'],
        explanation:
          "Action en cours dans le passé au Past Continuous : 'I was watching TV when the phone rang.'",
      },
      {
        fr: 'Que faisais-tu hier à vingt heures ?',
        hint: 'What / you / do / at 8 PM yesterday',
        answer: 'What were you doing at 8 PM yesterday?',
        acceptedAnswers: [
          'What were you doing yesterday at 8 PM?',
          "What were you doing at 8 o'clock yesterday?",
        ],
        explanation: "Question au Past Continuous : 'What were you doing at 8 PM yesterday?'",
      },
    ],
  },
  past_perfect: {
    qcm: [
      {
        sentence: 'When I arrived at the station, the train ___ already ___.',
        options: ['had / left', 'has / left', 'was / leaving', 'did / leave'],
        correct: 0,
        explanation:
          'Le train est parti AVANT mon arrivée (passé du passé) → Past Perfect (had + participe passé).',
      },
      {
        sentence: 'She told me she ___ never ___ to Paris.',
        options: ['had / been', 'has / been', 'was / being', 'did / go'],
        correct: 0,
        explanation: 'Discours indirect au passé + expérience antérieure → Past Perfect.',
      },
      {
        sentence: 'The film ___ by the time we got to the cinema.',
        options: ['had started', 'started', 'has started', 'was starting'],
        correct: 0,
        explanation:
          "'by the time we got...' indique une action antérieure à un moment passé → Past Perfect.",
      },
      {
        sentence: 'He couldn’t enter the house because he ___ his keys.',
        options: ['had forgotten', 'forgot', 'has forgotten', 'was forgetting'],
        correct: 0,
        explanation:
          "L'oubli des clés est antérieur au fait de ne pas pouvoir entrer → Past Perfect ('had forgotten').",
      },
      {
        sentence: 'After the guests ___, we tidied the living room.',
        options: ['had left', 'left', 'have left', 'were leaving'],
        correct: 0,
        explanation: "Action accomplie avant une autre action passée ('After...') → Past Perfect.",
      },
    ],
    fill: [
      {
        sentence: 'By the time we got there, the film ___ (already / start).',
        answer: 'had already started',
        explanation: 'Action antérieure à une autre dans le passé → had already started.',
      },
      {
        sentence: 'I realised I ___ (forget) my wallet at home.',
        answer: 'had forgotten',
        explanation: "L'oubli est antérieur à la réalisation → Past Perfect : had forgotten.",
      },
      {
        sentence: 'She ___ (not / finish) her breakfast when the taxi arrived.',
        answer: "hadn't finished",
        explanation: "Négation au Past Perfect → hadn't (had not) finished.",
      },
      {
        sentence: '___ they ___ (eat) before they boarded the flight?',
        answer: 'Had eaten',
        explanation: 'Question au Past Perfect → Had + sujet + participe passé (eaten).',
      },
      {
        sentence: 'The garden was dry because it ___ (not / rain) all summer.',
        answer: "hadn't rained",
        explanation: "Cause antérieure dans le passé → Past Perfect négatif : hadn't rained.",
      },
    ],
    correction: [
      {
        wrong: 'When we arrived at the airport, the plane had already took off.',
        answer: 'When we arrived at the airport, the plane had already taken off.',
        acceptedAnswers: ['had already taken off', 'had taken off'],
        explanation:
          "Au Past Perfect, après 'had', on utilise le participe passé ('taken') et non le prétérit ('took').",
      },
      {
        wrong: 'She told me that she has already seen that film.',
        answer: 'She told me that she had already seen that film.',
        acceptedAnswers: [
          'She told me she had already seen that film.',
          'had already seen',
          'she had already seen',
        ],
        explanation:
          "Avec un verbe introducteur au passé ('told'), l'action antérieure se met au Past Perfect ('had seen').",
      },
    ],
    translation: [
      {
        fr: 'Quand je suis arrivé, le train était déjà parti.',
        hint: 'When I arrived / the train / already leave',
        answer: 'When I arrived, the train had already left.',
        acceptedAnswers: ['The train had already left when I arrived.'],
        explanation:
          "Antériorité dans le passé au Past Perfect : 'When I arrived, the train had already left.'",
      },
      {
        fr: 'Elle a réalisé qu’elle avait oublié son passeport.',
        hint: 'She realised / she / forget / her passport',
        answer: 'She realised she had forgotten her passport.',
        acceptedAnswers: ['She realized that she had forgotten her passport.'],
        explanation:
          "Past Perfect pour l'action antérieure : 'She realised she had forgotten her passport.'",
      },
    ],
  },
  past_perfect_continuous: {
    qcm: [
      {
        sentence: 'They ___ for two hours before the bus finally arrived.',
        options: ['had been waiting', 'have been waiting', 'were waiting', 'waited'],
        correct: 0,
        explanation:
          "Durée continue ('for two hours') avant un événement passé ('arrived') → Past Perfect Continuous.",
      },
      {
        sentence: 'Her eyes were red because she ___.',
        options: ['had been crying', 'has been crying', 'cried', 'is crying'],
        correct: 0,
        explanation:
          'Activité prolongée antérieure expliquant un état passé (eyes were red) → Past Perfect Continuous.',
      },
      {
        sentence: 'How long ___ you ___ there before you got promoted?',
        options: ['had / been working', 'have / been working', 'were / working', 'did / work'],
        correct: 0,
        explanation:
          'Question sur la durée avant un jalon passé (got promoted) → Past Perfect Continuous.',
      },
      {
        sentence: 'The ground was white because it ___ all night.',
        options: ['had been snowing', 'has been snowing', 'snows', 'is snowing'],
        correct: 0,
        explanation:
          'Action continue pendant la nuit ayant laissé un résultat visible dans le passé → had been snowing.',
      },
    ],
    fill: [
      {
        sentence: 'He ___ (drive) for six hours when he decided to stop for coffee.',
        answer: 'had been driving',
        explanation:
          'Durée en cours avant une action passée → Past Perfect Continuous : had been driving.',
      },
      {
        sentence: 'We ___ (walk) in the rain for ages before we found a shelter.',
        answer: 'had been walking',
        explanation: 'Durée continue avant un repère passé → had been walking.',
      },
      {
        sentence: 'She was exhausted because she ___ (study) since dawn.',
        answer: 'had been studying',
        explanation: 'Cause prolongée d’un état passé → had been studying.',
      },
      {
        sentence: 'They ___ (not / sleep) well for weeks before the exam.',
        answer: "hadn't been sleeping",
        explanation: "Négation au Past Perfect Continuous → hadn't (had not) been sleeping.",
      },
    ],
    correction: [
      {
        wrong: 'He has been working there for five years when the company closed.',
        answer: 'He had been working there for five years when the company closed.',
        acceptedAnswers: ['had been working', 'He had been working'],
        explanation:
          "Le repère 'when the company closed' est dans le passé : il faut le Past Perfect Continuous ('had been working').",
      },
      {
        wrong: 'They had been wait for an hour before the doctor arrived.',
        answer: 'They had been waiting for an hour before the doctor arrived.',
        acceptedAnswers: ['had been waiting', 'They had been waiting'],
        explanation:
          "Après 'had been' au Past Perfect Continuous, le verbe prend obligatoirement -ing ('waiting').",
      },
    ],
    translation: [
      {
        fr: 'Ils attendaient depuis deux heures quand le train est arrivé.',
        hint: 'They / wait / for two hours / when the train arrived',
        answer: 'They had been waiting for two hours when the train arrived.',
        acceptedAnswers: ['They had been waiting for 2 hours when the train arrived.'],
        explanation:
          "Durée antérieure dans le passé (Past Perfect Continuous) : 'They had been waiting for two hours when the train arrived.'",
      },
    ],
  },
  future_will: {
    qcm: [
      {
        sentence: 'The phone is ringing. — I ___ get it!',
        options: ['will', 'am going to', 'would', 'shall'],
        correct: 0,
        explanation: "Décision spontanée prise au moment où l'on parle → 'will'.",
      },
      {
        sentence: 'I think it ___ rain tomorrow.',
        options: ['will', 'is', 'going to', 'has'],
        correct: 0,
        explanation: "Prédiction basée sur une opinion ('I think') → 'will'.",
      },
      {
        sentence: 'I promise I ___ tell anyone your secret.',
        options: ["won't", "don't", 'am not going to', "didn't"],
        correct: 0,
        explanation: "Promesse au futur négatif → 'won't' (will not).",
      },
      {
        sentence: 'Wait a second, I ___ help you carry those heavy bags.',
        options: ['will', 'am', 'have', 'went to'],
        correct: 0,
        explanation: 'Offre d’aide spontanée → Future Simple avec will.',
      },
      {
        sentence: 'Perhaps she ___ join us for dinner later.',
        options: ['will', 'is going', 'has', 'did'],
        correct: 0,
        explanation: "Avec 'perhaps' (incertitude / prédiction), on emploie 'will'.",
      },
    ],
    fill: [
      {
        sentence: "Don't worry, I ___ (help) you with your move.",
        answer: 'will help',
        explanation: 'Promesse / offre spontanée → will + base verbale.',
      },
      {
        sentence: 'She ___ (not / come) to the party tonight.',
        answer: "won't come",
        explanation: "Négation avec will → won't (will not) + base verbale.",
      },
      {
        sentence: '___ you ___ (marry) me?',
        answer: 'Will marry',
        explanation: 'Demande / proposition directe au futur → Will + sujet + base verbale.',
      },
      {
        sentence: 'I am sure they ___ (pass) the exam easily.',
        answer: 'will pass',
        explanation: "Avec 'I am sure' (conviction), on utilise will + base verbale.",
      },
      {
        sentence: 'In 2050, cars ___ (fly) above cities.',
        answer: 'will fly',
        explanation: 'Prédiction sur un futur lointain → will fly.',
      },
    ],
    correction: [
      {
        wrong: 'I will to call you as soon as I arrive.',
        answer: 'I will call you as soon as I arrive.',
        acceptedAnswers: ["I'll call you as soon as I arrive.", 'will call', 'I will call'],
        explanation:
          "Après l'auxiliaire modal 'will', on utilise toujours la base verbale SANS 'to' ('will call').",
      },
      {
        wrong: 'She wills help us tomorrow.',
        answer: 'She will help us tomorrow.',
        acceptedAnswers: ["She'll help us tomorrow.", 'will help', 'She will help'],
        explanation:
          "L'auxiliaire 'will' est invariable : il ne prend jamais de -s à la 3e personne du singulier.",
      },
    ],
    translation: [
      {
        fr: 'Je t’aiderai avec tes bagages, promis.',
        hint: 'I / help / you / with your luggage',
        answer: 'I will help you with your luggage.',
        acceptedAnswers: ["I'll help you with your luggage.", 'I will help you with your bags.'],
        explanation: "Promesse avec Future Simple (will) : 'I will help you with your luggage.'",
      },
      {
        fr: 'Il ne viendra pas demain.',
        hint: 'He / not come / tomorrow',
        answer: "He won't come tomorrow.",
        acceptedAnswers: ['He will not come tomorrow.'],
        explanation: "Futur négatif : 'He won't (will not) come tomorrow.'",
      },
    ],
  },
  future_going_to: {
    qcm: [
      {
        sentence: 'Look at those dark clouds! It ___ rain.',
        options: ['is going to', 'will', 'rains', 'rained'],
        correct: 0,
        explanation: 'Indice visuel évident (dark clouds) → be going to.',
      },
      {
        sentence: 'We ___ visit our grandparents this weekend. Everything is planned.',
        options: ['are going to', 'will', 'go to', 'went to'],
        correct: 0,
        explanation: 'Plan déjà décidé avant de parler → are going to.',
      },
      {
        sentence: 'I ___ study medicine at university next year.',
        options: ['am going to', 'will be', 'going to', 'is going to'],
        correct: 0,
        explanation: "Intention réfléchie avec 'I' → 'am going to'.",
      },
      {
        sentence: 'Watch out! That glass ___ fall off the table!',
        options: ['is going to', 'will to', 'goes to', 'has gone to'],
        correct: 0,
        explanation: 'Action imminente visible maintenant → is going to.',
      },
      {
        sentence: 'What ___ you going to wear to the wedding?',
        options: ['are', 'do', 'will', 'have'],
        correct: 0,
        explanation: "Question avec 'going to' et le sujet 'you' → 'are'.",
      },
    ],
    fill: [
      {
        sentence: 'She ___ (going to / buy) a new car next month.',
        answer: 'is going to buy',
        explanation: 'Intention planifiée, 3e pers. sing. → is going to + base verbale.',
      },
      {
        sentence: 'They ___ (not / going to / move) to Paris after all.',
        answer: "aren't going to move",
        explanation: "Négation avec going to au pluriel → aren't (are not) going to move.",
      },
      {
        sentence: 'I ___ (going to / start) a new job on Monday.',
        answer: 'am going to start',
        explanation: "Projet décidé avec 'I' → am going to start.",
      },
      {
        sentence: 'Be careful! You ___ (going to / drop) those plates!',
        answer: 'are going to drop',
        explanation: "Événement imminent visible avec 'you' → are going to drop.",
      },
    ],
    correction: [
      {
        wrong: 'I going to visit my sister this weekend.',
        answer: 'I am going to visit my sister this weekend.',
        acceptedAnswers: [
          "I'm going to visit my sister this weekend.",
          'am going to visit',
          'I am going to visit',
        ],
        explanation:
          "Avec 'going to', il faut toujours conjuguer l'auxiliaire 'be' (I am going to visit).",
      },
      {
        wrong: 'She is going to buys a new laptop.',
        answer: 'She is going to buy a new laptop.',
        acceptedAnswers: [
          "She's going to buy a new laptop.",
          'is going to buy',
          'She is going to buy',
        ],
        explanation: "Après 'is going to', le verbe reste à la base verbale ('buy', sans -s).",
      },
    ],
    translation: [
      {
        fr: 'Regarde ces nuages noirs, il va pleuvoir !',
        hint: 'Look at those dark clouds / it / going to / rain',
        answer: 'Look at those dark clouds, it is going to rain!',
        acceptedAnswers: ['It is going to rain.', "It's going to rain."],
        explanation: "Prédiction fondée sur un indice présent : 'It is going to rain!'",
      },
      {
        fr: 'Nous allons acheter une maison l’année prochaine.',
        hint: 'We / going to / buy / a house / next year',
        answer: 'We are going to buy a house next year.',
        acceptedAnswers: ['We are going to buy a house.'],
        explanation: "Projet planifié avec be going to : 'We are going to buy a house next year.'",
      },
    ],
  },
  future_continuous: {
    qcm: [
      {
        sentence: 'This time tomorrow, I ___ on a beach in Spain.',
        options: ['will be lying', 'will lie', 'am lying', 'have lain'],
        correct: 0,
        explanation:
          "Action qui sera en cours à un moment précis du futur ('This time tomorrow') → Future Continuous.",
      },
      {
        sentence: "Don't phone me at 8 PM tonight; I ___ dinner with clients.",
        options: ['will be having', 'will have', 'have', 'had'],
        correct: 0,
        explanation:
          'Action en déroulement à 20h demain/ce soir → Future Continuous (will be having).',
      },
      {
        sentence: 'At 10 a.m. tomorrow, she ___ her driving test.',
        options: ['will be taking', 'takes', 'will take', 'has taken'],
        correct: 0,
        explanation: 'Action en cours à une heure précise demain → will be taking.',
      },
      {
        sentence: '___ you be using the car this evening?',
        options: ['Will', 'Are', 'Do', 'Have'],
        correct: 0,
        explanation:
          'Question polie sur les projets de quelqu’un au Future Continuous → Will you be V-ing.',
      },
    ],
    fill: [
      {
        sentence: 'At 9 o’clock tomorrow morning, we ___ (fly) to Rome.',
        answer: 'will be flying',
        explanation: 'Action en cours à un moment précis du futur → will be flying.',
      },
      {
        sentence: 'This time next week, they ___ (ski) in the Alps.',
        answer: 'will be skiing',
        explanation: "'This time next week' → Future Continuous : will be skiing.",
      },
      {
        sentence: 'I ___ (not / work) tomorrow afternoon, so we can meet.',
        answer: "won't be working",
        explanation: "Négation au Future Continuous → won't (will not) be working.",
      },
      {
        sentence: 'She ___ (wait) for you when your train arrives.',
        answer: 'will be waiting',
        explanation: 'Action qui sera déjà en cours à ton arrivée → will be waiting.',
      },
    ],
    correction: [
      {
        wrong: 'This time tomorrow, I will flying to Tokyo.',
        answer: 'This time tomorrow, I will be flying to Tokyo.',
        acceptedAnswers: [
          "This time tomorrow, I'll be flying to Tokyo.",
          'will be flying',
          'I will be flying',
        ],
        explanation:
          "Au Future Continuous, il ne faut pas oublier 'be' entre 'will' et le verbe en -ing ('will be flying').",
      },
      {
        wrong: 'At 8 PM tonight, she will be cook dinner.',
        answer: 'At 8 PM tonight, she will be cooking dinner.',
        acceptedAnswers: ['will be cooking', 'she will be cooking'],
        explanation:
          "Après 'will be' au Future Continuous, le verbe prend toujours -ing ('cooking').",
      },
    ],
    translation: [
      {
        fr: 'Demain à cette heure-ci, nous survolerons l’océan.',
        hint: 'This time tomorrow / we / fly / over the ocean',
        answer: 'This time tomorrow, we will be flying over the ocean.',
        acceptedAnswers: ['We will be flying over the ocean this time tomorrow.'],
        explanation:
          "Future Continuous pour une action en cours demain à la même heure : 'This time tomorrow, we will be flying over the ocean.'",
      },
    ],
  },
  future_perfect: {
    qcm: [
      {
        sentence: 'By next Friday, I ___ the entire project.',
        options: ['will have finished', 'will finish', 'will be finishing', 'have finished'],
        correct: 0,
        explanation:
          "'By next Friday' indique une action qui sera achevée avant une échéance future → Future Perfect.",
      },
      {
        sentence: 'By the time you arrive, they ___ dinner.',
        options: ['will have eaten', 'will eat', 'eat', 'are eating'],
        correct: 0,
        explanation:
          'Action terminée avant un point futur ("By the time you arrive") → will have eaten.',
      },
      {
        sentence: 'She ___ twenty countries by the end of this year.',
        options: ['will have visited', 'visits', 'will visit', 'was visiting'],
        correct: 0,
        explanation:
          "Bilan accompli avant une date butoir future ('by the end of this year') → will have visited.",
      },
      {
        sentence: '___ you have completed the report by 5 PM?',
        options: ['Will', 'Have', 'Do', 'Are'],
        correct: 0,
        explanation: 'Question au Future Perfect → Will + sujet + have + participe passé.',
      },
    ],
    fill: [
      {
        sentence: 'By 2030, scientists ___ (discover) new clean energy sources.',
        answer: 'will have discovered',
        explanation: "'By 2030' → Future Perfect : will have + participe passé (discovered).",
      },
      {
        sentence: 'I ___ (finish) my homework before 6 PM.',
        answer: 'will have finished',
        explanation: 'Action accomplie avant une heure future → will have finished.',
      },
      {
        sentence: 'By next month, she ___ (save) enough money for the trip.',
        answer: 'will have saved',
        explanation: "'By next month' → will have saved.",
      },
      {
        sentence: 'They ___ (not / complete) the bridge before winter.',
        answer: "won't have completed",
        explanation: "Négation au Future Perfect → won't (will not) have completed.",
      },
    ],
    correction: [
      {
        wrong: 'By 6 PM tonight, she will has finished the report.',
        answer: 'By 6 PM tonight, she will have finished the report.',
        acceptedAnswers: ['will have finished', 'she will have finished'],
        explanation:
          "Après l'auxiliaire 'will', on utilise toujours 'have' (jamais 'has'), même à la 3e personne du singulier.",
      },
      {
        wrong: 'By next year, we will have build our house.',
        answer: 'By next year, we will have built our house.',
        acceptedAnswers: ['will have built', 'we will have built'],
        explanation: "Au Future Perfect, après 'will have', il faut le participe passé ('built').",
      },
    ],
    translation: [
      {
        fr: 'D’ici vendredi prochain, j’aurai terminé le rapport.',
        hint: 'By next Friday / I / finish / the report',
        answer: 'By next Friday, I will have finished the report.',
        acceptedAnswers: ['I will have finished the report by next Friday.'],
        explanation:
          "Future Perfect avec 'By...' : 'By next Friday, I will have finished the report.'",
      },
    ],
  },
  future_perfect_continuous: {
    qcm: [
      {
        sentence: 'By next June, I ___ at this company for ten years.',
        options: [
          'will have been working',
          'will be working',
          'have been working',
          'will have worked',
        ],
        correct: 0,
        explanation:
          "Repère futur ('By next June') + durée continue ('for ten years') → Future Perfect Continuous.",
      },
      {
        sentence: 'By 5 PM, she ___ for four hours without a break.',
        options: ['will have been driving', 'will drive', 'is driving', 'drove'],
        correct: 0,
        explanation: 'Durée accumulée jusqu’à un moment futur → will have been driving.',
      },
      {
        sentence: 'In December, we ___ in London for five years.',
        options: ['will have been living', 'will live', 'lived', 'are living'],
        correct: 0,
        explanation:
          'Durée continue atteinte à une date future → Future Perfect Continuous (will have been living).',
      },
    ],
    fill: [
      {
        sentence: 'By midnight, they ___ (travel) for eighteen hours.',
        answer: 'will have been travelling',
        explanation:
          'Durée continue jusqu’à un repère futur → will have been travelling (ou traveling).',
      },
      {
        sentence: 'Next month, he ___ (teach) at this university for twenty years.',
        answer: 'will have been teaching',
        explanation: 'Future Perfect Continuous → will have been teaching.',
      },
      {
        sentence: 'By the time you get here, I ___ (wait) for two hours.',
        answer: 'will have been waiting',
        explanation: 'Durée d’attente jusqu’à ton arrivée future → will have been waiting.',
      },
    ],
    correction: [
      {
        wrong: 'By next month, she will have been work here for ten years.',
        answer: 'By next month, she will have been working here for ten years.',
        acceptedAnswers: ['will have been working', 'she will have been working'],
        explanation:
          "Au Future Perfect Continuous, après 'will have been', le verbe prend toujours -ing ('working').",
      },
    ],
    translation: [
      {
        fr: 'En juin prochain, cela fera dix ans que je travaillerai ici.',
        hint: 'By next June / I / work / here / for ten years',
        answer: 'By next June, I will have been working here for ten years.',
        acceptedAnswers: ['In June, I will have been working here for ten years.'],
        explanation:
          "Future Perfect Continuous : 'By next June, I will have been working here for ten years.'",
      },
    ],
  },
  conditional_0: {
    qcm: [
      {
        sentence: 'If you heat ice, it ___.',
        options: ['melts', 'will melt', 'would melt', 'melted'],
        correct: 0,
        explanation:
          'Zero Conditional (vérité scientifique permanente) : If + Present Simple, Present Simple (melts).',
      },
      {
        sentence: 'Plants die if they ___ enough water.',
        options: ["don't get", "won't get", "didn't get", "wouldn't get"],
        correct: 0,
        explanation: 'Loi naturelle : Present Simple dans les deux propositions → don’t get.',
      },
      {
        sentence: 'If babies ___ hungry, they cry.',
        options: ['are', 'will be', 'were', 'had been'],
        correct: 0,
        explanation: 'Vérité générale : If + Present Simple (are), Present Simple (cry).',
      },
      {
        sentence: 'If you mix red and blue, you ___ purple.',
        options: ['get', 'will get', 'got', 'would get'],
        correct: 0,
        explanation: 'Fait constant → Zero Conditional (get).',
      },
    ],
    fill: [
      {
        sentence: 'If you ___ (freeze) water, it turns into ice.',
        answer: 'freeze',
        explanation: 'Zero Conditional : Present Simple dans la proposition en if → freeze.',
      },
      {
        sentence: 'If I drink coffee at night, I ___ (not / sleep) well.',
        answer: "don't sleep",
        explanation: "Habitude / vérité personnelle constante → Present Simple : don't sleep.",
      },
      {
        sentence: 'Metal ___ (expand) if you heat it.',
        answer: 'expands',
        explanation: 'Loi physique au Zero Conditional, 3e pers. sing. → expands.',
      },
      {
        sentence: 'If people ___ (eat) too much sugar, they gain weight.',
        answer: 'eat',
        explanation: 'Zero Conditional avec sujet pluriel → eat.',
      },
    ],
    correction: [
      {
        wrong: 'If you heat water to 100°C, it would boil.',
        answer: 'If you heat water to 100°C, it boils.',
        acceptedAnswers: ['boils', 'it boils'],
        explanation:
          "Pour une vérité scientifique permanente (Zero Conditional), on utilise le Present Simple ('boils') et non 'would boil'.",
      },
      {
        wrong: 'If she touch fire, she gets burnt.',
        answer: 'If she touches fire, she gets burnt.',
        acceptedAnswers: ['touches', 'If she touches fire'],
        explanation:
          "À la 3e personne du singulier au Present Simple, 'touch' prend -es ('touches').",
      },
    ],
    translation: [
      {
        fr: 'Si on chauffe de la glace, elle fond.',
        hint: 'If you heat ice / it / melt',
        answer: 'If you heat ice, it melts.',
        acceptedAnswers: ['Ice melts if you heat it.'],
        explanation:
          "Zero Conditional (If + Present Simple, Present Simple) : 'If you heat ice, it melts.'",
      },
    ],
  },
  conditional_1: {
    qcm: [
      {
        sentence: 'If it ___ tomorrow, we will stay home.',
        options: ['rains', 'will rain', 'rained', 'would rain'],
        correct: 0,
        explanation:
          "First Conditional : If + Present Simple, will + V. JAMAIS 'will' dans la clause en 'if' !",
      },
      {
        sentence: 'If you study hard, you ___ the exam.',
        options: ['will pass', 'pass', 'would pass', 'passed'],
        correct: 0,
        explanation: 'First Conditional : la proposition principale utilise will + base verbale.',
      },
      {
        sentence: 'She ___ miss the train if she doesn’t hurry.',
        options: ['will', 'would', 'did', 'is'],
        correct: 0,
        explanation: 'Conséquence future probable → will + base verbale.',
      },
      {
        sentence: 'If we ___ now, we will arrive on time.',
        options: ['leave', 'will leave', 'left', 'would leave'],
        correct: 0,
        explanation:
          "Dans la sous-phrase en 'If' au First Conditional, on utilise le Present Simple ('leave').",
      },
      {
        sentence: 'What ___ you do if the flight is delayed?',
        options: ['will', 'would', 'do', 'did'],
        correct: 0,
        explanation: 'Question au First Conditional (if + Present Simple) → will + sujet + V.',
      },
    ],
    fill: [
      {
        sentence: 'If she ___ (call) me, I will tell her the news.',
        answer: 'calls',
        explanation:
          "Dans la clause 'if' du 1st Conditional → Present Simple (3e pers. : 'calls').",
      },
      {
        sentence: 'We ___ (be) late if we do not hurry.',
        answer: 'will be',
        explanation: 'Proposition principale du 1st Conditional → will + base verbale.',
      },
      {
        sentence: 'If it is sunny this weekend, we ___ (go) to the beach.',
        answer: 'will go',
        explanation: 'Conséquence probable au First Conditional → will go.',
      },
      {
        sentence: 'If you ___ (not / wear) a coat, you will catch a cold.',
        answer: "don't wear",
        explanation: "Négation dans la clause en 'if' → Present Simple négatif : don't wear.",
      },
    ],
    correction: [
      {
        wrong: 'If it will rain tomorrow, we will cancel the picnic.',
        answer: 'If it rains tomorrow, we will cancel the picnic.',
        acceptedAnswers: ['rains', 'If it rains tomorrow'],
        explanation:
          "Règle d'or du First Conditional : jamais de 'will' après 'if' ! On utilise le Present Simple ('If it rains').",
      },
      {
        wrong: 'If she studies hard, she would pass the test.',
        answer: 'If she studies hard, she will pass the test.',
        acceptedAnswers: ['will pass', 'she will pass'],
        explanation:
          "Avec 'If + Present Simple' (situation réelle et probable), la principale prend 'will pass' et non 'would pass'.",
      },
    ],
    translation: [
      {
        fr: 'S’il pleut demain, nous resterons à la maison.',
        hint: 'If it / rain / tomorrow, we / stay / home',
        answer: 'If it rains tomorrow, we will stay home.',
        acceptedAnswers: [
          'If it rains tomorrow, we will stay at home.',
          'We will stay home if it rains tomorrow.',
        ],
        explanation:
          "First Conditional : 'If it rains tomorrow, we will stay home.' (Present Simple après if !)",
      },
    ],
  },
  conditional_2: {
    qcm: [
      {
        sentence: 'If I ___ rich, I would travel the world.',
        options: ['were', 'am', 'will be', 'have been'],
        correct: 0,
        explanation:
          "Second Conditional : If + Past Simple. Avec 'be', on utilise 'were' à toutes les personnes.",
      },
      {
        sentence: 'She ___ buy that house if she had enough money.',
        options: ['would', 'will', 'can', 'has'],
        correct: 0,
        explanation: 'Second Conditional : proposition principale → would + base verbale.',
      },
      {
        sentence: 'If we ___ closer to the sea, we would go swimming every day.',
        options: ['lived', 'live', 'will live', 'would live'],
        correct: 0,
        explanation: 'Hypothèse irréelle dans le présent : If + Past Simple (lived).',
      },
      {
        sentence: 'What would you do if you ___ a wallet in the street?',
        options: ['found', 'find', 'would find', 'have found'],
        correct: 0,
        explanation: "Dans la clause en 'if' du Second Conditional → Past Simple ('found').",
      },
    ],
    fill: [
      {
        sentence: 'If I ___ (know) the answer, I would tell you.',
        answer: 'knew',
        explanation: 'Second Conditional : If + Past Simple. know → knew.',
      },
      {
        sentence: 'If I ___ (be) you, I would accept the job.',
        answer: 'were',
        explanation: "'If I were you' est la forme standard du Second Conditional avec 'be'.",
      },
      {
        sentence: 'They ___ (travel) more if they had more free time.',
        answer: 'would travel',
        explanation: 'Proposition principale du Second Conditional → would travel.',
      },
      {
        sentence: 'If she ___ (not / live) so far away, we would visit her more often.',
        answer: "didn't live",
        explanation: "Négation au Past Simple dans la clause 'if' → didn't live.",
      },
    ],
    correction: [
      {
        wrong: 'If I would have more time, I would learn Japanese.',
        answer: 'If I had more time, I would learn Japanese.',
        acceptedAnswers: ['had', 'If I had more time'],
        explanation:
          "Au Second Conditional, on n'utilise jamais 'would' dans la proposition en 'if' : il faut le Past Simple ('If I had').",
      },
      {
        wrong: 'If she knew his number, she will call him.',
        answer: 'If she knew his number, she would call him.',
        acceptedAnswers: ['would call', 'she would call'],
        explanation:
          "Avec 'If + Past Simple' (knew), la proposition principale prend 'would + base verbale' ('would call').",
      },
    ],
    translation: [
      {
        fr: 'Si j’étais toi, j’accepterais cette offre.',
        hint: 'If I / be / you, I / accept / this offer',
        answer: 'If I were you, I would accept this offer.',
        acceptedAnswers: [
          'If I was you, I would accept this offer.',
          'If I were you, I would accept that offer.',
        ],
        explanation: "Second Conditional : 'If I were you, I would accept this offer.'",
      },
    ],
  },
  conditional_3: {
    qcm: [
      {
        sentence: 'If I ___ harder, I would have passed the exam.',
        options: ['had studied', 'studied', 'would have studied', 'have studied'],
        correct: 0,
        explanation: 'Third Conditional : If + Past Perfect (had + participe passé).',
      },
      {
        sentence: 'We ___ the flight if the taxi had arrived on time.',
        options: ["wouldn't have missed", "didn't miss", "won't miss", "hadn't missed"],
        correct: 0,
        explanation: 'Conséquence irréelle dans le passé → would(n’t) have + participe passé.',
      },
      {
        sentence: 'If she had told me about the problem, I ___ her.',
        options: ['would have helped', 'would help', 'helped', 'will have helped'],
        correct: 0,
        explanation: 'Third Conditional : would have + participe passé (would have helped).',
      },
      {
        sentence: 'If they ___ the map, they wouldn’t have got lost.',
        options: ['had taken', 'took', 'would take', 'have taken'],
        correct: 0,
        explanation: "Dans la proposition en 'if' au 3rd Conditional → Past Perfect ('had taken').",
      },
    ],
    fill: [
      {
        sentence: 'She ___ (come) if you had invited her.',
        answer: 'would have come',
        explanation: 'Third Conditional principale : would have + participe passé (come).',
      },
      {
        sentence: 'If we ___ (leave) earlier, we would not have missed the train.',
        answer: 'had left',
        explanation: "Clause 'if' au Third Conditional : Past Perfect → had left.",
      },
      {
        sentence: 'If I had seen you at the station, I ___ (say) hello.',
        answer: 'would have said',
        explanation: 'Principale du Third Conditional → would have said.',
      },
      {
        sentence: 'He wouldn’t have had an accident if he ___ (drive) more carefully.',
        answer: 'had driven',
        explanation: 'Condition passée irréelle → Past Perfect : had driven.',
      },
    ],
    correction: [
      {
        wrong: 'If I would have known, I would have told you.',
        answer: 'If I had known, I would have told you.',
        acceptedAnswers: ['had known', 'If I had known'],
        explanation:
          "Erreur classique : jamais de 'would have' dans la clause en 'if' ! Il faut le Past Perfect ('If I had known').",
      },
      {
        wrong: 'If they had left earlier, they would caught the bus.',
        answer: 'If they had left earlier, they would have caught the bus.',
        acceptedAnswers: ['would have caught', 'they would have caught'],
        explanation:
          "Dans la principale du Third Conditional, il faut 'would have + participe passé' ('would have caught').",
      },
    ],
    translation: [
      {
        fr: 'Si j’avais su, je t’aurais aidé.',
        hint: 'If I / know, I / help / you',
        answer: 'If I had known, I would have helped you.',
        acceptedAnswers: ['I would have helped you if I had known.'],
        explanation: "Third Conditional : 'If I had known, I would have helped you.'",
      },
    ],
  },
  mixed_conditional: {
    qcm: [
      {
        sentence: 'If I had taken that job in London, I ___ there right now.',
        options: ['would live', 'would have lived', 'will live', 'lived'],
        correct: 0,
        explanation:
          'Mixed Conditional : condition passée (had taken) avec conséquence dans le présent ("right now") → would + base verbale.',
      },
      {
        sentence: 'If she ___ more careful in the past, she wouldn’t be in trouble today.',
        options: ['had been', 'were', 'was', 'would have been'],
        correct: 0,
        explanation:
          'Condition passée ("in the past") + résultat présent ("today") → If + Past Perfect (had been).',
      },
      {
        sentence: 'If he hadn’t stayed up all night, he ___ so tired now.',
        options: ["wouldn't be", "wouldn't have been", "isn't", "won't be"],
        correct: 0,
        explanation: 'Conséquence présente ("now") d’une cause passée → wouldn’t be.',
      },
    ],
    fill: [
      {
        sentence: 'If I had studied medicine, I ___ (be) a doctor now.',
        answer: 'would be',
        explanation:
          'Mixed Conditional : condition dans le passé (had studied) → résultat dans le présent : would be.',
      },
      {
        sentence: 'If we ___ (look) at the map earlier, we wouldn’t be lost now.',
        answer: 'had looked',
        explanation: 'Cause passée d’une situation présente → Past Perfect : had looked.',
      },
      {
        sentence: 'She ___ (have) more money today if she hadn’t bought that sports car.',
        answer: 'would have',
        explanation: 'Résultat présent ("today") d’une action passée → would have.',
      },
    ],
    correction: [
      {
        wrong: 'If I had slept well last night, I would have been less tired right now.',
        answer: 'If I had slept well last night, I would be less tired right now.',
        acceptedAnswers: ['would be', 'I would be less tired right now.'],
        explanation:
          "Comme la conséquence porte sur le présent ('right now'), on utilise 'would + base verbale' ('would be') et non 'would have been'.",
      },
    ],
    translation: [
      {
        fr: 'Si j’avais écouté tes conseils, je ne serais pas en retard maintenant.',
        hint: 'If I had listened to your advice / I / not be / late now',
        answer: "If I had listened to your advice, I wouldn't be late now.",
        acceptedAnswers: ['If I had listened to your advice, I would not be late now.'],
        explanation:
          "Mixed Conditional (passé → présent) : 'If I had listened to your advice, I wouldn't be late now.'",
      },
    ],
  },
};
