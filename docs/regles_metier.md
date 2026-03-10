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
