
# ConjuMaster UK 🇬🇧

Bienvenue sur le dépôt de **ConjuMaster UK**, une application web interactive et autonome pour apprendre et réviser la conjugaison de l'anglais britannique.

## 🌟 Fonctionnalités
- **Tableau de bord :** Suivez votre progression avec un système de niveau (XP), le nombre d'exercices réussis, et une file d'attente de révision basée sur la répétition espacée.
- **Leçons :** Des parcours d'apprentissage par temps verbaux (du niveau débutant à expert) avec explications détaillées.
- **Exercices Interactifs :** Pratiquez avec différents modes de jeu :
  - QCM intelligents
  - Phrases à compléter
  - Transformations (Affirmatif → Négatif → Interrogatif)
  - Correction d'erreurs
  - Traductions
- **Mode Test :** Évaluez votre niveau avec un test de 20 questions générées dynamiquement.
- **Référence Complète :**
  - Un dictionnaire consultable de plus de 200 verbes irréguliers.
  - Un tableau comparatif de tous les temps.

## 🚀 Comment l'utiliser
ConjuMaster UK est une application front-end qui ne nécessite **aucune installation de serveur ou de base de données**.

Pour lancer l'application, il vous suffit de :
1. Télécharger ou cloner ce dépôt.
2. Ouvrir le fichier `index.html` avec votre navigateur web préféré (Chrome, Firefox, Safari, Edge, etc.).

Toutes vos données (statistiques, niveaux, leçons complétées) sont sauvegardées localement dans votre navigateur (`localStorage`).

## 🛠️ Architecture du Projet
Le projet a été pensé pour être facile à maintenir :
- `index.html` : Structure de l'application et de l'interface utilisateur.
- `style.css` : Design complet (incluant un mode sombre intégré).
- `data.js` : Base de données des exercices, des cours, des templates, et des verbes irréguliers (`APP_DATA`).
- `app.js` : Moteur logique de l'application (génération dynamique des questions, gestion de l'XP, répétition espacée).

## 👨‍💻 Créateur
Créé avec passion par **Kouakam Henry**.

*(Pour faire part d'un retour ou d'un bug, vous pouvez utiliser le bouton "Contact" dans la section "Paramètres" de l'application).*

# conjuMaster

