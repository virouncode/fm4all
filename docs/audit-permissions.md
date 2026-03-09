# Audit Permissions — FM4ALL

> Dernière mise à jour : 2026-03-09 (session 6 — audit complet)
> Branch : new-bo
> Scope : `src/app/[locale]/(main)/(application)/(portail)/app` + `auth`

---

## Architecture de Protection Globale

### Layout-level Auth Guard (CRITIQUE)

**Fichier** : `src/app/[locale]/(main)/(application)/(portail)/app/layout.tsx`

Le layout protège **toutes** les pages `/app/` :
1. `getSession()` → redirect `/auth/login` si pas de session
2. `bootstrapUser(userId, postureActive)` → redirect `/auth/unauthorized` si bootstrap échoue

Les pages sans `getSession()` individuel sont **quand même protégées** par ce guard global. Elles scopent leurs données via les server actions.

---

## Tableau Complet des Permissions par Module

### Pages `/app/`

| Page | Route | Guard Individuel | Postures Autorisées | Scoping Données | Statut |
|------|-------|-----------------|---------------------|-----------------|--------|
| Dashboard | `/app/` | Layout uniquement | Toutes | N/A (placeholder) | ✅ OK |
| Checklists | `/app/checklists` | Layout uniquement | Toutes | Via server actions | ✅ OK |
| Contrats | `/app/contrats` | Layout uniquement | Toutes | N/A (placeholder) | ⚠️ Placeholder |
| Devis (liste) | `/app/devis` | Layout uniquement | Toutes | Via DevisTable + actions | ✅ OK |
| Devis nouveau | `/app/devis/nouveau` | ✅ Prestataire (cookie + DB) | Prestataire | Cookie posture + adhésion prestataire | ✅ OK |
| Devis détail | `/app/devis/[id]` | ✅ Multi-rôle (posture-aware) | Plateforme/Émetteur/Propriétaire | `getEffectivePlateformeRole` + hasAccessToEntreprise | ✅ OK |
| Documents | `/app/documents` | Layout uniquement | Toutes | N/A (placeholder) | ⚠️ Placeholder |
| Entreprises | `/app/entreprises` | ✅ Plateforme (DB-only) | Plateforme | `getUserPlateformeAdhesion` | ✅ OK |
| Entreprise détail | `/app/entreprises/[id]` | ✅ Plateforme (DB-only) | Plateforme | `getUserPlateformeAdhesion` | ✅ OK |
| Facturation | `/app/facturation` | Layout uniquement | Toutes | N/A (placeholder) | ⚠️ Placeholder |
| Mes Clients | `/app/mes-clients` | ✅ Prestataire actif | Prestataire | `userPrestataireAdhesions.statut=actif` | ✅ OK |
| Mes Prestataires | `/app/mes-prestataires` | ✅ Client actif | Client | `userClientAdhesions.statut=actif` | ✅ OK |
| Mes Sites Clients | `/app/mes-sites-clients` | ✅ Prestataire actif | Prestataire | `userPrestataireAdhesions.statut=actif` | ✅ OK |
| Mon Entreprise | `/app/mon-entreprise` | Layout uniquement | Toutes | Entreprise du bootstrap | ✅ OK |
| Paramètres | `/app/parametres` | Layout uniquement | Toutes | N/A (placeholder) | ⚠️ Placeholder |
| Prestations | `/app/prestations` | Layout uniquement | Toutes | Via PrestationsClient + actions | ✅ OK |
| Prestation détail | `/app/prestations/[id]` | ✅ Posture-aware complet | Toutes (scoped) | `getEffectivePlateformeRole` + adhésions | ✅ OK |
| Occurrence détail | `/app/prestations/[id]/occurrences/[id]` | ✅ Posture-aware complet | Toutes (scoped) | `getEffectivePlateformeRole` + modePilotage | ✅ Excellent |
| Services | `/app/services` | ✅ Plateforme (DB-only) | Plateforme | `getUserPlateformeAdhesion` | ✅ OK |
| Sites Clients | `/app/sites-clients` | ✅ Plateforme (DB-only) | Plateforme | `getUserPlateformeAdhesion` | ✅ OK |
| Sites | `/app/sites` | Layout uniquement | Toutes | Via SitesClient + actions | ✅ OK |
| Tickets | `/app/tickets` | Layout uniquement | Toutes | Via TicketsTable + actions | ✅ OK |
| Ticket détail | `/app/tickets/[id]` | ✅ Posture-aware complet | Toutes (scoped) | Cookie posture + adhésions | ✅ Excellent |
| Utilisateurs | `/app/utilisateurs` | Layout uniquement | Toutes | Via UsersClient + actions | ✅ OK |

### Pages `/auth/`

| Page | Route | Protection | Description |
|------|-------|-----------|-------------|
| Login | `/auth/login` | Publique | Formulaire connexion |
| Mot de passe oublié | `/auth/forgot-password` | Publique | Demande reset |
| Reset password | `/auth/reset-password` | Token URL validé | Reset/activation mot de passe |
| Inscription admin | `/auth/inscription-admin` | Token invitation validé (acceptedAt=NULL, expiresAt futur) | Création compte via invitation |
| Redirect | `/auth/redirect` | Session requise | Handler post-login |
| Email OK | `/auth/email-ok` | Publique | Confirmation email |
| Unauthorized | `/auth/unauthorized` | Publique | Page d'erreur accès refusé |

---

## Matrice de Permissions par Action

### Module Tickets

| Action | Plateforme | Client Admin | Client Responsable | Client Demandeur | Client Observateur | Prest. Admin | Prest. Responsable | Prest. Intervenant |
|--------|-----------|-------------|-------------------|------------------|--------------------|-------------|-------------------|-------------------|
| Voir liste | ✅ | ✅ (ses sites) | ✅ (ses sites) | ✅ (ses sites) | ✅ (ses sites) | ✅ (assigné) | ✅ (assigné + ses sites) | ❌ |
| Voir détail | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Créer | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Éditer titre/desc | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Éditer type/priorité | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Assigner prestataire | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assigner utilisateur | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Changer statut | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Message public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Message client_only | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Message prestataire_only | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

### Module Occurrences / Tâches

*Conditionné par le `modePilotage` de l'occurrence : client/prestataire/collaboration*

| Action | Plateforme | Client Admin* | Prest. Admin* | Responsable Site* | Demandeur (client)* | Intervenant (prest.)* |
|--------|-----------|--------------|--------------|------------------|--------------------|-----------------------|
| Voir | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Créer/modifier tâche ad-hoc | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Démarrer tâche | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Terminer tâche | ✅ | ✅ | ✅ | ✅ | si assignée | si assignée |
| Non applicable / Non honorée | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Annuler tâche | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Corriger temps passé | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ajouter PJ preuve | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assigner intervenant | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |

### Module Devis

| Action | Plateforme | Émetteur (prestataire) | Propriétaire (client) | Autres |
|--------|-----------|----------------------|----------------------|--------|
| Voir liste | ✅ | ✅ (ses devis) | ✅ (reçus) | ❌ |
| Voir détail | ✅ (read-only) | ✅ | ✅ | ❌ |
| Créer | ❌ | ✅ | ❌ | ❌ |
| Éditer (brouillon) | ❌ | ✅ | ❌ | ❌ |
| Émettre | ❌ | ✅ si brouillon | ❌ | ❌ |
| Signer | ❌ | ❌ | ✅ si emis | ❌ |
| Refuser | ❌ | ❌ | ✅ si emis | ❌ |

### Module Sites

| Action | Plateforme | Client Admin/Manager | Client Responsable Site | Prest. Proxy (si client sans admin actif) |
|--------|-----------|---------------------|------------------------|-----------------------------------------|
| Voir ses sites | ✅ (tous) | ✅ | ✅ (attribués) | ✅ (ses clients) |
| Créer site | ✅ | ✅ | ❌ | ✅ |
| Modifier site | ✅ | ✅ | ❌ | ✅ |
| Archiver site | ✅ | ✅ | ❌ | ✅ |

### Module Utilisateurs

| Action | Plateforme | Client Admin | Client Manager | Prest. Admin | Prest. Manager |
|--------|-----------|-------------|----------------|-------------|----------------|
| Voir liste | ✅ (posture-aware) | ✅ (son entreprise) | ✅ | ✅ (son entreprise) | ✅ |
| Inviter | ✅ | ✅ | ❌ | ✅ | ❌ |
| Rattacher existant | ✅ | ✅ | ❌ | ✅ | ❌ |
| Modifier rôle | ✅ | ✅ | ❌ | ✅ | ❌ |
| Désactiver | ✅ | ✅ | ❌ | ✅ | ❌ |

---

## Légende

- ✅ Corrigé / OK
- 🔴 Bug critique non corrigé
- 🟠 Bug moyen non corrigé
- 🟡 Bug mineur / comportement à valider
- ⚠️ Placeholder (module non implémenté)

---

## BUGS CORRIGÉS (Sessions Précédentes)

### ✅ BUG-01 — `getAccessibleSitesAction` : erreur forbidden en posture prestataire

**Fichier** : `src/server/actions/sitesActions.ts`

**Fix** : Branche prestataire ajoutée — own ID → `[]`, client lié → sites du client.

---

### ✅ BUG-02 — `getEntreprisesClientesAction` : interdit aux prestataires

**Fichier** : `src/server/actions/entreprisesActions.ts`

**Fix** : Branche prestataire → `getMesClients(prestataireEntrepriseId)`.

---

### ✅ BUG-03 + BUG-04 + BUG-05 — Périmètre tickets prestataire

**Fichiers** : `tickets.query.ts`, `ticketsPerimetre.utils.ts`, `tickets/[id]/page.tsx`

**Règles** :
- Admin → tous les tickets assignés à son entreprise
- Non-admin → tickets assignés + site dans ses attributions

**Fix (corrigé 2 fois — session 1 incorrecte, session 2 correcte)** :
```typescript
// getTicketsByPerimetre
if (prestataireAdhesion.role === "admin") {
  conditions.push(eq(tickets.assigneEntrepriseId, entrepriseId));
} else {
  accessibleSiteIds = await getAllPrestataireSiteIds({ userId });
  conditions.push(eq(tickets.assigneEntrepriseId, entrepriseId));
  conditions.push(inArray(tickets.siteId, accessibleSiteIds));
}
// canUserAccessTicket
if (ticket.assigneEntrepriseId !== entrepriseId) return false;
if (prestataireAdhesion.role === "admin") return true;
return (await getAllPrestataireSiteIds({ userId })).includes(ticket.siteId);
```

---

### ✅ BUG-06 — `ticketsPermissions.utils.ts` : prestataire admin bloqué à l'édition

**Problème** : Admin sans attribution site → `resolvePostureAwareSiteRole` → `null` → toutes permissions `false`.

**Fix** : Helper `isTicketsEnterpriseAdmin` + fallback dans toutes les fonctions de permission.

---

### ✅ BUG-07 — `getEntreprisesPrestatairesAction` : retournait tous les prestataires

**Fix** : Scopé par posture — plateforme → tous, prestataire → lui-même, client → ses prestataires.

---

### ✅ BUG-09 — Occurrence : non-admin prestataire contourne via URL directe

**Fix** : Après `prestataireHasExecutionOnPrestation`, si non-admin → vérification `getAllPrestataireSiteIds`.

---

### ✅ BUG-10 — `getUsers` : filtre statut actif

**Verdict** : Pas un bug. Affichage actifs + inactifs intentionnel pour page de gestion.

---

### ✅ BUG-11 — Machine d'état tickets : annulation depuis états avancés

**Fix** : Annulation limitée à `nouveau` et `pris_en_charge` uniquement (aligné spec).

---

### ✅ BUG-12 — UX : select "Sites" vide pour prestataire sans filtre client

**Fix** : Select disabled + placeholder "Sélectionnez d'abord un client".

---

### ✅ BUG-13 — `insertTicketAction` : prestataire ne pouvait pas créer de ticket

**Fix** : Suppression condition bloquante côté UI. `canUserCreateTicket` gère correctement les cas.

---

### ✅ BUG-14 — `getUsersAction` en posture plateforme : retournait seulement l'équipe FM4ALL

**Fix** : Fallback `getEffectivePlateformeRole` + sélecteur Type/Entreprise dans `UsersClient.tsx`.

---

## BUGS CORRIGÉS (Session 2026-03-09)

### ✅ BUG-15 — `devis/[devisId]/page.tsx` : bypass plateforme non posture-aware

**Fichier** : `src/app/[locale]/(main)/(application)/(portail)/app/devis/[devisId]/page.tsx`

**Problème** : Utilisait `getUserPlateformeAdhesion` (DB-only) au lieu de `getEffectivePlateformeRole` (DB + cookie).

**Impact** : Un FM4ALL en posture "client" était traité comme plateforme (`isReadOnly: true`), perdant ses permissions d'émetteur ou propriétaire.

**Fix** : Remplacement de `getUserPlateformeAdhesion` par `getEffectivePlateformeRole`. Import mis à jour.

---

### ✅ BUG-16 — `prestations/[prestationId]/page.tsx` : `canManage` toujours `false` pour client admin sans attribution site

**Fichier** : `src/app/[locale]/(main)/(application)/(portail)/app/prestations/[prestationId]/page.tsx`

**Problème** : `canManage` ne tenait pas compte du rôle `admin` — seul `responsable_site` via `resolvePostureAwareSiteRole` le déclenchait. Un client admin sans attribution site explicite obtenait `canManage = false` malgré `canChangeModePilotage = true`.

**Fix** : Admin bypass ajouté — cohérent avec `occurrences/[id]/page.tsx` :
```typescript
if (clientAdhesion?.role === "admin") {
  canManage = true;
} else {
  const siteRole = await resolvePostureAwareSiteRole({...});
  canManage = siteRole === "responsable_site";
}
```

---

### ✅ BUG-17 — `devis/nouveau/page.tsx` : guard ne vérifiait pas la posture active

**Fichier** : `src/app/[locale]/(main)/(application)/(portail)/app/devis/nouveau/page.tsx`

**Problème** : `getUserPrestataireAdhesion` vérifiait uniquement l'adhésion DB. Un FM4ALL avec les deux rôles (plateforme + prestataire) pouvait accéder en toute posture.

**Fix** : Vérification du cookie posture ajoutée avant le check DB — redirect si `posture !== "prestataire"`.

---

## RÉCAPITULATIF PRIORITÉS

| Bug | Sévérité | Module | Statut |
|-----|----------|--------|--------|
| BUG-01 | Critique | Tickets/Sites | ✅ Corrigé |
| BUG-02 | Critique | Tickets filtres | ✅ Corrigé |
| BUG-03 + 04 + 05 | Critique | Tickets périmètre + détail | ✅ Corrigé |
| BUG-06 | Critique | Tickets permissions édition | ✅ Corrigé |
| BUG-07 | Moyen | Entreprises | ✅ Corrigé |
| BUG-09 | Moyen | Occurrences | ✅ Corrigé |
| BUG-10 | Moyen | Utilisateurs | ✅ Pas un bug |
| BUG-11 | Moyen | Tickets machine d'état | ✅ Corrigé |
| BUG-12 | Faible | Tickets UX | ✅ Corrigé |
| BUG-13 | Faible | Tickets création | ✅ Corrigé |
| BUG-14 | Faible | Utilisateurs plateforme | ✅ Corrigé |
| BUG-15 | Moyen | Devis détail | ✅ Corrigé |
| BUG-16 | Moyen | Prestation détail | ✅ Corrigé |
| BUG-17 | Faible | Devis nouveau | ✅ Corrigé |

---

## Analyse par Couche

### Layout (protection globale)

`app/layout.tsx` — Protège TOUT `/app/` :
- Session → `/auth/login`
- Bootstrap → `/auth/unauthorized`

### Pages (protection spécifique)

Avec guard individuel (en plus du layout) :
- `/app/devis/nouveau` — cookie posture + adhésion prestataire ✅
- `/app/devis/[id]` — posture-aware complet ✅
- `/app/entreprises` — plateforme DB-only ✅
- `/app/entreprises/[id]` — plateforme DB-only ✅
- `/app/mes-clients` — prestataire actif ✅
- `/app/mes-prestataires` — client actif ✅
- `/app/mes-sites-clients` — prestataire actif ✅
- `/app/prestations/[id]` — posture-aware complet ✅
- `/app/prestations/[id]/occurrences/[id]` — posture-aware complet ✅
- `/app/services` — plateforme DB-only ✅
- `/app/sites-clients` — plateforme DB-only ✅
- `/app/tickets/[id]` — posture-aware complet ✅

Sans guard individuel (layout suffit) :
- Dashboard, Checklists, Sites, Tickets, Prestations, Utilisateurs, Mon Entreprise
- Données scopées via server actions

### Server Actions (protection données)

Pattern standard :
1. `hasAccessToEntreprise(userId, entrepriseId)` — posture-aware
2. `getEffectivePlateformeRole(userId)` — pour bypasses plateforme
3. Calcul permissions selon rôle entreprise + rôle site
