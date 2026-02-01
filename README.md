# Life Manager

Application React modulaire de gestion de vie personnelle. Gérez vos tâches, votre bibliothèque et la maintenance de vos véhicules, le tout stocké localement dans votre navigateur.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## 🚀 Fonctionnalités

### Module Todo List
- ✅ CRUD complet des tâches
- 📂 Catégorisation (travail, personnel, urgent, etc.)
- 🎯 Priorités (haute, moyenne, basse)
- 📅 Dates d'échéance avec rappels visuels
- 🔍 Recherche et filtres avancés
- 📆 Vue calendrier intégrée

### Module Bibliothèque
- 📚 Gestion complète de vos lectures
- 📖 Statuts (à lire, en cours, lu, abandonné)
- ⭐ Notes et évaluations
- 📊 Statistiques de lecture détaillées
- 🏷️ Genres et catégories

### Module Véhicules
- 🚗 Gestion multi-véhicules
- 🔧 Historique des interventions
- 💰 Suivi des coûts
- ⏰ Rappels de maintenance (date ou kilométrage)
- 📋 Intégration automatique avec les tâches

## 🛠️ Installation

```bash
# Cloner le projet
git clone <repository-url>
cd life-manager

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

## 📁 Structure du projet

```
src/
├── components/
│   ├── common/          # Composants réutilisables (Button, Modal, Card...)
│   ├── layout/          # Header, Sidebar, MainLayout
│   └── modules/         # Dashboard, Settings
├── modules/
│   ├── todo/            # Module Todo List
│   ├── library/         # Module Bibliothèque
│   └── vehicles/        # Module Véhicules
├── hooks/               # Hooks personnalisés
├── context/             # Contextes React
├── utils/               # Utilitaires et constantes
├── services/            # Services (intégration Todo)
├── config/              # Configuration des modules
└── styles/              # Styles globaux
```

## 🧩 Ajouter un nouveau module

1. Créer le dossier du module dans `src/modules/[nom-module]/`
2. Suivre la structure standard :
   ```
   modules/[nom-module]/
   ├── index.js              # Export principal
   ├── [Module].jsx          # Composant principal
   ├── components/           # Sous-composants
   └── hooks/                # Hooks spécifiques (optionnel)
   ```
3. Ajouter la configuration dans `src/config/modules.js`
4. Ajouter la route dans `src/App.jsx`
5. Ajouter la collection dans `src/context/AppContext.jsx` si nécessaire

## 💾 Stockage des données

Toutes les données sont stockées dans le `localStorage` du navigateur :
- Limite : ~5 Mo
- Synchronisation entre onglets
- Export/Import en JSON

### Clés de stockage
- `life-manager-todos` : Tâches
- `life-manager-books` : Livres
- `life-manager-vehicles` : Véhicules
- `life-manager-interventions` : Interventions
- `life-manager-theme` : Préférence de thème

## 🎨 Personnalisation

### Thème
Le thème clair/sombre est géré via Tailwind CSS avec la classe `dark`. Les couleurs sont définies dans `tailwind.config.js`.

### Styles
Les composants utilisent des classes CSS personnalisées définies dans `src/styles/index.css` :
- `.card` : Cartes avec ombre
- `.btn` : Boutons avec variantes
- `.input` : Champs de formulaire
- `.badge` : Badges colorés

## 🔧 Technologies

- **React 18** avec hooks
- **React Router v6** pour le routing
- **Tailwind CSS 3** pour les styles
- **Lucide React** pour les icônes
- **Vite** pour le build

## 📱 Responsive

L'application est entièrement responsive :
- Mobile : Menu hamburger, layout empilé
- Tablet : Layout adaptatif
- Desktop : Sidebar fixe, grilles optimisées

## 🚀 Déploiement

### Netlify
```bash
npm run build
# Déployer le dossier 'dist'
```

### Autres plateformes
L'application est statique et peut être déployée sur n'importe quel hébergement statique (Vercel, GitHub Pages, etc.)

## 📄 Licence

MIT

---

Développé avec ❤️ en React et Tailwind CSS



📁 Racine du projet (/life-manager/)
FichierDescriptionpackage.jsonDépendances npmvite.config.jsConfiguration Vitetailwind.config.jsConfiguration Tailwindpostcss.config.jsConfiguration PostCSSindex.htmlPoint d'entrée HTMLREADME.mdDocumentation
📁 /public/
FichierDescriptionfavicon.svgIcône de l'app
📁 /src/
FichierDescriptionmain.jsxPoint d'entrée ReactApp.jsxComposant principal avec routing
📁 /src/styles/
FichierDescriptionindex.cssStyles globaux Tailwind
📁 /src/utils/
FichierDescriptionconstants.jsConstantes globaleshelpers.jsFonctions utilitairesindex.jsExport des utils
📁 /src/hooks/
FichierDescriptionuseLocalStorage.jsHook localStorageuseUtils.jsHooks utilitairesindex.jsExport des hooks
📁 /src/context/
FichierDescriptionThemeContext.jsxContexte thème clair/sombreToastContext.jsxContexte notificationsAppContext.jsxContexte principal (données)index.jsExport des contextes
📁 /src/config/
FichierDescriptionmodules.jsConfiguration des modules
📁 /src/services/
FichierDescriptiontodoIntegration.jsService d'intégration Todo
📁 /src/components/common/
FichierDescriptionButton.jsxBouton réutilisableInput.jsxChamp de saisieSelect.jsxListe déroulanteTextarea.jsxZone de texteCheckbox.jsxCase à cocherModal.jsxFenêtre modaleCard.jsxCarteBadge.jsxBadge/étiquetteToastContainer.jsxConteneur notificationsEmptyState.jsxÉtat videConfirmDialog.jsxDialog de confirmationSearchInput.jsxChamp de rechercheStarRating.jsxNotation étoilesindex.jsExport des composants
📁 /src/components/layout/
FichierDescriptionHeader.jsxEn-têteSidebar.jsxMenu latéralMainLayout.jsxLayout principalindex.jsExport des layouts
📁 /src/components/modules/
FichierDescriptionDashboard.jsxPage tableau de bordSettingsPage.jsxPage paramètres
📁 /src/modules/todo/
FichierDescriptionTodoModule.jsxComposant principal Todoindex.jsExport du module
📁 /src/modules/todo/components/
FichierDescriptionTodoList.jsxListe des tâchesTodoItem.jsxÉlément de tâcheTodoForm.jsxFormulaire tâcheTodoCalendar.jsxVue calendrier
📁 /src/modules/library/
FichierDescriptionLibraryModule.jsxComposant principal Bibliothèqueindex.jsExport du module
📁 /src/modules/library/components/
FichierDescriptionBookGrid.jsxGrille de livresBookCard.jsxCarte de livreBookList.jsxListe de livresBookForm.jsxFormulaire livreBookStats.jsxStatistiques lecture
📁 /src/modules/vehicles/
FichierDescriptionVehiclesModule.jsxComposant principal Véhiculesindex.jsExport du module
📁 /src/modules/vehicles/components/
FichierDescriptionVehicleCard.jsxCarte de véhiculeVehicleForm.jsxFormulaire véhiculeVehicleDetail.jsxDétail véhiculeInterventionForm.jsxFormulaire intervention