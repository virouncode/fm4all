# Contexte Technique : Plateforme de Devis de Services FM4ALL

## Technologies Utilisées

### Frontend

- **Next.js** : Framework React pour applications rendues côté serveur
- **React** : Bibliothèque JavaScript pour construire des interfaces utilisateur
- **TypeScript** : Superset typé de JavaScript
- **Tailwind CSS** : Framework CSS utility-first
- **shadcn/ui** : Bibliothèque de composants basée sur Radix UI

### Backend

- **Routes API Next.js** : Fonctions serverless pour les endpoints API
- **Server Actions** : Fonctionnalité Next.js pour les mutations côté serveur
- **Drizzle ORM** : ORM TypeScript pour bases de données SQL
- **Sanity CMS** : Système de gestion de contenu headless
- **Pusher** : Communication websocket temps réel

### Validation de Données & Sécurité de Types

- **Zod** : Bibliothèque de validation de schémas
- **TypeScript** : Vérification de types statique

### Internationalisation

- **next-intl** : Bibliothèque d'internationalisation pour Next.js
- **Fichiers de messages** : Fichiers de traduction basés sur JSON

### Authentification

- **NextAuth.js** : Solution d'authentification pour Next.js
- **JWT** : JSON Web Tokens pour la gestion de sessions

### Build & Développement

- **pnpm** : Gestionnaire de paquets rapide et économe en espace disque
- **ESLint** : Utilitaire de linting JavaScript
- **Prettier** : Formateur de code
- **PostCSS** : Outil pour transformer le CSS avec JavaScript

## Configuration de Développement

### Environnement

- **Node.js** : Runtime JavaScript
- **TypeScript** : Langage de programmation
- **pnpm** : Gestionnaire de paquets
- **Serveur de développement Next.js** : Environnement de développement local

### Fichiers de Configuration

- **next.config.ts** : Configuration Next.js
- **tsconfig.json** : Configuration TypeScript
- **drizzle.config.ts** : Configuration Drizzle ORM
- **eslint.config.mjs** : Configuration ESLint
- **postcss.config.mjs** : Configuration PostCSS

### Variables d'Environnement

- **.env.local** : Variables d'environnement locales
- **.env.local** : Variables d'environnement spécifiques au développement

## Contraintes Techniques

### Performance

- **Rendu Côté Serveur** : Critique pour le SEO et les performances de chargement initial
- **Hydratation Côté Client** : Pour les composants interactifs
- **Assets Optimisés** : Pour des chargements de page rapides
- **Gestion d'État Efficace** : Pour éviter les re-rendus inutiles

### Scalabilité

- **Architecture Basée sur les Composants** : Pour la maintenabilité et la réutilisabilité
- **Design Modulaire** : Les modules de services peuvent être ajoutés/supprimés indépendamment
- **Composants Sans État** : Quand possible pour de meilleures performances

### Sécurité

- **Validation des Entrées** : Utilisation des schémas Zod
- **Authentification** : Authentification utilisateur sécurisée
- **Autorisation** : Contrôle d'accès basé sur les rôles
- **Protection des Données** : Gestion sécurisée des données utilisateur

### Accessibilité

- **Conformité WCAG** : Directives d'accessibilité du contenu web
- **Navigation Clavier** : Support complet du clavier
- **Support des Lecteurs d'Écran** : HTML sémantique et attributs ARIA

### Compatibilité Navigateur

- **Navigateurs Modernes** : Chrome, Firefox, Safari, Edge
- **Amélioration Progressive** : Fonctionnalités de base fonctionnent dans tous les navigateurs
- **Design Responsive** : Fonctionne sur toutes les tailles d'appareil

## Dépendances

### Dépendances Principales

- **next** : Framework React
- **react** : Bibliothèque UI
- **react-dom** : Méthodes spécifiques au DOM pour React
- **typescript** : Langage TypeScript
- **tailwindcss** : Framework CSS
- **drizzle-orm** : ORM de base de données
- **zod** : Validation de schémas
- **pusher** : Mises à jour temps réel
- **pusher-js** : Client Pusher
- **next-intl** : Internationalisation
- **sanity** : Gestion de contenu

### Dépendances de Développement

- **eslint** : Linting de code
- **prettier** : Formatage de code
- **postcss** : Traitement CSS
- **autoprefixer** : Préfixage CSS vendor
- **@types/react** : Types TypeScript pour React
- **@types/node** : Types TypeScript pour Node.js

## Patterns d'Usage des Outils

### Récupération de Données

- Server Actions pour les mutations de données
- Composants Serveur pour le chargement initial des données
- Composants Client pour les éléments UI interactifs
- Stratégie cache-first avec invalidation

### Gestion d'État

- React Context pour l'état global
- Pattern Provider pour l'état spécifique aux services
- Hooks personnalisés pour consommer l'état
- Pusher pour les mises à jour temps réel

### Gestion des Formulaires

- Composants contrôlés
- Validation par schémas Zod
- Gestion et affichage des erreurs
- Feedback de validation temps réel

### Stylisation

- Classes utilitaires Tailwind CSS
- Stylisation basée sur les composants
- Patterns de design responsive
- Personnalisation de thème

### Tests

- **Vitest** : Framework de tests pour les tests unitaires et de composants
- **Testing Library** : Pour tester les composants React
- **Jest DOM** : Matchers étendus pour éléments DOM
- **JSDOM** : Simulation d'environnement navigateur
- **Structure des Tests** :
  - Tests unitaires pour les fonctions utilitaires
  - Tests de composants pour les éléments UI
  - Organisés dans `src/__tests__/` reflétant la structure source
- **Patterns de Tests** :
  - Tests de rendu de composants
  - Tests d'interaction utilisateur
  - Tests de rendu conditionnel
  - Implémentations de mocks pour les dépendances
  - Mocks centralisés dans `src/__tests__/components/mocks.tsx`
- **Scripts de Tests** :
  - `npm test` : Exécuter tous les tests
  - `npm run test:watch` : Exécuter les tests en mode watch
  - `npm run test:coverage` : Exécuter les tests avec rapport de couverture

Ce document sera mis à jour au fur et à mesure que le contexte technique évolue ou que de nouvelles technologies sont introduites dans le projet.
