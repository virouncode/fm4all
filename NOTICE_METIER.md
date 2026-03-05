# Notice métier FM4ALL — Règles de fonctionnement

> Ce document décrit les règles métier de la plateforme FM4ALL telles qu'elles sont implémentées.
> Il s'adresse aux équipes FM4ALL et aux responsables d'entreprises clientes qui administrent la plateforme.

---

## Table des matières

1. [Comptes & Authentification](#1-comptes--authentification)
2. [Gestion des utilisateurs](#2-gestion-des-utilisateurs)
3. [Gestion des sites](#3-gestion-des-sites)
4. [Module Tickets](#4-module-tickets)
5. [Module Prestations](#5-module-prestations)
6. [Module Entreprises](#6-module-entreprises)
7. [Module Mes Prestataires](#7-module-mes-prestataires)

---

## 1. Comptes & Authentification

### 1.1 Création d'un compte

Il n'existe **pas d'auto-inscription** sur la plateforme. Tout compte est créé par un administrateur ou un manager habilité.

À la création, l'utilisateur reçoit automatiquement un **email d'activation** contenant un lien pour définir son mot de passe. Sans cette activation, la connexion est impossible.

> Le lien d'activation est valable **24 heures**. Passé ce délai, l'administrateur doit renvoyer le lien depuis la fiche utilisateur.

### 1.2 Activation du compte

Le workflow d'activation est le suivant :

```
Admin crée le compte → Email d'activation envoyé → Utilisateur clique sur le lien
→ Définit son mot de passe → Compte actif
```

Tant que l'utilisateur n'a pas cliqué sur le lien et défini son mot de passe, son compte reste en état **"En attente"** et il ne peut pas se connecter.

### 1.3 Règles du mot de passe

Le mot de passe doit respecter les critères suivants :

- Au moins **8 caractères**
- Au moins **une lettre majuscule**
- Au moins **une lettre minuscule**
- Au moins **un chiffre**
- Au moins **un caractère spécial** (ex : `!`, `@`, `#`, `$`, `%`)

### 1.4 Réinitialisation du mot de passe

Un utilisateur peut demander à réinitialiser son mot de passe depuis la page de connexion. Un lien de réinitialisation lui est envoyé par email. Ce lien est valable **24 heures**.

### 1.5 Changement d'adresse email

Deux situations distinctes :

| Cas | Comportement |
|-----|-------------|
| **L'utilisateur change son propre email** | Un email de confirmation est envoyé à la **nouvelle adresse**. L'ancienne adresse reste active jusqu'à validation du lien. |
| **Un administrateur change l'email d'un autre utilisateur** | La nouvelle adresse est enregistrée immédiatement. L'utilisateur reçoit un lien de vérification sur sa nouvelle adresse et une notification sur son ancienne adresse. La connexion est bloquée jusqu'à validation du lien. |

> ⚠️ Un administrateur ne peut changer l'email que des utilisateurs de **son propre périmètre** (voir section 2.2 pour les règles de permissions). Les super administrateurs et opérateurs FM4ALL peuvent changer l'email de n'importe quel utilisateur.

### 1.6 Statuts d'un compte

| Statut | Signification | Connexion possible |
|--------|--------------|-------------------|
| **En attente** | Compte créé, email non encore vérifié | Non |
| **Actif** | Compte opérationnel | Oui |
| **Suspendu** | Compte temporairement désactivé | Non |

---

## 2. Gestion des utilisateurs

### 2.1 Rôles au sein d'une entreprise

Chaque utilisateur appartient à une entreprise avec un rôle défini. Ce rôle détermine ce qu'il peut voir et faire **à l'échelle de l'entreprise entière** (indépendamment des sites).

| Rôle | Niveau | Description |
|------|--------|-------------|
| **Administrateur** | 3 | Accès complet à la gestion de l'entreprise, des utilisateurs et des sites |
| **Manager** | 2 | Gestion de son équipe et de ses sites, dans les limites de sa branche hiérarchique |
| **Collaborateur** | 1 | Accès limité, agit principalement sur les sites qui lui sont attribués |

> **Règle fondamentale** : un utilisateur ne peut agir que sur des utilisateurs de **niveau strictement inférieur** au sien. Un manager (niveau 2) ne peut pas modifier un autre manager ni un administrateur.

### 2.2 Rôles plateforme (FM4ALL uniquement)

Les utilisateurs FM4ALL peuvent disposer en plus d'un rôle plateforme, qui leur donne accès à la vision transversale (toutes les entreprises clientes).

| Rôle plateforme | Description |
|----------------|-------------|
| **Super administrateur plateforme** | Accès total, toutes entreprises, tous droits |
| **Opérateur plateforme** | Opérations courantes sur toutes les entreprises clientes |

### 2.3 Organisation des utilisateurs en arborescence

Les utilisateurs d'une entreprise sont organisés en **hiérarchie** (arbre) : chaque utilisateur peut avoir un supérieur direct (son "parent") et des subordonnés.

**Règles de structure** :
- Un utilisateur ne peut avoir **qu'un seul supérieur direct**
- On ne peut pas **supprimer** un utilisateur qui a encore des subordonnés
- Les managers ne peuvent agir que sur les utilisateurs de **leur propre branche** hiérarchique

### 2.4 Tableau des droits sur les utilisateurs

| Action | Administrateur | Manager | Collaborateur |
|--------|:-:|:-:|:-:|
| Créer un utilisateur (tous rôles inférieurs) | ✅ | ✅ (collaborateur uniquement, dans sa branche) | ❌ |
| Modifier le profil d'un autre utilisateur | ✅ (niveaux inférieurs) | ✅ (sa branche uniquement) | ❌ |
| Modifier son propre profil | ✅ | ✅ | ✅ |
| Changer le rôle d'un utilisateur | ✅ | ❌ | ❌ |
| Changer le statut d'un utilisateur | ✅ | ✅ (subordonnés uniquement) | ❌ |
| Supprimer définitivement un utilisateur | FM4ALL uniquement | ❌ | ❌ |
| Changer l'email d'un autre utilisateur | ✅ (niveaux inférieurs) | ❌ | ❌ |

### 2.5 Attributions sur les sites

Une **attribution sur un site** permet de définir précisément ce qu'un utilisateur peut faire sur un site donné. Un même utilisateur peut avoir des droits différents selon les sites.

#### Rôles disponibles sur les sites

| Rôle sur site | Ce que ça permet |
|--------------|-----------------|
| **Responsable de site** | Gestion complète : création et validation des prestations, attribution d'autres utilisateurs, création de tickets |
| **Demandeur de site** | Création de tickets et de demandes sur ce site |
| **Observateur de site** | Lecture seule sur ce site |
| **Intervenant de site** | Accès terrain : réalisation des tâches, pointage des passages (rôle destiné aux prestataires) |

#### Périmètre de l'attribution

| Périmètre | Description |
|-----------|-------------|
| **Site uniquement** | Les droits s'appliquent à ce site précis, sans hériter des sous-sites |
| **Site et sous-sites** | Les droits s'appliquent à ce site ET à tous ses sites enfants dans l'arborescence |

> Le périmètre "Site et sous-sites" n'est utilisable que par les **managers et administrateurs** lors de leurs attributions.

#### Mode d'attribution

| Mode | Description |
|------|-------------|
| **Inclure** | Accorder les droits sur ce site |
| **Exclure** | Retirer explicitement les droits sur ce site (utile pour exclure un site enfant d'une attribution en cascade) |

#### Règles d'auto-protection

- Un utilisateur **ne peut pas s'attribuer lui-même** des droits sur un site — demandez à votre supérieur ou administrateur.
- Un utilisateur **ne peut pas modifier ses propres attributions**.

#### Qui peut attribuer quoi

| Rôle de l'attribuant | Périmètre d'action | Rôles attribuables |
|---------------------|---------------------|-------------------|
| **Administrateur** | Tous les sites de l'entreprise | Tous les rôles |
| **Manager** | Sites où il est Responsable avec périmètre "Site et sous-sites" | Responsable, Demandeur, Observateur |
| **Collaborateur Responsable (délégation)** | Sites où il est Responsable | Demandeur, Observateur uniquement |

#### Règle de garde-fou

Un site doit toujours avoir **au moins un Responsable de site**. Il est impossible de retirer le dernier responsable d'un site.

---

## 3. Gestion des sites

### 3.1 Arborescence des sites

Les sites s'organisent en **arbre hiérarchique** sans limite de profondeur. Exemples :

```
Siège social (bâtiment)
├── Bâtiment A
│   ├── RDC
│   └── Étage 1
└── Bâtiment B
```

**Contraintes** :
- On ne peut pas supprimer un site qui possède des sous-sites
- Désactiver un site **désactive automatiquement tous ses sous-sites**

### 3.2 Informations d'un site

**Champs obligatoires** :

| Champ | Description |
|-------|-------------|
| Nom | Nom du site ou du local |
| Adresse (ligne 1) | Numéro et nom de rue |
| Code postal | |
| Ville | |
| Surface | Entre **50 et 3 000 m²** |
| Type d'occupation | Voir tableau ci-dessous |
| Type de bâtiment | Voir tableau ci-dessous |

**Types d'occupation** :

| Code | Libellé |
|------|---------|
| Partie d'étage | L'entreprise occupe une partie d'un étage |
| Plateau complet | L'entreprise occupe un étage entier |
| Bâtiment entier | L'entreprise occupe le bâtiment complet |

**Types de bâtiment** :

| Code | Libellé |
|------|---------|
| Bureaux | Locaux à usage de bureau |
| Local commercial | Boutique, showroom, commerce |
| Entrepôt | Logistique, stockage |
| Cabinet médical | Santé, paramédical |

**Champs optionnels** : complément d'adresse, commentaires, téléphone du site.

### 3.3 Statuts d'un site

| Statut | Signification |
|--------|--------------|
| **Actif** | Le site est opérationnel, des prestations peuvent y être rattachées |
| **Inactif** | Le site est hors périmètre ou fermé |

### 3.4 Qui peut créer et modifier les sites

| Action | Administrateur | Manager | Collaborateur |
|--------|:-:|:-:|:-:|
| Créer un site racine (sans parent) | ✅ | ❌ | ❌ |
| Créer un sous-site | ✅ | ✅ (sur sites dont il est Responsable) | ❌ |
| Modifier un site | ✅ | ✅ (sur sites dont il est Responsable) | ❌ |
| Désactiver un site | ✅ | ❌ | ❌ |

---

## 4. Module Tickets

### 4.1 Nature d'un ticket

Un ticket est une **demande formelle** adressée à FM4ALL ou à un prestataire, toujours rattachée à un site. Il peut s'agir d'un incident à résoudre, d'une demande de service ponctuelle, ou de toute autre communication nécessitant un suivi.

### 4.2 Types de tickets

| Type | Quand l'utiliser |
|------|-----------------|
| **Incident** | Problème à régler (panne, casse, urgence, dysfonctionnement) |
| **Demande** | Demande de service, d'intervention ponctuelle, de renseignement |
| **Autre** | Toute communication ne rentrant pas dans les catégories ci-dessus |

### 4.3 Niveaux de priorité

| Priorité | Description |
|----------|-------------|
| **Basse** | Non urgent, peut attendre plusieurs jours |
| **Normale** | Traitement standard dans les délais habituels |
| **Haute** | À traiter rapidement (dans la journée ou le lendemain) |
| **Critique** | Urgence absolue, nécessite une intervention immédiate |

### 4.4 Cycle de vie d'un ticket

```
[Nouveau]
    ↓ (prise en charge)
[Pris en charge]
    ↓                        ↕ (allers-retours possibles)
[En attente prestataire] ←→ [En attente client]
    ↓ (travail effectué)
[À valider]
    ↓                ↘
  [Clos]          [Annulé]   [Rejeté / Hors périmètre]
```

| Statut | Signification |
|--------|--------------|
| **Nouveau** | Ticket créé, pas encore traité |
| **Pris en charge** | Quelqu'un a pris ce ticket en main |
| **En attente prestataire** | On attend une action ou une réponse du prestataire |
| **En attente client** | On attend une information ou une validation du client |
| **À valider** | La prestation a été réalisée, en attente de validation finale par le client |
| **Clos** | Ticket terminé et validé — aucune modification possible |
| **Annulé** | Ticket abandonné en cours de traitement |
| **Rejeté / Hors périmètre** | Ticket refusé (hors périmètre, doublon, demande invalide) |

### 4.5 Messagerie intégrée

Chaque ticket dispose d'un **fil de messages** pour faciliter les échanges entre toutes les parties prenantes. Cette messagerie fonctionne comme une discussion avec niveaux de visibilité.

#### Niveaux de visibilité des messages

| Niveau | Qui peut voir ce message |
|--------|--------------------------|
| **Public** | Tout le monde (client + prestataire + FM4ALL) |
| **Client uniquement** | Le client et FM4ALL — le prestataire ne voit pas |
| **Prestataire uniquement** | Le prestataire et FM4ALL — le client ne voit pas |
| **FM4ALL uniquement** | FM4ALL uniquement (notes internes, jamais visibles par client ni prestataire) |

#### Qui peut écrire quoi

| Rôle | Niveaux de visibilité autorisés |
|------|--------------------------------|
| **Client** | Public, Client uniquement |
| **Prestataire** | Public, Prestataire uniquement |
| **FM4ALL** | Tous les niveaux |

### 4.6 Pièces jointes

Des fichiers peuvent être attachés :
- **Au ticket lui-même** (documents de fond : cahier des charges, plan, photos générales)
- **À un message spécifique** (photos prises lors d'un échange, devis réponse, etc.)

Les pièces jointes d'un message ne sont visibles que par les destinataires autorisés à voir ce message.

### 4.7 Tableau des droits sur les tickets

| Action | Client (Responsable) | Client (Demandeur) | Prestataire | FM4ALL |
|--------|:-:|:-:|:-:|:-:|
| Créer un ticket sur ses sites | ✅ | ✅ | ❌ | ✅ (tous) |
| Modifier titre / type / description | ✅ | ❌ | ❌ | ✅ |
| Modifier la priorité | ✅ | ❌ | ❌ | ✅ |
| Assigner à un prestataire | ✅ | ❌ | ❌ | ✅ |
| Assigner à un utilisateur | ✅ | ❌ | ❌ | ✅ |
| Changer le statut | ✅ | Partiel | Partiel | ✅ |
| Envoyer un message | ✅ | ✅ | ✅ | ✅ |
| Voir les messages FM4ALL uniquement | ❌ | ❌ | ❌ | ✅ |
| Clore le ticket | ✅ | ❌ | ❌ | ✅ |

---

## 5. Module Prestations

### 5.1 Qu'est-ce qu'une prestation ?

Une **prestation** représente la mise en place opérationnelle d'un service FM sur un site client. Elle définit :
- Le **type de service** (nettoyage, maintenance, café, etc.)
- Le **site** concerné
- La **fréquence** des interventions
- Le ou les **prestataires** qui réalisent le service, avec leurs tarifs

Une prestation encadre toute la vie opérationnelle d'un service : de la planification des passages à la réalisation des tâches sur le terrain.

> **Éléments immuables** une fois la prestation créée : l'entreprise cliente, le site, le type de service. Le mode commercial (voir ci-dessous) devient immuable dès qu'une exécution est ajoutée.

### 5.2 Mode commercial

Le mode commercial définit le **circuit contractuel et de facturation**.

| Mode | Description | Flux financier |
|------|-------------|---------------|
| **Direct** | Le client gère sa relation directement avec son prestataire. FM4ALL est un outil de suivi opérationnel. | Client → Prestataire |
| **Intermédiaire FM4ALL** | FM4ALL porte le contrat, facture le client, reverse aux prestataires après avoir appliqué sa marge. | Client → FM4ALL → Prestataire(s) |

> ⚠️ **Règle critique** : Le mode commercial **ne peut plus être modifié** dès lors qu'au moins une exécution (prestataire + tarifs) a été enregistrée sur la prestation. Ce choix est définitif.

> Le mode **Intermédiaire FM4ALL** ne peut être géré que par les équipes FM4ALL.

### 5.3 Mode de planification

| Mode | Description |
|------|-------------|
| **Planifié** | Les passages sont **générés automatiquement** selon la fréquence définie. Aucune action manuelle n'est nécessaire pour créer les passages. |
| **À la demande** | Les passages ont vocation à être créés manuellement au cas par cas. *(Fonctionnalité en cours de développement — interface non disponible à ce jour.)* |

### 5.4 Fréquences de passage

| Fréquence | Description |
|-----------|-------------|
| **One shot** | Intervention unique, non récurrente |
| **Hebdomadaire** | Une fois par semaine (ou plusieurs fois par semaine selon paramétrage) |
| **Mensuelle** | Une fois par mois |
| **Trimestrielle** | Tous les 3 mois |
| **Semestrielle** | Tous les 6 mois |
| **Annuelle** | Une fois par an |
| **Tous les X jours** | Rythme personnalisé (ex : tous les 10 jours) |

Pour les fréquences récurrentes, il est possible de préciser :
- Les **jours préférés** de la semaine (ex : le lundi et le mercredi)
- L'**heure de début préférée**
- La **durée estimée** d'une intervention (entre 1 et 720 minutes)

### 5.5 Statuts d'une prestation

| Statut | Signification | Génération des passages |
|--------|--------------|------------------------|
| **Brouillon** | Prestation configurée mais pas encore opérationnelle | Aucun passage généré |
| **Actif** | Prestation en cours d'exécution | Passages générés automatiquement (si mode planifié) |
| **En pause** | Prestation temporairement suspendue | Aucun nouveau passage généré pendant la pause |
| **Terminé** | Prestation définitivement clôturée | Archivée, aucune modification possible |

### 5.6 Les exécutions (prestataires et tarifs)

Une **exécution** représente le lien entre une prestation et un prestataire, accompagné des **conditions tarifaires** applicables.

Une même prestation peut avoir **plusieurs exécutions** (plusieurs prestataires se succèdent ou coexistent), mais une seule peut être **active** à un instant donné.

#### Lignes tarifaires d'une exécution

Chaque exécution peut avoir jusqu'à **4 lignes tarifaires**, en combinant librement les types suivants :

| Type de tarif | Description | Contrainte |
|---------------|-------------|------------|
| **Abonnement** | Montant fixe facturé à chaque période (semaine / mois / an). Indépendant du nombre de passages réalisés. | **Maximum 1** par exécution |
| **Par intervention** | Montant facturé à chaque passage réalisé. Si un abonnement avec quota d'interventions incluses existe, ce tarif s'applique uniquement au-delà du quota. | Illimité |
| **Frais par intervention** | Frais fixes additionnels à chaque passage (ex : frais de déplacement, frais de livraison). | Illimité |
| **Installation** | Frais de mise en place facturés une seule fois, lors du premier passage. Ne se répète pas. | **Maximum 1** par exécution |

**Périodes de facturation pour l'abonnement** : Semaine / Mois / Année

#### En mode Intermédiaire FM4ALL

Pour chaque ligne tarifaire, on renseigne :
- Le **coût prestataire HT** : ce que FM4ALL verse au prestataire
- La **marge FM4ALL** : en pourcentage (entre 0 % et 100 %)
- Le **montant client HT** est calculé automatiquement : `coût × (1 + marge / 100)`

#### En mode Direct

On renseigne uniquement le **montant HT** appliqué au client.

#### Ajout d'un nouveau prestataire

Si le prestataire n'est pas encore référencé dans le système, il peut être créé directement depuis le formulaire d'ajout d'exécution :

1. Saisir le **numéro SIRET** (14 chiffres)
2. Le système **vérifie automatiquement** la validité du SIRET (algorithme de Luhn)
3. Cliquer sur **"Rechercher"** — le SIRET est alors figé et la recherche est lancée :
   - **Prestataire trouvé** : son nom est pré-rempli automatiquement, il suffit de confirmer la liaison
   - **Prestataire non trouvé** : renseigner son nom (en majuscules) et optionnellement les coordonnées d'un contact (prénom, nom, email, téléphone)
4. Pour recommencer avec un autre SIRET, cliquer sur **"Modifier"**
5. Valider en cliquant sur **"Lier ce prestataire"** ou **"Créer et lier ce prestataire"**

> Le nom du prestataire est systématiquement enregistré en **majuscules**.

### 5.7 Les passages (interventions planifiées)

Un **passage** est une intervention planifiée sur un site, à une date précise. En mode planifié, les passages sont générés automatiquement lorsque la prestation est activée.

#### Statuts d'un passage

| Statut | Signification |
|--------|--------------|
| **Planifiée** | Passage généré, en attente de réalisation |
| **En cours** | L'intervenant est sur place, l'intervention est en train de se dérouler |
| **Terminée** | Passage réalisé et clôturé |
| **Non honorée** | Le prestataire ne s'est pas présenté (absence non justifiée) |
| **Annulée** | Passage supprimé avant sa réalisation (décision client ou prestataire) |

> ⚠️ Seules les transitions logiques sont autorisées. Un passage **"Planifiée"** ne peut pas passer directement à **"Terminée"** sans être passé par **"En cours"**.

### 5.8 Les tâches d'un passage

Chaque passage peut contenir une **liste de tâches** à réaliser (checklist). Ces tâches sont issues d'un modèle de checklist défini au niveau de la prestation, et sont copiées sur chaque passage lors de sa génération.

#### Statuts d'une tâche

| Statut | Signification |
|--------|--------------|
| **À faire** | Tâche non commencée |
| **En cours** | Tâche en cours de réalisation |
| **Terminée** | Tâche accomplie |
| **Non honorée** | Tâche non réalisée (l'intervenant ne l'a pas effectuée) |
| **Annulée** | Tâche supprimée pour ce passage |
| **Non applicable** | Tâche hors périmètre pour ce passage spécifique |

Les tâches peuvent nécessiter des **preuves documentaires** (photos, rapports) selon leur paramétrage.

### 5.9 Assignation des intervenants

L'assignation définit **qui réalise les passages**. Elle fonctionne en cascade sur trois niveaux :

```
Exécution (défaut global)
    ↓ hérite sauf si écrasé
Passage (défaut pour ce passage)
    ↓ hérite sauf si écrasé
Tâche (assignation spécifique à une tâche)
```

| Niveau | Description |
|--------|-------------|
| **Exécution** | Intervenants par défaut pour tous les futurs passages de cette exécution |
| **Passage** | Intervenants spécifiques à ce passage précis (remplace l'assignation de l'exécution pour ce passage) |
| **Tâche** | Intervenant spécifique pour cette tâche précise (remplace l'assignation du passage) |

> ⚠️ **Règle de non-rétroactivité** : modifier les intervenants assignés à une exécution **ne modifie pas** les passages déjà créés ou déjà assignés individuellement. Seuls les futurs passages non encore assignés sont impactés.

### 5.10 Tableau des droits sur les prestations

| Action | Responsable de site | FM4ALL |
|--------|:-:|:-:|
| Créer une prestation | ✅ | ✅ |
| Modifier fréquence, planning | ✅ | ✅ |
| Ajouter un prestataire / exécution | ✅ | ✅ |
| Activer / Mettre en pause | ✅ | ✅ |
| Clore définitivement | ✅ | ✅ |
| Gérer en mode Intermédiaire FM4ALL | ❌ | ✅ uniquement |

---

## 6. Module Entreprises

### 6.1 Qu'est-ce qu'une entreprise dans FM4ALL ?

Une **entreprise** est l'entité centrale du modèle : elle regroupe des utilisateurs, des sites et des prestations. Une même entreprise peut endosser simultanément plusieurs rôles sur la plateforme.

> **Double casquette** : une entreprise peut être à la fois **cliente** (elle commande des prestations) et **prestataire** (elle en réalise). Elle peut également être la plateforme FM4ALL elle-même.

### 6.2 Rôles d'une entreprise

| Rôle | Description | Qui peut l'attribuer |
|------|-------------|---------------------|
| **Client** | L'entreprise commande des prestations FM | FM4ALL uniquement |
| **Prestataire** | L'entreprise réalise des prestations FM | FM4ALL uniquement |
| **Plateforme** | Rôle réservé à FM4ALL — non attribuable via l'interface | En base de données uniquement |

**Règle d'obligation** : toute entreprise doit avoir **au moins un rôle** à tout moment. Il est impossible de retirer le dernier rôle d'une entreprise.

**Garde-fous sur le retrait de rôle** :
- Le rôle **Client** ne peut pas être retiré si l'entreprise possède des **prestations actives** (`clientServices`)
- Le rôle **Prestataire** (ou un service associé) ne peut pas être retiré si l'entreprise est **référencée comme exécutante** dans des prestations (`clientServiceExecutions`)

### 6.3 Informations d'une entreprise

**Champs obligatoires** :

| Champ | Description |
|-------|-------------|
| Nom | Raison sociale de l'entreprise (majuscules recommandées) |
| SIRET | 14 chiffres — identifiant unique légal |

**Champs optionnels** :

| Champ | Description |
|-------|-------------|
| Prénom du contact | Prénom du contact principal |
| Nom du contact | Nom du contact principal |
| Email du contact | Adresse email du contact |
| Téléphone du contact | Numéro de téléphone du contact |
| Logo | Image (PNG, JPG) représentant l'entreprise |

### 6.4 Services proposés (prestataires uniquement)

Lorsqu'une entreprise a le rôle **Prestataire**, elle doit renseigner les **services FM qu'elle propose** parmi le catalogue FM4ALL (nettoyage, maintenance, café, etc.).

**Règle** : un prestataire doit toujours avoir **au moins un service** sélectionné. Il est impossible d'enregistrer ou de maintenir un prestataire sans service associé.

Si l'entreprise perd son rôle Prestataire, la liste de ses services est automatiquement vidée.

### 6.5 Création d'une entreprise (processus multi-étapes)

La création d'une entreprise se fait en **2 étapes** :

#### Étape 1 — Informations entreprise

1. **Nom** et **SIRET** de l'entreprise (obligatoires)
2. Coordonnées du **contact principal** (optionnel)
3. **Rôle(s)** de l'entreprise (au moins un)
4. **Services proposés** si le rôle Prestataire est sélectionné (au moins un)

> **Raccourci** : il est possible de pré-remplir le formulaire à partir d'un **prospect existant** dans le système. Les champs correspondants (nom, SIRET, contact) sont remplis automatiquement.

#### Étape 2 — Administrateur principal

Un compte utilisateur **administrateur** est obligatoirement créé en même temps que l'entreprise. Cet utilisateur sera le premier à pouvoir se connecter et gérer l'entreprise.

| Champ | Obligatoire |
|-------|:-----------:|
| Prénom | ✅ |
| Nom | ✅ |
| Email | ✅ |
| Téléphone | ❌ |

> Les champs de l'étape 2 sont **pré-remplis automatiquement** avec les informations de contact saisies à l'étape 1 si elles existent, afin d'éviter la double saisie.

Lors de la validation, un **email d'activation** est automatiquement envoyé à l'administrateur pour qu'il définisse son mot de passe.

### 6.6 Logo de l'entreprise

Un logo peut être uploadé et associé à chaque entreprise. Le logo est affiché :
- Dans la liste des entreprises (vue grille et tableau)
- Sur la page de détail de l'entreprise
- Dans la page "Mon Entreprise"

**Modification du logo** : depuis la page de détail, un clic sur l'avatar de l'entreprise ouvre le formulaire de modification du logo (réservé aux administrateurs).

**Suppression du logo** : il est possible de supprimer le logo existant sans en téléverser un nouveau.

### 6.7 Page "Mon Entreprise"

Accessible depuis la navigation latérale pour toutes les postures (client, prestataire, plateforme), cette page affiche les informations de l'entreprise à laquelle l'utilisateur connecté appartient.

**Accès en lecture** : tous les utilisateurs de l'entreprise peuvent consulter la page.

**Accès en modification** : réservé aux utilisateurs ayant le rôle **Administrateur** au sein de l'entreprise.

Les modifications disponibles sont identiques à celles de la page de détail entreprise (FM4ALL) :
- Informations (nom, SIRET)
- Contact principal
- Rôles et services
- Logo

### 6.8 Qui peut accéder au module Entreprises

Le module complet (liste, création, gestion) est **réservé à la posture Plateforme (FM4ALL)**. Toute tentative d'accès par un utilisateur sans rôle plateforme est bloquée côté serveur et redirige vers la page d'accès non autorisé.

| Action | FM4ALL (Plateforme) | Client / Prestataire |
|--------|:-:|:-:|
| Lister toutes les entreprises | ✅ | ❌ |
| Créer une entreprise | ✅ | ❌ |
| Voir le détail d'une entreprise | ✅ | ❌ (sauf "Mon Entreprise") |
| Modifier les infos / contact | ✅ | ✅ (admin, via "Mon Entreprise") |
| Modifier les rôles et services | ✅ | ✅ (admin, via "Mon Entreprise") |
| Modifier le logo | ✅ | ✅ (admin, via "Mon Entreprise") |

### 6.9 Navigation selon la posture

| Posture | Accès entreprises |
|---------|------------------|
| **Plateforme** | Section "Réseau" → "Entreprises" (liste complète) + "Mon Entreprise" |
| **Client** | Section "Équipe" → "Mon Entreprise" uniquement |
| **Prestataire** | Section "Paramètres" → "Mon Entreprise" uniquement |

---

## 7. Module Mes Prestataires

### 7.1 Consultation des prestataires (posture Client)

Les utilisateurs en posture **Client** disposent d'une page **"Mes Prestataires"** permettant de consulter les prestataires avec lesquels ils ont des relations actives (via des prestations existantes).

> ℹ️ Les informations des prestataires (nom, SIRET, coordonnées de contact) sont **consultables uniquement**. Elles ne peuvent pas être modifiées depuis l'espace client.

**Pourquoi ?** Un prestataire peut être partagé entre plusieurs entreprises clientes sur la plateforme. Autoriser un client à modifier les données d'un prestataire risquerait de créer des incohérences pour les autres clients liés au même prestataire.

Pour mettre à jour les informations d'un prestataire, deux options :
1. **Inviter le prestataire** à créer son compte — il gère alors lui-même ses informations
2. **Contacter FM4ALL** à l'adresse [contact@fm4all.com](mailto:contact@fm4all.com)

### 7.2 Actions disponibles pour le Client

| Action | Admin | Manager | Collaborateur |
|--------|:-:|:-:|:-:|
| Consulter la liste de ses prestataires | ✅ | ✅ | ✅ |
| Ajouter un prestataire (via SIRET) | ✅ | ✅ | ❌ |
| Inviter un prestataire sans compte à s'inscrire | ✅ | ✅ | ❌ |
| Modifier les infos d'un prestataire | ❌ | ❌ | ❌ |

### 7.3 Rattacher un utilisateur existant à une nouvelle posture

Lorsqu'une entreprise est **multi-posture** (ex : à la fois cliente et prestataire), un utilisateur déjà référencé dans l'entreprise peut se voir attribuer une adhésion supplémentaire **sans créer un nouveau compte**.

Ce rattachement est accessible depuis le module **Gestion des Utilisateurs**, via l'option "Rattacher existant" lors de la création d'un utilisateur.

**Condition** : l'utilisateur ne doit pas déjà posséder une adhésion pour la posture cible.

**Ce qui se passe lors du rattachement** :
- Une nouvelle ligne d'adhésion est ajoutée (`user_client_adhesions`, `user_prestataire_adhesions`, ou `user_plateforme_adhesions`)
- L'arborescence de l'utilisateur reste inchangée (ses entrées hiérarchiques existantes sont conservées)
- Aucun email d'activation n'est renvoyé (l'utilisateur a déjà un compte actif)

---

## Annexe — Récapitulatif des statuts

### Statuts des comptes utilisateurs

| Statut | Connexion |
|--------|:-:|
| En attente | ❌ |
| Actif | ✅ |
| Suspendu | ❌ |

### Statuts des tickets

| Statut | Phase |
|--------|-------|
| Nouveau | Ouvert |
| Pris en charge | En traitement |
| En attente prestataire | En attente |
| En attente client | En attente |
| À valider | Clôture en cours |
| Clos | Terminé |
| Annulé | Terminé |
| Rejeté / Hors périmètre | Terminé |

### Statuts des prestations

| Statut | Opérationnel |
|--------|:-:|
| Brouillon | ❌ |
| Actif | ✅ |
| En pause | ⏸️ |
| Terminé | 🔒 |

### Statuts des passages

| Statut | Description |
|--------|-------------|
| Planifiée | À venir |
| En cours | En train d'être réalisé |
| Terminée | Réalisé |
| Non honorée | Non réalisé (absence prestataire) |
| Annulée | Supprimé |

### Statuts des tâches

| Statut | Description |
|--------|-------------|
| À faire | En attente |
| En cours | En cours de réalisation |
| Terminée | Accomplie |
| Non honorée | Non réalisée |
| Annulée | Supprimée |
| Non applicable | Hors périmètre ce jour |

---

*Document mis à jour le 2026-03-05 (v2) — FM4ALL*
