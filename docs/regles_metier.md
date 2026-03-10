# Règles Métier — Module Devis

> Référence unique pour toutes les permissions liées aux devis et demandes de devis.
> À consulter systématiquement avant d'implémenter ou de modifier une permission.

---

## A) Posture CLIENT

### Demandes de devis (`devisDemandes`)

| Rôle | Voir | Créer | Modifier | Annuler/Supprimer |
|------|------|-------|----------|-------------------|
| `admin` (roleAdhesion) | Toutes | Oui | Toutes | Toutes |
| `responsable_site` (attribution) | Ses sites | Ses sites | Ses sites | Ses sites |
| `demandeur_site` (attribution) | Ses sites | Ses sites | Seulement ses propres | ❌ |
| `observateur_site` (attribution) | Ses sites | ❌ | ❌ | ❌ |

**Règle importante :** un client ne peut PAS supprimer une demande de devis si un devis y est lié (même à l'état `brouillon`).

### Devis reçus (`devis`)

| Rôle | Voir | Signer | Refuser |
|------|------|--------|---------|
| `admin` (roleAdhesion) | Tous | ✔ | ✔ |
| `responsable_site` (attribution) | Ses sites | ✔ | ✔ |
| `demandeur_site` (attribution) | Ses sites | ❌ | ❌ |
| `observateur_site` (attribution) | Ses sites | ❌ | ❌ |

**Règle de modification :** le client ne modifie JAMAIS un devis (uniquement les `devisDemandes`).

### Expiration du devis

Si `now() > validTo` → devis expiré :
- Interdire la signature **frontend** (pas de bouton + disclaimer "Devis expiré")
- Interdire la signature **backend** (guard dans l'action `signerDevisAction`)

---

## B) Posture PRESTATAIRE

**Conditions minimales pour voir une demande de devis :**
1. `clientPrestataireRelations` doit exister entre le prestataire et le client propriétaire de la demande
2. Le `serviceId` de la demande doit correspondre à un service proposé par le prestataire (`getServicesByPrestataire`)

Ces deux conditions sont cumulatives. Une demande sans `serviceId` correspondant n'est pas visible, même si la relation client existe.

### Visibilité des demandes de devis et devis

| Rôle prestataire | Demandes de devis | Devis |
|------------------|-------------------|-------|
| `admin` (roleAdhesion) | Tous les sites clients | Tous |
| `responsable_site` (attribution site) | Sites attribués | Sites attribués |
| `demandeur_site` (attribution site) | Sites attribués | Sites attribués |
| `observateur_site` (attribution site) | Sites attribués | Sites attribués |
| `intervenant_site` (attribution site) | ❌ | ❌ |

### Création d'un devis

Un devis est émis PAR le prestataire. Possible même sans demande associée (`devisDemandeId` nullable).

| Rôle prestataire | Créer devis |
|------------------|-------------|
| `admin` | ✔ |
| `responsable_site` | ✔ |
| `demandeur_site` | ✔ |
| `observateur_site` | ❌ |
| `intervenant_site` | ❌ |

### Modification d'un devis (statut `brouillon` uniquement)

| Rôle prestataire | Modifier devis & lignes |
|------------------|------------------------|
| `admin` | ✔ |
| `responsable_site` | ✔ |
| `demandeur_site` | ✔ |
| `observateur_site` | ❌ |
| `intervenant_site` | ❌ |

### Suppression d'un devis (statut `brouillon` uniquement)

| Rôle prestataire | Supprimer devis |
|------------------|-----------------|
| `admin` | ✔ |
| `responsable_site` | ✔ |
| `demandeur_site` | Seulement si auteur (`createdById`) |
| `observateur_site` | ❌ |
| `intervenant_site` | ❌ |

### Émettre un devis (statut `brouillon` uniquement)

| Rôle prestataire | Émettre |
|------------------|---------|
| `admin` | ✔ |
| `responsable_site` | ✔ |
| `demandeur_site` | ✔ |
| `observateur_site` | ❌ |
| `intervenant_site` | ❌ |

---

## C) Posture PLATEFORME

**Règle simple : lecture seule.**

| Action | Autorisé |
|--------|----------|
| Voir demandes de devis | ✔ |
| Voir devis | ✔ |
| Voir lignes de devis | ✔ |
| Voir PDF | ✔ |
| Créer/modifier/supprimer demande | ❌ |
| Créer/modifier/supprimer devis | ❌ |
| Émettre devis | ❌ |
| Signer/Refuser devis | ❌ |

---

## Résumé des rôles

### Rôles d'adhésion enterprise (`userClientAdhesions` / `userPrestataireAdhesions`)
- `admin` — droits globaux sur toute l'entreprise
- `manager` — gestion d'équipe (NB : pas de droit de signer/refuser les devis côté client)
- `collaborateur` — accès de base

### Rôles d'attribution site (`userClientSiteAttributions` / `userPrestataireSiteAttributions`)
- `responsable_site` — peut signer/refuser (client), créer/modifier/émettre (prestataire)
- `demandeur_site` — peut créer demandes/devis, modifier les siennes
- `observateur_site` — lecture seule
- `intervenant_site` (prestataire uniquement) — aucun droit sur les devis

---

*Dernière mise à jour : 2026-03-10*

---

# Règles Métier — Module Tickets

> Référence unique pour toutes les permissions liées aux tickets et à leurs messages.
> À consulter systématiquement avant d'implémenter ou de modifier une permission.

---

## 1. Sémantique des champs

| Champ | Signification | Règle |
|-------|--------------|-------|
| `proprietaireEntrepriseId` | L'entreprise "chez qui vit le ticket" | = **entreprise cliente du site** — toujours, même si le ticket est créé par le prestataire |
| `demandeurEntrepriseId` | L'entreprise qui a initié la demande | = entreprise de l'auteur initial (client, prestataire ou FM4ALL) |
| `assigneEntrepriseId` | L'entreprise actuellement attendue ("chez qui est la balle") | Variable selon le flux ; cohérent mais distinct du statut |
| `assigneUserId` | La personne concrète en charge | Optionnel — souvent `null` jusqu'à prise en charge explicite |

**Doctrine :** un ticket appartient toujours au client, même s'il est créé ou traité par le prestataire.

---

## 2. États du ticket

### États actifs
- `nouveau`
- `pris_en_charge`
- `en_attente_prestataire`
- `en_attente_client`
- `a_valider`

### États finaux (aucune transition sauf plateforme)
- `clos`
- `annule`
- `rejete`

---

## 3. Machine d'état — transitions autorisées

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
  └──→ rejete                                          │
                                                       │
  (retour vers pris_en_charge depuis en_attente_*)  ───┘
```

### Transitions interdites (sauf plateforme)
- Depuis un état final (`clos`, `annule`, `rejete`) → tout autre état
- Sauts non représentés dans le graphe ci-dessus (ex: `nouveau → clos` directement)

### Détail des transitions

| Transition | Déclencheur | Qui peut |
|-----------|------------|----------|
| `∅ → nouveau` | Création | Tout créateur autorisé |
| `nouveau → pris_en_charge` | Prise en charge | Entreprise assignée (admin, responsable_site) + plateforme |
| `pris_en_charge → en_attente_prestataire` | Le client attend une action du prestataire | Client admin, client responsable_site, plateforme |
| `pris_en_charge → en_attente_client` | Le prestataire attend une action du client | Prestataire admin, prestataire responsable_site, plateforme |
| `en_attente_prestataire → pris_en_charge` | Retour en traitement après réponse | Admin, responsable_site, plateforme |
| `en_attente_client → pris_en_charge` | Retour en traitement après réponse | Admin, responsable_site, plateforme |
| `pris_en_charge → a_valider` | Travail terminé, validation client attendue | Prestataire admin, prestataire responsable_site, plateforme |
| `a_valider → clos` | Validation finale | Client admin, client responsable_site, plateforme |
| `nouveau → annule` | Annulation avant prise en charge | Admin, responsable_site, plateforme |
| `pris_en_charge → annule` | Annulation en cours de traitement | Admin, responsable_site, plateforme |
| `nouveau → rejete` | Ticket hors périmètre ou erreur | Admin, responsable_site, plateforme |

**Effets automatiques :**
- `a_valider → clos` : `resolvedAt = now()`, `closedAt = now()`
- `nouveau → pris_en_charge` : `priseEnChargeAt = now()` (futur SLA), `assigneUserId = currentUser` (optionnel)
- Tout message ou modification : `lastActivityAt = now()`

---

## 4. Création d'un ticket

### Valeurs automatiques à la création

| Champ | Valeur |
|-------|--------|
| `proprietaireEntrepriseId` | Entreprise cliente du site concerné |
| `demandeurEntrepriseId` | Entreprise de l'auteur |
| `assigneEntrepriseId` | Entreprise cible (souvent prestataire si incident) |
| `assigneUserId` | `null` par défaut |
| `statut` | `nouveau` |

### Qui peut créer un ticket ?

**Posture CLIENT**

| Rôle | Peut créer |
|------|-----------|
| `admin` | Tous les sites de son entreprise |
| `responsable_site` | Ses sites attribués |
| `demandeur_site` | Ses sites attribués |
| `observateur_site` | ❌ |

**Posture PRESTATAIRE** (condition préalable : `clientPrestataireRelations` doit exister)

| Rôle | Peut créer |
|------|-----------|
| `admin` | Tous les sites clients liés |
| `responsable_site` | Ses sites clients attribués |
| `demandeur_site` | Ses sites clients attribués |
| `observateur_site` | ❌ |
| `intervenant_site` | ❌ |

**Posture PLATEFORME** : peut toujours créer.

---

## 5. Modification d'un ticket

Deux niveaux de modification distincts.

### 5a. Modifier le contenu libre (titre, description)

Mêmes droits que la création.

| Posture | Qui peut |
|---------|---------|
| Client | admin, responsable_site, demandeur_site |
| Prestataire | admin, responsable_site, demandeur_site (selon périmètre site/relation) |
| Plateforme | Toujours |

### 5b. Modifier le statut, l'assignation, la priorité, le type

Droits restreints — pilotage du workflow.

| Posture | Qui peut |
|---------|---------|
| Client | admin, responsable_site |
| Prestataire | admin, responsable_site |
| Plateforme | Toujours |

**Règle :** `demandeur_site` peut ouvrir et commenter, mais **ne peut pas piloter le workflow** (statut, type, priorité, assignation).

---

## 6. Permissions par champ modifiable

| Champ | Qui peut modifier | Note |
|-------|-----------------|------|
| `titre`, `description` | admin, responsable_site, demandeur_site + plateforme | Contenu libre |
| `type` | admin, responsable_site + plateforme | Pilotage — pas demandeur_site |
| `priorite` | admin, responsable_site + plateforme | Pilotage — pas demandeur_site |
| `statut` | Voir machine d'état (§3) | Transitions restrictives par posture |
| `assigneEntrepriseId` | admin, responsable_site + plateforme | Pilotage |
| `assigneUserId` | admin, responsable_site + plateforme | Pilotage |

---

## 7. Messages

### Qui peut poster un message ?

| Posture | Rôles autorisés |
|---------|----------------|
| Client | admin, responsable_site, demandeur_site |
| Prestataire | admin, responsable_site, demandeur_site |
| Plateforme | Toujours |

**Règle :** pas de modification ni suppression de message (immuabilité).

### Visibilité des messages

| Valeur `visibilite` | Qui voit |
|--------------------|---------|
| `public` | Tout acteur ayant accès au ticket |
| `fm4all_only` | Plateforme uniquement |
| `client_only` | Client + plateforme |
| `prestataire_only` | Prestataire + plateforme |

**Règle :** la visibilité s'applique aussi aux pièces jointes attachées aux messages.

### Contraintes d'écriture par visibilité

| Posture auteur | Visibilités autorisées |
|----------------|----------------------|
| Client | `public`, `client_only` |
| Prestataire | `public`, `prestataire_only` |
| Plateforme | Toutes |

---

## 8. Périmètre de visibilité des tickets

### Posture CLIENT
- **admin** : tous les tickets dont `proprietaireEntrepriseId = entrepriseId`
- **responsable_site** : tickets des sites attribués (périmètre effectif via `sitesArborescence`)
- **demandeur_site** : tickets des sites attribués
- **observateur_site** : tickets des sites attribués (lecture seule)

### Posture PRESTATAIRE
- **admin** : tous les tickets où `assigneEntrepriseId = prestataireId`
- **non-admin** : idem + filtre sur les sites attribués

### Posture PLATEFORME
- Tous les tickets sans filtre.

---

## 9. Pièces jointes

- Les PJ d'un ticket (`documentsLinks` avec `ticketId` rempli, `ticketMessageId` NULL) suivent les mêmes permissions que le ticket.
- Les PJ d'un message (`documentsLinks` avec `ticketMessageId` rempli, `ticketId` NULL) suivent la visibilité du message.
- **Jamais** les deux colonnes renseignées simultanément (principe de normalisation polymorphique).

---

## 10. Lien avec les occurrences et tâches

Un ticket peut être lié à :
- `occurrenceId` → ticket créé depuis une intervention
- `occurrenceTacheId` → ticket créé depuis une tâche (ex : tâche impossible à réaliser)

Ces champs sont informatifs — ils n'influencent pas les permissions du ticket.

---

## 11. Champs d'audit recommandés

| Champ | Renseigné quand | Statut |
|-------|----------------|--------|
| `createdAt` | Création | ✅ En DB |
| `lastActivityAt` | Tout message ou modification | ✅ En DB |
| `priseEnChargeAt` | Transition `nouveau → pris_en_charge` | ⚠️ À ajouter en DB (prioritaire — nécessaire pour SLA) |
| `resolvedAt` | Transition `a_valider → clos` | ✅ En DB |
| `closedAt` | Transition `a_valider → clos` | ✅ En DB |

---

## 12. Résumé des rôles

### Rôles d'adhésion entreprise
- `admin` — droits globaux sur toute l'entreprise pour cette posture
- `manager` / `collaborateur` — non mentionnés dans les droits tickets (rôles génériques non utilisés ici)

### Rôles d'attribution site
- `responsable_site` — pilotage du workflow (statut, priorité, assignation)
- `demandeur_site` — création + commentaires, pas de pilotage
- `observateur_site` — lecture seule, ne peut pas créer
- `intervenant_site` — aucun droit sur les tickets

---

*Dernière mise à jour : 2026-03-10*
