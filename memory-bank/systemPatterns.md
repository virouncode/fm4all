# Patterns Système : Plateforme de Devis de Services FM4ALL

## Architecture Système

La plateforme FM4ALL semble être construite avec une architecture d'application web moderne avec les composants clés suivants :

1. **Framework Frontend**
   - Next.js comme framework React
   - Rendu côté serveur et hydratation côté client
   - Pattern App Router avec routage basé sur les fichiers

2. **Services Backend**
   - Server Actions pour les mutations de données
   - Routes API pour les intégrations externes
   - Sanity CMS pour la gestion de contenu

3. **Gestion des Données**
   - Drizzle ORM pour les opérations de base de données
   - Zod pour la validation de schémas et la sécurité de types
   - Context API pour la gestion d'état

4. **Fonctionnalités Temps Réel**
   - Pusher pour les mises à jour temps réel
   - Système d'invalidation de cache pour la fraîcheur des données

## Décisions Techniques Clés

1. **Next.js App Router**
   - Système de routage basé sur les fichiers
   - Composants serveur pour performance améliorée
   - Internationalisation via paramètres de route ([locale])

2. **Gestion d'État**
   - React Context API pour l'état global
   - Pattern Provider pour l'état spécifique aux services
   - Hooks pour consommer et mettre à jour l'état

3. **Validation des Données**
   - Schémas Zod pour la validation runtime
   - TypeScript pour la vérification de types statique
   - Gestion de formulaires basée sur les schémas

4. **Approche de Stylisation**
   - Tailwind CSS pour la stylisation utility-first
   - Bibliothèque de composants UI basée sur les composants
   - Patterns de design responsive

5. **Récupération de Données**
   - Server Actions pour les mutations de données
   - Stratégie cache-first avec invalidation
   - Mises à jour temps réel via Pusher

## Patterns de Conception en Usage

1. **Pattern Provider**
   - Fournisseurs de contexte pour différents domaines de services
   - Gestion d'état hiérarchique
   - Exemple : `NettoyageProvider.tsx`, `HygieneProvider.tsx`

2. **Pattern Observer**
   - Listeners d'invalidation de cache
   - Mises à jour de données temps réel via Pusher
   - Exemple : `CacheInvalidationListener.tsx`

3. **Pattern Factory**
   - Factories de configuration de services
   - Génération de formulaires dynamiques
   - Structures de données standardisées

4. **Pattern Repository**
   - Accès aux données abstrait
   - Opérations de données centralisées
   - Exemple : Fichiers Actions comme `nettoyageTarifsAction.ts`

5. **Pattern Strategy**
   - Différentes stratégies de tarification
   - Logique de calcul spécifique aux services
   - Modules de services pluggables

6. **Pattern Composite**
   - Construction d'UIs complexes à partir de composants simples
   - Hiérarchies de composants imbriqués
   - Blocs de construction UI réutilisables

## Relations entre Composants

1. **Composants de Page**
   - Composants de niveau supérieur qui représentent les routes
   - Composent plusieurs composants de fonctionnalités
   - Gèrent l'état et les effets au niveau page

2. **Composants de Fonctionnalités**
   - Implémentent des fonctionnalités métier spécifiques
   - Consomment le contexte des fournisseurs
   - Exemple : `NettoyagePropositions.tsx`

3. **Composants UI**
   - Composants réutilisables et de présentation
   - Stylés avec Tailwind CSS
   - Situés dans `src/components/ui/`

4. **Composants Provider**
   - Gèrent l'état pour des domaines spécifiques
   - Fournissent le contexte aux composants enfants
   - Exemple : `NettoyageProvider.tsx`

5. **Relations des Hooks**
   - Les hooks personnalisés consomment le contexte
   - Les hooks fournissent une logique réutilisable
   - Exemple : `use-nettoyage-tarifs-watcher.ts`

6. **Relations des Actions**
   - Les server actions sont appelées depuis les composants
   - Les actions effectuent les mutations de données
   - Exemple : `nettoyageTarifsAction.ts`

## Chemins d'Implémentation Critiques

1. **Flux de Génération de Devis**
   1. L'utilisateur saisit les informations des locaux
   2. Sélectionne les services désirés
   3. Configure les détails des services
   4. Le système calcule la tarification
   5. Le devis est généré et présenté

2. **Flux d'Invalidation de Cache**
   1. Les données sont mises à jour via une server action
   2. L'événement d'invalidation de cache est déclenché
   3. Pusher diffuse l'événement
   4. Les listeners reçoivent l'événement
   5. Les composants affectés se re-rendent avec des données fraîches

3. **Flux de Configuration de Services**
   1. L'utilisateur sélectionne une catégorie de service
   2. Le formulaire spécifique au service est présenté
   3. L'utilisateur configure les paramètres du service
   4. Les mises à jour de tarification temps réel sont affichées
   5. La configuration est sauvegardée dans le devis

4. **Flux d'Internationalisation**
   1. Le locale de l'utilisateur est détecté ou sélectionné
   2. Les traductions appropriées sont chargées
   3. L'UI se rend dans la langue sélectionnée
   4. Les routes incluent le paramètre locale
   5. Le contenu est affiché dans la langue correcte

5. **Flux de Tests**
   1. Les tests unitaires vérifient les fonctions utilitaires
   2. Les tests de composants vérifient le rendu et les interactions
   3. Les mocks simulent les dépendances et services externes
   4. Les tests reflètent la structure du code source
   5. Vitest exécute les tests dans un environnement DOM simulé

## Patterns de Tests

1. **Pattern de Tests de Composants**
   - Les tests reflètent la structure du code source dans `src/__tests__/`
   - Chaque composant a un fichier de test correspondant
   - Les tests vérifient le rendu, la logique conditionnelle et les interactions
   - Exemple : `author.test.tsx` teste le composant `Author.tsx`

2. **Pattern Mock**
   - Mocks centralisés dans `src/__tests__/components/mocks.tsx`
   - Fonctions mock pour les dépendances externes
   - Composants mock pour les éléments UI
   - Exemple : `mockUIButton()`, `mockNavigation()`, `mockNextIntl()`

3. **Pattern d'Assertion**
   - Requêtes Testing Library pour trouver les éléments
   - Matchers Jest DOM pour les assertions
   - Vérification de la présence, attributs et contenu
   - Exemple : `expect(screen.getByText(/jean dupont/i)).toBeInTheDocument()`

4. **Pattern de Tests d'Utilitaires**
   - Tests directs de fonctions pour les utilitaires
   - Cas de tests multiples pour différents scénarios
   - Focus sur la vérification entrée/sortie
   - Exemple : `capitalize.test.ts` teste l'utilitaire `capitalize`

Ce document sera mis à jour au fur et à mesure que plus de patterns sont découverts ou implémentés dans le système.
