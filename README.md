# GroceriesHelper

**GroceriesHelper** est une Progressive Web App (PWA) de planification de repas et de génération dynamique de listes de courses.

---

## Fonctionnalités Principales

* **Gestion des Ingrédients :** Ajoutez et catégorisez vos ingrédients (Légumes, Épicerie, Viandes, etc.) avec leurs unités respectives.
* **Livre de Recettes :** Créez des recettes sur mesure avec portions de référence, instructions et liste d'ingrédients dynamique.
* **Planning Hebdomadaire :** Organisez vos repas (Midi & Soir) jour par jour. Ajustez le nombre de convives en direct.
* **Liste de Courses Intelligente :** 
  * Calcul automatique des quantités selon un intervalle de dates personnalisé.
  * Prise en compte du ratio des convives par rapport à la recette d'origine.
  * Regroupement des articles par rayon/catégorie.
* **Usage Mobile & Offline :** Fonctionne 100% hors-ligne et s'installe comme une application native sur Android et Desktop.

---

## Tech Stack

* **Front-end :** React 19, TypeScript, Vite
* **Styles :** Tailwind CSS v4
* **Base de données locale :** Dexie.js (Wrapper IndexedDB)
* **PWA :** `@tailwindcss/vite`, `vite-plugin-pwa`

---

## Installation & Développement

### Prérequis

* **Node.js** (v18 ou supérieur)
* **npm** ou **pnpm**

```markdown
### Lancement en local

1. **Cloner le projet :**
   ```bash
   git clone [https://github.com/votre-utilisateur/GroceriesHelper.git](https://github.com/votre-utilisateur/GroceriesHelper.git)
   cd GroceriesHelper

```

2. **Installer les dépendances :**
```bash
npm install

```


3. **Démarrer le serveur de développement :**
```bash
npm run dev

```


L'application sera disponible à l'adresse `http://localhost:5173`.

---

## Structure du Projet

```text
GroceriesHelper/
├── public/                 # Favicon et icônes PWA
├── src/
│   ├── components/         # Vues principales (Planning, Courses, Recettes, Ingrédients)
│   ├── hooks/              # Hooks réactifs Dexie (useShoppingList, useMealPlan, etc.)
│   ├── services/           # Logique métier & opérations IndexedDB
│   ├── utils/              # Fonctions utilitaires (manipulation de dates ISO, etc.)
│   ├── db.ts               # Schéma et configuration de la BDD Dexie.js
│   ├── index.css           # Thème global et imports Tailwind CSS v4
│   ├── App.tsx             # Composant racine & conteneur de navigation
│   └── main.tsx            # Point d'entrée de l'application
├── vite.config.ts          # Configuration Vite, Tailwind & PWA Workbox
└── package.json

```

---

## Gestion de la Base de Données & Stockage Local

L'application utilise **Dexie.js** pour interagir avec **IndexedDB** directement dans le navigateur :

* **Persistence des données :** Toutes vos recettes, ingrédients, plannings et états de la liste de courses restent enregistrés en local, même après fermeture ou rafraîchissement du navigateur.
* **Purge automatique :** Un script d'assainissement intégré supprime automatiquement les repas planifiés de plus de 15 jours au démarrage pour conserver une base légère.
* **Fonctionnement hors-ligne :** Aucune connexion internet ou serveur distant n'est nécessaire après le premier chargement.

---

## Scripts Disponibles

* `npm run dev` : Lance l'application en mode développement avec Rechargement Rapide (HMR).
* `npm run build` : Vérifie les types TypeScript et compile le projet optimisé pour la production dans `/dist`.
* `npm run preview` : Prévisualise le build de production en local.
* `npm run lint` : Exécute ESLint pour vérifier la qualité du code.

---

## Installation de la PWA sur Mobile

1. Ouvrez l'application dans **Chrome** sur Android (ou sur Desktop).
2. Cliquez sur le menu de votre navigateur ou sur la bannière d'installation.
3. Sélectionnez **"Ajouter à l'écran d'accueil"** / **"Installer l'application"**.

---

## 📄 Licence

Ce projet est sous licence **CC BY-NC 4.0 (Non-Commercial)**.
