# Règles Métier — Référence Plateforme FM4ALL

> Document de référence unique pour toutes les permissions de la plateforme.
> À consulter **systématiquement** avant d'implémenter ou de modifier une permission.
> Basé sur le code réel (DB schema, server actions, queries) — pas sur des intentions.

---

## PRÉAMBULE — Doctrines Transversales

### Glossaire des verbes

| Verbe | Définition stricte |
|-------|-------------------|
| **voir** | Accès liste + détail fonctionnel (hors financier et documents) |
| **voir (financier)** | Accès aux prix, montants, marges — toujours noté explicitement |
| **voir (documents/PDF)** | Suit la visibilité du parent, sauf mention contraire |
| **gérer** | Créer, modifier, planifier, annuler — acte de gouvernance |
| **exécuter** | Démarrer, terminer, pointer — acte terrain |
| **archiver** | Passer `actif = false` — données conservées en base |
| **désactiver** | Synonyme d'archiver dans certains contextes (ex: exécutions) |
| **supprimer** | DELETE physique — uniquement sur les brouillons non engagés, sous conditions strictes |
| **annuler** | Statut `annule` ou `annulee` — acte métier, données conservées |

---

### Doctrine globale : rôle `manager`

> **Règle absolue :** Le rôle d'adhésion `manager` ne confère **aucun droit opérationnel** sur les modules terrain : prestations, exécutions, occurrences, tâches, tickets, devis, factures.
>
> **Exception unique et circonscrite :** Dans le module Attribution des Sites, un `manager` qui possède également une attribution `responsable_site` effective peut déléguer des rôles `demandeur_site` ou `observateur_site` à ses subordonnés (`usersArborescence`). Il ne peut jamais attribuer `responsable_site` (réservé à l'admin).
>
> Dans les modules Checklists et Factures (côté émetteur), `manager` a des droits de gouvernance d'équipe — ces exceptions sont documentées dans chaque module concerné.

---

### Doctrine globale : suppression / archivage / annulation

| Catégorie | Règle |
|-----------|-------|
| **Événement terrain réalisé** (occurrences, tâches) | Jamais DELETE — changement de statut uniquement |
| **Référentiel structurant** (sites, prestations, exécutions, utilisateurs) | Archivage (`actif = false`) — jamais DELETE sauf `super_admin_plateforme` |
| **Brouillon non engagé** (devis brouillon, factures brouillon, exécution sans occurrence) | DELETE autorisé sous conditions strictes documentées par module |
| **`devisDemandes`** | DELETE physique bloqué si devis lié ; sinon autorisé selon rôle |

---

### Niveaux de "voir"

Dans toutes les matrices, "voir" signifie accès fonctionnel (liste + détail). Le financier est toujours noté séparément et explicitement. Les documents/PDF suivent la visibilité du parent.

---

## Module Devis

> Référence unique pour toutes les permissions liées aux devis et demandes de devis.

---

### A) Posture CLIENT

#### Demandes de devis (`devisDemandes`)

**Statuts possibles :** `ouverte` → `en_cours` → `cloturee` | `annulee` | `archivee`

| Rôle | Voir | Créer | Modifier | Annuler | Supprimer |
|------|------|-------|----------|---------|-----------|
| `admin` | Toutes | ✅ | Toutes | Toutes | Toutes (si aucun devis lié) |
| `responsable_site` | Ses sites | ✅ | Ses sites | Ses sites | Ses sites (si aucun devis lié) |
| `demandeur_site` | Ses sites | ✅ | Seulement les siennes | ❌ | ❌ |
| `observateur_site` | Ses sites | ❌ | ❌ | ❌ | ❌ |
| `manager`, `collaborateur` | ❌ | ❌ | ❌ | ❌ | ❌ |

> **Règle :** la suppression physique d'une `devisDemande` est bloquée si un devis y est lié, quel que soit le statut du devis. L'annulation logique (statut `annulee`) reste possible.

#### Devis reçus (`devis`)

| Rôle | Voir | Signer | Refuser |
|------|------|--------|---------|
| `admin` | Tous | ✅ | ✅ |
| `responsable_site` | Ses sites | ✅ | ✅ |
| `demandeur_site` | Ses sites | ❌ | ❌ |
| `observateur_site` | Ses sites | ❌ | ❌ |
| `manager`, `collaborateur` | ❌ | ❌ | ❌ |

> **Règle :** le client ne modifie jamais un devis (uniquement les `devisDemandes`).

#### Expiration du devis

Si `now() > validTo` → devis expiré :
- Signature **bloquée** (frontend + backend)
- Refus **bloqué** (frontend + backend)

> **Rationale :** un devis expiré ne peut plus être traité. L'état métier est "expiré sans suite" — le client doit demander un nouveau devis. Permettre le refus d'un devis expiré ne produirait aucun effet utile.

---

### B) Posture PRESTATAIRE

**Conditions minimales pour voir une demande de devis (cumulatives) :**
1. `clientPrestataireRelations` doit exister entre le prestataire et le client propriétaire
2. Le `serviceId` de la demande doit correspondre à un service proposé par le prestataire

> Une demande sans `serviceId` correspondant n'est visible par aucun prestataire. La création de demandes "hors catalogue" n'est pas supportée — `serviceId` est obligatoire.

#### Visibilité des demandes et devis

| Rôle | Demandes de devis | Devis |
|------|-------------------|-------|
| `admin` | Tous les sites clients | Tous |
| `responsable_site` | Sites attribués | Sites attribués |
| `demandeur_site` | Sites attribués | Sites attribués |
| `observateur_site` | Sites attribués | Sites attribués |
| `intervenant_site` | ❌ | ❌ |
| `manager`, `collaborateur` | ❌ | ❌ |

#### Création, modification, émission, suppression d'un devis

| Rôle | Créer | Modifier (brouillon) | Émettre | Supprimer (brouillon) |
|------|-------|---------------------|---------|----------------------|
| `admin` | ✅ | ✅ | ✅ | ✅ |
| `responsable_site` | ✅ | ✅ | ✅ | ✅ |
| `demandeur_site` | ✅ | ✅ | ✅ | ✅ si `createdById = soi` |
| `observateur_site` | ❌ | ❌ | ❌ | ❌ |
| `intervenant_site` | ❌ | ❌ | ❌ | ❌ |

#### Accès aux coordonnées du responsable de site

`getSiteResponsableAction` est intentionnellement ouverte aux prestataires sans check `hasAccessToEntreprise` sur l'entreprise cliente. Un prestataire a besoin des coordonnées du responsable pour rédiger un devis. La relation `clientPrestataireRelations` est déjà vérifiée en amont.

---

### C) Posture PLATEFORME

| Action | Autorisé |
|--------|----------|
| Voir demandes de devis | ✅ (lecture seule) |
| Voir devis | ✅ |
| Créer/modifier/supprimer une demande | ❌ |
| Créer un devis | ✅ (`modeCommercial` forcé à `"intermediaire"`) |
| Modifier un devis brouillon | ✅ |
| Supprimer un devis brouillon | ✅ |
| Émettre un devis | ✅ |
| Signer / Refuser | ❌ (acte client) |

> La plateforme ne peut créer/modifier/émettre que les devis avec `modeCommercialSnapshot = "intermediaire"`. Un devis `"direct"` est en lecture seule pour la plateforme — l'utilisateur FM4ALL doit basculer en posture `"prestataire"` pour le gérer.

---

### D) Mode commercial (`modeCommercialSnapshot`)

Forcé à la création selon la posture de l'émetteur. Jamais modifié ensuite.

| Posture émetteur | Valeur | Signification |
|------------------|--------|--------------|
| `prestataire` | `"direct"` | Facturation directe client → prestataire |
| `plateforme` | `"intermediaire"` | FM4ALL porte le contrat, prend une marge, reverse au prestataire |

#### Devis autonome (sans `devisDemandeId`)

Un devis peut être créé sans demande associée. Dans ce cas, `siteId` est obligatoire pour permettre le calcul du périmètre des rôles `responsable_site` et `demandeur_site`. Un devis sans `siteId` créé par un non-admin est rejeté côté serveur.

---

### Résumé des rôles

**Rôles d'adhésion** (`admin`, `manager`, `collaborateur`) — seul `admin` a des droits sur les devis.

**Rôles d'attribution site :**
- `responsable_site` — peut signer/refuser (client), créer/modifier/émettre (prestataire)
- `demandeur_site` — peut créer demandes/devis, modifier/émettre les siens, pas de signature
- `observateur_site` — lecture seule
- `intervenant_site` — aucun droit sur les devis

---

*Dernière mise à jour : 2026-03-11*

---

## Module Tickets

> Référence unique pour toutes les permissions liées aux tickets et à leurs messages.

---

### 1. Sémantique des champs

| Champ | Signification | Règle |
|-------|--------------|-------|
| `proprietaireEntrepriseId` | L'entreprise "chez qui vit le ticket" | = entreprise cliente du site — toujours, même si le ticket est créé par le prestataire |
| `demandeurEntrepriseId` | L'entreprise qui a initié la demande | = entreprise de l'auteur initial |
| `assigneEntrepriseId` | L'entreprise actuellement attendue ("chez qui est la balle") | Évolue à chaque transition — voir §3 |
| `assigneUserId` | La personne concrète en charge | Optionnel — souvent `null` jusqu'à prise en charge explicite |

> **Doctrine :** un ticket appartient toujours au client, même s'il est créé ou traité par le prestataire.

---

### 2. États du ticket

**États actifs :** `nouveau` · `pris_en_charge` · `en_attente_prestataire` · `en_attente_client` · `a_valider`

**États finaux** (aucune transition sauf plateforme) : `clos` · `annule` · `rejete`

---

### 3. Machine d'état — transitions et `assigneEntrepriseId`

```
nouveau
  │
  ├──→ pris_en_charge ◄────────────────────────────────┐
  │        │                                            │
  │        ├──→ en_attente_client ────────────────────►┤
  │        ├──→ en_attente_prestataire ───────────────►┤
  │        └──→ a_valider                              │
  │               │                                    │
  │               └──→ clos                            │
  │                                                    │
  ├──→ annule                                          │
  └──→ rejete                      (retour depuis en_attente_*) ─┘
```

| Transition | Qui peut | `assigneEntrepriseId` cible |
|-----------|----------|-----------------------------|
| `∅ → nouveau` | Tout créateur autorisé | Entreprise choisie par le créateur |
| `nouveau → pris_en_charge` | Admin/responsable_site de l'entreprise assignée + plateforme | Inchangé |
| `pris_en_charge → en_attente_prestataire` | Client admin/responsable_site + plateforme | = `prestataireEntrepriseId` |
| `pris_en_charge → en_attente_client` | Prestataire admin/responsable_site + plateforme | = `proprietaireEntrepriseId` |
| `en_attente_prestataire → pris_en_charge` | Prestataire admin/responsable_site + plateforme | Inchangé |
| `en_attente_client → pris_en_charge` | Client admin/responsable_site + plateforme | Inchangé |
| `pris_en_charge → a_valider` | Prestataire admin/responsable_site + plateforme | = `proprietaireEntrepriseId` |
| `a_valider → clos` | Client admin/responsable_site + plateforme | Inchangé |
| `nouveau → annule` | Admin/responsable_site + plateforme | Inchangé |
| `pris_en_charge → annule` | Admin/responsable_site + plateforme | Inchangé |
| `nouveau → rejete` | Admin/responsable_site de l'entreprise assignée + plateforme | Inchangé |

> **Règle "retour à pris_en_charge" :** seule l'**entreprise dont c'est actuellement la balle** peut remettre le ticket en traitement (prestataire pour `en_attente_prestataire → pris_en_charge`, client pour `en_attente_client → pris_en_charge`). La plateforme peut toujours faire les deux.

**Effets automatiques :**
- `nouveau → pris_en_charge` : `priseEnChargeAt = now()` ⚠️ (à ajouter en DB — nécessaire pour SLA)
- `a_valider → clos` : `resolvedAt = now()`, `closedAt = now()`
- Tout message ou modification : `lastActivityAt = now()`

---

### 4. `annule` vs `rejete` — distinction métier

| Statut | Signification | Initiateur |
|--------|--------------|------------|
| `annule` | Le ticket est abandonné — la demande est retirée | L'entreprise **propriétaire** (client) |
| `rejete` | Le ticket est déclaré hors périmètre ou invalide | L'entreprise **assignée** (prestataire ou FM4ALL) |

> Le `demandeur_site` ne peut ni annuler ni rejeter (pas de pilotage du workflow).

---

### 5. Création d'un ticket

**Posture CLIENT**

| Rôle | Peut créer |
|------|-----------|
| `admin` | Tous les sites de l'entreprise |
| `responsable_site` | Ses sites attribués |
| `demandeur_site` | Ses sites attribués |
| `observateur_site` | ❌ |
| `manager`, `collaborateur` | ❌ |

**Posture PRESTATAIRE** (condition : `clientPrestataireRelations` doit exister)

| Rôle | Peut créer |
|------|-----------|
| `admin` | Tous les sites clients liés |
| `responsable_site` | Ses sites clients attribués |
| `demandeur_site` | Ses sites clients attribués |
| `observateur_site`, `intervenant_site` | ❌ |

**Posture PLATEFORME :** peut toujours créer.

---

### 6. Modification d'un ticket

#### 6a. Contenu libre (titre, description)

Mêmes droits que la création. **Gelé** dès que le statut atteint `a_valider`, `clos`, `annule` ou `rejete`.

#### 6b. Workflow (statut, assignation, priorité, type)

| Posture | Qui peut |
|---------|---------|
| Client | `admin`, `responsable_site` |
| Prestataire | `admin`, `responsable_site` |
| Plateforme | Toujours |

> `demandeur_site` peut ouvrir et commenter, mais **ne pilote pas le workflow**.

---

### 7. Messages

**Qui peut poster :** `admin`, `responsable_site`, `demandeur_site` (client et prestataire) + plateforme.

**Immuabilité :** aucune modification ni suppression de message.

**Visibilité :**

| Valeur `visibilite` | Qui voit |
|--------------------|---------|
| `public` | Tout acteur ayant accès au ticket |
| `fm4all_only` | Plateforme uniquement |
| `client_only` | Client + plateforme |
| `prestataire_only` | Prestataire + plateforme |

**Contraintes d'écriture par visibilité :**

| Posture auteur | Visibilités autorisées |
|----------------|----------------------|
| Client | `public`, `client_only` |
| Prestataire | `public`, `prestataire_only` |
| Plateforme | Toutes |

---

### 8. Périmètre de visibilité des tickets

**Posture CLIENT**
- `admin` : tous les tickets dont `proprietaireEntrepriseId = entrepriseId`
- `responsable_site` : tickets des sites attribués (périmètre effectif via `sitesArborescence`)
- `demandeur_site` : tickets des sites attribués
- `observateur_site` : tickets des sites attribués (lecture seule)

**Posture PRESTATAIRE**
- Visibilité basée sur `assigneEntrepriseId = prestataireId` au moment de la lecture
- Si la balle repasse côté client, le prestataire ne voit plus le ticket dans sa liste — c'est intentionnel
- `admin` : tous les tickets où `assigneEntrepriseId = prestataireId`
- Non-admin : idem + filtre sur les sites attribués

**Posture PLATEFORME :** tous les tickets sans filtre.

---

### 9. Pièces jointes

- PJ du ticket : `documentsLinks` avec `ticketId` rempli, `ticketMessageId` NULL
- PJ d'un message : `documentsLinks` avec `ticketMessageId` rempli, `ticketId` NULL
- **Jamais** les deux colonnes renseignées simultanément

---

*Dernière mise à jour : 2026-03-11*

---

## Module Prestations (`clientServices`)

> Référence unique pour toutes les permissions liées aux prestations.

---

### 1. Hiérarchie d'autorité

```
plateforme   → contrôle total
client       → propriétaire de la prestation
prestataire  → opérateur (agit en délégation)
```

---

### 2. Posture CLIENT

| Action | `admin` | `responsable_site` | `demandeur_site` | `observateur_site` | `manager` |
|--------|---------|--------------------|-------------------|--------------------|-----------|
| Voir prestations | Toutes | Sites attribués | Sites attribués | Sites attribués (RO) | ❌ |
| Voir données financières | ✅ | ✅ | ❌ | ❌ | ❌ |
| Créer | ✅ | ✅ (ses sites) | ❌ | ❌ | ❌ |
| Modifier | ✅ | ✅ (ses sites) | ❌ | ❌ | ❌ |
| Archiver | ✅ | ❌ | ❌ | ❌ | ❌ |

> `manager` et `collaborateur` : zéro droit sur les prestations. Seule l'attribution de site compte.

---

### 3. Posture PRESTATAIRE

**Visibilité niveau 1 (inter-entreprises) :** une prestation n'est visible que si au moins une exécution (`clientServiceExecutions`) associe cette prestation à l'entreprise prestataire — peu importe le statut `actif` de l'exécution.

**Visibilité niveau 2 (interne non-admin) :** filtrage supplémentaire par attributions de site (`userPrestataireSiteAttributions`).

| Action | `admin` | `manager` | `responsable_site` | `intervenant_site` | `observateur_site` |
|--------|---------|-----------|--------------------|--------------------|--------------------|
| Voir prestations | Périmètre exécution | Sites attribués | Sites attribués | Sites attribués | Sites attribués (RO) |
| Voir données financières | ✅ | ❌ | ✅ | ❌ | ❌ |
| Créer | ✅ | ❌ | ✅ (ses sites) | ❌ | ❌ |
| Modifier | ✅ | ❌ | ✅ (ses sites) | ❌ | ❌ |
| Archiver | ✅ | ❌ | ❌ | ❌ | ❌ |

> **Règle :** quand le prestataire crée une prestation, l'exécution doit être créée simultanément dans la même transaction — sinon la prestation ne serait pas visible (règle niveau 1).

---

### 4. Posture PLATEFORME

Droits complets (god mode). Voir données financières inclus.

---

### 5. Conditions d'archivage

L'archivage d'une prestation est bloqué si :
1. Il existe une exécution avec `actif = true`
2. Il existe une occurrence avec statut `planifiee` ou `en_cours`

> L'admin doit d'abord désactiver les exécutions et annuler/terminer les occurrences futures avant d'archiver.

---

*Dernière mise à jour : 2026-03-11*

---

## Module Exécutions (`clientServiceExecutions`)

> ⚠️ Ne pas confondre avec les **occurrences** : les exécutions définissent **qui fait quoi et comment** ; les occurrences correspondent aux **passages effectifs**.

---

### 1. `modePilotage` — valeurs et contraintes

`modePilotage` détermine qui crée, planifie et assigne les occurrences.

| Valeur | Qui pilote |
|--------|-----------|
| `client` | L'entreprise cliente uniquement |
| `prestataire` | L'entreprise prestataire uniquement |
| `collaboration` | Les deux ensemble |

**Contraintes selon les entreprises fantômes** (sans admin actif) :

| Client fantôme | Prestataire fantôme | `modePilotage` autorisé |
|:--------------:|:-------------------:|:-----------------------:|
| ✅ | ❌ | `prestataire` uniquement |
| ❌ | ✅ | `client` uniquement |
| ❌ | ❌ | `client`, `prestataire`, `collaboration` |
| ✅ | ✅ | ❌ Impossible — aucun pilote |

> Valeurs impossibles filtrées côté formulaire **et** validées côté serveur.

> `modePilotage` n'influence **pas** les permissions de l'exécution elle-même. Il régit uniquement la gouvernance des occurrences.

---

### 2. Posture CLIENT

| Action | `admin` | `responsable_site` | `demandeur_site` | `observateur_site` | `manager` |
|--------|---------|--------------------|-------------------|--------------------|-----------|
| Voir exécutions | Toutes | Sites attribués | Sites attribués | Sites attribués (RO) | ❌ |
| Voir données financières | ✅ | ✅ | ❌ | ❌ | ❌ |
| Créer | ✅ | ✅ (ses sites) | ❌ | ❌ | ❌ |
| Modifier | ✅ | ✅ (ses sites) | ❌ | ❌ | ❌ |
| Désactiver | ✅ | ❌ | ❌ | ❌ | ❌ |

---

### 3. Posture PRESTATAIRE

Le prestataire ne voit et n'agit que sur les exécutions où `prestataireEntrepriseId = sonEntreprise`.

| Action | `admin` | `manager` | `responsable_site` | `intervenant_site` | `observateur_site` |
|--------|---------|-----------|--------------------|--------------------|--------------------|
| Voir exécutions | Toutes (son entreprise) | Sites attribués | Sites attribués | Sites attribués | Sites attribués (RO) |
| Voir données financières | ✅ | ❌ | ✅ | ❌ | ❌ |
| Créer | ✅ | ❌ | ✅ (ses sites) | ❌ | ❌ |
| Modifier | ✅ | ❌ | ✅ (ses sites) | ❌ | ❌ |
| Désactiver | ✅ | ❌ | ❌ | ❌ | ❌ |

> Condition préalable à toute création : `clientPrestataireRelations` doit exister.

---

### 4. Posture PLATEFORME

Droits complets. Voir données financières inclus.

---

### 5. Désactivation et suppression

> **Règle générale :** ne jamais supprimer une exécution — toujours désactiver (`actif = false`) pour conserver l'historique.

**Exception — suppression physique :** autorisée uniquement si l'exécution a été créée par erreur et qu'elle n'a aucune occurrence associée.

| Posture | Condition |
|---------|-----------|
| Plateforme | Toujours |
| Client `admin` | `modePilotage = "client"` ou `"collaboration"` |
| Prestataire `admin` | `modePilotage = "prestataire"` ou `"collaboration"` + ownership |

---

*Dernière mise à jour : 2026-03-11*

---

## Module Sites (`sites`)

> Référence unique pour toutes les permissions liées aux sites.

---

### A) Posture CLIENT (`/app/sites`)

**Voir les sites :** tous les utilisateurs avec une adhésion client `statut = actif` voient l'arborescence complète.

| Action | `admin` | `manager` + `responsable_site` | `collaborateur` + `responsable_site` | `responsable_site` seul | Autres |
|--------|---------|-------------------------------|--------------------------------------|------------------------|--------|
| Créer site racine | ✅ | ❌ | ❌ | ❌ | ❌ |
| Créer sous-site | ✅ | ✅ si resp. du parent | ✅ si resp. du parent | ✅ si resp. du parent | ❌ |
| Modifier | ✅ (tous) | ✅ si resp. du site | ✅ si resp. du site | ✅ ce site uniquement | ❌ |
| Déplacer (changer parentId) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Archiver | ✅ | ❌ | ❌ | ❌ | ❌ |

> **Archivage bloqué** si le site possède des sous-sites actifs.

**Règles de cascade :**
- Désactivation → tous les descendants passent à `actif = false` (transaction atomique)
- Réactivation → bloquée si le parent direct est inactif. Les descendants ne sont pas réactivés automatiquement.

---

### B) Posture PRESTATAIRE (`/app/mes-sites-clients`)

**Condition préalable :** `clientPrestataireRelations` doit exister.

**Cas 1 — Le client possède au moins un admin actif :**
- Tous les utilisateurs prestataire actifs peuvent **voir** les sites du client
- **Aucune mutation** (création, modification, archivage) n'est autorisée
- L'interface affiche un bandeau informatif

**Cas 2 — Aucun admin client actif (mode proxy) :**

| Action | `admin` prestataire | `manager` + `responsable_site` | Autres |
|--------|--------------------|---------------------------------|--------|
| Voir | ✅ | ✅ | ✅ (si adhésion active) |
| Créer site racine | ✅ | ❌ | ❌ |
| Créer sous-site | ✅ | ✅ si resp. du parent | ❌ |
| Modifier | ✅ | ✅ si resp. du site | ❌ |
| Archiver | ✅ | ❌ | ❌ |

> **Règle :** le proxy se déclenche dès l'absence d'admin client actif (`userClientAdhesions.role = "admin" AND statut = "actif"`), même si des managers ou collaborateurs sont actifs. Seul un admin peut prendre des décisions structurantes sur les sites.

---

### C) Posture PLATEFORME (`/app/sites-clients`)

Droits complets sur tous les sites de tous les clients.

| Action | Autorisé |
|--------|----------|
| Voir | ✅ |
| Créer / Modifier / Archiver | ✅ |
| Supprimer définitivement | ✅ `super_admin_plateforme` uniquement |

---

### Règle technique — Toujours inclure les sites inactifs dans les queries

Les sites archivés (`actif = false`) doivent toujours être inclus — des données opérationnelles (tickets, occurrences, prestations) peuvent encore les référencer.

---

*Dernière mise à jour : 2026-03-11*

---

## Module Occurrences (`clientServiceOccurrences`)

> ⚠️ Ne pas confondre avec les **exécutions** : les occurrences représentent les **interventions terrain concrètes**.

---

### 1. Deux capacités distinctes

| Capacité | Actions couvertes | Rôles requis |
|----------|------------------|-------------|
| `canManageOccurrence` | Créer, replanifier, annuler, marquer non honorée, réassigner | `admin` ou `responsable_site` (selon posture et `modePilotage`) |
| `canExecuteOccurrence` | Démarrer, terminer | `admin`, `responsable_site`, `demandeur_site` (client), `intervenant_site` (prestataire) — selon `modePilotage` |

---

### 2. Statuts et machine d'état

```
planifiee
  │
  ├──→ en_cours ──→ terminee
  │
  ├──→ annulee
  │
  └──→ non_honoree
```

**Jamais de DELETE.** Seul le statut change.

---

### 3. `modePilotage` — impact sur les occurrences

> Le `modePilotage` est une **contrainte d'accès stricte**, vérifiée côté serveur. Il ne restreint **pas la lecture** — tous les acteurs ayant accès à la prestation voient les occurrences quel que soit le mode.

#### Mode `client`

| Rôle | Voir | Gérer | Démarrer | Terminer |
|------|------|-------|----------|----------|
| **client** `admin` | ✅ | ✅ | ✅ | ✅ |
| **client** `responsable_site` | ✅ | ✅ | ✅ | ✅ |
| **client** `demandeur_site` | ✅ | ❌ | ✅ | ✅ si assigné |
| **client** `observateur_site` | ✅ | ❌ | ❌ | ❌ |
| **prestataire** (tous rôles) | ✅ | ❌ | ❌ | ❌ |

#### Mode `prestataire`

| Rôle | Voir | Gérer | Démarrer | Terminer |
|------|------|-------|----------|----------|
| **client** (tous rôles) | ✅ | ❌ | ❌ | ❌ |
| **prestataire** `admin` | ✅ | ✅ | ✅ | ✅ |
| **prestataire** `responsable_site` | ✅ | ✅ | ✅ | ✅ |
| **prestataire** `intervenant_site` | ✅ | ❌ | ✅ | ✅ si assigné |
| **prestataire** `observateur_site` | ✅ | ❌ | ❌ | ❌ |

#### Mode `collaboration`

| Rôle | Voir | Gérer | Démarrer | Terminer |
|------|------|-------|----------|----------|
| **client** `admin` | ✅ | ✅ | ✅ | ✅ |
| **client** `responsable_site` | ✅ | ✅ | ✅ | ✅ |
| **client** `demandeur_site` | ✅ | ❌ | ✅ | ✅ si assigné |
| **client** `observateur_site` | ✅ | ❌ | ❌ | ❌ |
| **prestataire** `admin` | ✅ | ✅ | ✅ | ✅ |
| **prestataire** `responsable_site` | ✅ | ✅ | ✅ | ✅ |
| **prestataire** `intervenant_site` | ✅ | ❌ | ✅ | ✅ si assigné |
| **prestataire** `observateur_site` | ✅ | ❌ | ❌ | ❌ |

#### Posture PLATEFORME (tous modes)

Voir ✅ Gérer ✅ Démarrer ✅ Terminer ✅

---

### 4. Périmètre de visibilité des occurrences

**Posture CLIENT**

| Rôle | Voit quelles occurrences |
|------|--------------------------|
| `admin` | Toutes les occurrences des prestations de l'entreprise |
| `responsable_site` | Occurrences des sites attribués |
| `demandeur_site` | Occurrences des sites attribués |
| `observateur_site` | Occurrences des sites attribués (lecture seule) |

**Posture PRESTATAIRE** (condition : `execution.prestataireEntrepriseId = sonEntrepriseId`)

| Rôle | Voit quelles occurrences |
|------|--------------------------|
| `admin` | Toutes les occurrences liées à ses exécutions |
| `manager` | Occurrences des sites clients attribués (même règle que non-admin) |
| `responsable_site` | Occurrences des sites clients attribués |
| `intervenant_site` | Occurrences des sites clients attribués |
| `observateur_site` | Occurrences des sites clients attribués (lecture seule) |

> `manager` prestataire = non-admin : filtré par attribution de site, aucun droit supplémentaire.

**Posture PLATEFORME :** toutes les occurrences sans filtre.

---

### 5. Règle de démarrage

**Condition temporelle :** même journée que `dateDebutPrevue` (fuseau `Europe/Paris`). Si `dateDebutPrevue = null` → toujours autorisé.

**Condition de statut :** `planifiee` uniquement.

**Effets automatiques :**
```
statut          → en_cours
dateDebutReelle → now()
assigneeUserId  → currentUser.id  (écrase toute préassignation existante)
```

---

### 6. Règle de terminaison

**Condition :** `statut = en_cours` uniquement.

**Contrainte tâches :** une occurrence peut être terminée même si certaines tâches ne sont pas dans un état terminal — la réalité terrain le justifie. Les tâches résiduelles sont un indicateur de rapport, pas un blocage.

**Effets automatiques :**
```
statut        → terminee
dateFinReelle → now()
```

---

### 7. Annulation et non-réalisation

| Action | Statut source | Qui peut |
|--------|--------------|---------|
| `annulee` | `planifiee` uniquement | `canManageOccurrence` |
| `non_honoree` | `planifiee` uniquement | `canManageOccurrence` |

> Une occurrence déjà démarrée (`en_cours`) ne peut que terminer (`terminee`). Si l'intervention est impossible en cours de route, les tâches individuelles sont marquées `non_honoree` ou `non_applicable`. L'occurrence elle-même finit `terminee`.

---

### 8. Auto-assignation

L'assignation est un **effet du démarrage** (`assigneeUserId = currentUser.id`). Elle écrase toute préassignation existante.

---

*Dernière mise à jour : 2026-03-11*

---

## Module Tâches (`occurrenceTaches`)

> ⚠️ Ne pas confondre avec les **checklists** (templates). Les tâches sont les **instances concrètes** créées par snapshot.

---

### 1. Définition

- **Issue d'un template** : snapshot immuable de `titre` et `description` au moment de l'affectation. Aucune modification de contenu possible. Tous les autres champs (statut, assigné, etc.) restent modifiables selon permissions.
- **Ad hoc** : créée manuellement (`listeItemId = null`). Titre et description modifiables par `canManage`.

---

### 2. Statuts et machine d'état

```
a_faire
  │
  ├──→ en_cours ──→ terminee
  │
  ├──→ non_honoree
  ├──→ non_applicable
  └──→ annulee
```

**Jamais de DELETE.** `terminee` est un état final — aucune transition depuis cet état (sauf correction `tempsPasseSecondes` par superviseur).

---

### 3. Deux capacités distinctes

| Capacité | Actions couvertes |
|----------|-----------------|
| `canManage` | Créer ad hoc, modifier ad hoc, annuler, corriger `tempsPasseSecondes` |
| `canExecute` | Démarrer, terminer (si assigné), non_honoree, non_applicable, ajouter PJ |

`canManage` = `admin` ou `responsable_site` selon posture et `modePilotage`.
`canExecute` = `admin`, `responsable_site`, `demandeur_site` (client, si non mode prestataire), `intervenant_site` (prestataire, si non mode client).

---

### 4. Condition préalable : occurrence parente `en_cours`

**Une tâche ne peut être démarrée que si son occurrence parente a le statut `en_cours`.** Les PJ et les transitions de statut (`non_applicable`, `non_honoree`) suivent la même règle.

---

### 5. Matrice des permissions

| Action | `canManage` | `canExecute` + assigné | `canExecute` non assigné |
|--------|:-----------:|:----------------------:|:------------------------:|
| Voir | ✅ | ✅ | ✅ |
| Créer ad hoc | ✅ | ❌ | ❌ |
| Modifier ad hoc | ✅ (si a_faire/en_cours) | ❌ | ❌ |
| Démarrer (a_faire → en_cours) | ✅ | ✅ | ✅ |
| Terminer (en_cours → terminee) | ✅ | ✅ | ❌ |
| Non applicable | ✅ | ✅ | ✅ |
| Non honorée | ✅ | ✅ | ✅ |
| Annuler | ✅ | ❌ | ❌ |
| Ajouter PJ (tâche en_cours) | ✅ | ✅ | ✅ |
| Corriger tempsPassé (terminee) | ✅ | ❌ | ❌ |

---

### 6. Démarrage — effets automatiques

```
statut         → en_cours
startedAt      → now()
assigneeUserId → currentUser.id
```

---

### 7. Terminaison — effets automatiques

```
statut               → terminee
doneAt               → now()
completeeParUserId   → currentUser.id
tempsPasseSecondes   → (doneAt - startedAt) en secondes
```

---

### 8. Correction du temps passé

| Condition | Peut corriger |
|-----------|:---:|
| `canManage` ET tâche `terminee` | ✅ |
| Tous les autres cas | ❌ |

- Valeur minimale : 0 s
- Valeur maximale : 604 800 s (7 jours)

---

### 9. Pièces jointes (preuves)

- Ajout : `canExecute` ou `canManage` + tâche `en_cours` uniquement
- Vue : tout utilisateur pouvant voir la tâche
- Maximum recommandé : 2 PJ par tâche (images et PDFs)

> Preuves ajoutables uniquement pendant l'exécution (`en_cours`). Contrainte UX intentionnelle : la preuve doit être fournie pendant l'acte, pas après coup.

---

*Dernière mise à jour : 2026-03-11*

---

## Module Attribution des Sites

> Référence unique pour les permissions liées à l'attribution de sites à des utilisateurs.

---

### 1. Principe fondamental

- **Adhésion entreprise** → accès au module
- **Attribution site** → responsabilités opérationnelles

Les attributions définissent qui peut agir sur les modules opérationnels (tickets, devis, occurrences…). La visibilité de base du référentiel sites n'est pas gérée ici.

---

### 2. Tables et rôles disponibles

| Posture | Table |
|---------|-------|
| Client | `userClientSiteAttributions` |
| Prestataire | `userPrestataireSiteAttributions` |

**Rôles client :** `responsable_site` · `demandeur_site` · `observateur_site`

**Rôles prestataire :** `responsable_site` · `demandeur_site` · `observateur_site` · `intervenant_site`

---

### 3. Qui peut attribuer un site ?

**Posture CLIENT**

| Rôle de l'attributeur | Peut attribuer | Périmètre |
|-----------------------|---------------|----------|
| `admin` | ✅ | Tous les sites |
| `manager` + `responsable_site` du site | ✅ | Sites de son périmètre, à ses descendants (`usersArborescence`) |
| `collaborateur` + `responsable_site` du site | ✅ | Sites de son périmètre, à ses descendants (`usersArborescence`) |
| `manager` sans `responsable_site` | ❌ | — |
| `collaborateur` sans `responsable_site` | ❌ | — |

> **Hiérarchie utilisateurs :** la cible d'une attribution (non-admin) doit être un descendant de l'attributeur dans `usersArborescence` (closure table). Un responsable local ne peut pas attribuer à n'importe quel membre de l'entreprise.

**Posture PRESTATAIRE**
- Client avec admin actif → lecture seule, aucune attribution possible
- Mode proxy → mêmes règles que côté client

**Posture PLATEFORME :** peut attribuer n'importe quel site à n'importe quel utilisateur.

---

### 4. Qui peut attribuer quel rôle ?

**Attribution client**

| Rôle donné | Qui peut l'attribuer |
|------------|----------------------|
| `responsable_site` | `admin` uniquement |
| `demandeur_site` | `admin` ou `responsable_site` |
| `observateur_site` | `admin` ou `responsable_site` |

**Attribution prestataire**

| Rôle donné | Qui peut l'attribuer |
|------------|----------------------|
| `responsable_site` | `admin` uniquement |
| `demandeur_site` | `admin` ou `responsable_site` |
| `observateur_site` | `admin` ou `responsable_site` |
| `intervenant_site` | `admin` ou `responsable_site` |

> **Guard self-action :** un manager ou collaborateur ne peut pas modifier ses propres attributions (uniquement `admin`).

---

### 5. Scope et mode d'attribution

| Dimension | Valeur | Signification |
|-----------|--------|--------------|
| `scope` | `subtree` | S'applique au site et tous ses descendants |
| `scope` | `exact` | S'applique uniquement au site désigné |
| `mode` | `inclure` | Accorde les droits |
| `mode` | `exclure` | Retire les droits (exception dans un sous-arbre) |

---

*Dernière mise à jour : 2026-03-11*

---

## Module Checklists (`tacheListesTemplates` / `tacheListeItems`)

> Référence unique pour les permissions liées aux packs de tâches (templates).

---

### 1. Deux types de packs

| Type | `proprietaireEntrepriseId` | Accessible par |
|------|---------------------------|----------------|
| **Pack système** (FM4ALL) | `null` | Tous les utilisateurs authentifiés |
| **Pack entreprise** | ID de l'entreprise | Utilisateurs de cette entreprise uniquement |

---

### 2. Exception doctrine manager

> Le module Checklists est un module **catalogue** (création de templates réutilisables), non un module terrain. Le `manager` peut gérer les packs car c'est une activité de gouvernance d'équipe. Cette exception à la doctrine générale `manager` est intentionnelle et circonscrite à ce module.

---

### 3. Qui peut gérer les packs ?

**Pack système :** `super_admin_plateforme` uniquement.

**Pack entreprise :**

| Posture | Rôle requis |
|---------|------------|
| Client | `admin` ou `manager` (adhésion active) |
| Prestataire | `admin` ou `manager` (adhésion active) |
| Plateforme | Toujours |

---

### 4. Restriction prestataire — services proposés

Un prestataire ne peut créer des packs entreprise que pour les **services qu'il propose réellement** (`servicesEntreprises`). Il ne peut pas créer de pack pour un service hors de son catalogue déclaré.

> Les packs système restent accessibles à tous les utilisateurs authentifiés, sans filtre par service.

---

### 5. Lecture des packs disponibles

Lors de l'affectation d'une checklist à une occurrence, les packs disponibles sont filtrés :
- Packs système : filtrés par `serviceId` de l'exécution
- Packs entreprise : packs du client + packs du prestataire (si exécution associée)

---

*Dernière mise à jour : 2026-03-11*

---

## Module Factures (`factures`)

> Référence unique pour toutes les permissions liées aux factures.

---

### 1. Statuts

| Statut | Signification |
|--------|--------------|
| `brouillon` | Création/modification possible, non visible par le destinataire |
| `emise` | Pièce comptable figée, visible par le destinataire, montants verrouillés |
| `litige` | Facture émise contestée — en attente de résolution |
| `annulee` | Annulée après émission — données conservées |

> V1 : l'annulation change uniquement le statut. Aucun avoir automatique n'est créé. Un avoir comptable devra être géré manuellement en V2 pour conformité.

---

### 2. Parties d'une facture

| Champ | Rôle |
|-------|------|
| `emetteurEntrepriseId` | Entreprise qui facture (prestataire ou FM4ALL) |
| `destinataireEntrepriseId` | Entreprise qui reçoit la facture (client) |
| `modeCommercialSnapshot` | `"direct"` ou `"intermediaire"` — figé à la création |

> Une facture est **toujours émise par un prestataire ou FM4ALL**. Une entreprise en posture client n'émet jamais de facture.

---

### 3. Posture ÉMETTEUR (prestataire)

| Action | `admin` | `manager` | `responsable_site` | Autres |
|--------|---------|-----------|--------------------|--------|
| Voir (brouillon + émises) | ✅ | ✅ | ❌ | ❌ |
| Créer | ✅ | ✅ | ❌ | ❌ |
| Modifier (brouillon) | ✅ | ✅ | ❌ | ❌ |
| Émettre | ✅ | ✅ | ❌ | ❌ |
| Annuler (émise) | ✅ | ✅ | ❌ | ❌ |

> **Exception manager :** dans ce module, `manager` a des droits d'émission car la facturation est une activité de gouvernance d'entreprise, non une activité terrain.

---

### 4. Posture DESTINATAIRE (client)

Le destinataire voit uniquement les factures au statut `emise` (jamais les brouillons).

La visibilité est restreinte selon le `siteId` de la facture :

| Condition | Qui peut voir |
|-----------|--------------|
| Facture **avec `siteId`** | `admin` + `responsable_site` du site concerné |
| Facture **sans `siteId`** | `admin` uniquement |

> Aucune modification, émission ou annulation possible côté destinataire.

---

### 5. Posture PLATEFORME

**Lecture seule uniquement** — la plateforme ne crée, ne modifie, n'émet et n'annule pas de factures en posture plateforme.

> Exception : si FM4ALL est **prestataire direct** (ex: office manager, pilotage FM), l'utilisateur FM4ALL bascule en posture `"prestataire"` pour gérer ses propres factures — les règles de la posture émetteur s'appliquent.

| Action | Autorisé |
|--------|----------|
| Voir toutes les factures émises | ✅ |
| Créer / Modifier / Émettre / Annuler | ❌ |

---

### 6. Montants figés à l'émission

À l'émission, les champs `montantHt`, `montantTva`, `montantTtc` de chaque ligne sont calculés et stockés en base. Ils ne sont jamais recalculés — la facture est une pièce comptable immuable.

---

*Dernière mise à jour : 2026-03-11*
