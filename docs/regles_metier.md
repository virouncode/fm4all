# Règles Métier — Référence Plateforme FM4ALL

> Document de référence unique pour toutes les permissions de la plateforme.
> À consulter **systématiquement** avant d'implémenter ou de modifier une permission.
> Basé sur le code réel (DB schema, server actions, queries) — pas sur des intentions.

---

## PRÉAMBULE — Doctrines Transversales

### Glossaire des verbes

| Verbe                    | Définition stricte                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------- |
| **voir**                 | Accès liste + détail fonctionnel (hors financier et documents)                        |
| **voir (financier)**     | Accès aux prix, montants, marges — toujours noté explicitement                        |
| **voir (documents/PDF)** | Suit la visibilité du parent, sauf mention contraire                                  |
| **gérer**                | Créer, modifier, planifier, annuler — acte de gouvernance                             |
| **exécuter**             | Démarrer, terminer, pointer — acte terrain                                            |
| **archiver**             | Passer `actif = false` — données conservées en base                                   |
| **désactiver**           | Synonyme d'archiver dans certains contextes (ex: exécutions)                          |
| **supprimer**            | DELETE physique — uniquement sur les brouillons non engagés, sous conditions strictes |
| **annuler**              | Statut `annule` ou `annulee` — acte métier, données conservées                        |

---

### Doctrine globale : rôle `manager`

> **Règle absolue :** Le rôle d'adhésion `manager` ne confère **aucun droit opérationnel** sur les modules terrain : prestations, exécutions, occurrences, tâches, tickets, devis, factures.
>
> **Exception unique et circonscrite :** Dans le module Attribution des Sites, un `manager` qui possède également une attribution `responsable_site` effective peut déléguer des rôles `demandeur_site` ou `observateur_site` à ses subordonnés (`usersArborescence`). Il ne peut jamais attribuer `responsable_site` (réservé à l'admin).
>
> Dans les modules Checklists et Factures (côté émetteur), `manager` a des droits de gouvernance d'équipe — ces exceptions sont documentées dans chaque module concerné.

---

### Doctrine globale : suppression / archivage / annulation

| Catégorie                                                                                 | Règle                                                                     |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Événement terrain réalisé** (occurrences, tâches)                                       | Jamais DELETE — changement de statut uniquement                           |
| **Référentiel structurant** (sites, prestations, exécutions, utilisateurs)                | Archivage (`actif = false`) — jamais DELETE sauf `super_admin_plateforme` |
| **Brouillon non engagé** (devis brouillon, factures brouillon, exécution sans occurrence) | DELETE autorisé sous conditions strictes documentées par module           |
| **`devisDemandes`**                                                                       | DELETE physique bloqué si devis lié ; sinon autorisé selon rôle           |

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

| Rôle                       | Voir      | Créer | Modifier              | Annuler   | Supprimer                      |
| -------------------------- | --------- | ----- | --------------------- | --------- | ------------------------------ |
| `admin`                    | Toutes    | ✅    | Toutes                | Toutes    | Toutes (si aucun devis lié)    |
| `responsable_site`         | Ses sites | ✅    | Ses sites             | Ses sites | Ses sites (si aucun devis lié) |
| `demandeur_site`           | Ses sites | ✅    | Seulement les siennes | ❌        | ❌                             |
| `observateur_site`         | Ses sites | ❌    | ❌                    | ❌        | ❌                             |
| `manager`, `collaborateur` | ❌        | ❌    | ❌                    | ❌        | ❌                             |

> **Règle :** la suppression physique d'une `devisDemande` est bloquée si un devis y est lié, quel que soit le statut du devis. L'annulation logique (statut `annulee`) reste possible.

#### Devis reçus (`devis`)

| Rôle                       | Voir      | Signer | Refuser |
| -------------------------- | --------- | ------ | ------- |
| `admin`                    | Tous      | ✅     | ✅      |
| `responsable_site`         | Ses sites | ✅     | ✅      |
| `demandeur_site`           | Ses sites | ❌     | ❌      |
| `observateur_site`         | Ses sites | ❌     | ❌      |
| `manager`, `collaborateur` | ❌        | ❌     | ❌      |

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

| Rôle                       | Demandes de devis      | Devis           |
| -------------------------- | ---------------------- | --------------- |
| `admin`                    | Tous les sites clients | Tous            |
| `responsable_site`         | Sites attribués        | Sites attribués |
| `demandeur_site`           | Sites attribués        | Sites attribués |
| `observateur_site`         | Sites attribués        | Sites attribués |
| `intervenant_site`         | ❌                     | ❌              |
| `manager`, `collaborateur` | ❌                     | ❌              |

#### Création, modification, émission, suppression d'un devis

| Rôle               | Créer | Modifier (brouillon) | Émettre | Supprimer (brouillon)     |
| ------------------ | ----- | -------------------- | ------- | ------------------------- |
| `admin`            | ✅    | ✅                   | ✅      | ✅                        |
| `responsable_site` | ✅    | ✅                   | ✅      | ✅                        |
| `demandeur_site`   | ✅    | ✅                   | ✅      | ✅ si `createdById = soi` |
| `observateur_site` | ❌    | ❌                   | ❌      | ❌                        |
| `intervenant_site` | ❌    | ❌                   | ❌      | ❌                        |

#### Accès aux coordonnées du responsable de site

`getSiteResponsableAction` est intentionnellement ouverte aux prestataires sans check `hasAccessToEntreprise` sur l'entreprise cliente. Un prestataire a besoin des coordonnées du responsable pour rédiger un devis. La relation `clientPrestataireRelations` est déjà vérifiée en amont.

---

### C) Posture PLATEFORME

| Action                               | Autorisé                                        |
| ------------------------------------ | ----------------------------------------------- |
| Voir demandes de devis               | ✅ (lecture seule)                              |
| Voir devis                           | ✅                                              |
| Créer/modifier/supprimer une demande | ❌                                              |
| Créer un devis                       | ✅ (`modeCommercial` forcé à `"intermediaire"`) |
| Modifier un devis brouillon          | ✅                                              |
| Supprimer un devis brouillon         | ✅                                              |
| Émettre un devis                     | ✅                                              |
| Signer / Refuser                     | ❌ (acte client)                                |

> La plateforme ne peut créer/modifier/émettre que les devis avec `modeCommercialSnapshot = "intermediaire"`. Un devis `"direct"` est en lecture seule pour la plateforme — l'utilisateur FM4ALL doit basculer en posture `"prestataire"` pour le gérer.

---

### D) Mode commercial (`modeCommercialSnapshot`)

Forcé à la création selon la posture de l'émetteur. Jamais modifié ensuite.

| Posture émetteur | Valeur            | Signification                                                    |
| ---------------- | ----------------- | ---------------------------------------------------------------- |
| `prestataire`    | `"direct"`        | Facturation directe client → prestataire                         |
| `plateforme`     | `"intermediaire"` | FM4ALL porte le contrat, prend une marge, reverse au prestataire |

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

### Contact dans le formulaire de création (`DevisNouveauClient`)

Le formulaire de création de devis propose un sélecteur **Contact (optionnel)** après le sélecteur de site.

- Les contacts sont chargés depuis `entreprise_contacts` pour l'entreprise cliente sélectionnée (`getEntrepriseContactsAction`)
- Le select affiche `{prenom} {nom} — {fonction}` par item
- Option **"Pas de contact"** (`value="none"`) disponible → `contactId` envoyé comme `undefined`
- Le contact sélectionné s'affiche dans `DevisPreviewCard` sous le SIRET du client (section "À"), **pas** dans la section site
- Les champs affichés dans le preview : prénom+nom, email, téléphone
- Le `siteId` reste **obligatoire** pour les devis (`.notNull()` en DB) — pas d'option "Pas de site"

---

_Dernière mise à jour : 2026-03-13_

---

## Module Tickets

> Référence unique pour toutes les permissions liées aux tickets et à leurs messages.

---

### 1. Sémantique des champs

| Champ                      | Signification                                                | Règle                                                                                  |
| -------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `proprietaireEntrepriseId` | L'entreprise "chez qui vit le ticket"                        | = entreprise cliente du site — toujours, même si le ticket est créé par le prestataire |
| `demandeurEntrepriseId`    | L'entreprise qui a initié la demande                         | = entreprise de l'auteur initial                                                       |
| `assigneEntrepriseId`      | L'entreprise actuellement attendue ("chez qui est la balle") | Évolue à chaque transition — voir §3                                                   |
| `assigneUserId`            | La personne concrète en charge                               | Optionnel — souvent `null` jusqu'à prise en charge explicite                           |

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

| Transition                                | Qui peut                                                     | `assigneEntrepriseId` cible        |
| ----------------------------------------- | ------------------------------------------------------------ | ---------------------------------- |
| `∅ → nouveau`                             | Tout créateur autorisé                                       | Entreprise choisie par le créateur |
| `nouveau → pris_en_charge`                | Admin/responsable_site de l'entreprise assignée + plateforme | Inchangé                           |
| `pris_en_charge → en_attente_prestataire` | Client admin/responsable_site + plateforme                   | = `prestataireEntrepriseId`        |
| `pris_en_charge → en_attente_client`      | Prestataire admin/responsable_site + plateforme              | = `proprietaireEntrepriseId`       |
| `en_attente_prestataire → pris_en_charge` | Prestataire admin/responsable_site + plateforme              | Inchangé                           |
| `en_attente_client → pris_en_charge`      | Client admin/responsable_site + plateforme                   | Inchangé                           |
| `pris_en_charge → a_valider`              | Prestataire admin/responsable_site + plateforme              | = `proprietaireEntrepriseId`       |
| `a_valider → clos`                        | Client admin/responsable_site + plateforme                   | Inchangé                           |
| `nouveau → annule`                        | Admin/responsable_site + plateforme                          | Inchangé                           |
| `pris_en_charge → annule`                 | Admin/responsable_site + plateforme                          | Inchangé                           |
| `nouveau → rejete`                        | Admin/responsable_site de l'entreprise assignée + plateforme | Inchangé                           |

> **Règle "retour à pris_en_charge" :** seule l'**entreprise dont c'est actuellement la balle** peut remettre le ticket en traitement (prestataire pour `en_attente_prestataire → pris_en_charge`, client pour `en_attente_client → pris_en_charge`). La plateforme peut toujours faire les deux.

**Effets automatiques :**

- `nouveau → pris_en_charge` : `priseEnChargeAt = now()` ⚠️ (à ajouter en DB — nécessaire pour SLA)
- `a_valider → clos` : `resolvedAt = now()`, `closedAt = now()`
- Tout message ou modification : `lastActivityAt = now()`

---

### 4. `annule` vs `rejete` — distinction métier

| Statut   | Signification                                    | Initiateur                                        |
| -------- | ------------------------------------------------ | ------------------------------------------------- |
| `annule` | Le ticket est abandonné — la demande est retirée | L'entreprise **propriétaire** (client)            |
| `rejete` | Le ticket est déclaré hors périmètre ou invalide | L'entreprise **assignée** (prestataire ou FM4ALL) |

> Le `demandeur_site` ne peut ni annuler ni rejeter (pas de pilotage du workflow).

---

### 5. Création d'un ticket

**Posture CLIENT**

| Rôle                       | Peut créer                     |
| -------------------------- | ------------------------------ |
| `admin`                    | Tous les sites de l'entreprise |
| `responsable_site`         | Ses sites attribués            |
| `demandeur_site`           | Ses sites attribués            |
| `observateur_site`         | ❌                             |
| `manager`, `collaborateur` | ❌                             |

**Posture PRESTATAIRE** (condition : `clientPrestataireRelations` doit exister)

| Rôle                                   | Peut créer                  |
| -------------------------------------- | --------------------------- |
| `admin`                                | Tous les sites clients liés |
| `responsable_site`                     | Ses sites clients attribués |
| `demandeur_site`                       | Ses sites clients attribués |
| `observateur_site`, `intervenant_site` | ❌                          |

**Posture PLATEFORME :** peut toujours créer.

---

### 6. Modification d'un ticket

#### 6a. Contenu libre (titre, description)

Mêmes droits que la création. **Gelé** dès que le statut atteint `a_valider`, `clos`, `annule` ou `rejete`.

#### 6b. Workflow (statut, assignation, priorité, type)

| Posture     | Qui peut                    |
| ----------- | --------------------------- |
| Client      | `admin`, `responsable_site` |
| Prestataire | `admin`, `responsable_site` |
| Plateforme  | Toujours                    |

> `demandeur_site` peut ouvrir et commenter, mais **ne pilote pas le workflow**.

---

### 7. Messages

**Qui peut poster :** `admin`, `responsable_site`, `demandeur_site` (client et prestataire) + plateforme.

**Immuabilité :** aucune modification ni suppression de message.

**Visibilité :**

| Valeur `visibilite` | Qui voit                          |
| ------------------- | --------------------------------- |
| `public`            | Tout acteur ayant accès au ticket |
| `fm4all_only`       | Plateforme uniquement             |
| `client_only`       | Client + plateforme               |
| `prestataire_only`  | Prestataire + plateforme          |

**Contraintes d'écriture par visibilité :**

| Posture auteur | Visibilités autorisées       |
| -------------- | ---------------------------- |
| Client         | `public`, `client_only`      |
| Prestataire    | `public`, `prestataire_only` |
| Plateforme     | Toutes                       |

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

_Dernière mise à jour : 2026-03-11_

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

| Action                   | `admin` | `responsable_site` | `demandeur_site` | `observateur_site`   | `manager` |
| ------------------------ | ------- | ------------------ | ---------------- | -------------------- | --------- |
| Voir prestations         | Toutes  | Sites attribués    | Sites attribués  | Sites attribués (RO) | ❌        |
| Voir données financières | ✅      | ✅                 | ❌               | ❌                   | ❌        |
| Créer                    | ✅      | ✅ (ses sites)     | ❌               | ❌                   | ❌        |
| Modifier                 | ✅      | ✅ (ses sites)     | ❌               | ❌                   | ❌        |
| Archiver                 | ✅      | ❌                 | ❌               | ❌                   | ❌        |

> `manager` et `collaborateur` : zéro droit sur les prestations. Seule l'attribution de site compte.

---

### 3. Posture PRESTATAIRE

**Visibilité niveau 1 (inter-entreprises) :** une prestation n'est visible que si au moins une exécution (`clientServiceExecutions`) associe cette prestation à l'entreprise prestataire — peu importe le statut `actif` de l'exécution.

**Visibilité niveau 2 (interne non-admin) :** filtrage supplémentaire par attributions de site (`userPrestataireSiteAttributions`).

| Action                   | `admin`             | `manager`       | `responsable_site` | `intervenant_site` | `observateur_site`   |
| ------------------------ | ------------------- | --------------- | ------------------ | ------------------ | -------------------- |
| Voir prestations         | Périmètre exécution | Sites attribués | Sites attribués    | Sites attribués    | Sites attribués (RO) |
| Voir données financières | ✅                  | ❌              | ✅                 | ❌                 | ❌                   |
| Créer                    | ✅                  | ❌              | ✅ (ses sites)     | ❌                 | ❌                   |
| Modifier                 | ✅                  | ❌              | ✅ (ses sites)     | ❌                 | ❌                   |
| Archiver                 | ✅                  | ❌              | ❌                 | ❌                 | ❌                   |

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

_Dernière mise à jour : 2026-03-11_

---

## Module Exécutions (`clientServiceExecutions`)

> ⚠️ Ne pas confondre avec les **occurrences** : les exécutions définissent **qui fait quoi et comment** ; les occurrences correspondent aux **passages effectifs**.

---

### 1. `modePilotage` — valeurs et contraintes

`modePilotage` détermine qui crée, planifie et assigne les occurrences.

| Valeur          | Qui pilote                          |
| --------------- | ----------------------------------- |
| `client`        | L'entreprise cliente uniquement     |
| `prestataire`   | L'entreprise prestataire uniquement |
| `collaboration` | Les deux ensemble                   |

**Contraintes selon les entreprises fantômes** (sans admin actif) :

| Client fantôme | Prestataire fantôme |         `modePilotage` autorisé          |
| :------------: | :-----------------: | :--------------------------------------: |
|       ✅       |         ❌          |         `prestataire` uniquement         |
|       ❌       |         ✅          |           `client` uniquement            |
|       ❌       |         ❌          | `client`, `prestataire`, `collaboration` |
|       ✅       |         ✅          |       ❌ Impossible — aucun pilote       |

> Valeurs impossibles filtrées côté formulaire **et** validées côté serveur.

> `modePilotage` n'influence **pas** les permissions de l'exécution elle-même. Il régit uniquement la gouvernance des occurrences.

---

### 2. Posture CLIENT

| Action                   | `admin` | `responsable_site` | `demandeur_site` | `observateur_site`   | `manager` |
| ------------------------ | ------- | ------------------ | ---------------- | -------------------- | --------- |
| Voir exécutions          | Toutes  | Sites attribués    | Sites attribués  | Sites attribués (RO) | ❌        |
| Voir données financières | ✅      | ✅                 | ❌               | ❌                   | ❌        |
| Créer                    | ✅      | ✅ (ses sites)     | ❌               | ❌                   | ❌        |
| Modifier                 | ✅      | ✅ (ses sites)     | ❌               | ❌                   | ❌        |
| Désactiver               | ✅      | ❌                 | ❌               | ❌                   | ❌        |

---

### 3. Posture PRESTATAIRE

Le prestataire ne voit et n'agit que sur les exécutions où `prestataireEntrepriseId = sonEntreprise`.

| Action                   | `admin`                 | `manager`       | `responsable_site` | `intervenant_site` | `observateur_site`   |
| ------------------------ | ----------------------- | --------------- | ------------------ | ------------------ | -------------------- |
| Voir exécutions          | Toutes (son entreprise) | Sites attribués | Sites attribués    | Sites attribués    | Sites attribués (RO) |
| Voir données financières | ✅                      | ❌              | ✅                 | ❌                 | ❌                   |
| Créer                    | ✅                      | ❌              | ✅ (ses sites)     | ❌                 | ❌                   |
| Modifier                 | ✅                      | ❌              | ✅ (ses sites)     | ❌                 | ❌                   |
| Désactiver               | ✅                      | ❌              | ❌                 | ❌                 | ❌                   |

> Condition préalable à toute création : `clientPrestataireRelations` doit exister.

---

### 4. Posture PLATEFORME

Droits complets. Voir données financières inclus.

---

### 5. Désactivation et suppression

> **Règle générale :** ne jamais supprimer une exécution — toujours désactiver (`actif = false`) pour conserver l'historique.

**Exception — suppression physique :** autorisée uniquement si l'exécution a été créée par erreur et qu'elle n'a aucune occurrence associée.

| Posture             | Condition                                                       |
| ------------------- | --------------------------------------------------------------- |
| Plateforme          | Toujours                                                        |
| Client `admin`      | `modePilotage = "client"` ou `"collaboration"`                  |
| Prestataire `admin` | `modePilotage = "prestataire"` ou `"collaboration"` + ownership |

---

_Dernière mise à jour : 2026-03-11_

---

## Module Sites (`sites`)

> Référence unique pour toutes les permissions liées aux sites.

---

### A) Posture CLIENT (`/app/sites`)

**Voir les sites :** tous les utilisateurs avec une adhésion client `statut = actif` voient l'arborescence complète.

| Action                      | `admin`   | `manager` + `responsable_site` | `collaborateur` + `responsable_site` | `responsable_site` seul | Autres |
| --------------------------- | --------- | ------------------------------ | ------------------------------------ | ----------------------- | ------ |
| Créer site racine           | ✅        | ❌                             | ❌                                   | ❌                      | ❌     |
| Créer sous-site             | ✅        | ✅ si resp. du parent          | ✅ si resp. du parent                | ✅ si resp. du parent   | ❌     |
| Modifier                    | ✅ (tous) | ✅ si resp. du site            | ✅ si resp. du site                  | ✅ ce site uniquement   | ❌     |
| Déplacer (changer parentId) | ✅        | ❌                             | ❌                                   | ❌                      | ❌     |
| Archiver                    | ✅        | ❌                             | ❌                                   | ❌                      | ❌     |

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

| Action            | `admin` prestataire | `manager` + `responsable_site` | Autres                  |
| ----------------- | ------------------- | ------------------------------ | ----------------------- |
| Voir              | ✅                  | ✅                             | ✅ (si adhésion active) |
| Créer site racine | ✅                  | ❌                             | ❌                      |
| Créer sous-site   | ✅                  | ✅ si resp. du parent          | ❌                      |
| Modifier          | ✅                  | ✅ si resp. du site            | ❌                      |
| Archiver          | ✅                  | ❌                             | ❌                      |

> **Règle :** le proxy se déclenche dès l'absence d'admin client actif (`userClientAdhesions.role = "admin" AND statut = "actif"`), même si des managers ou collaborateurs sont actifs. Seul un admin peut prendre des décisions structurantes sur les sites.

---

### C) Posture PLATEFORME (`/app/sites-clients`)

Droits complets sur tous les sites de tous les clients.

| Action                      | Autorisé                               |
| --------------------------- | -------------------------------------- |
| Voir                        | ✅                                     |
| Créer / Modifier / Archiver | ✅                                     |
| Supprimer définitivement    | ✅ `super_admin_plateforme` uniquement |

---

### Règle technique — Toujours inclure les sites inactifs dans les queries

Les sites archivés (`actif = false`) doivent toujours être inclus — des données opérationnelles (tickets, occurrences, prestations) peuvent encore les référencer.

---

_Dernière mise à jour : 2026-03-11_

---

## Module Occurrences (`clientServiceOccurrences`)

> ⚠️ Ne pas confondre avec les **exécutions** : les occurrences représentent les **interventions terrain concrètes**.

---

### 1. Deux capacités distinctes

| Capacité               | Actions couvertes                                            | Rôles requis                                                                                                    |
| ---------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `canManageOccurrence`  | Créer, replanifier, annuler, marquer non honorée, réassigner | `admin` ou `responsable_site` (selon posture et `modePilotage`)                                                 |
| `canExecuteOccurrence` | Démarrer, terminer                                           | `admin`, `responsable_site`, `demandeur_site` (client), `intervenant_site` (prestataire) — selon `modePilotage` |

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

| Rôle                          | Voir | Gérer | Démarrer | Terminer      |
| ----------------------------- | ---- | ----- | -------- | ------------- |
| **client** `admin`            | ✅   | ✅    | ✅       | ✅            |
| **client** `responsable_site` | ✅   | ✅    | ✅       | ✅            |
| **client** `demandeur_site`   | ✅   | ❌    | ✅       | ✅ si assigné |
| **client** `observateur_site` | ✅   | ❌    | ❌       | ❌            |
| **prestataire** (tous rôles)  | ✅   | ❌    | ❌       | ❌            |

#### Mode `prestataire`

| Rôle                               | Voir | Gérer | Démarrer | Terminer      |
| ---------------------------------- | ---- | ----- | -------- | ------------- |
| **client** (tous rôles)            | ✅   | ❌    | ❌       | ❌            |
| **prestataire** `admin`            | ✅   | ✅    | ✅       | ✅            |
| **prestataire** `responsable_site` | ✅   | ✅    | ✅       | ✅            |
| **prestataire** `intervenant_site` | ✅   | ❌    | ✅       | ✅ si assigné |
| **prestataire** `observateur_site` | ✅   | ❌    | ❌       | ❌            |

#### Mode `collaboration`

| Rôle                               | Voir | Gérer | Démarrer | Terminer      |
| ---------------------------------- | ---- | ----- | -------- | ------------- |
| **client** `admin`                 | ✅   | ✅    | ✅       | ✅            |
| **client** `responsable_site`      | ✅   | ✅    | ✅       | ✅            |
| **client** `demandeur_site`        | ✅   | ❌    | ✅       | ✅ si assigné |
| **client** `observateur_site`      | ✅   | ❌    | ❌       | ❌            |
| **prestataire** `admin`            | ✅   | ✅    | ✅       | ✅            |
| **prestataire** `responsable_site` | ✅   | ✅    | ✅       | ✅            |
| **prestataire** `intervenant_site` | ✅   | ❌    | ✅       | ✅ si assigné |
| **prestataire** `observateur_site` | ✅   | ❌    | ❌       | ❌            |

#### Posture PLATEFORME (tous modes)

Voir ✅ Gérer ✅ Démarrer ✅ Terminer ✅

---

### 4. Périmètre de visibilité des occurrences

**Posture CLIENT**

| Rôle               | Voit quelles occurrences                               |
| ------------------ | ------------------------------------------------------ |
| `admin`            | Toutes les occurrences des prestations de l'entreprise |
| `responsable_site` | Occurrences des sites attribués                        |
| `demandeur_site`   | Occurrences des sites attribués                        |
| `observateur_site` | Occurrences des sites attribués (lecture seule)        |

**Posture PRESTATAIRE** (condition : `execution.prestataireEntrepriseId = sonEntrepriseId`)

| Rôle               | Voit quelles occurrences                                           |
| ------------------ | ------------------------------------------------------------------ |
| `admin`            | Toutes les occurrences liées à ses exécutions                      |
| `manager`          | Occurrences des sites clients attribués (même règle que non-admin) |
| `responsable_site` | Occurrences des sites clients attribués                            |
| `intervenant_site` | Occurrences des sites clients attribués                            |
| `observateur_site` | Occurrences des sites clients attribués (lecture seule)            |

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

| Action        | Statut source          | Qui peut              |
| ------------- | ---------------------- | --------------------- |
| `annulee`     | `planifiee` uniquement | `canManageOccurrence` |
| `non_honoree` | `planifiee` uniquement | `canManageOccurrence` |

> Une occurrence déjà démarrée (`en_cours`) ne peut que terminer (`terminee`). Si l'intervention est impossible en cours de route, les tâches individuelles sont marquées `non_honoree` ou `non_applicable`. L'occurrence elle-même finit `terminee`.

---

### 8. Auto-assignation

L'assignation est un **effet du démarrage** (`assigneeUserId = currentUser.id`). Elle écrase toute préassignation existante.

---

### 9. Déplacement et redimensionnement depuis le calendrier

> Ces actions correspondent à `canManageOccurrence`. Seule une occurrence `planifiee` peut être déplacée ou redimensionnée.

**Qui peut déplacer / redimensionner une occurrence depuis le calendrier :**

| Acteur | Condition |
|---|---|
| **Plateforme** | Toujours |
| **Client `admin`** | `modePilotage = "client"` ou `"collaboration"` |
| **Client `responsable_site`** | `modePilotage = "client"` ou `"collaboration"` + site attribué (avec héritage subtree et exclusions) |
| **Prestataire `admin`** | `modePilotage = "prestataire"` ou `"collaboration"` |
| **Prestataire `responsable_site`** | `modePilotage = "prestataire"` ou `"collaboration"` + site client attribué (avec héritage subtree) |
| **Tous les autres rôles** | ❌ Jamais (`manager`, `collaborateur`, `demandeur_site`, `observateur_site`, `intervenant_site`) |

**Implémentation :**
- Guard serveur : `canManageOccurrence` dans `clientServiceOccurrencesActions.ts`
- Guard UI : `eventAllow` + `editable` calculés depuis `canEditCalendar` (admin) et `responsableSiteIds` (responsable_site) retournés par `getCalendarFilterOptionsAction`
- Résolution arborescence client : `resolveUserEffectiveRolesOnSites` (closure table + exclusions `mode=exclure`)
- Résolution arborescence prestataire : `getResponsableSiteIdsByPrestataire` (closure table + exclusions)

_Dernière mise à jour : 2026-03-17_

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

| Capacité     | Actions couvertes                                                        |
| ------------ | ------------------------------------------------------------------------ |
| `canManage`  | Créer ad hoc, modifier ad hoc, annuler, corriger `tempsPasseSecondes`    |
| `canExecute` | Démarrer, terminer (si assigné), non_honoree, non_applicable, ajouter PJ |

`canManage` = `admin` ou `responsable_site` selon posture et `modePilotage`.
`canExecute` = `admin`, `responsable_site`, `demandeur_site` (client, si non mode prestataire), `intervenant_site` (prestataire, si non mode client).

---

### 4. Condition préalable : occurrence parente `en_cours`

**Une tâche ne peut être démarrée que si son occurrence parente a le statut `en_cours`.** Les PJ et les transitions de statut (`non_applicable`, `non_honoree`) suivent la même règle.

---

### 5. Matrice des permissions

| Action                         |       `canManage`        | `canExecute` + assigné | `canExecute` non assigné |
| ------------------------------ | :----------------------: | :--------------------: | :----------------------: |
| Voir                           |            ✅            |           ✅           |            ✅            |
| Créer ad hoc                   |            ✅            |           ❌           |            ❌            |
| Modifier ad hoc                | ✅ (si a_faire/en_cours) |           ❌           |            ❌            |
| Démarrer (a_faire → en_cours)  |            ✅            |           ✅           |            ✅            |
| Terminer (en_cours → terminee) |            ✅            |           ✅           |            ❌            |
| Non applicable                 |            ✅            |           ✅           |            ✅            |
| Non honorée                    |            ✅            |           ✅           |            ✅            |
| Annuler                        |            ✅            |           ❌           |            ❌            |
| Ajouter PJ (tâche en_cours)    |            ✅            |           ✅           |            ✅            |
| Corriger tempsPassé (terminee) |            ✅            |           ❌           |            ❌            |

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

| Condition                       | Peut corriger |
| ------------------------------- | :-----------: |
| `canManage` ET tâche `terminee` |      ✅       |
| Tous les autres cas             |      ❌       |

- Valeur minimale : 0 s
- Valeur maximale : 604 800 s (7 jours)

---

### 9. Pièces jointes (preuves)

- Ajout : `canExecute` ou `canManage` + tâche `en_cours` uniquement
- Vue : tout utilisateur pouvant voir la tâche
- Maximum recommandé : 2 PJ par tâche (images et PDFs)

> Preuves ajoutables uniquement pendant l'exécution (`en_cours`). Contrainte UX intentionnelle : la preuve doit être fournie pendant l'acte, pas après coup.

---

_Dernière mise à jour : 2026-03-11_

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

| Posture     | Table                             |
| ----------- | --------------------------------- |
| Client      | `userClientSiteAttributions`      |
| Prestataire | `userPrestataireSiteAttributions` |

**Rôles client :** `responsable_site` · `demandeur_site` · `observateur_site`

**Rôles prestataire :** `responsable_site` · `demandeur_site` · `observateur_site` · `intervenant_site`

---

### 3. Qui peut attribuer un site ?

**Posture CLIENT**

| Rôle de l'attributeur                        | Peut attribuer | Périmètre                                                       |
| -------------------------------------------- | -------------- | --------------------------------------------------------------- |
| `admin`                                      | ✅             | Tous les sites                                                  |
| `manager` + `responsable_site` du site       | ✅             | Sites de son périmètre, à ses descendants (`usersArborescence`) |
| `collaborateur` + `responsable_site` du site | ✅             | Sites de son périmètre, à ses descendants (`usersArborescence`) |
| `manager` sans `responsable_site`            | ❌             | —                                                               |
| `collaborateur` sans `responsable_site`      | ❌             | —                                                               |

> **Hiérarchie utilisateurs :** la cible d'une attribution (non-admin) doit être un descendant de l'attributeur dans `usersArborescence` (closure table). Un responsable local ne peut pas attribuer à n'importe quel membre de l'entreprise.

**Posture PRESTATAIRE**

- Client avec admin actif → lecture seule, aucune attribution possible
- Mode proxy → mêmes règles que côté client

**Posture PLATEFORME :** peut attribuer n'importe quel site à n'importe quel utilisateur.

---

### 4. Qui peut attribuer quel rôle ?

**Attribution client**

| Rôle donné         | Qui peut l'attribuer          |
| ------------------ | ----------------------------- |
| `responsable_site` | `admin` uniquement            |
| `demandeur_site`   | `admin` ou `responsable_site` |
| `observateur_site` | `admin` ou `responsable_site` |

**Attribution prestataire**

| Rôle donné         | Qui peut l'attribuer          |
| ------------------ | ----------------------------- |
| `responsable_site` | `admin` uniquement            |
| `demandeur_site`   | `admin` ou `responsable_site` |
| `observateur_site` | `admin` ou `responsable_site` |
| `intervenant_site` | `admin` ou `responsable_site` |

> **Guard self-action :** un manager ou collaborateur ne peut pas modifier ses propres attributions (uniquement `admin`).

---

### 5. Scope et mode d'attribution

| Dimension | Valeur    | Signification                                    |
| --------- | --------- | ------------------------------------------------ |
| `scope`   | `subtree` | S'applique au site et tous ses descendants       |
| `scope`   | `exact`   | S'applique uniquement au site désigné            |
| `mode`    | `inclure` | Accorde les droits                               |
| `mode`    | `exclure` | Retire les droits (exception dans un sous-arbre) |

---

_Dernière mise à jour : 2026-03-11_

---

## Module Checklists (`tacheListesTemplates` / `tacheListeItems`)

> Référence unique pour les permissions liées aux packs de tâches (templates).

---

### 1. Deux types de packs

| Type                      | `proprietaireEntrepriseId` | Accessible par                              |
| ------------------------- | -------------------------- | ------------------------------------------- |
| **Pack système** (FM4ALL) | `null`                     | Tous les utilisateurs authentifiés          |
| **Pack entreprise**       | ID de l'entreprise         | Utilisateurs de cette entreprise uniquement |

---

### 2. Exception doctrine manager

> Le module Checklists est un module **catalogue** (création de templates réutilisables), non un module terrain. Le `manager` peut gérer les packs car c'est une activité de gouvernance d'équipe. Cette exception à la doctrine générale `manager` est intentionnelle et circonscrite à ce module.

---

### 3. Qui peut gérer les packs ?

**Pack système :** `super_admin_plateforme` uniquement.

**Pack entreprise :**

| Posture     | Rôle requis                            |
| ----------- | -------------------------------------- |
| Client      | `admin` ou `manager` (adhésion active) |
| Prestataire | `admin` ou `manager` (adhésion active) |
| Plateforme  | Toujours                               |

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

_Dernière mise à jour : 2026-03-11_

---

## Module Factures (`factures`)

> Référence unique pour toutes les permissions liées aux factures.

---

### 1. Statuts

| Statut      | Signification                                                            |
| ----------- | ------------------------------------------------------------------------ |
| `brouillon` | Création/modification possible, non visible par le destinataire          |
| `emise`     | Pièce comptable figée, visible par le destinataire, montants verrouillés |
| `litige`    | Facture émise contestée — en attente de résolution                       |
| `annulee`   | Annulée après émission — données conservées                              |

> V1 : l'annulation change uniquement le statut. Aucun avoir automatique n'est créé. Un avoir comptable devra être géré manuellement en V2 pour conformité.

---

### 2. Parties d'une facture

| Champ                      | Rôle                                                 |
| -------------------------- | ---------------------------------------------------- |
| `emetteurEntrepriseId`     | Entreprise qui facture (prestataire ou FM4ALL)       |
| `destinataireEntrepriseId` | Entreprise qui reçoit la facture (client)            |
| `modeCommercialSnapshot`   | `"direct"` ou `"intermediaire"` — figé à la création |

> Une facture est **toujours émise par un prestataire ou FM4ALL**. Une entreprise en posture client n'émet jamais de facture.

---

### 3. Posture ÉMETTEUR (prestataire)

| Action                    | `admin` | `manager` | `responsable_site` | Autres |
| ------------------------- | ------- | --------- | ------------------ | ------ |
| Voir (brouillon + émises) | ✅      | ✅        | ❌                 | ❌     |
| Créer                     | ✅      | ✅        | ❌                 | ❌     |
| Modifier (brouillon)      | ✅      | ✅        | ❌                 | ❌     |
| Émettre                   | ✅      | ✅        | ❌                 | ❌     |
| Annuler (émise)           | ✅      | ✅        | ❌                 | ❌     |

> **Exception manager :** dans ce module, `manager` a des droits d'émission car la facturation est une activité de gouvernance d'entreprise, non une activité terrain.

---

### 4. Posture DESTINATAIRE (client)

Le destinataire voit uniquement les factures au statut `emise` (jamais les brouillons).

La visibilité est restreinte selon le `siteId` de la facture :

| Condition                 | Qui peut voir                                 |
| ------------------------- | --------------------------------------------- |
| Facture **avec `siteId`** | `admin` + `responsable_site` du site concerné |
| Facture **sans `siteId`** | `admin` uniquement                            |

> Aucune modification, émission ou annulation possible côté destinataire.

---

### 5. Posture PLATEFORME

Deux périmètres distincts selon le `modeCommercialSnapshot` :

#### Factures `modeCommercialSnapshot = "direct"` (prestataire externe → client)

Lecture seule. FM4ALL n'est pas partie prenante de ces contrats en posture plateforme.

| Action                                         | Autorisé |
| ---------------------------------------------- | -------- |
| Voir (`emise` + `litige`) — tous les émetteurs | ✅       |
| Voir brouillons                                | ❌       |
| Créer / Modifier / Émettre / Annuler           | ❌       |

> Si FM4ALL est lui-même prestataire direct (ex: office manager, pilotage FM), l'utilisateur FM4ALL bascule en posture `"prestataire"` pour gérer ses propres factures — les règles de la posture émetteur s'appliquent.

#### Factures `modeCommercialSnapshot = "intermediaire"` (FM4ALL facture le client)

FM4ALL est l'émetteur. Les utilisateurs FM4ALL disposent des **mêmes droits que la posture émetteur** (§3), selon leur rôle dans l'entreprise FM4ALL.

| Action                                | `admin` FM4ALL | `manager` FM4ALL | Autres |
| ------------------------------------- | -------------- | ---------------- | ------ |
| Voir (brouillon + `emise` + `litige`) | ✅             | ✅               | ❌     |
| Créer                                 | ✅             | ✅               | ❌     |
| Modifier (brouillon)                  | ✅             | ✅               | ❌     |
| Émettre                               | ✅             | ✅               | ❌     |
| Annuler (`emise`)                     | ✅             | ✅               | ❌     |

> Ces droits sont conditionnés à `getEffectivePlateformeRole` non-null (cookie posture = `"plateforme"`) ET `emetteurEntrepriseId` = entreprise FM4ALL.

---

### 6. Montants figés à l'émission

À l'émission, les champs `montantHt`, `montantTva`, `montantTtc` de chaque ligne sont calculés et stockés en base. Ils ne sont jamais recalculés — la facture est une pièce comptable immuable.

---

### 7. Contact et site dans le formulaire de création (`FactureNouvelleClient`)

Contrairement au devis, le `siteId` est **nullable** en DB (`factures.siteId` sans `.notNull()`).

**Sélecteur Site (optionnel)** :

- Option **"Pas de site"** (`value="none"`) disponible → `siteId` envoyé comme `""` → `normalizeForSubmit` → `null` en DB
- Affiché dans `FacturePreviewCard` sous le SIRET du client, avec adresse formatée (`siteAdresse + codePostal + ville` en une seule ligne)

**Sélecteur Contact (optionnel)** :

- Chargé depuis `entreprise_contacts` pour le client sélectionné (`getEntrepriseContactsAction`)
- Option **"Pas de contact"** (`value="none"`) → `contactId` envoyé comme `""` → `normalizeForSubmit` → `null`
- Affiché dans `FacturePreviewCard` sous le SIRET/TVA du destinataire, avant la section site

**Cohérence labels** : les deux champs utilisent `label="X (optionnel)"` — pas d'`(optionnel)` dans le placeholder.

---

_Dernière mise à jour : 2026-03-13_

---

## Module Documents (`documents`)

> Référence unique pour toutes les permissions liées à la bibliothèque de documents.

---

### 1. Sémantique des champs

| Champ                      | Signification                                               |
| -------------------------- | ----------------------------------------------------------- |
| `proprietaireEntrepriseId` | L'entreprise propriétaire du document                       |
| `visibilite`               | `"prive"` (interne) ou `"public"` (partagé aux partenaires) |
| `categorie`                | `"document"` — seule valeur supportée en V1                 |
| `storageKey`               | Clé S3 permanente (promue depuis `temp/` à l'upload)        |

> La table `documentsLinks` porte la visibilité. Un document sans ligne dans `documentsLinks` pour son propre `entrepriseId` n'est pas visible — cette ligne est toujours créée dans la même transaction que l'insertion du document.

---

### 2. Deux onglets — périmètres distincts

| Onglet                 | Contenu                                                       | Filtrable par                               |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| **Mes documents**      | Documents dont `proprietaireEntrepriseId = monEntrepriseId`   | Recherche, visibilité, tags, tri            |
| **Documents partagés** | Documents `visibilite = "public"` appartenant aux partenaires | Recherche, entreprise partenaire, tags, tri |

> Les documents privés (`visibilite = "prive"`) n'apparaissent **jamais** dans l'onglet "Documents partagés" — la lecture est filtrée à l'exécution sur `visibilite = "public"`.

---

### 3. Qui sont les "partenaires" ?

Le périmètre des partenaires visibles dans "Documents partagés" dépend de la posture :

| Posture       | Partenaires vus                                    |
| ------------- | -------------------------------------------------- |
| `client`      | Prestataires liés via `clientPrestataireRelations` |
| `prestataire` | Clients liés via `clientPrestataireRelations`      |
| `plateforme`  | Toutes les entreprises (sauf la sienne)            |

---

### 4. Permissions de lecture

Tout utilisateur avec une adhésion active sur l'entreprise peut **voir** les documents :

| Onglet             | Conditions                                              |
| ------------------ | ------------------------------------------------------- |
| Mes documents      | `hasAccessToEntreprise(userId, entrepriseId)` = vrai    |
| Documents partagés | Idem + document `visibilite = "public"` d'un partenaire |

> **Règle :** `hasAccessToEntreprise` est posture-aware. Un utilisateur en posture prestataire ne peut pas accéder aux documents d'une entreprise cliente en passant son ID directement — seul le périmètre `clientPrestataireRelations` est autorisé.

---

### 5. Permissions d'écriture (`assertCanWrite`)

Seuls **admin** et **manager** peuvent créer, modifier ou supprimer des documents. La plateforme bypasse toujours.

| Posture       | Rôle requis                                      |
| ------------- | ------------------------------------------------ |
| `client`      | `admin` ou `manager` (adhésion active)           |
| `prestataire` | `admin` ou `manager` (adhésion active)           |
| `plateforme`  | Toujours (`getEffectivePlateformeRole` non-null) |

> **Exception doctrine manager :** dans ce module, `manager` a des droits d'écriture car la gestion documentaire est une activité de gouvernance d'entreprise, non une activité terrain. Cohérent avec le module Factures.

---

### 6. Actions disponibles par posture

#### Onglet "Mes documents"

| Action                             | `admin` | `manager` | `collaborateur` | `responsable_site` |
| ---------------------------------- | ------- | --------- | --------------- | ------------------ |
| Voir                               | ✅      | ✅        | ✅              | ✅                 |
| Télécharger / Prévisualiser        | ✅      | ✅        | ✅              | ✅                 |
| Créer                              | ✅      | ✅        | ❌              | ❌                 |
| Modifier (titre, visibilité, tags) | ✅      | ✅        | ❌              | ❌                 |
| Supprimer                          | ✅      | ✅        | ❌              | ❌                 |
| Créer un tag                       | ✅      | ✅        | ❌              | ❌                 |

#### Onglet "Documents partagés"

Lecture seule pour tous : aucune création, modification ou suppression de documents partenaires.

| Action                       | Tous |
| ---------------------------- | ---- |
| Voir                         | ✅   |
| Télécharger / Prévisualiser  | ✅   |
| Créer / Modifier / Supprimer | ❌   |

---

### 7. Suppression d'un document

- La suppression est un **DELETE physique** (document + objet S3 via `deleteS3Object`).
- Aucun archivage logique — la donnée disparaît définitivement.
- Réservé aux documents dont `proprietaireEntrepriseId` correspond à l'entreprise de l'utilisateur.

> **Rationale :** un document est un fichier binaire externe. L'archivage logique n'apporte pas de valeur — le fichier S3 resterait à facturer. La suppression est le comportement attendu.

---

### 8. Tags

- Les tags sont **par entreprise** (`proprietaireEntrepriseId` sur `documentsTags`).
- Un tag créé par un client n'est pas visible par un prestataire et vice-versa.
- La création de tag requiert `assertCanWrite` (admin ou manager).
- Le filtrage par tag utilise une logique **OR** (un document avec l'un des tags sélectionnés est retourné).
- Dans "Documents partagés", les tags affichés sont ceux des partenaires, filtrés selon la posture (même périmètre que §3).

---

### 9. Prévisualisation et téléchargement

Les URLs S3 sont générées via `getPresignedReadUrlAction` avec une durée de validité courte (`S3_PRESIGN_READ_EXPIRES_SECONDS`, défaut 60 s).

- **Prévisualisables** : `image/*`, `application/pdf`, `video/*` — récupérés via `fetch → Blob → createObjectURL` pour contourner les erreurs CORS S3.
- **Non prévisualisables** (Office, CSV, etc.) : affichage "Aperçu non disponible" + lien de téléchargement.
- Les URLs présignées ne sont **jamais** générées côté serveur pour les listes — uniquement au montage du composant client.

---

## Module N — Contacts Entreprise & Contacts Relation

> Introduit lors de la refonte du modèle de contacts (2026-03-13).
> Remplace les champs inline sur `entreprises` et `client_prestataire_relations`.

### 1. Modèle de données

**Avant** : 4 champs inline sur `entreprises` (prénom/nom/email/téléphone) + 8 champs inline sur `client_prestataire_relations` (4 côté client, 4 côté prestataire). Limité à 1 contact par entité/relation.

**Après** :

- `entreprise_contacts` — n contacts par entreprise, avec lien optionnel vers un `userId` de la plateforme
- `client_prestataire_relation_contacts` — table de jonction entre une relation et un contact, avec `side: "client" | "prestataire"`, `role` (texte libre), `est_principal` (booléen)

**Règle de cohérence** : un contact dans `client_prestataire_relation_contacts` DOIT appartenir à l'entreprise correspondant à son `side` (le contact "prestataire" doit être un contact de l'entreprise prestataire, et vice-versa). Cette règle est vérifiée côté applicatif au moment de la liaison.

### 2. Permissions — Contacts d'entreprise (`entreprise_contacts`)

| Action                      | Condition                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Voir (liste)                | `hasAccessToEntreprise(userId, entrepriseId)`                                                                     |
| Créer                       | `hasAccessToEntreprise(userId, entrepriseId)`                                                                     |
| Modifier                    | `hasAccessToEntreprise(userId, entrepriseId)` + **`contact.userId` doit être `null`** (ownership vérifié via lookup) |
| Supprimer (DELETE physique) | `hasAccessToEntreprise(userId, entrepriseId)` + **`contact.userId` doit être `null`** + contact non référencé dans `client_prestataire_relation_contacts` |

> **Blocage si userId** : si le contact a un `userId` (= lié à un compte utilisateur actif), les actions `updateEntrepriseContactAction` et `deleteEntrepriseContactAction` retournent une erreur `errors.conflict()`. Les données du compte sont la source de vérité — elles se synchronisent automatiquement depuis `updateUserAction` (voir §4 ci-dessous). L'UI masque les boutons Modifier/Supprimer/Inviter pour ces contacts.

> **Blocage suppression (lien relation)** : si le contact est lié à au moins une relation (`COUNT(client_prestataire_relation_contacts WHERE contactId = ...)` > 0), la suppression est refusée avec un message explicite. Il faut d'abord le retirer de toutes les relations.

> **Rationale** : les contacts sont un carnet d'adresses de référence. Tout utilisateur avec une adhésion active peut les gérer. Cette page étant réservée à la posture plateforme (`getUserPlateformeAdhesion`), la restriction admin/manager est implicite.

> **Cascade** : si une entreprise est supprimée, ses contacts le sont aussi (`ON DELETE CASCADE`). Mais la suppression unitaire est bloquée si des liens de relation existent.

### 2bis. Badge de statut contact

Chaque contact affiché dans l'UI porte un badge :

| Badge | Condition | Style |
|-------|-----------|-------|
| **Utilisateur** | `c.userId` non null | Vert (`border-green-300 bg-green-50 text-green-700`) |
| **Sans compte** | `c.userId` null | Grisé (`text-muted-foreground`) |

Affiché dans : `EntrepriseDetailsClient`, `ClientDetailClient`, `PrestataireDetailClient`.

### 3. Permissions — Contacts de relation (`client_prestataire_relation_contacts`)

| Action                           | Condition                                                           |
| -------------------------------- | ------------------------------------------------------------------- |
| Voir (liste)                     | Accès à l'entreprise cliente OU prestataire de la relation          |
| Lier un contact                  | `admin` ou `manager` côté client OU côté prestataire (+ plateforme) |
| Délier (DELETE physique du lien) | `admin` ou `manager` côté client OU côté prestataire (+ plateforme) |

> **Vérification** : via `canManageRelationContacts(userId, clientEntrepriseId, prestataireEntrepriseId)` — vérifie `getUserClientAdhesion` (role admin/manager + statut actif) OU `getUserPrestataireAdhesion` (entrepriseId match + role admin/manager + statut actif) OU `getEffectivePlateformeRole`. Un `collaborateur` ne peut pas gérer les contacts de relation.

### 4. Actions disponibles

| Action                                            | Fichier                 | Description                                                                            |
| ------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| `getEntrepriseContactsAction`                     | `entreprisesActions.ts` | Liste les contacts d'une entreprise                                                    |
| `insertEntrepriseContactAction`                   | `entreprisesActions.ts` | Crée un contact (normalizeForSubmit)                                                   |
| `updateEntrepriseContactAction`                   | `entreprisesActions.ts` | Modifie un contact — bloqué si `contact.userId` non null (`errors.conflict()`)         |
| `deleteEntrepriseContactAction`                   | `entreprisesActions.ts` | Supprime un contact — bloqué si `contact.userId` non null ou lié à une relation        |
| `inviterContactAction`                            | `entreprisesActions.ts` | Envoie une invitation par email à un contact sans compte                               |
| `accepterInvitationContactAction`                 | `entreprisesActions.ts` | Crée le compte user + adhésion collaborateur à partir du token                         |
| `getRelationContactsAction`                       | `entreprisesActions.ts` | Liste les contacts d'une relation avec détails                                         |
| `getEntrepriseContactsForRelationAction`          | `entreprisesActions.ts` | Liste les contacts de `targetEntrepriseId` **non encore liés** à `relationId` (filtre `notExists`) + `totalContactCount` |
| `insertRelationContactAction`                     | `entreprisesActions.ts` | Lie un contact à une relation (normalizeForSubmit)                                     |
| `insertEntrepriseContactAndLinkToRelationAction`  | `entreprisesActions.ts` | Crée un contact + le lie à la relation en une transaction atomique                     |
| `deleteRelationContactAction`                     | `entreprisesActions.ts` | Retire un contact d'une relation (sans guard userId — retrait relation = sans danger)  |

> **Sync user → contact** : `updateUserAction` (`usersActions.ts`) met à jour en transaction les champs `prenom`, `nom`, `phone` de tous les `entrepriseContacts` où `userId = parsedInput.userId`. Uniquement si au moins un de ces champs est dans le payload. L'email n'est pas synchronisé (il passe par un flow de vérification dédié).

### 5. Normalisation (`normalizeForSubmit`)

| Schema                            | Champs normalisés (`"" → null`)       |
| --------------------------------- | ------------------------------------- |
| `insertEntrepriseContactSchema`   | `email`, `phone`, `fonction`, `notes` |
| `updateEntrepriseContactSchema`   | `email`, `phone`, `fonction`, `notes` |
| `insertRelationContactSchema`     | `role`                                |
| `accepterInvitationContactSchema` | `phone`, `fonction`                   |

`userId` sur le contact est un UUID optionnel (`z.uuid().optional()`) — géré avec `?? null` directement, sans passer par `normalizeForSubmit`.

### 6. Flux d'invitation contact — table `contacts_invitations`

> Anciennement `entreprise_invitations`. Renommée et enrichie d'une FK `contact_id` vers `entreprise_contacts`.

**Conditions d'envoi** (`inviterContactAction`) :

- Appelant : accès à l'entreprise (`hasAccessToEntreprise`) OU rôle plateforme
- Contact cible : doit avoir un `email`, ne pas avoir de `userId`, appartenir à l'entreprise
- L'email cible ne doit pas correspondre à un compte utilisateur existant
- Toute invitation en attente pour le même `contactId` est annulée avant la création

**Données du token** : entreprise, email, typeAdhesion (client|prestataire), contactId, expiresAt (7 jours)

**Acceptation** (`accepterInvitationContactAction`, page `/auth/inscription?token=xxx`) :

1. Validation du token (non expiré, non accepté)
2. Création du compte via `auth.api.signUpEmail` (mot de passe aléatoire)
3. Transaction atomique :
   - Adhésion `collaborateur` dans `userClientAdhesions` ou `userPrestataireAdhesions` selon `typeAdhesion`
   - Mise à jour `entrepriseContacts.userId = newUserId` + prenom/nom/phone/fonction modifiés par l'utilisateur
   - Entrée closure table (`usersArborescence`, `parentId = null`)
   - Marquer `acceptedAt = now()` dans `contacts_invitations`
4. Email `requestPasswordReset` (non bloquant) → `/auth/reset-password?type=activation`

**Rôle forcé** : toujours `"collaborateur"`. Jamais `"admin"`.

**Cas `contactId = null`** (ancienne invitation admin sans contact source) : au lieu de mettre à jour un contact existant, la transaction crée une nouvelle entrée `entrepriseContacts` avec les données saisies par l'utilisateur (`prenom`, `nom`, `email`, `phone`, `fonction`) et le `userId` du compte fraîchement créé.

**Page publique** : `/auth/inscription?token=xxx`

- Champs pré-remplis depuis le contact : prenom, nom, phone, fonction (tous modifiables)
- Email en lecture seule (contrôlé par l'invitation)
- Pas d'upload d'avatar (pas de session — possible depuis les paramètres post-connexion)

---

## Module Auth — Flux d'invitation

> Les deux flows d'invitation coexistent dans la même table `contacts_invitations` (ex `entreprise_invitations`).

### 1. Invitation Admin — SUPPRIMÉE

> ⚠️ Les actions `inviterEntrepriseAdminAction`, `inviterPrestataireAdminAction` et `inviterClientAdminAction` ont été **supprimées**. Les dialogs associés (`InviterEntrepriseAdminDialog`, `InviterPrestataireDialog`, `InviterClientDialog`) et le schéma `inscriptionAdmin.schema.ts` sont également supprimés.
>
> Le seul flow d'invitation actif est désormais `inviterContactAction` (ci-dessous). Pour inviter un admin, créer d'abord un contact dans `entreprise_contacts`, puis l'inviter via ce flow — le rôle pourra être promu en admin une fois le compte créé.

### 2. Invitation Contact (`inviterContactAction`)

- **Déclencheur** : bouton "Inviter" (icône `Send`) sur chaque carte contact dans `EntrepriseDetailsClient.tsx`
- **Condition d'affichage** : `canEdit && !c.userId && c.email`
- **Conditions d'exécution** : voir §6 du Module N ci-dessus
- **Page** : `/auth/inscription?token=xxx`
- **Rôle créé** : `"collaborateur"` — jamais configurable, jamais `"admin"`
- **`contactId`** : FK vers le contact source, utilisé pour mettre à jour `entrepriseContacts.userId` à l'acceptation

### 3. Activation du compte (commun aux deux flows)

Après création du compte (`signUpEmail`), un email `requestPasswordReset` est envoyé vers `/auth/reset-password?type=activation`. Ce n'est pas un reset classique — c'est la définition initiale du mot de passe. L'utilisateur peut aussi demander un nouveau lien depuis la page de login.

---

## Module Entreprises — Posture Plateforme (`/app/entreprises`)

> Page réservée posture plateforme uniquement. Guard serveur : `getUserPlateformeAdhesion`. Redirect → `/auth/unauthorized` si absent.

### 1. Liste des entreprises

| Feature    | Détail                                                               |
| ---------- | -------------------------------------------------------------------- |
| Filtres    | Nom (ilike), rôle (client/prestataire/plateforme), statut admin      |
| Tri        | Nom, date de création, SIRET                                         |
| Pagination | Infinite scroll                                                      |
| Logos      | Chargement côté client via `LogoAvatar` (storageKey → presigned URL) |

### 2. Création d'entreprise (`createEntrepriseAction`)

Étapes :

1. Infos générales (nom, SIRET, adresse, forme juridique, TVA)
2. Rôles et services proposés

Contraintes :

- SIRET unique en base
- Au moins un rôle requis

### 3. Détail entreprise (`/app/entreprises/[entrepriseId]`)

Sections :

- **Informations** : SIRET, forme juridique, TVA, adresse — modifiable via `EditEntrepriseInfosDialog`
- **Logo** : upload S3 via `EditEntrepriseLogoDialog` (temp → permanent, `documents.storageKey` + `entreprises.logoId`)
- **Rôles** : ajout/retrait avec guard métier (pas de retrait si `clientServices` ou `clientServiceExecutions` actifs) — `EditEntrepriseRolesDialog`
- **Contacts** : liste CRUD + bouton "Inviter" conditionnel — voir Module N §6

### 4. Permissions de modification

| Action                             | Condition                                                             |
| ---------------------------------- | --------------------------------------------------------------------- |
| Modifier infos, logo, rôles        | `canEdit = true` (plateforme par défaut)                              |
| Ajouter/modifier/supprimer contact | `canEditContacts && !c.userId` (`canEditContacts` = `canEdit` par défaut) |
| Inviter un contact                 | `canInviteContacts && !c.userId && c.email` (`canInviteContacts` = `canEditContacts` par défaut) |

> **`canInviteContacts` indépendant** : prop séparée permettant d'autoriser l'invitation sans autoriser la modification/suppression.

#### Calcul des permissions dans `/app/mon-entreprise` (`MonEntrepriseClient`)

Les permissions sont calculées côté client de façon **posture-aware** en lisant depuis le store :

```typescript
const activeRole =
  postureActive === "plateforme" ? rolePlateformeAdhesion
  : postureActive === "prestataire" ? rolePrestataireAdhesion
  : roleClientAdhesion;

// Infos / Logo / Rôles : admin uniquement (ou n'importe quel rôle plateforme)
const canEdit =
  postureActive === "plateforme" ? activeRole !== null : activeRole === "admin";

// Contacts : admin + manager (ou n'importe quel rôle plateforme)
const canEditContacts =
  postureActive === "plateforme"
    ? activeRole !== null
    : activeRole === "admin" || activeRole === "manager";
```

`canInviteContacts={canEditContacts}` (les managers peuvent aussi inviter leurs contacts).

> **Règle** : `postureActive` est lu depuis le store Zustand **uniquement** pour cet affichage conditionnel. Il n'est **jamais** envoyé vers une server action. Les server actions lisent toujours la posture depuis le cookie httpOnly via `getEffectivePlateformeRole()`.

### 5. Chargement des contacts (pattern important)

Les contacts sont chargés **côté serveur** dans `page.tsx` via `getEntrepriseContactsByEntrepriseId` (requête `.select().from()` standard — **ne pas utiliser la relational API `db.query.entrepriseContacts`** car la table n'est pas enregistrée dans `relations.ts`). Ils sont passés en `initialContacts` au composant client et mis à jour via `router.refresh()` après mutation.

---

## Module Mes Clients — Posture Prestataire (`/app/mes-clients`)

> Page réservée posture prestataire uniquement. Guard serveur : `userPrestataireAdhesions` statut actif. Redirect → `/auth/unauthorized` si absent.

### 1. Périmètre

- Liste les entreprises clientes via `getMesClients(prestataireEntrepriseId)` (`clientServiceExecutions.query.ts`)
- Les clients apparaissent s'ils ont une relation explicite (`clientPrestataireRelations`) OU au moins une exécution active avec le prestataire

### 2. Politique de modification

**Lecture seule par défaut.** Un prestataire voit les informations de base de ses clients (nom, SIRET, contact) mais ne peut pas les modifier. Aucun disclaimer global — le message contextuel n'apparaît que sur la page détail si le client a un admin actif.

> **Rationale** : un client peut être partagé entre plusieurs prestataires. Autoriser un prestataire à modifier les données d'un client créerait des incohérences pour les autres prestataires et pour la plateforme FM4ALL. Le prestataire contrôle la relation via le module Prestations (`clientServices`).

**Exception — Proxy prestataire** : Si le client n'a pas d'admin actif (`userClientAdhesions.role = "admin" AND statut = "actif"`), le bouton "Modifier" est affiché dans la section Informations de la page détail. Ce bouton ouvre `EditEntrepriseInfosDialog` (mise à jour depuis l'API SIRENE). L'action serveur `updateEntrepriseSireneFieldsAction` autorise cette modification via `canManageClientInfosAsProxy()`. Si le client a un admin actif, un message amber s'affiche : "Ce client a un administrateur actif, vous ne pouvez pas modifier ses informations. Pour tout changement, contacter l'administrateur." (lien `mailto:` sur "administrateur" si `adminEmail` disponible).

**`canManageClientInfosAsProxy(userId, clientEntrepriseId)`** (dans `entreprisesActions.ts`) :

1. Le client n'a pas d'admin actif → sinon `false`
2. L'utilisateur est `admin` ou `manager` prestataire actif → sinon `false`
3. La relation `clientPrestataireRelations` entre le prestataire et ce client existe → sinon `false`

### 3. Page détail (`/app/mes-clients/[clientEntrepriseId]`)

Sections :

- **Message admin** (conditionnel) : si `client.hasActiveAdmin`, bannière amber "Ce client a un administrateur actif..." avec lien `mailto:` sur "administrateur"
- **Informations** : SIRET, forme juridique, TVA, adresse — bouton "Modifier" conditionnel (`!client.hasActiveAdmin`) → `EditEntrepriseInfosDialog`
- **Sites** : compteur `client.nbSites` (lecture seule)
- **Contacts** : liste des contacts de la relation (`clientPrestataireRelationContacts`, `side = "client"`) avec bouton "Ajouter" → `AddRelationContactDialog`

Query serveur : `getClientAvecDetailsById(prestataireEntrepriseId, clientEntrepriseId)` puis `getRelationContactsByRelationId(relationId).filter(side === "client")`.

Synchronisation client : `useEffect([initialContacts])` recharge l'état local après `router.refresh()`.

### 4. Actions disponibles

| Action                                      | Condition                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| Voir la page détail                         | Adhésion prestataire active + client dans périmètre                                  |
| Modifier informations (SIRENE)              | `!client.hasActiveAdmin` + `canManageClientInfosAsProxy` (admin/manager prestataire) |
| Ajouter un contact à la relation            | `admin` ou `manager` prestataire actif + `relationId` existant                       |
| Modifier rôle/estPrincipal d'un lien        | Idem — `EditRelationContactDialog` (bouton Pencil sur chaque contact)                |
| Retirer un contact de la relation           | Idem — confirmation AlertDialog "Voulez-vous vraiment retirer **Nom** de vos contacts pour ce client ?" |

---

## Module Mes Prestataires — Posture Client (`/app/mes-prestataires`)

> Page réservée posture client uniquement. Guard serveur : `userClientAdhesions` statut actif. Redirect → `/auth/unauthorized` si absent.

### 1. Périmètre

- Liste les entreprises prestataires via `getClientPrestatairesAvecDetails(clientEntrepriseId)` (`clientServiceExecutions.query.ts`)
- Les prestataires apparaissent s'ils ont une relation explicite (`clientPrestataireRelations`) OU au moins une exécution active avec le client

### 2. Politique de modification

**Lecture seule par défaut.** Même rationale que Mes Clients : un prestataire peut être partagé entre plusieurs clients. Aucun disclaimer global — le message contextuel n'apparaît que sur la page détail si le prestataire a un admin actif.

**Exception — Proxy client** : Si le prestataire n'a pas d'admin actif (`userPrestataireAdhesions.role = "admin" AND statut = "actif"`), les boutons "Modifier" sont affichés dans les sections Informations et Services. Si le prestataire a un admin actif, un message amber s'affiche : "Ce prestataire a un administrateur actif, vous ne pouvez pas modifier ses informations. Pour tout changement, contacter l'administrateur." (lien `mailto:` sur "administrateur" si `adminEmail` disponible).

**`canManagePrestataireInfosAsClient(userId, prestataireEntrepriseId)`** (dans `entreprisesActions.ts`) :

1. Le prestataire n'a pas d'admin actif → sinon `false`
2. L'utilisateur est `admin` ou `manager` client actif → sinon `false`
3. La relation `clientPrestataireRelations` entre ce prestataire et le client existe → sinon `false`

### 3. Page détail (`/app/mes-prestataires/[prestataireEntrepriseId]`)

Sections :

- **Informations** : SIRET, forme juridique, TVA, adresse — bouton "Modifier" conditionnel (`!prestataire.hasActiveAdmin`) → `EditEntrepriseInfosDialog`
- **Services** : badges des services offerts — bouton "Modifier" conditionnel (`!prestataire.hasActiveAdmin`) → `EditPrestataireServicesDialog` (checkboxes, disclaimer blocage retrait si exécutions actives)
- **Contacts** : liste des contacts de la relation (`clientPrestataireRelationContacts`, `side = "prestataire"`) avec bouton "Ajouter" → `AddRelationContactDialog`

Query serveur : `getPrestataireAvecDetailsById(clientEntrepriseId, prestataireEntrepriseId)` puis `getRelationContactsByRelationId(relationId).filter(side === "prestataire")`.

Synchronisation client : `useEffect([initialContacts])` recharge l'état local après `router.refresh()`.

### 4. Actions disponibles

| Action                                      | Condition                                                                                                        |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Voir la page détail                         | Adhésion client active + prestataire dans périmètre                                                              |
| Modifier informations (SIRENE)              | `!prestataire.hasActiveAdmin` + `canManagePrestataireInfosAsClient` (admin/manager client)                       |
| Modifier services                           | `!prestataire.hasActiveAdmin` + `canManagePrestataireInfosAsClient` via `updatePrestataireServicesAsProxyAction` |
| Ajouter un contact à la relation            | `admin` ou `manager` client actif + `relationId` existant                                                        |
| Modifier rôle/estPrincipal d'un lien        | Idem — `EditRelationContactDialog` (bouton Pencil sur chaque contact)                                            |
| Retirer un contact de la relation           | Idem — confirmation AlertDialog "Voulez-vous vraiment retirer **Nom** de vos contacts pour ce prestataire ?"    |

---

### `updateEntrepriseSireneFieldsAction` — Autorisations consolidées

Cette action est partagée entre plusieurs contextes :

| Contexte                   | Condition                                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Posture plateforme         | `getEffectivePlateformeRole` non-null                                                                          |
| Proxy prestataire → client | `canManageClientInfosAsProxy` (prestataire admin/manager + client sans admin actif + relation existante)       |
| Proxy client → prestataire | `canManagePrestataireInfosAsClient` (client admin/manager + prestataire sans admin actif + relation existante) |

`getSireneDataAction` est accessible à tout utilisateur authentifié (données SIRENE = publiques).

---

### `AddRelationContactDialog` — Dialog d'ajout de contacts de relation

Utilisé dans `/app/mes-clients/[id]` (`side="client"`) et `/app/mes-prestataires/[id]` (`side="prestataire"`).

Deux onglets :

- **Créer nouveau** : formulaire `newContactFormSchema` (prénom, nom, email, téléphone, fonction, rôle, est_principal). Appelle `insertEntrepriseContactAndLinkToRelationAction` — crée d'abord un `entrepriseContacts` pour `targetEntrepriseId`, puis lie à la relation via `clientPrestataireRelationContacts`. Vérification d'unicité email par entreprise avant insertion.
- **Choisir existant** : charge via `getEntrepriseContactsForRelationAction` uniquement les contacts de `targetEntrepriseId` **non encore liés** à `relationId` (filtre `notExists` côté serveur). Si liste vide après chargement, bascule automatiquement en mode "Créer nouveau" et affiche un message contextuel :
  - `totalContactCount > 0` → "Tous les contacts de X ont déjà été ajoutés. Vous pouvez en créer un nouveau."
  - `totalContactCount === 0` → "X n'a pas encore de contacts. Créez-en un nouveau."

> **Avant** : la liste affichait tous les contacts de l'entreprise sans filtrage, y compris ceux déjà liés à la relation (bug). Corrigé le 2026-03-13.

---

### `EditRelationContactDialog` — Dialog d'édition du lien de relation

Utilisé dans `/app/mes-clients/[id]` et `/app/mes-prestataires/[id]`. Affiché via le bouton Pencil sur chaque contact de la liste de relation.

**Périmètre d'édition** : uniquement les champs du lien `clientPrestataireRelationContacts`, **pas** les champs du contact lui-même (`prenom`, `nom`, `email`, etc.) :

| Champ       | Type         | Description                                            |
| ----------- | ------------ | ------------------------------------------------------ |
| `role`      | texte libre  | Rôle de ce contact dans la relation (ex : "Commercial") |
| `estPrincipal` | booléen  | Ce contact est-il le contact principal de la relation ? |

**Schéma** : `updateRelationContactSchema` (`linkId: uuid`, `role?: string`, `estPrincipal: boolean`)

**Action** : `updateRelationContactAction` — même guard `canManageRelationContacts` (`admin` ou `manager` actif) que les actions insert/delete. Utilise `normalizeForSubmit({ optionalStrings: ["role"] })` pour convertir `""` → `null`.

**Affichage** : le champ `role` est affiché en italique sous les badges de chaque contact dans la liste, quand il est défini.

> **Distinction** : `EditRelationContactDialog` édite le **lien** (relation). Pour éditer les **coordonnées** du contact (prénom, nom, téléphone...), utiliser `EditEntrepriseContactDialog` dans `/app/entreprises` (posture plateforme) — uniquement si `contact.userId === null`.

---

---

## Module Utilisateurs — Règles de rôle et d'auto-promotion (`/app/utilisateurs`)

### 1. Rôle par défaut à la création

**Règle** : Tout utilisateur créé ou onboardé reçoit **toujours** le rôle `"collaborateur"` par défaut.

- Le composant `CreateUserFormInner` initialise `roleAdhesion: "collaborateur"` dans `defaultValues` et dans `form.reset()`.
- Le sélecteur de rôle est visible et modifiable par l'admin/manager qui crée l'utilisateur, mais sa valeur par défaut est `"collaborateur"` — jamais `"admin"`.
- Côté serveur, `insertUserAction` et `addAdhesionToExistingUserAction` n'imposent pas de contrainte sur le rôle soumis (la contrainte est gérée côté formulaire via les options disponibles selon le rôle du créateur).

### 1b. Synchronisation automatique `entreprise_contacts` à la création

**Règle** : Toute création d'utilisateur crée **automatiquement** une entrée dans `entreprise_contacts` dans la même transaction atomique.

Concerné par cette règle :

- `insertUserAction` (création via UI `/app/utilisateurs`) — insère dans `entrepriseContacts` avec `prenom`, `nom`, `email`, `phone`, `userId`
- `insertPlateformeUserAction` (création d'un utilisateur plateforme) — idem
- `accepterInvitationContactAction` — si `contactId` non-null : met à jour le contact existant ; si `contactId` null : crée une nouvelle entrée `entrepriseContacts`

**Non concerné** :

- `addAdhesionToExistingUserAction` ("Rattacher existant") — l'utilisateur existe déjà, son entrée `entrepriseContacts` également.

### 2. Boutons "Devenir admin" / "Devenir manager"

Visibles **uniquement** dans le panneau de détail de l'utilisateur courant (`isViewingSelf = true`) en posture **client** ou **prestataire** (jamais en posture plateforme).

| Bouton            | Condition d'affichage                     |
| ----------------- | ----------------------------------------- |
| "Devenir admin"   | `user.adhesion?.role !== "admin"`         |
| "Devenir manager" | `user.adhesion?.role === "collaborateur"` |

Ces boutons ouvrent une Dialog d'information — ils ne déclenchent aucune mutation directe.

### 3. Dialog de demande de promotion

La dialog affiche un message contextuel selon la présence d'un admin actif dans l'entreprise :

| Cas                | Message                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Admin actif trouvé | "Veuillez vous adresser à votre [administrateur](mailto:admin@...) pour changer de rôle." |
| Aucun admin actif  | "Veuillez vous adresser à [FM4ALL](mailto:contact@fm4all.com)."                           |

L'action serveur `getActiveAdminEmailAction` (`usersActions.ts`) :

- Paramètres : `entrepriseId: uuid`, `posture: "client" | "prestataire"`
- Requête : `userClientAdhesions` (posture client) ou `userPrestataireAdhesions` (posture prestataire), filtre `role = "admin"` ET `statut = "actif"`, jointure `user` pour récupérer l'email
- Retour : `{ adminEmail: string | null }`

### 4. Fix création d'utilisateur en posture plateforme

**Règle** : Quand un super admin plateforme crée un utilisateur depuis la vue "Type Client" ou "Type Prestataire" (sélecteur `viewType` dans `UsersClient`), le formulaire doit :

1. Afficher les rôles `admin | manager | collaborateur` (pas les rôles plateforme)
2. Créer l'utilisateur dans l'entreprise sélectionnée (`viewEntrepriseId`), **pas** dans l'entreprise FM4ALL

**Implémentation** :

- `UsersClient` passe `targetPosture` et `targetEntrepriseId` à `UserFormDialog`
- `UserFormDialog` route vers `CreateOrLinkUserForm` avec `entrepriseId=targetEntrepriseId` et `posture=targetPosture` (et non `"plateforme"`)

### 5. Bouton "Renvoyer l'email d'activation"

**Règle** : Ce bouton (posture plateforme uniquement) est masqué si `user.emailVerified === true`.

Raison : si l'email est déjà vérifié, l'utilisateur a déjà un compte actif. Renvoyer un email d'activation enverrait en réalité un email de "réinitialisation de mot de passe", ce qui est confus et non souhaité.

---

## Module Terrain (`/terrain/[token]`)

### Vue d'ensemble

Page mobile publique (sans authentification) permettant à un agent de terrain de réaliser une intervention en dehors de la plateforme back-office.

**Principes** :
- Accessible via un lien à usage multiple (partageable entre agents)
- Aucun compte utilisateur requis
- L'agent déclare son nom librement au démarrage (stocké dans `localStorage` pour autocomplete)
- Plusieurs agents peuvent ouvrir le même lien simultanément (chacun crée sa propre `occurrenceFieldSession`)

### Table `occurrence_field_links`

| Champ | Règle |
|-------|-------|
| `token` | UUID v4 généré par `crypto.randomUUID()` |
| `expiresAt` | `dateDebutPrevue + 2 jours` (marge pour clôture tardive) |
| `revokedAt` | NULL = actif ; non-NULL = révoqué |
| `autoGenerated` | `true` = généré par le CRON ; `false` = généré manuellement |

**Lien actif** = `revokedAt IS NULL` ET `expiresAt > now`.

### Génération du lien

**Règle absolue** : le lien est généré **uniquement par le CRON** `snapshot-taches` (route `/api/crons/snapshot-taches`), qui tourne à J-1 de chaque intervention planifiée (`dateDebutPrevue` dans les 8 prochains jours, statut `planifiee`, `executionId` non null).

**Aucune génération manuelle** n'est exposée dans l'UI. Raison : à J-1, le CRON snapshote simultanément les tâches — un lien généré avant J-1 pointerait vers une intervention sans tâches, ce qui est incohérent.

Le CRON est **idempotent** : si un lien actif existe déjà, il ne génère pas de doublon.

### Permissions back-office (affichage du lien)

Visible uniquement pour les utilisateurs avec `canManage = true` sur l'occurrence (admin client/prestataire, responsable_site selon `modePilotage`).

| État | Bouton "Copier le lien" |
|------|------------------------|
| Lien actif en DB | Activé — copie `${origin}/fr/terrain/${token}` |
| Pas encore généré (avant J-1) | Désactivé — message "Lien disponible automatiquement la veille (J-1)" |

### Action `getOccurrenceFieldLinkAction`

- Paramètres : `occurrenceId`, `entrepriseId`
- Guard : `canManage` sur l'occurrence
- Retour : `{ token: string | null }` — null si aucun lien actif non expiré

### Page terrain — comportement

La page est un **server component** qui re-fetche depuis la DB à chaque ouverture. Elle est donc toujours à jour :
- Avant J-1 : aucune tâche snapshotée → non applicable (le lien n'existe pas encore)
- Dès J-1 : tâches disponibles, intervention démarrable
- Après clôture : affichage résumé lecture seule

### Table `occurrence_field_sessions`

Créée au démarrage de l'intervention par l'agent (clic sur "Démarrer"). Tracée pour audit et preuve de réalisation même sans compte utilisateur.

---

_Dernière mise à jour : 2026-03-13_
