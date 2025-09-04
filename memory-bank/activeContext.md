# Active Context: FM4ALL Service Quotation Platform

## Current Work Focus

La priorité de développement actuelle est l'amélioration du système d'invalidation de cache et l'optimisation des requêtes de services, avec un accent particulier sur :

1. **Système d'Invalidation de Cache**
   - Perfectionnement du système de mise à jour en temps réel des données de tarification via Pusher
   - Garantie de la cohérence des données entre les sessions utilisateurs avec debouncing et suivi des événements
   - Développement de composants d'écoute d'invalidation de cache (`CacheInvalidationListener.tsx`, `PortalCacheInvalidationListener.tsx`)
   - Gestion des scénarios complexes d'invalidation de cache avec une gestion appropriée des erreurs

2. **Optimisation des Requêtes de Services**
   - Refactorisation des requêtes pour différents services (`getHygiene.ts`, `getIncendie.ts`, `getMaintenance.ts`, `getNettoyage.ts`, `getServices.ts`)
   - Amélioration de la performance et de la fiabilité des requêtes de données
   - Mise en place de stratégies de mise en cache efficaces pour les données de services
   - Intégration avec le système d'invalidation de cache pour des mises à jour cohérentes

3. **Real-time Quote Recalculation**
   - Implementing service-specific pricing calculations based on updated tarifs
   - Ensuring quotes reflect the latest pricing data through cache invalidation
   - Providing user notifications when prices are updated
   - Handling edge cases like partial updates and validation failures

4. **Quote Reset Functionality**
   - Implementing mechanisms to reset or reinitialize quotes (`reinitialisationDevis.ts`, `fullReinitialisationDevis.tsx`)
   - Handling partial and full quote resets
   - Ensuring proper state management during resets
   - Maintaining data consistency across multiple service contexts

## Changements Récents

D'après les fichiers ouverts et l'examen du code, les travaux récents comprennent :

1. **Amélioration du Système d'Invalidation de Cache**
   - Perfectionnement de `CacheInvalidationListener.tsx` et `PortalCacheInvalidationListener.tsx` avec debouncing et prévention des événements dupliqués
   - Mise en place d'une route API dédiée pour l'invalidation du cache (`invalidate-cache/route.ts`)
   - Optimisation de la gestion des données spécifiques aux services dans les événements d'invalidation de cache
   - Ajout de journalisation détaillée pour les événements d'invalidation de cache

2. **Refactorisation des Requêtes de Services**
   - Optimisation des requêtes pour les services d'hygiène, d'incendie, de maintenance et de nettoyage
   - Amélioration de la structure et de l'organisation des requêtes pour une meilleure maintenabilité
   - Mise en œuvre de stratégies de mise en cache efficaces pour les données de services
   - Standardisation des patterns de requêtes à travers les différents services

3. **Améliorations de l'Interface Utilisateur**
   - Travail sur les composants de la page d'accueil (`Hero.tsx`, `HeroCard.tsx`)
   - Optimisation des arrière-plans et des éléments visuels (`BackgroundServer.tsx`)
   - Amélioration de la page de contact pour une meilleure expérience utilisateur
   - Perfectionnement de l'interface responsive pour tous les appareils

4. **Context Management Optimization**
   - Refined state management in service providers (e.g., `NettoyageProvider.tsx`)
   - Improved localStorage persistence for quote data
   - Enhanced initialization logic for service contexts
   - Added conditional rendering for client-side components

## Prochaines Étapes

Sur la base du focus de travail actuel, les prochaines étapes potentielles comprennent :

1. **Finalisation du Système d'Invalidation de Cache**
   - Extension du pattern d'écouteur d'invalidation à d'autres parties de l'application
   - Implémentation d'un filtrage et d'une priorisation des événements plus sophistiqués
   - Ajout d'un support hors ligne avec gestion de file d'attente
   - Amélioration de la surveillance des performances pour les mises à jour en temps réel

2. **Amélioration des Performances des Requêtes**
   - Optimisation supplémentaire des requêtes de services pour réduire la latence
   - Mise en œuvre de stratégies de préchargement pour les données fréquemment utilisées
   - Développement de mécanismes de mise en cache plus avancés
   - Mise en place de métriques de performance pour surveiller l'efficacité des requêtes

3. **Enrichissement de l'Interface Utilisateur**
   - Développement de nouvelles fonctionnalités pour le site vitrine
   - Amélioration de l'expérience utilisateur sur la page de contact
   - Optimisation des composants visuels et des arrière-plans
   - Perfectionnement de l'accessibilité et de l'internationalisation

4. **Testing and Optimization**
   - Implement component tests using Vitest and Testing Library
   - Create centralized mocks for common dependencies
   - Organize tests to mirror the source code structure
   - Implement comprehensive test coverage for UI components and utilities
   - Perform end-to-end testing of the quotation flow with real-time updates
   - Optimize performance of cache invalidation system
   - Conduct load testing for concurrent pricing updates

## Décisions et Considérations Actives

Décisions techniques et produit actuellement à l'étude :

1. **Raffinement de la Stratégie de Cache**
   - Comment gérer les événements d'invalidation de cache à haute fréquence
   - Quand utiliser des mises à jour de contexte ciblées vs des rafraîchissements complets de page
   - Comment équilibrer la mise en cache côté client avec la fraîcheur des données
   - Stratégies pour gérer les échecs réseau pendant l'invalidation du cache

2. **Approche de Gestion des Requêtes**
   - Évaluation de différentes stratégies de mise en cache pour les requêtes de services
   - Considération des implications de performance pour les requêtes complexes
   - Gestion des interdépendances entre les différents services
   - Exploration d'alternatives pour optimiser les requêtes dans des cas spécifiques

3. **Expérience Utilisateur du Site Vitrine**
   - Comment améliorer l'engagement des utilisateurs sur la page d'accueil
   - Quand utiliser des animations vs des éléments statiques pour l'interface
   - Comment présenter les services de manière claire et attrayante
   - Équilibrer l'esthétique avec la performance et les temps de chargement

4. **Performance Considerations**
   - Optimizing real-time updates without excessive re-renders
   - Managing large state objects efficiently
   - Ensuring responsive UI during complex calculations
   - Handling concurrent updates from multiple suppliers

## Important Patterns and Preferences

Based on the observed code structure and implementation:

1. **File Organization**
   - Feature-based organization within the app directory
   - Service-specific components in dedicated directories
   - Separation of desktop and mobile components
   - Clear separation of actions, components, and hooks

2. **Naming Conventions**
   - PascalCase for React components and TypeScript types
   - camelCase for functions, variables, and files
   - French terms for domain-specific concepts (e.g., "devis" for quote, "nettoyage" for cleaning)
   - Descriptive, domain-specific naming

3. **State Management**
   - React Context for global and domain-specific state
   - Custom hooks for consuming and updating state
   - Server Actions for data mutations
   - Local storage for persistence between sessions

4. **Component Structure**
   - Separation of form and display components
   - Feature-specific components organized by service type
   - Reusable UI components in dedicated directories
   - Clear separation of concerns between components

## Testing Approach

The project uses a comprehensive testing approach with the following characteristics:

1. **Test Organization**
   - Tests are organized in `src/__tests__/` mirroring the source structure
   - Component tests in `components/` directory
   - Utility tests in `utils/` directory
   - Centralized mocks in `components/mocks.tsx`

2. **Component Testing**
   - Testing rendering with different props
   - Verifying conditional rendering logic
   - Testing user interactions
   - Mocking dependencies like UI components, navigation, and internationalization
   - Example: `author.test.tsx` tests all rendering scenarios of the Author component

3. **Utility Testing**
   - Direct function testing with multiple scenarios
   - Focus on input/output verification
   - Comprehensive edge case coverage
   - Example: `capitalize.test.ts` tests various string capitalization scenarios

4. **Mock Implementation**
   - Centralized mock functions in `mocks.tsx`
   - Mock UI components to simplify testing
   - Mock navigation functions to test routing behavior
   - Mock internationalization to test with consistent locale

5. **Testing Tools**
   - Vitest as the test runner
   - Testing Library for component queries
   - Jest DOM for extended matchers
   - JSDOM for browser environment simulation

## Learnings and Project Insights

Key insights from the current development work:

1. **Real-time Data Challenges**
   - Managing cache invalidation across multiple services requires careful coordination
   - Debouncing and event deduplication are essential for stable real-time updates
   - Balancing immediate updates with system stability is an ongoing challenge
   - Providing clear user feedback for background updates improves user experience

2. **Complex State Management**
   - Service-specific context updaters improve maintainability
   - Targeted state updates perform better than full context replacements
   - Local storage persistence requires careful synchronization
   - Clear separation of concerns in state management simplifies debugging

3. **Form Management Complexity**
   - Visual indicators for modified fields improve user experience
   - Validation at both client and server sides ensures data integrity
   - Optimistic UI updates with proper error handling improve perceived performance
   - Sorting and categorization of form data improves usability

4. **Pricing Logic Complexity**
   - Service pricing involves multiple variables and conditions
   - Real-time pricing updates need to be efficient and accurate
   - Zod schemas help ensure data integrity for pricing calculations
   - Proper transformation between display and storage formats is essential

This document will be updated as the active context evolves with ongoing development work.
