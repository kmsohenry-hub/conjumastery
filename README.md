# ConjuMaster UK 🇬🇧

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
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
- **Correction d'erreurs** : Identifiez et corrigez les mistakes
- **Traductions** : Traduisez depuis le français vers l'anglais

### 📝 Mode Test & Évaluation
- **Test de niveau** : 20 questions générées dynamiquement
- **Score instantané** : Obtenez votre résultat immédiatement
- **Feedback détaillé** : Comprenez vos erreurs

### 📖 Références complètes
- **Dictionnaire de verbes** : Plus de 200 verbes irréguliers consultables
- **Tableau comparatif** : Tous les temps verbaux côte à côte
- **Mode sombre intégré** : Confort de lecture optimal

---

## 🚀 Démarrage rapide

ConjuMaster UK est une application **100% front-end** qui ne nécessite **aucune installation de serveur ou de base de données**.

### Option 1 : Utilisation directe (recommandé)

```bash
# 1. Clonez ou téléchargez ce dépôt
git clone https://github.com/votre-utilisateur/conjumaster.git
cd conjumaster

# 2. Ouvrez simplement le fichier dans votre navigateur
# Double-cliquez sur index.html ou utilisez :
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

### Option 2 : Serveur local (optionnel)

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
- Node.js >= 16.x
- npm >= 7.x

### Installation des dépendances

```bash
# Installer toutes les dépendances de développement
npm install
```

### Scripts disponibles

```bash
# Lancer les tests unitaires
npm test

# Lancer les tests avec coverage (couverture de code)
npm test -- --coverage

# Lancer les tests en mode watch (re-run automatique)
npm test -- --watch
```

### Structure de développement

```
conjumaster/
├── __tests__/              # Tests unitaires
│   └── conjumaster.test.js
├── node_modules/           # Dépendances (généré par npm install)
├── index.html              # Point d'entrée de l'application
├── style.css               # Feuilles de style (mode clair/sombre)
├── app.js                  # Logique métier et moteur de l'application
├── data.js                 # Base de données (exercices, verbes, leçons)
├── package.json            # Configuration du projet et dépendances
├── jest.config.json        # Configuration de Jest
├── babel.config.json       # Configuration Babel
└── README.md               # Ce fichier
```

---

## 🏗️ Architecture du projet

### Séparation des responsabilités

| Fichier | Rôle | Taille approximative |
|---------|------|---------------------|
| `index.html` | Structure HTML et squelette de l'UI | ~300 lignes |
| `style.css` | Design responsive + mode sombre | ~800 lignes |
| `data.js` | Base de données statique (APP_DATA) | ~2000+ lignes |
| `app.js` | Moteur logique, gestion d'état, rendu dynamique | ~2500+ lignes |

### Flux de données

```
Utilisateur → Interface (HTML/CSS) 
           → Événements (app.js) 
           → Logique métier (app.js) 
           → Données (data.js) 
           → Stockage (localStorage)
```

### Modules principaux (`app.js`)

1. **State Management** : Gestion centralisée de l'état (XP, niveau, statistiques)
2. **ExerciseEngine** : Génération dynamique de questions et conjugaison
3. **SpacedRepetition** : Algorithme de révision espacée
4. **UI Renderer** : Rendu dynamique des composants
5. **Data Persistence** : Sauvegarde/chargement localStorage

---

## ✅ Tests unitaires

Le projet inclut une suite de tests complète avec **Jest** pour garantir la fiabilité du code.

### Couverture des tests

- ✅ **State Management** : XP, niveaux, logs d'activité
- ✅ **Système de favoris** : Ajout, suppression, vérification
- ✅ **Points faibles** : Identification des temps à réviser
- ✅ **Moteur de conjugaison** : Tous les temps verbaux
- ✅ **Générateur de questions** : QCM, fill-in-the-blank, transformations
- ✅ **Répétition espacée** : Algorithmes de révision
- ✅ **Structure des données** : Validation de APP_DATA

### Exécuter les tests

```bash
# Tous les tests
npm test

# Avec détails verbose
npm test -- --verbose

# Un fichier de test spécifique
npm test -- conjumaster.test.js
```

### Statut actuel des tests

> ⚠️ **Note** : Certains tests peuvent échouer si `APP_DATA` n'est pas correctement exporté dans l'environnement de test. Voir la section *Contribuer* pour plus de détails.

---

## 🔒 Sécurité

### Analyse de sécurité (2024)

✅ **Aucune vulnérabilité critique détectée**

#### Points forts
- **0 vulnérabilité** dans les dépendances npm (`npm audit` clean)
- **Pas de backend** : Toutes les opérations sont locales
- **Sanitization** : Fonctions `escapeHtml()` et `sanitizeInput()` implémentées
- **Pas de pratiques dangereuses** : Aucun `eval()`, `document.write()`, ou injection directe

#### Bonnes pratiques implémentées
- Validation des entrées utilisateur
- Échappement du contenu HTML dynamique
- Politique de sécurité CSP recommandée
- Stockage local uniquement (pas de transmission réseau)

#### Recommandation CSP

Ajoutez cette balise dans `<head>` de `index.html` pour renforcer la sécurité :

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

---

## 📊 Structure des données

### APP_DATA (data.js)

```javascript
{
  irregularVerbs: [     // 200+ verbes irréguliers
    { base, pastSimple, pastParticiple, translation }
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
git clone https://github.com/votre-utilisateur/conjumaster.git
cd conjumaster
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
git commit -m "feat: ajout de [description]"
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
- 📧 Via l'application : Section *Paramètres* → *Contact*
- 🐛 Bugs & Features : Ouvrez une issue sur GitHub

---

## 📄 Licence

Ce projet est distribué sous la licence **ISC** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- À tous les apprenants qui utilisent ConjuMaster
- Aux contributeurs open-source dont les librairies rendent ce projet possible
- À la communauté pour les retours et suggestions

---

<div align="center">

**ConjuMaster UK** v1.0.0 | Fait avec ❤️ pour l'apprentissage de l'anglais

[⬆ Retour en haut](#conjumaster-uk-)

</div>
