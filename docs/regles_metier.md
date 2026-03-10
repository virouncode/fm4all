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

---

# Règles Métier — Module Prestations

> Référence unique pour toutes les permissions liées aux prestations (`clientServices`).
> À consulter systématiquement avant d'implémenter ou de modifier une permission.

---

## 1. Hiérarchie d'autorité

```
plateforme   → contrôle total (god mode)
client       → propriétaire de la prestation
prestataire  → opérateur (agit en délégation)
```

Une prestation appartient toujours à l'entreprise cliente, même si elle est créée ou gérée par le prestataire.

---

## 2. Posture CLIENT

### 2a. Visibilité des prestations

| Rôle | Voit quelles prestations |
|------|--------------------------|
| `admin` (roleAdhesion) | **Toutes** les prestations de l'entreprise |
| `manager` (roleAdhesion) | ❌ Pas de droit implicite (sauf attribution site explicite) |
| `responsable_site` (attribution) | Prestations des sites attribués |
| `demandeur_site` (attribution) | Prestations des sites attribués |
| `observateur_site` (attribution) | Prestations des sites attribués (lecture seule) |

> **Règle manager :** le `manager` n'a PAS de droits automatiques sur les prestations. Il ne voit des prestations que s'il est explicitement attribué à un site avec un rôle opérationnel (`responsable_site`, `demandeur_site`, etc.). Cette doctrine évite de recréer un quasi-admin.

### 2b. Visibilité des données financières / contractuelles

Tous ceux qui voient une prestation ne voient pas forcément ses données sensibles (prix, montants, marges, détails contractuels).

| Données | Qui peut voir |
|---------|---------------|
| Infos fonctionnelles (nom, description, site, fréquence…) | admin + tout rôle ayant accès à la prestation |
| **Données financières / contractuelles** (prix, montants, marges) | `admin` + `responsable_site` uniquement |

`demandeur_site` et `observateur_site` voient l'existence et le fonctionnel, **jamais** le financier.

### 2c. Création

| Rôle | Peut créer |
|------|-----------|
| `admin` | ✅ Sur n'importe quel site de l'entreprise |
| `responsable_site` | ✅ Sur ses sites attribués |
| `manager`, `demandeur_site`, `observateur_site` | ❌ |

### 2d. Modification

| Rôle | Peut modifier |
|------|--------------|
| `admin` | ✅ Toutes les prestations |
| `responsable_site` | ✅ Prestations de ses sites attribués |
| Autres | ❌ |

### 2e. Archivage / Suppression

| Rôle | Peut archiver |
|------|--------------|
| `admin` | ✅ |
| Tous les autres | ❌ |

> L'archivage est un acte de gouvernance fort — réservé à l'admin uniquement.

---

## 3. Posture PRESTATAIRE

### 3a. Visibilité — deux niveaux cumulatifs

**Niveau 1 — sécurité inter-entreprises (obligatoire)**

Une prestation n'est visible par un prestataire que s'il existe au moins une exécution (`clientServiceExecutions`) associant cette prestation à son entreprise :

```sql
EXISTS (
  SELECT 1 FROM clientServiceExecutions cse
  WHERE cse.clientServiceId = prestation.id
    AND cse.prestataireEntrepriseId = monEntreprise
)
```

- Le statut `actif` de l'exécution **n'entre pas en jeu** : une ancienne exécution suffit (historique conservé).
- Le filtre se fait **par exécution, jamais par site seul** — sinon un prestataire pourrait voir les prestations d'autres prestataires sur le même site.

**Niveau 2 — organisation interne prestataire (si non-admin)**

Si le rôle n'est pas `admin`, filtrer en plus par attribution de site :

```sql
AND prestation.siteId IN (userPrestataireSiteAttributions du user courant)
```

> **Règle :** le rôle `manager` (adhésion) ne confère **aucun droit implicite supplémentaire**. Pour tout utilisateur non-admin, c'est l'**attribution de site** qui définit le périmètre visible. Un `manager` sans attribution de site ne voit aucune prestation.

| Rôle prestataire | Périmètre interne |
|------------------|-------------------|
| `admin` | Toutes les prestations où l'entreprise intervient |
| `manager` | Sites clients attribués (même règle que les non-admin) |
| `responsable_site` | Prestations des sites clients attribués |
| `intervenant_site` | Prestations des sites clients attribués |
| `observateur_site` | Prestations des sites clients attribués (lecture seule) |

### 3b. Visibilité des données financières

| Données | Qui peut voir |
|---------|---------------|
| Infos fonctionnelles | Tout rôle ayant accès |
| **Prix / montants côté prestataire** | `admin` uniquement |
| Tous les autres rôles | ❌ Pas de données financières |

> **Rationale :** un intervenant terrain, responsable de site ou manager n'a pas besoin de voir les prix vendus au client ni les marges FM4ALL. Seul l'admin prestataire a une vision contractuelle complète.

### 3c. Création

Autorisée même si le client a un compte actif — le client peut déléguer la gestion au prestataire, ou simplement ne jamais utiliser la plateforme.

| Rôle prestataire | Peut créer |
|------------------|-----------|
| `admin` | ✅ Sur tous les sites clients dans son périmètre |
| `responsable_site` | ✅ Sur ses sites clients attribués |
| `manager`, `intervenant_site`, `observateur_site` | ❌ |

> **Règle importante :** quand le prestataire crée une prestation, **l'exécution doit être créée simultanément** dans la même transaction. Sinon la prestation ne serait pas visible (règle niveau 1 — pas d'exécution associée).

### 3d. Modification

| Rôle prestataire | Peut modifier |
|------------------|--------------|
| `admin` | ✅ |
| `responsable_site` | ✅ Sur ses sites |
| Autres | ❌ |

### 3e. Archivage

| Rôle prestataire | Peut archiver |
|------------------|--------------|
| `admin` | ✅ |
| Tous les autres | ❌ |

> L'archivage reste un acte fort même en mode proxy : seul l'admin prestataire peut le faire.

---

## 4. Posture PLATEFORME

**Droits complets (god mode).** La plateforme n'est pas soumise au `modePilotage` ni aux restrictions d'entreprise.

| Action | Autorisé |
|--------|----------|
| Voir toutes les prestations | ✅ |
| Voir les données financières | ✅ |
| Créer une prestation | ✅ |
| Modifier une prestation | ✅ |
| Archiver / supprimer | ✅ |

> **Rationale :** la plateforme doit pouvoir corriger, migrer, débuguer n'importe quelle donnée. Restreindre la plateforme rendrait le support et l'administration impossibles.

---

## 5. Résumé matriciel complet

### Posture CLIENT

| Action | `admin` | `responsable_site` | `demandeur_site` | `observateur_site` | `manager` |
|--------|---------|--------------------|-------------------|--------------------|-----------|
| Voir prestations | Toutes | Sites attribués | Sites attribués | Sites attribués (RO) | ❌ |
| Voir données financières | ✅ | ✅ | ❌ | ❌ | ❌ |
| Créer | ✅ | ✅ (ses sites) | ❌ | ❌ | ❌ |
| Modifier | ✅ | ✅ (ses sites) | ❌ | ❌ | ❌ |
| Archiver | ✅ | ❌ | ❌ | ❌ | ❌ |

### Posture PRESTATAIRE

| Action | `admin` | `manager` | `responsable_site` | `intervenant_site` | `observateur_site` |
|--------|---------|-----------|--------------------|--------------------|--------------------|
| Voir prestations | Périmètre exécution (toutes) | Sites attribués | Sites attribués | Sites attribués | Sites attribués (RO) |
| Voir données financières | ✅ | ❌ | ❌ | ❌ | ❌ |
| Créer | ✅ | ❌ | ✅ (ses sites) | ❌ | ❌ |
| Modifier | ✅ | ❌ | ✅ (ses sites) | ❌ | ❌ |
| Archiver | ✅ | ❌ | ❌ | ❌ | ❌ |

### Posture PLATEFORME

| Action | Autorisé |
|--------|----------|
| Tout | ✅ |

---

## 6. Règles techniques d'implémentation

### Filtre prestataire — toujours passer par les exécutions

Ne jamais filtrer les prestations côté prestataire par `siteId` seul :

```typescript
// ✅ CORRECT — filtre via exécutions
.innerJoin(clientServiceExecutions, and(
  eq(clientServiceExecutions.clientServiceId, clientServices.id),
  eq(clientServiceExecutions.prestataireEntrepriseId, prestataireEntrepriseId),
))

// ❌ FAUX — expose des prestations d'autres prestataires sur le même site
.where(eq(clientServices.siteId, siteId))
```

### Mode proxy — création simultanée prestation + exécution

```typescript
await db.transaction(async (tx) => {
  const [prestation] = await tx.insert(clientServices).values({ ... }).returning();
  await tx.insert(clientServiceExecutions).values({
    clientServiceId: prestation.id,
    prestataireEntrepriseId: prestataireEntrepriseId,
    // ...
  });
  return prestation;
});
```

### Filtrage interne prestataire non-admin

```typescript
if (!isAdmin) {
  query = query.where(
    inArray(clientServices.siteId, userPrestataireSiteAttributionIds)
  );
}
```

---

*Dernière mise à jour : 2026-03-10*

---

# Règles Métier — Module Exécutions (`clientServiceExecutions`)

> Référence unique pour toutes les permissions liées aux exécutions d'une prestation.
> À consulter systématiquement avant d'implémenter ou de modifier une permission.
>
> ⚠️ Ne pas confondre avec les **occurrences** (`clientServiceOccurrences`) qui représentent les interventions terrain réelles. Les exécutions définissent **qui fait quoi et comment** ; les occurrences correspondent aux **passages effectifs**.

> **Règle fondamentale sur le rôle `manager` :** Le rôle d'adhésion `manager` ne confère **aucune permission opérationnelle** sur les exécutions (ni création, ni modification, ni désactivation, ni changement de `modePilotage`). Pour tout utilisateur non-`admin`, c'est exclusivement l'**attribution de site** qui détermine les droits. Un utilisateur `manager` possédant également une attribution `responsable_site` sur le site concerné obtient les droits correspondants **via son attribution de site**, non via son rôle d'adhésion.

---

## 1. Définition d'une exécution

Une exécution (`clientServiceExecution`) configure l'organisation opérationnelle d'une prestation. Elle définit :

| Champ | Rôle |
|-------|------|
| `prestataireEntrepriseId` | Quel prestataire intervient |
| `dateDebutValidite` | À partir de quelle date |
| `dateFinValidite` | Jusqu'à quelle date |
| `priorite` | Priorité de l'exécution (si plusieurs exécutions coexistent) |
| `checklistId` | Quelle checklist de tâches appliquer |
| Prix / données financières | Quels tarifs appliqués |
| `modePilotage` | Qui pilote les occurrences (`client` / `prestataire` / `collaboration`) |

> **Doctrine :** une exécution appartient toujours au client. Le prestataire peut participer à sa création/modification, mais le client reste propriétaire.

> **Plusieurs exécutions simultanées :** plusieurs exécutions peuvent coexister pour une même prestation (ex : prestataire A du 01/01 au 30/06, prestataire B à partir du 01/07). Le moteur sélectionne l'exécution active selon la date courante et la priorité.

---

## 2. `modePilotage` — valeurs et contraintes

`modePilotage` détermine **qui crée, planifie et assigne les occurrences**.

| Valeur | Qui pilote les occurrences |
|--------|---------------------------|
| `client` | L'entreprise cliente |
| `prestataire` | L'entreprise prestataire |
| `collaboration` | Les deux ensemble |

### Contraintes selon les entreprises fantômes

Une entreprise est dite **fantôme** si elle n'a aucun utilisateur actif sur la plateforme (`hasActiveAdmin === false`).

| Client fantôme | Prestataire fantôme | Valeurs `modePilotage` autorisées |
|:--------------:|:-------------------:|:---------------------------------:|
| ✅ Oui | ❌ Non | `prestataire` uniquement |
| ❌ Non | ✅ Oui | `client` uniquement |
| ❌ Non | ❌ Non | `client`, `prestataire`, `collaboration` |
| ✅ Oui | ✅ Oui | ❌ Impossible (pas de pilote) — à interdire |

> **Règle :** les valeurs impossibles doivent être **filtrées côté formulaire** ET **validées côté serveur**. Ne jamais faire confiance au front.

> **Note :** `modePilotage` n'influence **pas les permissions** de l'exécution elle-même (voir, créer, modifier, désactiver). Il régit uniquement la gouvernance des occurrences.

### Qui peut modifier `modePilotage` ?

Changer `modePilotage` change qui crée les occurrences, qui les planifie, qui les assigne — c'est un acte de gouvernance opérationnelle.

| Posture | Rôles autorisés |
|---------|----------------|
| Client | `admin`, `responsable_site` |
| Prestataire | `admin`, `responsable_site` |
| Plateforme | Toujours |

> **Rappel manager :** Le rôle `manager` (adhésion) ne donne pas accès à la modification de `modePilotage`. Seul le rôle `admin` (adhésion) ou une attribution `responsable_site` sur le site concerné confèrent ce droit — quel que soit le rôle d'adhésion par ailleurs.

---

## 3. Posture CLIENT

### 3a. Visibilité des exécutions

| Rôle | Voit quelles exécutions |
|------|--------------------------|
| `admin` (roleAdhesion) | Toutes les exécutions des prestations de l'entreprise |
| `responsable_site` (attribution) | Exécutions des prestations de ses sites attribués |
| `demandeur_site` (attribution) | Exécutions des prestations de ses sites attribués |
| `observateur_site` (attribution) | Exécutions des prestations de ses sites attribués (lecture seule) |

### 3b. Visibilité des données financières

| Données | Qui peut voir |
|---------|---------------|
| Infos fonctionnelles (dates, prestataire, mode pilotage, checklist…) | Tout rôle ayant accès à l'exécution |
| **Prix / montants** | `admin` + `responsable_site` uniquement |

### 3c. Création

| Rôle | Peut créer |
|------|-----------|
| `admin` | ✅ Sur toutes les prestations de l'entreprise |
| `responsable_site` | ✅ Sur les prestations de ses sites attribués |
| `manager`, `demandeur_site`, `observateur_site` | ❌ |

### 3d. Modification

| Rôle | Peut modifier |
|------|--------------|
| `admin` | ✅ Toutes |
| `responsable_site` | ✅ Exécutions de ses sites attribués |
| Autres | ❌ |

### 3e. Désactivation (`actif = false`)

> **Règle :** ne jamais supprimer une exécution — toujours désactiver (`actif = false`) pour conserver l'historique.

| Rôle | Peut désactiver |
|------|----------------|
| `admin` | ✅ |
| `responsable_site`, `demandeur_site`, `observateur_site` | ❌ |

> La désactivation est un acte de gouvernance fort (change qui intervient sur la prestation) — réservée à l'admin.

---

## 4. Posture PRESTATAIRE

Le prestataire ne voit et n'agit que sur les exécutions où `prestataireEntrepriseId = sonEntreprise`.

### 4a. Visibilité des exécutions

| Rôle prestataire | Voit quelles exécutions |
|------------------|--------------------------|
| `admin` | Toutes les exécutions où son entreprise intervient |
| `manager` | Sites clients attribués (même règle que non-admin) |
| `responsable_site` (attribution) | Exécutions des sites clients attribués |
| `intervenant_site` (attribution) | Exécutions des sites clients attribués |
| `observateur_site` (attribution) | Exécutions des sites clients attribués (lecture seule) |

> **Règle :** le rôle `manager` (adhésion) ne confère **aucun droit implicite supplémentaire**. Pour tout utilisateur non-admin, c'est l'**attribution de site** qui définit le périmètre visible.

### 4b. Visibilité des données financières

| Données | Qui peut voir |
|---------|---------------|
| Infos fonctionnelles | Tout rôle ayant accès |
| **Prix / montants côté prestataire** | `admin` uniquement |
| Tous les autres rôles | ❌ |

### 4c. Création

Autorisée même si le client a un compte actif (le prestataire peut agir en proxy).

**Condition préalable :** `clientPrestataireRelations` doit exister entre les deux entreprises.

| Rôle prestataire | Peut créer |
|------------------|-----------|
| `admin` | ✅ Sur toutes les prestations des clients liés |
| `responsable_site` | ✅ Sur les prestations de ses sites clients attribués |
| `manager`, `intervenant_site`, `observateur_site` | ❌ |

> La nouvelle exécution doit impérativement avoir `prestataireEntrepriseId = sonEntreprise`.

### 4d. Modification

| Rôle prestataire | Peut modifier |
|------------------|--------------|
| `admin` | ✅ (exécutions où son entreprise intervient) |
| `responsable_site` | ✅ (ses sites clients attribués) |
| Autres | ❌ |

### 4e. Désactivation

| Rôle prestataire | Peut désactiver |
|------------------|----------------|
| `admin` | ✅ |
| `responsable_site`, `manager`, `intervenant_site`, `observateur_site` | ❌ |

---

## 5. Posture PLATEFORME

**Droits complets (god mode).** Aucune restriction d'entreprise ou de `modePilotage`.

| Action | Autorisé |
|--------|----------|
| Voir toutes les exécutions | ✅ |
| Voir les données financières | ✅ |
| Créer une exécution | ✅ |
| Modifier une exécution (y compris `modePilotage`) | ✅ |
| Désactiver une exécution | ✅ |

---

## 6. Résumé matriciel complet

### Posture CLIENT

| Action | `admin` | `responsable_site` | `demandeur_site` | `observateur_site` | `manager` |
|--------|---------|--------------------|-------------------|--------------------|-----------|
| Voir exécutions | Toutes | Sites attribués | Sites attribués | Sites attribués (RO) | ❌ |
| Voir données financières | ✅ | ✅ | ❌ | ❌ | ❌ |
| Créer | ✅ | ✅ (ses sites) | ❌ | ❌ | ❌ |
| Modifier | ✅ | ✅ (ses sites) | ❌ | ❌ | ❌ |
| Désactiver | ✅ | ❌ | ❌ | ❌ | ❌ |

### Posture PRESTATAIRE

| Action | `admin` | `manager` | `responsable_site` | `intervenant_site` | `observateur_site` |
|--------|---------|-----------|--------------------|--------------------|--------------------|
| Voir exécutions | Périmètre entreprise (toutes) | Sites attribués | Sites attribués | Sites attribués | Sites attribués (RO) |
| Voir données financières | ✅ | ❌ | ❌ | ❌ | ❌ |
| Créer | ✅ | ❌ | ✅ (ses sites) | ❌ | ❌ |
| Modifier | ✅ | ❌ | ✅ (ses sites) | ❌ | ❌ |
| Désactiver | ✅ | ❌ | ❌ | ❌ | ❌ |

### Posture PLATEFORME

| Action | Autorisé |
|--------|----------|
| Tout | ✅ |

---

## 7. Règles techniques d'implémentation

### Filtre prestataire — toujours filtrer par `prestataireEntrepriseId`

```typescript
// ✅ CORRECT — filtrer uniquement les exécutions de son entreprise
.where(eq(clientServiceExecutions.prestataireEntrepriseId, monEntrepriseId))

// ❌ FAUX — expose des exécutions d'autres prestataires sur le même site
.where(eq(clientServices.siteId, siteId))
```

### Validation `modePilotage` côté serveur

```typescript
// Dans insertExecutionAction et updateExecutionAction
const clientGhost = !client.hasActiveAdmin;
const prestataireGhost = !prestataire.hasActiveAdmin;

if (clientGhost && prestataireGhost) {
  throw errors.forbidden("Impossible : aucun pilote disponible.");
}
if (clientGhost && modePilotage !== "prestataire") {
  throw errors.forbidden("Client fantôme — seul le mode 'prestataire' est autorisé.");
}
if (prestataireGhost && modePilotage !== "client") {
  throw errors.forbidden("Prestataire fantôme — seul le mode 'client' est autorisé.");
}
```

### Filtre interne prestataire non-admin

```typescript
if (!isAdmin) {
  query = query.where(
    inArray(clientServices.siteId, userPrestataireSiteAttributionIds)
  );
}
```

> `manager` = non-admin : soumis au filtre par attribution de site comme tous les autres rôles non-admin.

### Désactivation — toujours `actif = false`, jamais DELETE

```typescript
// ✅ CORRECT
await db.update(clientServiceExecutions)
  .set({ actif: false, updatedById: currentUser.id })
  .where(eq(clientServiceExecutions.id, executionId));

// ❌ JAMAIS (sauf cas d'erreur de création — voir ci-dessous)
await db.delete(clientServiceExecutions).where(...);
```

### Suppression — cas exceptionnel (exécution créée par erreur, sans intervention associée)

La suppression physique (`DELETE`) est autorisée **uniquement** dans le cas d'une exécution créée par erreur, sans aucune occurrence associée. Elle ne remplace pas la désactivation.

Permissions pour la suppression :

| Posture | Condition |
|---------|-----------|
| Plateforme | Toujours autorisé |
| Client `admin` | `modePilotage = "client"` ou `"collaboration"` |
| Prestataire `admin` | `modePilotage = "prestataire"` ou `"collaboration"` + ownership de l'exécution |

```typescript
// ✅ CORRECT — suppression conditionnelle selon modePilotage
if (modePilotage === "client" && posture === "client" && isAdmin) { delete(); }
if (modePilotage === "prestataire" && posture === "prestataire" && isAdmin) { delete(); }
if (modePilotage === "collaboration" && isAdmin) { delete(); } // l'un ou l'autre côté
```

---

*Dernière mise à jour : 2026-03-10*

---

# Règles Métier — Module Sites (`sites`)

> Référence unique pour toutes les permissions liées aux sites.
> À consulter systématiquement avant d'implémenter ou de modifier une permission.

---

## A) Posture CLIENT (`/app/sites`)

### 1. Voir les sites de l'entreprise

Peuvent voir toute l'arborescence des sites de leur entreprise :

- tous les utilisateurs ayant une ligne dans `userClientAdhesions`
- avec `statut = actif`

Aucune restriction par site à ce stade.

### 2. Créer un site racine (`parentId = null`)

| Rôle | Peut créer |
|------|-----------|
| `admin` | ✅ |
| `manager`, `collaborateur` | ❌ |

### 3. Créer un sous-site (`parentId ≠ null`)

| Rôle | Peut créer |
|------|-----------|
| `admin` | ✅ Sur n'importe quel parent |
| `manager` | ✅ Uniquement si `responsable_site` du site parent |
| `collaborateur` | ❌ |

### 4. Modifier un site

| Rôle | Peut modifier |
|------|--------------|
| `admin` | ✅ Tous les sites |
| `responsable_site` (attribution) | ✅ Ce site uniquement |
| Autres | ❌ |

> **Règle importante :** seul l'`admin` peut modifier le `parentId` d'un site (déplacer un site dans l'arborescence). Un `responsable_site` non-admin ne peut pas déplacer un site.

### 5. Archiver un site

| Rôle | Peut archiver |
|------|--------------|
| `admin` | ✅ |
| Autres | ❌ |

> Bloqué si le site possède des **sous-sites actifs**. Il faut d'abord archiver les enfants.

### 6. Règles de cascade sur `actif`

- **Désactivation** → tous les descendants passent à `actif = false` (transaction atomique).
- **Réactivation** → bloquée si le parent direct est inactif. Les descendants **ne sont pas** réactivés automatiquement.

---

## B) Posture PRESTATAIRE (`/app/mes-sites-clients`)

**Relation préalable obligatoire :** le client doit être lié à l'entreprise prestataire via `clientPrestataireRelations`.

### Cas 1 — Le client possède au moins un admin actif

**Condition :**
```
userClientAdhesions.role = "admin"
userClientAdhesions.statut = "actif"
```

**Conséquences :**

Tous les utilisateurs du prestataire ayant une adhésion active (`userPrestataireAdhesions.statut = actif`) peuvent :
- **voir** tous les sites de ce client

Mais aucune mutation n'est autorisée :
- création interdite
- modification interdite

L'interface doit afficher un bandeau informatif :
> Ce client possède désormais un administrateur actif. Les modifications doivent être effectuées par l'équipe cliente.

### Cas 2 — Aucun admin client actif (mode proxy)

Le prestataire agit alors en proxy du client.

#### Voir les sites

Tous les utilisateurs ayant une adhésion active dans `userPrestataireAdhesions` peuvent voir les sites du client.

#### Créer un site racine

| Rôle prestataire | Peut créer |
|------------------|-----------|
| `admin` | ✅ |
| `manager`, autres | ❌ |

#### Créer un sous-site

| Rôle prestataire | Peut créer |
|------------------|-----------|
| `admin` | ✅ Sur n'importe quel parent |
| `manager` | ✅ Uniquement si `responsable_site` du site parent |
| Autres | ❌ |

#### Modifier un site

| Rôle prestataire | Peut modifier |
|------------------|--------------|
| `admin` | ✅ |
| `responsable_site` (attribution) | ✅ Ce site uniquement |
| Autres | ❌ |

> **Règle importante :** lorsqu'un prestataire crée un site en mode proxy, aucune attribution `responsable_site` automatique n'est créée. Les responsables sont définis explicitement via le système d'attributions.

---

## C) Posture PLATEFORME (`/app/sites-clients`)

Tous les utilisateurs ayant `userPlateformeAdhesions.statut = actif` peuvent sur n'importe quel site de n'importe quel client :

| Action | Autorisé |
|--------|----------|
| Voir | ✅ |
| Créer un site racine | ✅ |
| Créer un sous-site | ✅ |
| Modifier | ✅ |
| Archiver | ✅ |
| Supprimer définitivement | ✅ `super_admin_plateforme` uniquement |

---

## Résumé conceptuel

Le module Sites repose sur 3 principes simples :

**1. Les sites appartiennent toujours au client**
Les prestataires n'ont jamais de droit natif.

**2. Le prestataire agit seulement dans deux cas**
- lecture : si `clientPrestataireRelations` existe
- mutation : uniquement en l'absence d'admin client actif (proxy)

**3. La plateforme a un contrôle total**
Les utilisateurs plateforme peuvent intervenir sur tous les sites de tous les clients.

---

*Dernière mise à jour : 2026-03-10*

---

# Règles Métier — Module Occurrences (`clientServiceOccurrences`)

> Référence unique pour toutes les permissions liées aux occurrences d'une prestation.
> À consulter systématiquement avant d'implémenter ou de modifier une permission.
>
> ⚠️ Ne pas confondre avec les **exécutions** (`clientServiceExecutions`) qui configurent l'organisation opérationnelle. Les occurrences représentent les **interventions terrain concrètes**, planifiées ou réalisées.

---

## 1. Définition d'une occurrence

Une occurrence (`clientServiceOccurrence`) représente une intervention planifiée ou réalisée sur un site. Elle est liée à :

| Champ | Rôle |
|-------|------|
| `clientServiceId` | La prestation concernée |
| `siteId` | Le site où se déroule l'intervention |
| `executionId` | Snapshot de la règle d'exécution active au moment de la planification |
| `statut` | État courant de l'intervention |
| `assigneeUserId` | L'utilisateur qui réalise ou a réalisé l'intervention (souvent renseigné au démarrage) |
| `demandeeParUserId` | L'utilisateur qui a déclenché la création (traçabilité) |
| `dateDebutPrevue` | Date et heure planifiées |
| `dateDebutReelle` | Renseignée automatiquement au démarrage effectif |
| `dateFinReelle` | Renseignée automatiquement à la terminaison |

> **Doctrine :** une occurrence appartient toujours au client. Elle ne peut jamais être supprimée — on change son statut.

---

## 2. Statuts et machine d'état

### Valeurs

- `planifiee` — intervention prévue, non encore démarrée
- `en_cours` — intervention démarrée (assignée et en cours d'exécution)
- `terminee` — intervention terminée
- `annulee` — annulée avant démarrage
- `non_honoree` — prévue mais non réalisée

### Transitions autorisées

```
planifiee
  │
  ├──→ en_cours ──→ terminee
  │
  ├──→ annulee
  │
  └──→ non_honoree
```

### Règle fondamentale

**Jamais de DELETE.** Seul le statut change. Cela préserve l'historique, la traçabilité et l'intégrité des données de facturation.

---

## 3. Deux capacités distinctes

Les permissions sur les occurrences se décomposent en deux capacités orthogonales :

| Capacité | Actions couvertes |
|----------|------------------|
| `canManageOccurrence` | Créer, modifier la planification (dates, checklist), annuler, marquer comme non honorée, réassigner |
| `canExecuteOccurrence` | Démarrer (auto-assignation), compléter les tâches, terminer |

> **Principe :** gérer c'est gouverner la planification. Exécuter c'est intervenir sur le terrain. Ce ne sont pas les mêmes personnes ni les mêmes droits.

---

## 4. Sources de création

Les occurrences peuvent être créées de deux façons :

1. **Génération automatique** — par le moteur de planification (planning récurrent)
2. **Création manuelle** — par un utilisateur autorisé (mêmes droits que `canManageOccurrence`)

---

## 5. `modePilotage` — impact sur les occurrences

`modePilotage` est défini sur l'exécution parente. Il détermine **qui peut gérer et qui peut exécuter** les occurrences.

| `modePilotage` | Qui peut gérer | Qui peut exécuter |
|----------------|---------------|-------------------|
| `client` | Côté client uniquement | Côté client uniquement |
| `prestataire` | Côté prestataire uniquement | Côté prestataire uniquement |
| `collaboration` | Les deux côtés | Les deux côtés |

> **Règle :** le `modePilotage` n'est pas un paramètre de préférence — c'est une contrainte d'accès stricte, vérifiée côté serveur.

---

## 6. Matrices de permissions par `modePilotage`

Les 4 actions de la matrice :
- **Voir** — accès en lecture à l'occurrence
- **Gérer** — créer, replanifier, annuler, marquer non honorée, réassigner (`canManageOccurrence`)
- **Démarrer** — démarrer l'occurrence et s'auto-assigner (`canExecuteOccurrence`)
- **Terminer** — compléter les tâches et clore l'occurrence (`canExecuteOccurrence`)

### Mode `client`

| Rôle | Voir | Gérer | Démarrer | Terminer |
|------|------|-------|----------|----------|
| **client** `admin` | ✅ | ✅ | ✅ | ✅ |
| **client** `responsable_site` | ✅ | ✅ | ✅ | ✅ |
| **client** `demandeur_site` | ✅ | ❌ | ✅ | ✅ |
| **client** `observateur_site` | ✅ | ❌ | ❌ | ❌ |
| **prestataire** `admin` | ✅ | ❌ | ❌ | ❌ |
| **prestataire** `responsable_site` | ✅ | ❌ | ❌ | ❌ |
| **prestataire** `intervenant_site` | ✅ | ❌ | ❌ | ❌ |
| **prestataire** `observateur_site` | ✅ | ❌ | ❌ | ❌ |

### Mode `prestataire`

| Rôle | Voir | Gérer | Démarrer | Terminer |
|------|------|-------|----------|----------|
| **client** `admin` | ✅ | ❌ | ❌ | ❌ |
| **client** `responsable_site` | ✅ | ❌ | ❌ | ❌ |
| **client** `demandeur_site` | ✅ | ❌ | ❌ | ❌ |
| **client** `observateur_site` | ✅ | ❌ | ❌ | ❌ |
| **prestataire** `admin` | ✅ | ✅ | ✅ | ✅ |
| **prestataire** `responsable_site` | ✅ | ✅ | ✅ | ✅ |
| **prestataire** `intervenant_site` | ✅ | ❌ | ✅ | ✅ |
| **prestataire** `observateur_site` | ✅ | ❌ | ❌ | ❌ |

### Mode `collaboration`

| Rôle | Voir | Gérer | Démarrer | Terminer |
|------|------|-------|----------|----------|
| **client** `admin` | ✅ | ✅ | ✅ | ✅ |
| **client** `responsable_site` | ✅ | ✅ | ✅ | ✅ |
| **client** `demandeur_site` | ✅ | ❌ | ✅ | ✅ |
| **client** `observateur_site` | ✅ | ❌ | ❌ | ❌ |
| **prestataire** `admin` | ✅ | ✅ | ✅ | ✅ |
| **prestataire** `responsable_site` | ✅ | ✅ | ✅ | ✅ |
| **prestataire** `intervenant_site` | ✅ | ❌ | ✅ | ✅ |
| **prestataire** `observateur_site` | ✅ | ❌ | ❌ | ❌ |

### Posture PLATEFORME (tous modes)

| Action | Autorisé |
|--------|----------|
| Voir | ✅ |
| Gérer | ✅ |
| Démarrer | ✅ |
| Terminer | ✅ |

---

## 7. Règle de démarrage

### Condition temporelle

Une occurrence ne peut être démarrée que si :

```
date(dateDebutPrevue, siteTimezone) == today(siteTimezone)
```

- En avance (ex : prévue à 10h, démarre à 7h) → **autorisé**
- En retard (ex : prévue à 10h, démarre à 18h) → **autorisé**
- Jour différent (ex : prévue demain ou hier) → **refusé**
- `dateDebutPrevue = null` → démarrage **toujours autorisé**

> **Rationale :** sur le terrain, les intervenants peuvent arriver tôt ou tard. La contrainte utile est la journée, pas l'heure. Un démarrage le mauvais jour est toujours une erreur.

> **Important :** toujours utiliser le **fuseau horaire du site** (`siteTimezone`), jamais UTC.

### Condition de statut

Le démarrage n'est autorisé que depuis le statut `planifiee` :

| Statut | Démarrage |
|--------|-----------|
| `planifiee` | ✅ |
| `en_cours` | ❌ (déjà démarrée) |
| `terminee` | ❌ |
| `annulee` | ❌ |
| `non_honoree` | ❌ |

### Effets automatiques du démarrage

```
statut           → en_cours
dateDebutReelle  → now()
assigneeUserId   → currentUser.id
```

### Occurrence déjà en cours

Si `statut = en_cours`, le démarrage est bloqué. La reprise (takeover) par `admin` ou `responsable_site` peut être autorisée dans un second temps, mais reste simple par défaut : **premier arrivé, premier servi**.

---

## 8. Règle de terminaison

### Condition

Une occurrence peut être terminée uniquement si `statut = en_cours`.

Aucune contrainte temporelle : une occurrence peut être terminée le jour même, le lendemain, ou plus tard — la réalité terrain l'exige.

### Effets automatiques de la terminaison

```
statut        → terminee
dateFinReelle → now()
```

---

## 9. Annulation et non-réalisation

### Annulation (`annulee`)

L'annulation signifie que l'intervention ne se fera pas (décision anticipée).

- Statut source autorisé : `planifiee` uniquement
- Qui peut annuler : utilisateurs ayant `canManageOccurrence` selon `modePilotage`
- **Jamais de DELETE** — statut uniquement

### Non honorée (`non_honoree`)

Indique que l'intervention était prévue mais n'a pas eu lieu (ex : intervenant absent, accès impossible).

- Statut source autorisé : `planifiee` uniquement
- Qui peut marquer : utilisateurs ayant `canManageOccurrence` selon `modePilotage`

---

## 10. Auto-assignation — principe fondamental

> L'assignation est principalement un **effet du démarrage**, pas une opération de planification anticipée.

### Règle

- La préassignation de centaines d'occurrences n'est pas le modèle principal.
- Quand un utilisateur clique **Démarrer**, `assigneeUserId = currentUser.id` est renseigné automatiquement.
- L'utilisateur doit être attribué au site concerné pour pouvoir démarrer.

### Éligibilité au démarrage (côté prestataire)

Pour qu'un utilisateur prestataire puisse démarrer :
1. Son entreprise correspond à `execution.prestataireEntrepriseId`
2. Il est attribué au site (`userPrestataireSiteAttributions`)
3. Son rôle est `admin`, `responsable_site` ou `intervenant_site`

### Éligibilité au démarrage (côté client)

Pour qu'un utilisateur client puisse démarrer (modes `client` ou `collaboration`) :
1. Il est attribué au site
2. Son rôle est `admin`, `responsable_site` ou `demandeur_site`

---

## 11. Cas particulier : prestataire fantôme

Quand le prestataire n'a aucun utilisateur actif sur la plateforme :

- `modePilotage` = `client` (seul mode autorisé — voir règles exécutions)
- Le client peut **gérer et exécuter** les occurrences
- Rôles autorisés côté client : `admin`, `responsable_site`, `demandeur_site`
- Couvre le cas de l'office manager qui suit et réalise les interventions lui-même

> **Rationale :** interdire au client d'exécuter quand le prestataire est fantôme rendrait le système inutilisable pour une majorité de cas terrain réels.

---

## 12. Périmètre de visibilité des occurrences

### Posture CLIENT

| Rôle | Voit quelles occurrences |
|------|--------------------------|
| `admin` | Toutes les occurrences des prestations de l'entreprise |
| `responsable_site` | Occurrences des sites attribués (périmètre effectif via `sitesArborescence`) |
| `demandeur_site` | Occurrences des sites attribués |
| `observateur_site` | Occurrences des sites attribués (lecture seule) |

### Posture PRESTATAIRE

**Condition préalable :** `execution.prestataireEntrepriseId = sonEntrepriseId`

| Rôle | Voit quelles occurrences |
|------|--------------------------|
| `admin` | Toutes les occurrences liées à ses exécutions |
| `manager` | Toutes les occurrences liées à ses exécutions |
| `responsable_site` | Occurrences des sites clients attribués |
| `intervenant_site` | Occurrences des sites clients attribués |
| `observateur_site` | Occurrences des sites clients attribués (lecture seule) |

### Posture PLATEFORME

Toutes les occurrences sans filtre.

---

## 13. Règles techniques d'implémentation

### Toujours filtrer côté prestataire via l'exécution

```typescript
// ✅ CORRECT — filtrer via executionId puis prestataireEntrepriseId
.innerJoin(clientServiceExecutions, and(
  eq(clientServiceOccurrences.executionId, clientServiceExecutions.id),
  eq(clientServiceExecutions.prestataireEntrepriseId, prestataireEntrepriseId),
))

// ❌ FAUX — expose des occurrences d'autres prestataires sur le même site
.where(eq(clientServiceOccurrences.siteId, siteId))
```

### Validation de la règle "même journée" pour le démarrage

```typescript
import { toZonedTime, startOfDay, isSameDay } from "date-fns-tz";

function canStartOccurrence(
  dateDebutPrevue: Date | null,
  siteTimezone: string,
): boolean {
  if (!dateDebutPrevue) return true; // null → toujours autorisé

  const now = new Date();
  const todayInSiteTz = startOfDay(toZonedTime(now, siteTimezone));
  const prevueDayInSiteTz = startOfDay(toZonedTime(dateDebutPrevue, siteTimezone));

  return isSameDay(todayInSiteTz, prevueDayInSiteTz);
}
```

### Effet du démarrage — transaction atomique

```typescript
await db.transaction(async (tx) => {
  await tx.update(clientServiceOccurrences)
    .set({
      statut: "en_cours",
      dateDebutReelle: new Date(),
      assigneeUserId: currentUser.id,
      updatedById: currentUser.id,
    })
    .where(eq(clientServiceOccurrences.id, occurrenceId));
  // Autres effets : déverrouiller les tâches si nécessaire
});
```

### Terminaison — toujours vérifier `statut = en_cours` côté serveur

```typescript
const occurrence = await getOccurrenceById(occurrenceId);
if (occurrence.statut !== "en_cours") {
  throw errors.forbidden("Seule une occurrence en cours peut être terminée.");
}

await db.update(clientServiceOccurrences)
  .set({ statut: "terminee", dateFinReelle: new Date(), updatedById: currentUser.id })
  .where(eq(clientServiceOccurrences.id, occurrenceId));
```

### Annulation / Non honorée — jamais de DELETE

```typescript
// ✅ CORRECT
await db.update(clientServiceOccurrences)
  .set({ statut: "annulee", updatedById: currentUser.id })
  .where(eq(clientServiceOccurrences.id, occurrenceId));

// ❌ JAMAIS
await db.delete(clientServiceOccurrences).where(...);
```

---

## 14. Résumé rapide

| Règle | Valeur |
|-------|--------|
| Suppression | ❌ Jamais — statut uniquement |
| Démarrage | `planifiee` + même jour (fuseau site) + `canExecuteOccurrence` |
| Assignation | Automatique au démarrage (`assigneeUserId = currentUser`) |
| Terminaison | `en_cours` uniquement, pas de contrainte temporelle |
| Annulation | `planifiee` uniquement, `canManageOccurrence` requis |
| Non honorée | `planifiee` uniquement, `canManageOccurrence` requis |
| Préassignation | Non recommandée comme modèle principal — privilégier l'auto-assignation |

---

*Dernière mise à jour : 2026-03-10*

---

# Règles Métier — Module Tâches (`occurrenceTaches`)

> Référence unique pour toutes les permissions liées aux tâches d'une occurrence.
> À consulter systématiquement avant d'implémenter ou de modifier une permission.
>
> ⚠️ Ne pas confondre avec les **checklists** (`tacheListeTemplates` / `tacheListeItems`) qui définissent les modèles de tâches. Les tâches sont les **instances concrètes**, créées par snapshot lors de l'affectation d'une checklist à une occurrence.

---

## 1. Définition d'une tâche

Une tâche (`occurrenceTache`) représente une action à réaliser dans le cadre d'une occurrence. Elle peut être :

- **Issue d'un template** — snapshot d'un `tacheListeItem` au moment de l'affectation de la checklist à l'occurrence
- **Ad hoc** — créée manuellement par un utilisateur autorisé (`listeItemId = null`)

| Champ | Rôle |
|-------|------|
| `occurrenceId` | L'occurrence parente |
| `listeItemId` | Référence au template d'origine (nullable si ad hoc) |
| `titre` | Snapshot du titre au moment de la création (immuable si issu d'un template) |
| `description` | Snapshot de la description (immuable si issu d'un template) |
| `statut` | État courant de la tâche |
| `assigneeUserId` | L'utilisateur assigné (souvent renseigné au démarrage) |
| `startedAt` | Renseigné automatiquement au démarrage |
| `doneAt` | Renseigné automatiquement à la terminaison |
| `completeeParUserId` | L'utilisateur qui a terminé la tâche |
| `tempsPasseSecondes` | Calculé automatiquement (`doneAt - startedAt`), corrigeable par admin/responsable_site |

> **Doctrine :** le snapshot `titre + description` garantit que les occurrences passées restent intactes même si le template évolue. Une tâche ne peut jamais être supprimée — on change son statut.

---

## 2. Statuts et machine d'état

### Valeurs

- `a_faire` — tâche créée, non démarrée
- `en_cours` — tâche démarrée (assignée et en cours d'exécution)
- `terminee` — tâche accomplie (état final sauf correction superviseur)
- `non_honoree` — prévue mais impossible à réaliser (ex : accès impossible)
- `annulee` — annulée avant ou pendant l'exécution
- `non_applicable` — non pertinente dans le contexte réel (ex : terrasse inaccessible)

### Transitions autorisées

```
a_faire
  │
  ├──→ en_cours ──→ terminee
  │
  ├──→ non_honoree
  │
  ├──→ non_applicable
  │
  └──→ annulee
```

> **Note :** `terminee` est un état final sauf correction manuelle explicite du `tempsPasseSecondes` par un superviseur (admin ou responsable_site). Aucune transition de statut n'est autorisée depuis `terminee`.

### Règle fondamentale

**Jamais de DELETE.** Seul le statut change. Cela préserve l'historique, la traçabilité et l'intégrité des données de facturation.

---

## 3. Deux capacités distinctes

Comme pour les occurrences, les permissions sur les tâches se décomposent en deux capacités orthogonales :

| Capacité | Actions couvertes |
|----------|------------------|
| `canManage` | Créer des tâches ad hoc, modifier les tâches ad hoc, annuler, corriger `tempsPasseSecondes` |
| `canExecute` | Démarrer (auto-assignation), terminer, marquer `non_honoree`, marquer `non_applicable`, ajouter des PJ |

> **Principe :** gérer c'est gouverner les tâches (création, suppression logique, correction). Exécuter c'est réaliser le travail terrain. Ce ne sont pas les mêmes personnes ni les mêmes droits.

---

## 4. Visibilité des tâches

La visibilité d'une tâche suit exactement la visibilité de son occurrence parente.

### Posture CLIENT

| Rôle | Voit les tâches |
|------|----------------|
| `admin` | Toutes les tâches des occurrences de l'entreprise |
| `responsable_site` (attribution) | Tâches des occurrences des sites attribués |
| `demandeur_site` (attribution) | Tâches des occurrences des sites attribués |
| `observateur_site` (attribution) | Tâches des occurrences des sites attribués (lecture seule) |

### Posture PRESTATAIRE

**Condition préalable :** `execution.prestataireEntrepriseId = sonEntrepriseId`

| Rôle | Voit les tâches |
|------|----------------|
| `admin` | Toutes les tâches des occurrences liées à ses exécutions |
| `manager` | Tâches des occurrences des sites clients attribués |
| `responsable_site` (attribution) | Tâches des occurrences des sites clients attribués |
| `intervenant_site` (attribution) | Tâches des occurrences des sites clients attribués |
| `observateur_site` (attribution) | Tâches des occurrences des sites clients attribués (lecture seule) |

### Posture PLATEFORME

Toutes les tâches sans filtre.

---

## 5. Création de tâches

### Tâches issues d'un template (snapshot)

Créées automatiquement lors de l'affectation d'une checklist à une occurrence. Aucune permission utilisateur requise — c'est le moteur qui les crée.

### Tâches ad hoc (création manuelle)

La création manuelle est restreinte pour ne pas contourner les checklists définies.

| Posture | Rôle | Peut créer une tâche ad hoc |
|---------|------|-----------------------------|
| CLIENT | `admin` | ✅ Sur toutes les occurrences de l'entreprise |
| CLIENT | `responsable_site` | ✅ Sur les occurrences de ses sites attribués |
| CLIENT | `demandeur_site`, `observateur_site` | ❌ |
| PRESTATAIRE | `admin` | ✅ Sur toutes les occurrences de ses exécutions |
| PRESTATAIRE | `responsable_site` | ✅ Sur les occurrences de ses sites clients attribués |
| PRESTATAIRE | `intervenant_site`, `observateur_site`, `manager` | ❌ |
| PLATEFORME | Tous | ✅ |

> **Rationale :** les intervenants terrain ne peuvent pas créer de tâches ad hoc — cela risquerait de casser la structure des checklists validées. Seuls les superviseurs (admin, responsable_site) ont ce droit.

---

## 6. Démarrage d'une tâche

### Condition de statut

Le démarrage n'est autorisé que depuis le statut `a_faire` :

| Statut | Démarrage |
|--------|-----------|
| `a_faire` | ✅ |
| `en_cours` | ❌ (déjà démarrée) |
| `terminee` | ❌ |
| `non_honoree` | ❌ |
| `non_applicable` | ❌ |
| `annulee` | ❌ |

### Effets automatiques du démarrage

```
statut         → en_cours
startedAt      → now()
assigneeUserId → currentUser.id
```

### Qui peut démarrer ?

Le droit de démarrer suit `canExecute`, conditionné par le `modePilotage` de l'exécution parente.

| Posture | Rôle | Mode `client` | Mode `prestataire` | Mode `collaboration` |
|---------|------|:---:|:---:|:---:|
| CLIENT | `admin` | ✅ | ❌ | ✅ |
| CLIENT | `responsable_site` | ✅ | ❌ | ✅ |
| CLIENT | `demandeur_site` | ✅ | ❌ | ✅ |
| CLIENT | `observateur_site` | ❌ | ❌ | ❌ |
| PRESTATAIRE | `admin` | ❌ | ✅ | ✅ |
| PRESTATAIRE | `responsable_site` | ❌ | ✅ | ✅ |
| PRESTATAIRE | `intervenant_site` | ❌ | ✅ | ✅ |
| PRESTATAIRE | `observateur_site` | ❌ | ❌ | ❌ |
| PLATEFORME | Tous | ✅ | ✅ | ✅ |

---

## 7. Terminaison d'une tâche

### Condition

Une tâche peut être terminée uniquement si `statut = en_cours`.

### Effets automatiques

```
statut               → terminee
doneAt               → now()
completeeParUserId   → currentUser.id
tempsPasseSecondes   → (doneAt - startedAt) en secondes
```

### Qui peut terminer ?

Même droits que le démarrage, avec une restriction supplémentaire : seul l'utilisateur **assigné** à la tâche peut la terminer, sauf si `canManage` est vrai (admin ou responsable_site peuvent terminer n'importe quelle tâche de leur périmètre).

| Condition | Peut terminer |
|-----------|:---:|
| `canManage` (admin ou responsable_site) | ✅ |
| `canExecute` ET `assigneeUserId = currentUser.id` | ✅ |
| `canExecute` mais pas assigné | ❌ |

> **Rationale :** un intervenant non assigné ne doit pas pouvoir fermer la tâche d'un collègue. Le superviseur peut le faire pour débloquer une situation.

---

## 8. Statuts spéciaux

### Non applicable (`non_applicable`)

Indique que la tâche n'est pas pertinente dans le contexte réel (ex : nettoyer la terrasse → terrasse inaccessible pour travaux).

- Statut source autorisé : `a_faire` ou `en_cours`
- Qui peut marquer : utilisateurs ayant `canExecute` ou `canManage` selon `modePilotage`

### Non honorée (`non_honoree`)

Indique que la tâche était prévue mais n'a pas pu être réalisée (ex : vider les poubelles → accès refusé).

- Statut source autorisé : `a_faire` ou `en_cours`
- Qui peut marquer : utilisateurs ayant `canExecute` ou `canManage` selon `modePilotage`

### Annulation (`annulee`)

Acte fort — la tâche ne sera pas réalisée et ne doit pas figurer dans les statistiques de réalisation.

- Statut source autorisé : `a_faire` ou `en_cours`
- Qui peut annuler : `canManage` uniquement (admin ou responsable_site)

> **Rationale :** l'annulation est une décision de gouvernance, pas une décision terrain. Un intervenant peut marquer une tâche non applicable ou non honorée, mais seul un superviseur peut l'annuler.

---

## 9. Pièces jointes (preuves)

Les pièces jointes sur une tâche servent de **preuves d'exécution** (photo avant/après, bon de livraison, etc.).

- Stockage via `documents` + `documentsLinks` (`occurrenceTacheId` renseigné)
- Maximum recommandé : 2 PJ par tâche
- Format : images et PDFs uniquement

### Qui peut ajouter des PJ ?

| Condition | Peut ajouter |
|-----------|:---:|
| `canExecute` ET tâche `en_cours` | ✅ |
| `canManage` ET tâche `en_cours` | ✅ |
| Tâche dans un autre statut | ❌ |

### Qui peut voir les PJ ?

Tout utilisateur pouvant voir la tâche peut voir ses pièces jointes.

---

## 10. Temps passé (`tempsPasseSecondes`)

### Calcul automatique

Lors de la terminaison d'une tâche :

```
tempsPasseSecondes = (doneAt - startedAt) en secondes
```

### Correction manuelle

Le temps calculé automatiquement peut être incorrect (pause, oubli de démarrage…). Un superviseur peut le corriger manuellement.

| Condition | Peut corriger |
|-----------|:---:|
| `canManage` (admin ou responsable_site) ET tâche `terminee` | ✅ |
| Tous les autres cas | ❌ |

- Valeur minimale : 0 seconde
- Valeur maximale : 604 800 secondes (7 jours)

> **Rationale :** la correction est réservée aux superviseurs pour éviter que les intervenants manipulent leurs temps de travail. La tâche doit être `terminee` — on ne corrige pas un temps en cours d'exécution.

---

## 11. Modification et suppression des tâches ad hoc

Les tâches issues d'un template (snapshot) ne peuvent pas être modifiées ni supprimées — le snapshot est immuable.

Les tâches ad hoc peuvent être modifiées ou supprimées logiquement (via `annulee`) par les utilisateurs ayant `canManage`.

| Action | Condition |
|--------|-----------|
| Modifier une tâche ad hoc | `canManage` + tâche `a_faire` ou `en_cours` |
| Annuler une tâche ad hoc | `canManage` + tâche `a_faire` ou `en_cours` |
| Modifier une tâche template | ❌ Jamais (snapshot immuable) |
| Supprimer physiquement une tâche | ❌ Jamais |

---

## 12. Résumé matriciel complet

### Actions par rôle (toutes postures)

| Action | `admin` | `responsable_site` | `demandeur_site` / `intervenant_site` | `observateur_site` |
|--------|---------|--------------------|---------------------------------------|-------------------|
| **Voir** | ✅ | ✅ (sites attribués) | ✅ (sites attribués) | ✅ (RO) |
| **Créer ad hoc** | ✅ | ✅ | ❌ | ❌ |
| **Modifier ad hoc** | ✅ | ✅ | ❌ | ❌ |
| **Annuler** | ✅ | ✅ | ❌ | ❌ |
| **Démarrer** | ✅ (selon modePilotage) | ✅ (selon modePilotage) | ✅ (selon modePilotage) | ❌ |
| **Terminer** | ✅ | ✅ | ✅ si assigné | ❌ |
| **Non applicable** | ✅ | ✅ | ✅ | ❌ |
| **Non honorée** | ✅ | ✅ | ✅ | ❌ |
| **Ajouter PJ** | ✅ si en_cours | ✅ si en_cours | ✅ si en_cours | ❌ |
| **Corriger tempsPassé** | ✅ si terminee | ✅ si terminee | ❌ | ❌ |

> **Note :** le `modePilotage` de l'exécution parente contraint les actions Démarrer/Terminer/Non applicable/Non honorée — voir §6 et §7.

---

## 13. Règles techniques d'implémentation

### Fetch de la tâche avant le check de permission

Pour vérifier `isAssignée`, la tâche doit être récupérée AVANT de calculer les permissions :

```typescript
// ✅ CORRECT — fetch d'abord, check après
const tache = await getTacheById(tacheId);
const isAssignee = tache.assigneeUserId === currentUser.id;
const canTerminer = canManage || (canExecute && isAssignee);

if (!canTerminer) throw errors.forbidden("...");
```

### Terminaison — transaction atomique avec calcul du temps

```typescript
await db.transaction(async (tx) => {
  const now = new Date();
  const tempsPasseSecondes = tache.startedAt
    ? Math.floor((now.getTime() - tache.startedAt.getTime()) / 1000)
    : 0;

  await tx.update(occurrenceTaches)
    .set({
      statut: "terminee",
      doneAt: now,
      completeeParUserId: currentUser.id,
      tempsPasseSecondes,
      updatedById: currentUser.id,
    })
    .where(eq(occurrenceTaches.id, tacheId));
});
```

### Correction du temps passé — validation des bornes

```typescript
// ✅ CORRECT — validation 0 à 604800 secondes (7 jours max)
const MAX_TEMPS_PASSE = 7 * 24 * 60 * 60; // 604800

if (tempsPasseSecondes < 0 || tempsPasseSecondes > MAX_TEMPS_PASSE) {
  throw errors.badRequest("Temps passé invalide (0 à 604800 secondes).");
}

if (tache.statut !== "terminee") {
  throw errors.forbidden("Seule une tâche terminée peut être corrigée.");
}
```

### Jamais de DELETE — toujours un statut

```typescript
// ✅ CORRECT
await db.update(occurrenceTaches)
  .set({ statut: "annulee", updatedById: currentUser.id })
  .where(eq(occurrenceTaches.id, tacheId));

// ❌ JAMAIS
await db.delete(occurrenceTaches).where(...);
```

### Snapshot immuable pour les tâches issues d'un template

```typescript
// À la création (snapshot)
await tx.insert(occurrenceTaches).values({
  occurrenceId,
  listeItemId: item.id,          // Référence au template
  titre: item.titre,             // Snapshot — copie au moment T
  description: item.description, // Snapshot — copie au moment T
  statut: "a_faire",
  // ...
});

// Lors d'une tentative de modification du titre d'une tâche template
if (tache.listeItemId !== null) {
  throw errors.forbidden("Les tâches issues d'un template ne peuvent pas être modifiées.");
}
```

---

## 14. Résumé rapide

| Règle | Valeur |
|-------|--------|
| Suppression physique | ❌ Jamais — statut uniquement |
| Démarrage | `a_faire` + `canExecute` (selon `modePilotage`) → auto-assignation |
| Terminaison | `en_cours` + (`canManage` OU assigné + `canExecute`) |
| Non applicable / Non honorée | `a_faire` ou `en_cours` + `canExecute` ou `canManage` |
| Annulation | `a_faire` ou `en_cours` + `canManage` uniquement |
| Création ad hoc | `canManage` uniquement (admin + responsable_site) |
| Tâche template | Snapshot immuable — aucune modification de contenu |
| PJ preuves | `canExecute` ou `canManage` + tâche `en_cours` |
| Correction temps passé | `canManage` + tâche `terminee` + 0–604 800 s |

---

*Dernière mise à jour : 2026-03-10*

---

# Règles Métier — Attribution des Sites (`userClientSiteAttributions` / `userPrestataireSiteAttributions`)

> Référence unique pour toutes les permissions liées à l'attribution de sites à des utilisateurs.
> À consulter systématiquement avant d'implémenter ou de modifier une logique d'attribution.

---

## 1. Principe fondamental

Les attributions de sites définissent les **responsabilités opérationnelles** : qui est responsable d'un site, qui peut créer des sous-sites, qui peut interagir avec les modules opérationnels (tickets, devis, occurrences, etc.).

Elles ne servent **pas** à filtrer la visibilité de base du référentiel côté client : tous les utilisateurs ayant une adhésion active voient les sites de leur entreprise. C'est l'attribution qui détermine ce qu'ils peuvent faire dessus.

> **Règle d'or :**
> - Adhésion entreprise → accès au module
> - Attribution site → responsabilités opérationnelles

---

## 2. Tables concernées

| Posture | Table d'attribution |
|---------|---------------------|
| Client | `userClientSiteAttributions` |
| Prestataire | `userPrestataireSiteAttributions` |

Les cibles d'attribution sont toujours des utilisateurs appartenant à la même entreprise :
- Attribution client → `userClientAdhesions.userId` (statut actif)
- Attribution prestataire → `userPrestataireAdhesions.userId` (statut actif)

---

## 3. Rôles d'attribution disponibles

### Côté client (`userClientSiteAttributions`)

| Rôle | Signification |
|------|--------------|
| `responsable_site` | Peut modifier le site, créer des sous-sites, attribuer des utilisateurs sur ce site |
| `demandeur_site` | Peut créer des tickets, des demandes de devis, consulter les opérations |
| `observateur_site` | Lecture seule |

### Côté prestataire (`userPrestataireSiteAttributions`)

| Rôle | Signification |
|------|--------------|
| `responsable_site` | Chef d'équipe : peut modifier le site (si proxy), attribuer des prestataires, organiser les opérations |
| `demandeur_site` | Peut créer des tickets, des demandes d'intervention |
| `observateur_site` | Lecture seule |
| `intervenant_site` | Agent terrain : peut voir ses tâches, intervenir, clôturer des tâches. Ne peut pas attribuer. |

---

## 4. Qui peut attribuer un site ?

### Posture CLIENT

| Rôle de l'attributeur | Peut attribuer |
|-----------------------|---------------|
| `admin` (roleAdhesion) | ✅ Sur tous les sites |
| `manager` + `responsable_site` du site concerné | ✅ Sur les sites de son périmètre uniquement |
| `collaborateur` + `responsable_site` du site concerné | ✅ Sur les sites de son périmètre (délégation locale) |
| `manager` sans `responsable_site` | ❌ |
| `collaborateur` sans `responsable_site` | ❌ |

> **Règle exacte :** un utilisateur peut attribuer un site si et seulement si `admin` (roleAdhesion) OU possède une attribution `responsable_site` (effective, i.e. `mode=inclure`) sur ce site. Le roleAdhesion `collaborateur` ne restreint pas ce droit : s'il est `responsable_site` sur un site, il peut déléguer les rôles `demandeur_site` et `observateur_site` sur ce site (mais jamais `responsable_site` — réservé aux admins, cf. §5).

### Posture PRESTATAIRE

**Cas 1 — Le client possède un admin actif :**
Le prestataire est en lecture seule. Aucune attribution possible.

**Cas 2 — Mode proxy (pas d'admin client actif) :**
Mêmes règles que côté client :

| Rôle du prestataire | Peut attribuer |
|---------------------|---------------|
| `admin` (roleAdhesion) | ✅ Sur tous les sites du client |
| `responsable_site` du site concerné | ✅ Sur les sites de son périmètre |
| Autres | ❌ |

### Posture PLATEFORME

Les utilisateurs plateforme peuvent attribuer n'importe quel site à n'importe quel utilisateur, sans restriction.

---

## 5. Qui peut attribuer quel rôle ?

L'attributeur ne peut pas donner un rôle supérieur à son propre périmètre.

### Attribution client

| Rôle donné | Qui peut l'attribuer |
|------------|----------------------|
| `responsable_site` | `admin` uniquement |
| `demandeur_site` | `admin` ou `responsable_site` |
| `observateur_site` | `admin` ou `responsable_site` |

### Attribution prestataire

| Rôle donné | Qui peut l'attribuer |
|------------|----------------------|
| `responsable_site` | `admin` uniquement |
| `demandeur_site` | `admin` ou `responsable_site` |
| `observateur_site` | `admin` ou `responsable_site` |
| `intervenant_site` | `admin` ou `responsable_site` |

---

## 6. Périmètre de l'attributeur

Un utilisateur ne peut attribuer un site **que s'il a lui-même accès à ce site**.

| Rôle | Peut attribuer quels sites |
|------|---------------------------|
| `admin` | Tous les sites de l'entreprise |
| `responsable_site` | Uniquement les sites de son périmètre effectif (via closure table + scope) |

> **Raison :** éviter qu'un responsable local étende son autorité à des sites hors de son périmètre.

---

## 7. Scope et mode d'attribution

Chaque attribution dispose de deux dimensions complémentaires :

### `scope` : étendue de l'attribution

| Valeur | Signification |
|--------|--------------|
| `self` | S'applique uniquement au site désigné |
| `subtree` | S'applique au site désigné et à tous ses descendants (via `sitesArborescence`) |

### `mode` : type d'attribution

| Valeur | Signification |
|--------|--------------|
| `inclure` | Accorde les droits sur ce site (et son sous-arbre si `scope=subtree`) |
| `exclure` | Retire les droits sur ce site (et son sous-arbre si `scope=subtree`) |

### Exemples

**Exemple 1 — Réseau entier :**
```
inclure  siège   scope=subtree
```
→ L'utilisateur est responsable de tout le réseau sous le siège.

**Exemple 2 — Réseau avec exception :**
```
inclure  siège         scope=subtree
exclure  agence-paris  scope=subtree
```
→ L'utilisateur couvre tout le réseau sauf l'agence de Paris et ses sous-sites.

---

## 8. Règle de résolution des conflits (CRITIQUE)

Quand plusieurs attributions s'appliquent à un même site (via le scope et la closure table), la règle de résolution est :

> **L'exclusion prime toujours sur l'inclusion.**

### Algorithme de résolution

Pour un utilisateur U et un site S :

1. Récupérer toutes les attributions actives de U dont le périmètre couvre S (via `sitesArborescence` pour le `scope=subtree`)
2. Si au moins une attribution est `mode=exclure` → **accès refusé**
3. Sinon, si au moins une attribution est `mode=inclure` → **accès autorisé**
4. Sinon → **accès refusé**

```
exclure > inclure
```

### Pourquoi cette règle est impérative (sécurité)

Sans règle explicite, un utilisateur pourrait :
1. Être exclu d'un site via `exclure siège subtree`
2. Se réattribuer une inclusion plus spécifique via `inclure siège self`
3. Contourner l'exclusion

La règle "exclusion gagne toujours" ferme cette faille : une exclusion posée sur un sous-arbre **ne peut pas être contournée** par une inclusion plus spécifique en dessous.

### Implémentation SQL de référence

```sql
-- Pour vérifier l'accès de userId au site targetSiteId :
SELECT mode
FROM user_client_site_attributions uca
JOIN sites_arborescence sa
  ON sa.ancetre_id = uca.site_id
  AND sa.descendant_id = :targetSiteId
  AND sa.entreprise_id = :entrepriseId
WHERE uca.user_id = :userId
  AND (
    (uca.scope = 'self'    AND sa.profondeur = 0)
    OR uca.scope = 'subtree'
  )
ORDER BY (uca.mode = 'exclure') DESC  -- exclusions en premier
LIMIT 1;
-- Si la première ligne est 'exclure' → refus
-- Si la première ligne est 'inclure' → accès autorisé
-- Si aucune ligne → refus
```

---

## 9. Résolution des droits effectifs

Pour calculer si un utilisateur est `responsable_site`, `demandeur_site`, etc. sur un site donné, le système combine :

1. **Attributions directes** — lignes dans `userClientSiteAttributions` ou `userPrestataireSiteAttributions`
2. **Closure table** — `sitesArborescence` pour propager les attributions `scope=subtree`
3. **Règle d'exclusion prioritaire** — mode `exclure` annule toujours le mode `inclure`

Le résultat est un **rôle effectif par site** :
- `estResponsableSite` — peut modifier le site, sous-sites, attributions
- `estDemandeurSite` — peut créer tickets, devis, interventions
- `estObservateurSite` — lecture seule
- `estIntervenantSite` (prestataire uniquement) — peut exécuter les tâches

> **Règle :** si un utilisateur a plusieurs attributions `inclure` avec des rôles différents sur un même site, le rôle le plus permissif s'applique — sauf si une exclusion annule l'ensemble.

---

## 10. Règles techniques d'implémentation

### Toujours vérifier le périmètre de l'attributeur

```typescript
// Avant d'insérer une attribution, vérifier que l'attributeur a accès au site cible
const canAttribute =
  isAdmin ||
  (await isResponsableSiteEffectif({ userId: attributeurId, siteId, entrepriseId }));

if (!canAttribute) {
  throw errors.forbidden("Vous n'avez pas accès à ce site.");
}
```

### Toujours vérifier que la cible appartient à la bonne entreprise

```typescript
// Vérifier que la cible a bien une adhésion active dans l'entreprise
const adhesion = await db.query.userClientAdhesions.findFirst({
  where: and(
    eq(userClientAdhesions.userId, targetUserId),
    eq(userClientAdhesions.entrepriseId, entrepriseId),
    eq(userClientAdhesions.statut, "actif"),
  ),
});
if (!adhesion) throw errors.forbidden("Utilisateur non membre de cette entreprise.");
```

### Résolution via closure table (Drizzle ORM)

```typescript
// Récupérer toutes les attributions qui couvrent un site cible
const attributions = await db
  .select({ mode: uca.mode, role: uca.role })
  .from(userClientSiteAttributions.as("uca"))
  .innerJoin(sitesArborescence.as("sa"), and(
    eq(sa.ancetreId, uca.siteId),
    eq(sa.descendantId, targetSiteId),
    eq(sa.entrepriseId, entrepriseId),
  ))
  .where(and(
    eq(uca.userId, userId),
    or(
      and(eq(uca.scope, "self"), eq(sa.profondeur, 0)),
      eq(uca.scope, "subtree"),
    ),
  ));

const hasExclusion = attributions.some((a) => a.mode === "exclure");
const hasInclusion = attributions.some((a) => a.mode === "inclure");

if (hasExclusion) return null;   // accès refusé — exclusion prioritaire
if (!hasInclusion) return null;  // pas d'attribution active
// Retourner le rôle le plus permissif parmi les inclusions
const roles = attributions.filter((a) => a.mode === "inclure").map((a) => a.role);
return getMostPermissiveRole(roles); // responsable_site > demandeur_site > observateur_site
```

---

## 11. Résumé rapide

| Question | Réponse |
|----------|---------|
| Qui peut attribuer ? | `admin` (toujours) ou `responsable_site` (dans son périmètre) |
| À qui peut-on attribuer ? | Utilisateurs avec adhésion active dans la même entreprise |
| Côté client — rôles disponibles | `responsable_site`, `demandeur_site`, `observateur_site` |
| Côté prestataire — rôles disponibles | `responsable_site`, `demandeur_site`, `observateur_site`, `intervenant_site` |
| Qui peut donner `responsable_site` ? | `admin` uniquement |
| Règle de conflit inclure/exclure | Exclusion prioritaire — `exclure` annule toujours `inclure` |
| Scope `subtree` + exclusion | L'exclusion parent bloque tout le sous-arbre, même avec inclusion spécifique en dessous |

---

*Dernière mise à jour : 2026-03-10*

---

# Règles Métier — Module Utilisateurs (`app/utilisateurs`)

> Référence unique pour toutes les permissions liées à la gestion des utilisateurs.
> À consulter systématiquement avant d'implémenter ou de modifier une permission.

---

## 1. Modèle à deux arbres indépendants

Le module gère **deux systèmes hiérarchiques distincts** qui ne se mélangent pas :

| Système | Table | Rôle | Exemple |
|---------|-------|------|---------|
| **Arbre organisationnel** | `usersArborescence` | Gouvernance administrative (qui manage qui) | Manager A → Collaborateur B |
| **Arbre attributions sites** | `userClientSiteAttributions` | Responsabilités opérationnelles (qui gère quel site) | B est `responsable_site` du Siège |

**Règles de coexistence** :
- Un utilisateur peut être subordonné dans l'arbre organisationnel ET responsable d'un site = indépendant
- La suppression d'un utilisateur supprime ses deux types d'entrées
- La suspension d'un manager **ne modifie pas** les subordonnés dans l'arbre (l'arbre reste intact)

---

## 2. Rôles d'adhésion par posture

### Posture CLIENT (`userClientAdhesions.role`)
| Niveau | Rôle | Capacités |
|--------|------|-----------|
| 3 | `admin` | Droits complets sur tous les utilisateurs de l'entreprise |
| 2 | `manager` | Gestion de sa propre branche uniquement |
| 1 | `collaborateur` | Aucun droit de gestion utilisateurs |

### Posture PRESTATAIRE (`userPrestataireAdhesions.role`)
Même 3 niveaux (`admin`, `manager`, `collaborateur`) avec les mêmes règles de hiérarchie.

### Posture PLATEFORME (`userPlateformeAdhesions.role`)
| Rôle | Capacités |
|------|-----------|
| `super_admin_plateforme` | Droits complets sur toutes les entreprises (niveau 4) |
| `operateur_plateforme` | Droits opérationnels plateforme |

---

## 3. Matrice des permissions CRUD

### 3.1 Voir la liste des utilisateurs

Tout utilisateur avec une adhésion active dans l'entreprise peut consulter la liste.
La liste est scopée selon la posture active :
- **Client** → `userClientAdhesions` de cette `entrepriseId`
- **Prestataire** → `userPrestataireAdhesions` de cette `entrepriseId`
- **Plateforme** → `userPlateformeAdhesions` (liste cross-entreprises)

### 3.2 Créer un utilisateur

| Action | Admin | Manager | Collaborateur | Plateforme |
|--------|-------|---------|---------------|------------|
| Créer un utilisateur racine (sans parent) | ✅ | ❌ | ❌ | ✅ |
| Créer un subordonné direct sous soi-même | ✅ | ✅ | ❌ | ✅ |
| Créer un subordonné sous un collaborateur de sa branche | ✅ | ✅ | ❌ | ✅ |
| Créer un subordonné sous un autre manager | ✅ | ❌ | ❌ | ✅ |
| Créer un subordonné sous un admin | ✅ | ❌ | ❌ | ✅ |

**Règle manager** : le manager peut créer uniquement sous lui-même OU sous un nœud `collaborateur` qui est dans SA branche (vérifié via `isUserDescendant()`).

**`parentId`** : libre — un créateur peut rattacher le nouvel utilisateur à n'importe quel nœud de l'arbre de l'entreprise (dans les limites ci-dessus).

### 3.3 Rattacher un utilisateur existant

Réservé à `admin` et `super_admin_plateforme` uniquement.
Les utilisateurs éligibles sont ceux présents dans l'arborescence de l'entreprise (entrée réflexive `profondeur=0`) mais sans adhésion pour la posture cible.

| Action | Admin | Manager | Collaborateur | Plateforme |
|--------|-------|---------|---------------|------------|
| Rattacher un utilisateur existant | ✅ | ❌ | ❌ | ✅ |

### 3.4 Modifier le profil d'un utilisateur

| Qui modifie / Qui est modifié | Soi-même | Inférieur | Même niveau | Supérieur |
|-------------------------------|----------|-----------|-------------|-----------|
| `admin` (niveau 3) | ✅ | ✅ | ❌ (autre admin) | ❌ |
| `manager` (niveau 2) | ✅ | ✅ (collaborateurs) | ❌ | ❌ |
| `collaborateur` (niveau 1) | ✅ | N/A | ❌ | ❌ |
| `super_admin_plateforme` | ✅ | ✅ | ✅ | ✅ |

**Règle** : `canEdit = isViewingSelf || (currentLevel > targetLevel && currentLevel > 1)`

### 3.5 Modifier le rôle ou le statut d'adhésion

Même règle que 3.4 : niveau courant **strictement supérieur** au niveau cible.

**Cas particulier** : un admin ne peut pas modifier le rôle d'un autre admin (même niveau = 3).

### 3.6 Supprimer définitivement un utilisateur

Réservé à `admin` et `super_admin_plateforme`.

La suppression doit nettoyer toutes les adhésions de l'utilisateur :
1. `userClientAdhesions` (si adhésion client existe)
2. `userPrestataireAdhesions` (si adhésion prestataire existe)
3. `userPlateformeAdhesions` (si adhésion plateforme existe)
4. `usersArborescence` (toutes les entrées — ancêtres ET descendants)
5. `userClientSiteAttributions` / `userPrestataireSiteAttributions`

---

## 4. Garde-fou "dernier administrateur actif"

**Règle** : Il est interdit de laisser une entreprise sans aucun administrateur actif.

**Actions bloquées** si l'utilisateur cible est le dernier admin actif :
1. Changer son rôle (`admin` → `manager` ou `collaborateur`)
2. Changer son statut (`actif` → `suspendu` ou `en_attente`)
3. Le supprimer définitivement

**Message d'erreur** : *"Impossible : cet utilisateur est le dernier administrateur actif de l'entreprise. Nommez un autre administrateur avant d'effectuer cette action."*

**Implémentation** : `assertNotLastActiveAdmin({ entrepriseId, posture })` dans `usersActions.ts` — lève une erreur `forbidden` si le nombre d'admins actifs serait 0 après l'action.

**Implication de sécurité FM4ALL** : l'absence d'admin actif chez un client active automatiquement les droits proxy prestataire (`canManageSiteAsProxy`). Ce garde-fou empêche un vecteur d'escalade de privilèges.

---

## 5. Gestion des attributions de sites

### 5a. Posture client — `userClientSiteAttributions`

Visible et modifiable en posture **client**. L'`entrepriseId` est celui de l'entreprise cliente.

| Qui | Peut gérer les attributions |
|-----|----------------------------|
| `super_admin_plateforme` | ✅ (y compris sur soi-même) |
| `admin` | ✅ (y compris sur soi-même) |
| `manager` | ✅ mais uniquement sur les **subordonnés** (jamais sur soi-même) |
| `collaborateur` | ❌ |

**Règle** : `canManageSiteAttributions = isAdmin || isPlatformAdmin || (!isViewingSelf && currentLevel > targetLevel && currentLevel > 1)`

### 5b. Posture prestataire — `userPrestataireSiteAttributions`

Visible et modifiable en posture **prestataire**. Les attributions sont liées à un **client** (`clientEntrepriseId`), pas à l'entreprise prestataire. L'UI présente un sélecteur de client dans le dialog.

| Qui | Peut gérer les attributions |
|-----|----------------------------|
| `super_admin_plateforme` | ✅ |
| `admin` prestataire | ✅ (y compris sur soi-même) |
| `manager` prestataire | ✅ uniquement sur les **subordonnés** (jamais sur soi-même) |
| `collaborateur` prestataire | ❌ |

**Règles complémentaires** :
- Le backend vérifie la relation `clientPrestataireRelations` avant toute lecture ou écriture
- Seul un admin prestataire peut attribuer le rôle `responsable_site`
- La présence d'un admin actif chez le client est **sans effet** ici : `userPrestataireSiteAttributions` concerne l'organisation interne du prestataire (qui de son équipe est responsable de quel site client), et non la gestion des utilisateurs clients. La règle "proxy prestataire" (`canManageSiteAsProxy`) s'applique exclusivement à `userClientSiteAttributions` (§5a).

**Implémentation** : `UserSiteAttributionDialog` gère les deux postures (client picker pour prestataire). `UserDetails` affiche la section attribution pour `postureActive !== "plateforme"`.

### 5c. Posture plateforme

Les attributions de sites ne sont **pas gérées** depuis la posture plateforme dans `app/utilisateurs`. La plateforme passe en posture client ou prestataire pour gérer les attributions de l'entreprise concernée.

---

## 6. Comportement multi-posture

Un même compte peut avoir des adhésions dans plusieurs postures. La posture active (cookie `fm4all:postureActive`) détermine :
- Quelle table d'adhésion est lue pour les permissions (`userClientAdhesions` vs `userPrestataireAdhesions`)
- Quelle liste d'utilisateurs est affichée
- Quelles actions sont disponibles

**Règle critique** : En posture `prestataire`, les rôles viennent de `userPrestataireAdhesions.role`, **pas** de `userClientAdhesions.role`. Un utilisateur peut être `admin` prestataire et `collaborateur` client simultanément — ce sont deux contextes indépendants.

---

## 7. Module Entreprises

### 7a. Page `app/mon-entreprise` (postures client / prestataire / plateforme)

Accessible à tout utilisateur ayant une adhésion active (client ou prestataire) dans l'entreprise.

| Action | Condition |
|--------|-----------|
| Voir les informations | Toute adhésion active (client OU prestataire) |
| Modifier infos (nom, SIRET, TVA) | `role === "admin"` dans l'adhésion active |
| Modifier contact | idem |
| Modifier logo | idem |
| Modifier rôles / services | idem |
| Inviter un administrateur | idem (seulement si `!hasActiveAdmin`) |

**Règle plateforme** : un utilisateur en posture plateforme a accès à tout (bypass admin check).

**Implémentation** :
- UI : `canEdit = roleClientAdhesion === "admin" || rolePrestataireAdhesion === "admin"` dans `MonEntrepriseClient`
- Serveur : vérifier `plateformeRole` OU `clientAdhesion.role === "admin"` OU `prestataireAdhesion.role === "admin"` (même entreprise)

### 7b. Pages `app/entreprises` et `app/entreprises/[entrepriseId]` (posture plateforme uniquement)

Accessibles uniquement aux utilisateurs ayant un rôle plateforme actif.

| Action | Condition |
|--------|-----------|
| Voir la liste des entreprises | Rôle plateforme actif |
| Voir le détail d'une entreprise | Rôle plateforme actif |
| Créer une entreprise | Rôle plateforme actif |
| Modifier infos / contact / logo / rôles | Rôle plateforme actif |
| Inviter un administrateur | Rôle plateforme actif |

**Note** : Ces pages utilisent le même composant `EntrepriseDetailsClient` que `app/mon-entreprise`, avec `canEdit = true` passé depuis la page plateforme (après guard serveur).

---

# Règles Métier — Module Mes Clients (`app/mes-clients`)

> Référence unique pour les permissions liées à la gestion des clients d'un prestataire.
> Accessible uniquement en posture **prestataire**.

---

## 1. Accès à la page

Guard serveur (`page.tsx`) : l'utilisateur doit avoir une adhésion prestataire active.

```
userPrestataireAdhesions.userId   = currentUser.id
userPrestataireAdhesions.statut   = "actif"
```

Sinon → redirect `/auth/unauthorized`.

---

## 2. Périmètre des clients affichés

Un client apparaît dans la liste si au moins l'une des deux conditions est vraie :

1. Une relation explicite existe dans `clientPrestataireRelations` (prestataire a ajouté ce client manuellement)
2. Le prestataire a au moins une exécution active (`clientServiceExecutions`) liée à ce client

---

## 3. Matrice de permissions

| Action | `admin` | `manager` | `collaborateur` |
|--------|---------|-----------|-----------------|
| Voir la liste des clients | ✅ | ✅ | ✅ |
| Lier/créer un client (`AjouterClientDialog`) | ✅ | ✅ | ❌ |
| Inviter l'admin d'un client (`InviterClientDialog`) | ✅ | ✅ | ❌ |

---

## 4. Lier un client — règles métier

L'action `createOrLinkClientAction` fonctionne en deux cas :

- **SIRET connu en DB** : aucune création d'entreprise — seul le lien `clientPrestataireRelations` est créé
- **SIRET inconnu** : création de l'entreprise + attribution du rôle `"client"` + création du lien

**Contraintes :**
- Un prestataire ne peut pas s'ajouter lui-même comme client (`clientId ≠ prestataireEntrepriseId`)
- Si la relation existe déjà (`clientPrestataireRelations`), le lien n'est pas recréé (`onConflictDoNothing`)
- Requiert au minimum le rôle `manager`

---

## 5. Inviter l'admin d'un client — règles métier

L'action `inviterClientAdminAction` envoie une invitation par email pour que le client crée son compte administrateur.

**Conditions pour pouvoir inviter :**
1. L'utilisateur prestataire est au moins `manager`
2. La relation `clientPrestataireRelations` existe entre les deux entreprises
3. Le client n'a pas encore d'admin actif (`userClientAdhesions.role = "admin"` et `statut = "actif"`)
4. L'email cible n'est pas déjà utilisé par un compte existant

**Effets :**
1. Les invitations en attente existantes pour ce client sont annulées (`DELETE` sur `entrepriseInvitations` non acceptées)
2. Une nouvelle invitation est créée (token UUID, expiration 7 jours, `typeAdhesion = "client"`)
3. Un email est envoyé avec un lien `/auth/inscription-admin?token=…`

**Note UI** : après l'envoi, la liste est rechargée depuis le serveur (`loadClients()`). Le bouton "Inviter" ne disparaît qu'une fois qu'un admin actif existe réellement en base — une invitation en attente ne suffit pas.

---

## 6. Lecture seule des infos client

Un prestataire peut **consulter** les informations d'un client (nom, SIRET, contact) mais ne peut **pas les modifier**.

> Rationale : un client peut être partagé entre plusieurs prestataires. Permettre à un prestataire de modifier les données partagées risquerait de créer des incohérences pour les autres.

Pour toute mise à jour, le client doit créer son compte ou contacter FM4ALL.

---

# Règles Métier — Module Mes Prestataires (`app/mes-prestataires`)

> Référence unique pour les permissions liées à la gestion des prestataires d'un client.
> Accessible uniquement en posture **client**.

---

## 1. Accès à la page

Guard serveur (`page.tsx`) : l'utilisateur doit avoir une adhésion client active.

```
userClientAdhesions.userId  = currentUser.id
userClientAdhesions.statut  = "actif"
```

Sinon → redirect `/auth/unauthorized`.

---

## 2. Périmètre des prestataires affichés

Un prestataire apparaît dans la liste si au moins l'une des deux conditions est vraie :

1. Une relation explicite existe dans `clientPrestataireRelations` (le client a ajouté ce prestataire manuellement)
2. Le prestataire a au moins une exécution active (`clientServiceExecutions`) liée à ce client

---

## 3. Matrice de permissions

| Action | `admin` | `manager` | `collaborateur` |
|--------|---------|-----------|-----------------|
| Voir la liste des prestataires | ✅ | ✅ | ✅ |
| Ajouter un prestataire (`AjouterPrestataireDialog`) | ✅ | ✅ | ❌ |
| Inviter l'admin d'un prestataire (`InviterPrestataireDialog`) | ✅ | ✅ | ❌ |

---

## 4. Ajouter un prestataire — règles métier

L'action `createOrLinkPrestataireAction` fonctionne en deux cas :

- **SIRET connu en DB** : aucune création d'entreprise — seul le lien `clientPrestataireRelations` est créé
- **SIRET inconnu** : création de l'entreprise + attribution du rôle `"prestataire"` + création du lien

**Contraintes :**
- Un client ne peut pas s'ajouter lui-même comme prestataire (`prestataireId ≠ clientEntrepriseId`)
- Si la relation existe déjà (`clientPrestataireRelations`), le lien n'est pas recréé (`onConflictDoNothing`)
- Requiert au minimum le rôle `manager`

---

## 5. Inviter l'admin d'un prestataire — règles métier

L'action `inviterPrestataireAdminAction` envoie une invitation par email pour que le prestataire crée son compte administrateur.

**Conditions pour pouvoir inviter :**
1. L'utilisateur client est au moins `manager`
2. La relation `clientPrestataireRelations` existe entre les deux entreprises
3. Le prestataire n'a pas encore d'admin actif (`userPrestataireAdhesions.role = "admin"` et `statut = "actif"`)
4. L'email cible n'est pas déjà utilisé par un compte existant

**Effets :**
1. Les invitations en attente existantes pour ce prestataire sont annulées (`DELETE` sur `entrepriseInvitations` non acceptées, filtrées par `typeAdhesion = "prestataire"`)
2. Une nouvelle invitation est créée (token UUID, expiration 7 jours, `typeAdhesion = "prestataire"`)
3. Un email est envoyé avec un lien `/auth/inscription-admin?token=…`

**Important — `typeAdhesion` sur l'invitation** :
Lors de l'acceptation (`accepterInvitationAdminAction`), le champ `typeAdhesion` détermine quelle adhésion est créée :
- `"prestataire"` → insert dans `userPrestataireAdhesions`
- `"client"` → insert dans `userClientAdhesions`

Cela évite qu'une invitation prestataire crée accidentellement une adhésion client (risque pour les entreprises ayant les deux rôles simultanément).

---

## 6. Lecture seule des infos prestataire

Un client peut **consulter** les informations d'un prestataire (nom, SIRET, contact) mais ne peut **pas les modifier**.

> Rationale : un prestataire peut être partagé entre plusieurs clients. Permettre à un client de modifier les données partagées risquerait de créer des incohérences pour les autres.

Pour toute mise à jour, le prestataire doit créer son compte ou contacter FM4ALL.

---

*Dernière mise à jour : 2026-03-10*
