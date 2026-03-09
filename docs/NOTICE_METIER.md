# Notice Métier — FM4ALL

> Document de référence des règles métier de la plateforme de gestion opérationnelle FM4ALL.
> Dernière mise à jour : 2026-03-09

---

## Contexte Produit

FM4ALL est une société de **courtage et mise en relation** pour les services de facility management des TPE/PME. Positionnement : **"1 contact, 1 contrat, 1 facture"** pour toutes les prestations externalisées.

La plateforme de gestion opérationnelle gère le cycle de vie complet des services après contractualisation.

---

## Acteurs et Postures

### Les 3 Postures

Un utilisateur peut basculer entre les postures selon ses adhésions :

| Posture | Cookie | Accès |
|---------|--------|-------|
| `client` | `fm4all:postureActive=client` | Ses propres sites, prestations, tickets |
| `prestataire` | `fm4all:postureActive=prestataire` | Sites/tickets/prestations de ses clients |
| `plateforme` | `fm4all:postureActive=plateforme` | Tout (cross-entreprises) — FM4ALL uniquement |

**Règle fondamentale** : Le cookie détermine la posture active. Un utilisateur avec plusieurs rôles en DB n'obtient les permissions que de sa posture active. Un cookie absent ou invalide = posture client (comportement le plus sûr).

### Principe "Double Casquette"

Une entreprise peut être simultanément cliente ET prestataire. Un utilisateur FM4ALL peut avoir un rôle plateforme ET un rôle client/prestataire. Dans ce cas, les permissions sont toujours scopées à la posture active.

### Rôles par Posture

#### Rôles Entreprise (table `user_adhesions` + `user_client_adhesions` / `user_prestataire_adhesions`)

| Rôle | Niveau | Description |
|------|--------|-------------|
| `admin` | 3 | Gestion complète de l'entreprise — bypass attributions site |
| `manager` | 2 | Gestion équipe, pas de modification structure |
| `collaborateur` | 1 | Accès lecture |

#### Rôles Site (table `user_client_site_attributions` / `user_prestataire_site_attributions`)

| Rôle | Niveau | Description |
|------|--------|-------------|
| `responsable_site` | 3 | Gestion opérationnelle d'un site |
| `demandeur_site` | 2 | Peut créer tickets et exécuter des tâches |
| `observateur_site` | 1 | Lecture seule |
| `intervenant_site` | 0 | Exécution de tâches uniquement (prestataire) |

**Règle ADMIN BYPASS** : Un admin entreprise a accès à tous les sites sans attribution explicite. Il n'a pas besoin d'être `responsable_site` pour gérer les opérations d'un site.

#### Rôles Plateforme (table `user_plateforme_adhesions`)

| Rôle | Description |
|------|-------------|
| `super_admin_plateforme` | Accès total cross-entreprise |
| `operateur_plateforme` | Opérations plateforme |

---

## Règles par Module

### Module Sites

#### Périmètre par posture

| Posture | Sites visibles |
|---------|----------------|
| Client | Ses propres sites (`sites.entrepriseId = entrepriseId`) |
| Prestataire | Sites de ses clients liés via `clientPrestataireRelations` (PAS ses propres sites) |
| Plateforme | Tous les sites |

#### Hiérarchie de Sites (Closure Table)

Les sites sont organisés en arborescence via `sites_arborescence` (closure table) :
- Chaque site a une ligne réflexive (profondeur 0)
- Les ancêtres sont enregistrés avec leur profondeur

**Règle suppression** : Impossible si le site a des enfants directs (profondeur = 1).

#### Proxy Prestataire

Un prestataire peut créer/modifier des sites au nom d'un client **si et seulement si** :
1. La relation `clientPrestataireRelations` existe
2. Le client n'a pas d'admin actif (`userClientAdhesions.statut=actif, role=admin`)

---

### Module Utilisateurs

#### Périmètre par posture (3 branches explicites)

| Posture | Table consultée | Filtre |
|---------|----------------|--------|
| `plateforme` | `user_plateforme_adhesions` | FM4ALL team |
| `prestataire` | `user_prestataire_adhesions` | Son entreprise prestataire |
| `client` | `user_client_adhesions` | Son entreprise cliente |

**Règle** : Ne jamais tenter d'unifier ces 3 branches — elles sont structurellement différentes.

#### Invitation vs Rattachement

- **Invitation** : Crée un token → email → `/auth/inscription-admin?token=` → nouveau compte
- **Rattachement** : Ajoute une adhésion à un utilisateur existant (sans créer de compte)

**Règle 1 user = 1 entreprise** : Index unique sur `userId` dans `user_client_adhesions` et `user_prestataire_adhesions`. Un utilisateur ne peut appartenir qu'à une seule entreprise dans chaque posture.

---

### Module Tickets

#### Cycle de Vie (Machine d'État)

```
nouveau
  └─► pris_en_charge
        ├─► en_attente_prestataire
        │     └─► en_attente_client
        │           └─► a_valider
        │                 └─► clos
        ├─► a_valider
        │     └─► clos
        └─► annule (seulement depuis nouveau et pris_en_charge)
```

**Transitions autorisées** :
- `annule` : uniquement depuis `nouveau` ou `pris_en_charge`
- `rejete` : transition exceptionnelle (ex: ticket invalide)
- Toutes les autres transitions suivent le flux ci-dessus

#### Périmètre par posture

| Posture | Tickets visibles |
|---------|-----------------|
| Client | Tickets de ses sites accessibles (`proprietaireEntrepriseId` = son entreprise, filtrés par sites) |
| Prestataire Admin | Tous les tickets où `assigneEntrepriseId` = son entreprise |
| Prestataire Non-Admin | Tickets assignés + site dans ses attributions |
| Plateforme | Tous les tickets sans filtre |

**CRITIQUE** : Le périmètre prestataire est basé sur `assigneEntrepriseId`, PAS sur `proprietaireEntrepriseId`. Un prestataire ne voit que les tickets qui lui sont assignés.

#### Permissions d'Édition (Hiérarchie par niveau)

| Niveau requis | Actions autorisées |
|--------------|-------------------|
| ≥ 2 (demandeur+) | Éditer titre, description, créer ticket |
| ≥ 3 (responsable+) | Éditer type, priorité, statut, assigner prestataire, assigner utilisateur |
| Admin bypass | Toutes les actions ci-dessus sans attribution site explicite |
| Plateforme | Tout |

**Règle Assignation** : Seul le côté client peut changer le prestataire assigné (`assigneEntrepriseId`). Un prestataire ne peut pas se désassigner lui-même.

#### Visibilité des Messages

| Visibilité | Client | Prestataire | Plateforme |
|-----------|--------|-------------|-----------|
| `public` | ✅ | ✅ | ✅ |
| `client_only` | ✅ | ❌ | ✅ |
| `prestataire_only` | ❌ | ✅ | ✅ |
| `fm4all_only` | ❌ | ❌ | ✅ |

---

### Module Prestations (ClientServices)

#### Modes de Pilotage

Le `modePilotage` détermine qui gère les occurrences :

| Mode | Client Actif | Prestataire Actif |
|------|-------------|------------------|
| `client` | ✅ canManage + canExecute | ❌ (lecture seule) |
| `prestataire` | ❌ (lecture seule) | ✅ canManage + canExecute |
| `collaboration` | ✅ | ✅ |

**Règle** : La posture inactive peut voir l'occurrence mais pas agir (canManage=false, canExecute=false).

#### Qui peut changer le modePilotage ?

- Plateforme : ✅ toujours
- Client Admin : ✅ toujours
- Responsable Site (non manager) : ✅
- Client Manager : ❌

#### Accès Prestataire à une Prestation

1. Son entreprise doit avoir une exécution (`client_service_executions`) sur cette prestation
2. Si non-admin : le site de la prestation doit être dans ses attributions

---

### Module Occurrences / Tâches

#### Matrice canManage / canExecute

| Posture/Rôle | modePilotage=client | modePilotage=prestataire | modePilotage=collaboration |
|-------------|--------------------|-----------------------|--------------------------|
| Client Admin | canManage ✅, canExecute ✅ | canManage ❌, canExecute ❌ | canManage ✅, canExecute ✅ |
| Client Responsable Site | canManage ✅, canExecute ✅ | canManage ❌, canExecute ❌ | canManage ✅, canExecute ✅ |
| Client Demandeur Site | canManage ❌, canExecute ✅ | canManage ❌, canExecute ❌ | canManage ❌, canExecute ✅ |
| Prest. Admin | canManage ❌, canExecute ❌ | canManage ✅, canExecute ✅ | canManage ✅, canExecute ✅ |
| Prest. Responsable | canManage ❌, canExecute ❌ | canManage ✅, canExecute ✅ | canManage ✅, canExecute ✅ |
| Prest. Intervenant | canManage ❌, canExecute ❌ | canManage ❌, canExecute ✅ | canManage ❌, canExecute ✅ |
| Plateforme | canManage ✅, canExecute ✅ | canManage ✅, canExecute ✅ | canManage ✅, canExecute ✅ |

#### Règles Tâches Spécifiques

- **Terminer** : `canExecute && (isAssignée || canManage)` — un exécutant ne peut terminer que sa propre tâche s'il n'est pas manager
- **Corriger temps passé** : `canManage && statut === "terminee"` uniquement
- **Tâches ad-hoc** : `canManage` uniquement (pas canExecute seul)
- **PJ Preuves** : `canExecute && tâche.statut === "en_cours"`, max 2 PJ par tâche

---

### Module Devis (BO)

#### Cycle de Vie

```
brouillon → emis → signé
                 → refusé
```

#### Acteurs

- **Émetteur** : l'entreprise prestataire qui crée le devis
- **Propriétaire** : l'entreprise cliente qui reçoit le devis
- **Plateforme** : lecture seule (audit)

#### Règles

- Un devis ne peut être créé que par un prestataire (posture prestataire requise)
- L'émetteur peut éditer/émettre tant que `statut = brouillon`
- Le propriétaire peut signer/refuser si `statut = emis`
- La plateforme ne peut qu'observer

---

### Module Checklists

#### Deux niveaux de templates

| Type | Propriétaire | Accès |
|------|-------------|-------|
| Pack système | `proprietaireEntrepriseId = NULL` | Tous les utilisateurs authentifiés |
| Pack entreprise | `proprietaireEntrepriseId = entrepriseId` | Admin/Manager de cette entreprise uniquement |

#### canManageChecklists vs canManage (occurrence)

- `canManageChecklists` : CRUD des packs/items (stratégique) → admin/manager entreprise
- `canManage` (occurrence) : assigner une checklist à une prestation (opérationnel) → responsable_site

---

### Module Entreprises (Plateforme)

Réservé à la posture **plateforme** uniquement.

#### Règles de Modification des Rôles/Services

Avant de retirer un rôle ou service à une entreprise, vérifier :
- **Rôle client** : l'entreprise n'a pas de `clientServices` actifs
- **Rôle prestataire** : l'entreprise n'a pas de `clientServiceExecutions` actives
- **Service** : aucune prestation active utilisant ce service

---

### Module Mes Prestataires

**Politique** : Lecture seule pour les clients.

Un client peut voir les informations de base de ses prestataires (nom, SIRET, contact) mais ne peut pas les modifier. Les données d'un prestataire sont partagées entre plusieurs clients — modifier depuis un client créerait des incohérences.

Pour modifier les données d'un prestataire : contacter FM4ALL (`contact@fm4all.com`).

---

### Module Mes Clients / Mes Sites Clients

Réservés à la posture **prestataire** uniquement.

Les sites clients affichés sont ceux des clients liés via `clientPrestataireRelations` (pas les propres sites du prestataire).

---

## Relations Clés

### `clientPrestataireRelations`

Lien entre un client et un prestataire. Requis pour :
- Qu'un prestataire voie les sites du client
- Qu'un prestataire crée des tickets chez un client
- Que le select "prestataire" dans les tickets ne montre que les prestataires liés

### `clientServiceExecutions`

Lien entre une prestation et un prestataire. Requis pour :
- Qu'un prestataire accède à une prestation
- Définit les tarifs appliqués (prix, unité, fréquence)

### `userClientSiteAttributions` / `userPrestataireSiteAttributions`

Attributions de site à un utilisateur. Non requises pour un admin (bypass).

### `documentsLinks` (polymorphique)

Lie un document à une entité. Principe : une seule FK non-null par ligne.
- PJ ticket : `ticketId` rempli, `ticketMessageId` NULL
- PJ message : `ticketMessageId` rempli, `ticketId` NULL

---

## Règles Financières

- Tous les montants en **centimes** en base (×100)
- `modeCommercial: "direct" | "intermediaire_fm4all"` sur chaque `clientService`
- `clientServicePrixAppliques` : table anti-double-facturation

---

## Terminologie Imposée

| Terme utilisé | Terme interdit |
|--------------|----------------|
| **prestataire** | ~~fournisseur~~ |
| **posture** | ~~rôle actif~~ |
| **adhésion** | ~~appartenance~~ |
| `en_attente_prestataire` | ~~en_attente_fournisseur~~ |

---

## Fonctions Utilitaires Clés

| Fonction | Fichier | Usage |
|----------|---------|-------|
| `hasAccessToEntreprise(userId, entrepriseId)` | `userAdhesions.query.ts` | Check accès posture-aware dans server actions |
| `getEffectivePlateformeRole(userId)` | `permissions.utils.ts` | Bypass plateforme posture-aware (vérifie cookie) |
| `getUserPlateformeAdhesion(userId)` | `userPlateformeAdhesions.query.ts` | Guard page.tsx plateforme (vérifie DB uniquement) |
| `resolvePostureAwareSiteRole({userId, siteId, entrepriseId})` | `permissions.utils.ts` | Rôle site selon posture active |
| `canUserAccessTicket({userId, ticketId, entrepriseId})` | `ticketsPerimetre.utils.ts` | Accès ticket + périmètre site |
| `getMesClients(prestataireEntrepriseId)` | `clientServiceExecutions.query.ts` | Clients du prestataire |
| `getAllPrestataireSiteIds({userId})` | `userPrestataireSiteAttributions.query.ts` | Tous les sites attribués cross-clients |
| `canManageSiteAsProxy(userId, entrepriseId)` | `sitesActions.ts` | Proxy prestataire sur sites client |
