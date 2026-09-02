# ConjuMaster UK 🇬🇧

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-stable-success)

**Application web interactive pour apprendre et maîtriser la conjugaison de l'anglais britannique**

---

## 📖 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Démarrage rapide](#-démarrage-rapide)
- [Installation pour développeurs](#-installation-pour-développeurs)
- [Architecture du projet](#-architecture-du-projet)
- [Tests unitaires](#-tests-unitaires)
- [Sécurité](#-sécurité)
- [Structure des données](#-structure-des-données)
- [Contribuer](#-contribuer)
- [Auteur](#-auteur)
- [Licence](#-licence)

---

## 🌟 Fonctionnalités

### 📊 Tableau de bord personnalisé

- **Système de progression** : Gagnez de l'XP et montez en niveau
- **Suivi statistique** : Visualisez vos exercices réussis/échoués
- **Répétition espacée** : Révisez intelligemment avec un algorithme de révision optimisé
- **File d'attente de révision** : Ne révisez que ce dont vous avez besoin

### 📚 Parcours d'apprentissage structurés

- **Leçons par temps verbaux** : Du niveau débutant à expert
  - Present Simple / Continuous / Perfect
  - Past Simple / Continuous / Perfect
  - Future (will / going to)
  - Et bien plus encore...
- **Explications détaillées** : Comprenez la logique derrière chaque temps
- **Exemples contextuels** : Apprenez avec des phrases du quotidien

### 🎮 Exercices interactifs variés

- **QCM intelligents** : Choisissez la bonne réponse parmi plusieurs options
- **Phrases à compléter** : Complétez les trous avec la forme verbale correcte
- **Transformations** : Passez de l'affirmatif au négatif/interrogatif
- **Correction d'erreurs** : Identifiez et corrigez les erreurs
- **Traductions** : Traduisez depuis le français vers l'anglais

### 📝 Mode Test & Évaluation

- **Test de niveau** : 20 questions générées dynamiquement
- **Score instantané** : Obtenez votre résultat immédiatement
- **Feedback détaillé** : Comprenez vos erreurs

### 📖 Références complètes

- **Dictionnaire de verbes** : 143 verbes irréguliers consultables
- **Tableau comparatif** : Tous les temps verbaux côte à côte
- **Mode sombre intégré** : Confort de lecture optimal

---

## 🚀 Démarrage rapide

ConjuMaster UK est une application **100% front-end** qui ne nécessite **aucun backend ni base de données**.

### Option 1 : Utilisation directe (la plus simple)

```bash
# 1. Clonez ou téléchargez ce dépôt
git clone https://github.com/kmsohenry-hub/conjumastery.git
cd conjumastery

# 2. Ouvrez simplement le fichier dans votre navigateur
# Double-cliquez sur index.html ou utilisez :
open index.html       # macOS
start index.html      # Windows
xdg-open index.html   # Linux
```

### Option 2 : Serveur de développement Vite (recommandé pour développer)

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### Option 3 : Serveur statique simple

```bash
# Avec Python
python -m http.server 8000

# Avec Node.js (npx)
npx serve .

# Puis ouvrez http://localhost:8000
```

### 💾 Sauvegarde des données

Toutes vos données (statistiques, niveaux, leçons complétées) sont sauvegardées automatiquement dans le **localStorage** de votre navigateur. Aucune donnée n'est envoyée vers un serveur externe.

**Export/Import** : Utilisez la fonctionnalité de sauvegarde dans les paramètres pour exporter/importer votre progression.

---

## 🛠️ Installation pour développeurs

### Prérequis

- Node.js >= 18.x (recommandé)
- npm >= 9.x

### Installation des dépendances

```bash
npm install
```

### Scripts disponibles

```bash
# Serveur de développement (Vite)
npm run dev

# Build de production
npm run build

# Prévisualiser le build de production
npm run preview

# Lancer les tests unitaires (Vitest, exécution unique)
npm test

# Lancer les tests en mode watch
npm run test:watch

# Lancer les tests avec interface graphique
npm run test:ui

# Lancer les tests avec couverture de code
npm run test:coverage

# Lint
npm run lint
npm run lint:fix

# Formatage Prettier
npm run format
npm run format:check
```

### Structure de développement

```
conjumastery/
├── __tests__/              # Tests unitaires et tests de régression (Vitest)
├── src/
│   ├── data/               # Données pédagogiques modulaires
│   │   ├── index.js        # Façade APP_DATA stable
│   │   ├── irregularVerbs.js # Verbes irréguliers et index
│   │   ├── tenses.js       # Temps verbaux et règles
│   │   ├── exerciseTemplates.js # Templates d'exercices
│   │   ├── modules.js      # Modules et leçons
│   │   ├── modals.js       # Données des modaux
│   │   ├── phrasalVerbs.js # Phrasal verbs
│   │   ├── passiveInfo.js  # Voix passive
│   │   ├── reportedSpeech.js # Discours indirect
│   │   └── stativeVerbs.js # Verbes d'état
│   ├── core/
│   │   ├── exercises/      # Génération, validation et conjugaison
│   │   ├── persistence/    # Accès localStorage
│   │   ├── state/          # Store, sélecteurs et façade State
│   │   └── security.js     # Échappement HTML et nettoyage d'entrées
│   └── ui/
│       ├── pages/          # Rendu des pages de l'application
│       ├── utils/          # Toasts, notifications, confettis
│       └── navigation.js   # Navigation interne et thème
├── index.html              # Squelette HTML et conteneurs de pages
├── style.css               # Feuilles de style (responsive + mode sombre)
├── app.js                  # Bootstrap et compatibilité globale
├── package.json            # Scripts npm et dépendances
└── vite.config.js          # Configuration Vite
```

> Le projet utilise npm comme gestionnaire de paquets de référence. Utilisez `npm ci` en CI et `npm install` en local.

---

## 🏗️ Architecture du projet

### Séparation des responsabilités

| Zone         | Responsabilité                                                       |
| ------------ | -------------------------------------------------------------------- |
| `index.html` | Structure HTML et conteneurs de pages                                |
| `style.css`  | Design responsive et mode sombre                                     |
| `src/data/`  | Données pédagogiques séparées par domaine, assemblées par `APP_DATA` |
| `src/core/`  | Logique métier, état, persistance, exercices et sécurité             |
| `src/ui/`    | Pages, navigation et utilitaires d'interface                         |
| `app.js`     | Bootstrap, compatibilité globale et orchestration                    |

### Flux de données

```
Utilisateur → Interface (`src/ui/`)
           → Événements / bootstrap (`app.js`)
           → Logique métier (`src/core/`)
           → Données pédagogiques (`src/data/`)
           → État et persistance (`src/core/state/`, `src/core/persistence/`)
           → `localStorage`
```

### Points de maintenance importants

- Les exercices doivent toujours conserver une cohérence entre `tenseId`, consigne, réponse attendue et statistiques.
- Les imports de sauvegarde utilisateur sont validés avant d'être appliqués à l'état local.
- Toute nouvelle donnée pédagogique doit être couverte par un test de structure ou de génération d'exercice.
- Les handlers inline historiques sont conservés pour compatibilité, mais les nouveaux développements doivent privilégier `addEventListener`.

### Modules principaux (`app.js`)

1. **State Management** : Gestion centralisée de l'état (XP, niveau, statistiques)
2. **ExerciseEngine** : Génération dynamique de questions et conjugaison
3. **SpacedRepetition** : Algorithme de révision espacée
4. **UI Renderer** : Rendu dynamique des composants
5. **Data Persistence** : Sauvegarde/chargement localStorage

---

## ✅ Tests unitaires

Le projet inclut une suite de tests avec **Vitest** pour garantir la fiabilité du code. La suite actuellement exécutée compte **27 fichiers de test et 294 tests**, tous passés lors de l’audit fonctionnel du 2 septembre 2026.

### Couverture des tests

- ✅ **State Management** : XP, niveaux, logs d'activité
- ✅ **Système de favoris** : Ajout, suppression, vérification
- ✅ **Points faibles** : Identification des temps à réviser
- ✅ **Moteur de conjugaison** : Tous les temps verbaux
- ✅ **Générateur de questions** : QCM, phrases à compléter, transformations, correction d'erreurs et traductions
- ✅ **Validation des réponses** : casse, espaces, apostrophes et variantes exactes (ex. BrE/AmE)
- ✅ **Navigation et accessibilité** : routage des pages, thème, barre latérale, modales, clavier et focus
- ✅ **Répétition espacée** : Algorithmes de révision
- ✅ **Structure des données** : Validation de APP_DATA
- ✅ **Sécurité** : validation des imports, nettoyage des entrées et régressions XSS

### Exécuter les tests

```bash
# Tous les tests (exécution unique)
npm test

# Mode watch (re-run automatique)
npm run test:watch

# Interface graphique Vitest
npm run test:ui

# Avec couverture de code
npm run test:coverage
```

---

## 🔒 Sécurité

### Analyse de sécurité

✅ **Contrôles de sécurité applicatifs validés** : 11 tests dédiés à la sécurité et aux régressions XSS passent actuellement.

#### Points forts

- **Pas de backend** : Toutes les opérations sont locales
- **Sanitization** : Fonctions `escapeHtml()` et `sanitizeInput()` implémentées
- **Pas de pratiques dangereuses** : Aucun `eval()`, `document.write()`, ou injection directe
- **Stockage local uniquement** : pas de transmission réseau

#### Bonnes pratiques implémentées

- Validation des entrées utilisateur
- Échappement du contenu HTML dynamique
- Politique de sécurité CSP active dans `index.html`

#### CSP actuellement déployée

La page principale applique déjà une Content Security Policy via une balise `<meta>` dans `index.html`. Elle couvre notamment :

- `default-src 'self'` : ressources limitées par défaut à l’origine de l’application
- `script-src 'self' 'unsafe-inline'` : scripts locaux et inline nécessaires au fonctionnement actuel
- `style-src 'self' 'unsafe-inline'` : styles locaux et inline utilisés par l’interface
- `img-src 'self' data:` : images locales et données inline
- `connect-src 'self'` : connexions limitées à l’origine de l’application
- `object-src 'none'` : désactivation des plugins/objets embarqués
- `base-uri 'self'` : base URL limitée à l’origine de l’application
- `form-action 'self'` : soumissions de formulaires limitées à l’origine de l’application
- `frame-ancestors 'none'` : interdiction de l’encapsulation de l’application dans une iframe

Aucune étape d’installation supplémentaire n’est nécessaire pour activer cette CSP. Tout durcissement futur doit être traité comme une évolution distincte et vérifié contre les besoins réels de l’application.

---

## 📊 Structure des données

### APP_DATA (`src/data/index.js`)

```javascript
{
  irregularVerbs: [     // Données issues de src/data/verbs.js
    { base, past, pp, meaning }
  ],

  tenses: [            // Tous les temps verbaux
    {
      id, name, level,
      structure, explanation, examples,
      conjugationRules
    }
  ],

  exercises: {         // Templates d'exercices
    templates: [...],
    lessons: [...]
  },

  ui: {                // Textes et labels UI
    levels: [...],
    messages: [...]
  }
}
```

### State (app.js)

```javascript
{
  xp: Number,          // Expérience actuelle
  level: Number,       // Niveau actuel
  statistics: {
    correct: Number,
    incorrect: Number,
    streak: Number,
    bestStreak: Number
  },
  completedLessons: [],
  spacedRepetition: {},
  favorites: [],
  activityLog: []
}
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment procéder :

### 1. Fork et clone

```bash
git clone https://github.com/kmsohenry-hub/conjumastery.git
cd conjumastery
```

### 2. Créer une branche

```bash
git checkout -b feature/nouvelle-fonctionnalite
```

### 3. Installer les dépendances

```bash
npm install
```

### 4. Développer et tester

```bash
# Codez votre fonctionnalité
# Assurez-vous que tous les tests passent
npm test
```

### 5. Commit et push

```bash
git add .
git commit -m \"feat: ajout de [description]\"
git push origin feature/nouvelle-fonctionnalite
```

### 6. Pull Request

Ouvrez une PR sur GitHub avec une description claire de vos changements.

### Conventions de commit

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, points-virgules manquants, etc.
- `refactor:` Refactoring de code
- `test:` Ajout/modification de tests
- `chore:` Maintenance, dépendances

---

## 👨‍💻 Auteur

**Kouakam Henry**  
Créé avec passion pour faciliter l'apprentissage de l'anglais britannique.

### Contact & Support

- 📧 Via l'application : Section _Paramètres_ → _Contact_
- 🐛 Bugs & Features : Ouvrez une issue sur GitHub

---

## 📄 Licence

Ce projet est distribué sous la licence **MIT** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- À tous les apprenants qui utilisent ConjuMaster
- Aux contributeurs open-source dont les librairies rendent ce projet possible
- À la communauté pour les retours et suggestions

---

<div align="center">

**ConjuMaster UK** v2.0.0 | Fait avec ❤️ pour l'apprentissage de l'anglais

[⬆ Retour en haut](#conjumaster-uk-)

</div>
