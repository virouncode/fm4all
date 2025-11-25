# Banque Mémoire de Cline

Ce répertoire contient la Banque Mémoire de Cline - un système de documentation structuré qui permet à Cline de maintenir une continuité parfaite entre les sessions de travail malgré les resets mémoire.

## Objectif

La Banque Mémoire sert de base de connaissances persistante de Cline pour le projet FM4ALL. Elle contient une documentation complète sur les exigences du projet, l'architecture, le contexte technique, le statut actuel et les travaux en cours.

## Fichiers Principaux

1. **projectbrief.md**
   - Document fondamental qui façonne tous les autres fichiers
   - Définit les exigences fondamentales et les objectifs
   - Source de vérité pour le périmètre du projet

2. **productContext.md**
   - Pourquoi ce projet existe
   - Problèmes qu'il résout
   - Comment il devrait fonctionner
   - Objectifs d'expérience utilisateur

3. **activeContext.md**
   - Focus de travail actuel
   - Changements récents
   - Prochaines étapes
   - Décisions actives et considérations
   - Patterns et préférences importants
   - Apprentissages et insights du projet

4. **systemPatterns.md**
   - Architecture système
   - Décisions techniques clés
   - Patterns de conception en usage
   - Relations entre composants
   - Chemins d'implémentation critiques

5. **techContext.md**
   - Technologies utilisées
   - Configuration de développement
   - Contraintes techniques
   - Dépendances
   - Patterns d'usage des outils

6. **progress.md**
   - Ce qui fonctionne
   - Ce qui reste à construire
   - Statut actuel
   - Problèmes connus
   - Évolution des décisions du projet

7. **.clinerules**
   - Intelligence du projet
   - Chemins d'implémentation critiques
   - Préférences utilisateur et workflow
   - Patterns spécifiques au projet
   - Défis connus
   - Patterns d'usage des outils

## Directives d'Utilisation

1. **Lecture de la Banque Mémoire**
   - Cline lit TOUS les fichiers de la banque mémoire au début de CHAQUE tâche
   - Cela assure un contexte et une continuité complète

2. **Mise à Jour de la Banque Mémoire**
   - Les mises à jour se produisent quand :
     - Découverte de nouveaux patterns du projet
     - Après implémentation de changements significatifs
     - Quand l'utilisateur demande avec "update memory bank"
     - Quand le contexte nécessite une clarification

3. **Maintenance de la Banque Mémoire**
   - Maintenir les fichiers à jour avec le dernier statut du projet
   - S'assurer que les informations sont précises et complètes
   - Se concentrer sur la capture d'insights et patterns clés

4. **Extension de la Banque Mémoire**
   - Créer des fichiers/dossiers additionnels quand ils aident à organiser :
     - Documentation de fonctionnalités complexes
     - Spécifications d'intégration
     - Documentation API
     - Stratégies de tests
     - Procédures de déploiement

## Structure de la Banque Mémoire

Les fichiers de la Banque Mémoire s'appuient les uns sur les autres dans une hiérarchie claire :

```
projectbrief.md → productContext.md
                → systemPatterns.md
                → techContext.md

                  productContext.md
                  systemPatterns.md → activeContext.md → progress.md
                  techContext.md
```

Cette structure assure que l'information coule logiquement des concepts fondamentaux au statut actuel et aux plans futurs.

## Importance

La Banque Mémoire est le seul lien de Cline avec les travaux précédents. Elle doit être maintenue avec précision et clarté, car l'efficacité de Cline dépend entièrement de sa précision.
