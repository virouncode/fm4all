# Contexte Actif : Plateforme de Devis de Services FM4ALL

## Focus de Travail Actuel

La priorité de développement actuelle est l'amélioration continue du système d'invalidation de cache et l'optimisation des requêtes de services, avec un accent particulier sur :

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

3. **Recalcul des Devis en Temps Réel**
   - Implémentation des calculs de prix spécifiques aux services basés sur les tarifs mis à jour
   - Garantie que les devis reflètent les dernières données de tarification via l'invalidation du cache
   - Fourniture de notifications utilisateur lors des mises à jour de prix
   - Gestion des cas limites comme les mises à jour partielles et les échecs de validation

4. **Fonctionnalité de Réinitialisation des Devis**
   - Implémentation des mécanismes de réinitialisation des devis (`initialisationDevis.ts`, `fullReinitialisationDevis.tsx`)
   - Gestion des réinitialisations partielles et complètes des devis
   - Garantie d'une gestion d'état appropriée pendant les réinitialisations
   - Maintien de la cohérence des données entre multiples contextes de services

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

4. **Optimisation de la Gestion de Contexte**
   - Perfectionnement de la gestion d'état dans les fournisseurs de services (ex: `NettoyageProvider.tsx`)
   - Amélioration de la persistance localStorage pour les données de devis
   - Logique d'initialisation améliorée pour les contextes de services
   - Ajout de rendu conditionnel pour les composants côté client

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

4. **Tests et Optimisation**
   - Implémentation de tests de composants avec Vitest et Testing Library
   - Création de mocks centralisés pour les dépendances communes
   - Organisation des tests pour refléter la structure du code source
   - Implémentation d'une couverture de tests complète pour les composants UI et utilitaires
   - Réalisation de tests end-to-end du flux de devis avec mises à jour en temps réel
   - Optimisation des performances du système d'invalidation de cache
   - Tests de charge pour les mises à jour de prix concurrentes

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

4. **Considérations de Performance**
   - Optimisation des mises à jour en temps réel sans re-rendus excessifs
   - Gestion efficace des objets d'état volumineux
   - Garantie d'une interface utilisateur réactive pendant les calculs complexes
   - Gestion des mises à jour concurrentes de plusieurs fournisseurs

## Patterns et Préférences Importants

Basé sur la structure de code observée et l'implémentation :

1. **Organisation des Fichiers**
   - Organisation basée sur les fonctionnalités dans le répertoire app
   - Composants spécifiques aux services dans des répertoires dédiés
   - Séparation des composants desktop et mobile
   - Séparation claire entre actions, composants et hooks

2. **Conventions de Nommage**
   - PascalCase pour les composants React et les types TypeScript
   - camelCase pour les fonctions, variables et fichiers
   - Termes français pour les concepts spécifiques au domaine (ex: "devis" pour quote, "nettoyage" pour cleaning)
   - Nommage descriptif et spécifique au domaine

3. **Gestion d'État**
   - React Context pour l'état global et spécifique au domaine
   - Hooks personnalisés pour consommer et mettre à jour l'état
   - Server Actions pour les mutations de données
   - Local storage pour la persistance entre les sessions

4. **Structure des Composants**
   - Séparation des composants de formulaire et d'affichage
   - Composants spécifiques aux fonctionnalités organisés par type de service
   - Composants UI réutilisables dans des répertoires dédiés
   - Séparation claire des préoccupations entre les composants

## Approche de Tests

Le projet utilise une approche de tests complète avec les caractéristiques suivantes :

1. **Organisation des Tests**
   - Les tests sont organisés dans `src/__tests__/` reflétant la structure du code source
   - Tests de composants dans le répertoire `components/`
   - Tests d'utilitaires dans le répertoire `utils/`
   - Mocks centralisés dans `components/mocks.tsx`

2. **Tests de Composants**
   - Test du rendu avec différentes props
   - Vérification de la logique de rendu conditionnel
   - Tests des interactions utilisateur
   - Mocking des dépendances comme les composants UI, la navigation et l'internationalisation
   - Exemple : `author.test.tsx` teste tous les scénarios de rendu du composant Author

3. **Tests d'Utilitaires**
   - Tests directs des fonctions avec plusieurs scénarios
   - Focus sur la vérification entrée/sortie
   - Couverture complète des cas limites
   - Exemple : `capitalize.test.ts` teste divers scénarios de capitalisation de chaînes

4. **Implémentation de Mocks**
   - Fonctions de mock centralisées dans `mocks.tsx`
   - Mock des composants UI pour simplifier les tests
   - Mock des fonctions de navigation pour tester le comportement de routage
   - Mock de l'internationalisation pour tester avec une locale cohérente

5. **Outils de Tests**
   - Vitest comme test runner
   - Testing Library pour les requêtes de composants
   - Jest DOM pour les matchers étendus
   - JSDOM pour la simulation d'environnement navigateur

## Apprentissages et Insights du Projet

Insights clés du travail de développement actuel :

1. **Défis des Données en Temps Réel**
   - Gérer l'invalidation de cache à travers plusieurs services nécessite une coordination minutieuse
   - Le debouncing et la déduplication d'événements sont essentiels pour des mises à jour stables en temps réel
   - Équilibrer les mises à jour immédiates avec la stabilité du système est un défi continu
   - Fournir un feedback utilisateur clair pour les mises à jour en arrière-plan améliore l'expérience utilisateur

2. **Gestion d'État Complexe**
   - Les mises à jour de contexte spécifiques aux services améliorent la maintenabilité
   - Les mises à jour d'état ciblées performent mieux que les remplacements complets de contexte
   - La persistance local storage nécessite une synchronisation minutieuse
   - Une séparation claire des préoccupations dans la gestion d'état simplifie le débogage

3. **Complexité de Gestion des Formulaires**
   - Les indicateurs visuels pour les champs modifiés améliorent l'expérience utilisateur
   - La validation côté client et serveur assure l'intégrité des données
   - Les mises à jour UI optimistes avec gestion d'erreur appropriée améliorent la performance perçue
   - Le tri et la catégorisation des données de formulaire améliorent l'utilisabilité

4. **Complexité de la Logique de Tarification**
   - La tarification des services implique de multiples variables et conditions
   - Les mises à jour de prix en temps réel doivent être efficaces et précises
   - Les schémas Zod aident à assurer l'intégrité des données pour les calculs de prix
   - Une transformation appropriée entre les formats d'affichage et de stockage est essentielle

Ce document sera mis à jour au fur et à mesure que le contexte actif évolue avec le travail de développement en cours.
