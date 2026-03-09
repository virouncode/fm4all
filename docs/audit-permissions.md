# Audit Permissions — FM4ALL

> Dernière mise à jour : 2026-03-08 (session 5)
> Branch : new-bo
> Scope : `src/app/[locale]/(main)/(application)/(portail)/app` + imports

---

## Légende

- ✅ Corrigé
- 🔴 Bug critique non corrigé
- 🟠 Bug moyen non corrigé
- 🟡 Comportement à valider / question métier

---

## BUGS CORRIGÉS

### ✅ BUG-01 — `getAccessibleSitesAction` : erreur forbidden en posture prestataire

**Fichier** : `src/server/actions/sitesActions.ts`

**Problème** : L'action ne vérifiait que `userClientAdhesions`. Un prestataire obtenait systématiquement "Vous n'avez pas accès à cette entreprise." en ouvrant `/app/tickets`.

**Fix** : Ajout d'une branche prestataire :
- `entrepriseId` = propre entreprise du prestataire → retourne `[]`
- `entrepriseId` = client lié (via `clientPrestataireRelations`) → retourne les sites du client

---

### ✅ BUG-02 — `getEntreprisesClientesAction` : interdit aux prestataires

**Fichier** : `src/server/actions/entreprisesActions.ts`

**Problème** : L'action était réservée à la plateforme uniquement. Le select "Client" dans le filtre des tickets était toujours vide pour un prestataire.

**Fix** : Ajout branche prestataire → `getMesClients(prestataireEntrepriseId)` (réutilise la logique existante de `/app/mes-clients`).

---

### ✅ BUG-03 + BUG-04 + BUG-05 — Périmètre tickets prestataire : règles de visibilité

**Fichiers** :
- `src/server/queries/tickets.query.ts`
- `src/server/utils/ticketsPerimetre.utils.ts`
- `src/app/[locale]/(main)/(application)/(portail)/app/tickets/[ticketId]/page.tsx`

**Règles métier (clarifiées 2026-03-08)** :
- **Admin prestataire** → voit TOUS les tickets où `assigneEntrepriseId === prestataireId`
- **Autres rôles prestataire** (responsable_site, demandeur_site, observateur_site, intervenant_site) → tickets où `assigneEntrepriseId === prestataireId` ET site dans leurs attributions
- **BUG-05** : Cohérence liste/détail → si le ticket est visible en liste, il est accessible en détail (même règle)

**Fix (session 1 → mauvais fix corrigé en session 2)** :
- Session 1 : périmètre incorrectement fixé à `proprietaireEntrepriseId IN clients` (le prestataire voyait les tickets de ses clients même non assignés)
- Session 2 : corrigé → `assigneEntrepriseId === prestataireId`

**Détail du fix dans `getTicketsByPerimetre`** :
```typescript
// Récupère le rôle entreprise du prestataire
const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst({
  where: and(eq(...userId), eq(...entrepriseId), eq(...statut, "actif")),
});

if (prestataireAdhesion.role === "admin") {
  // Admin: tous les tickets assignés à l'entreprise
  conditions.push(eq(tickets.assigneEntrepriseId, entrepriseId));
} else {
  // Non-admin: tickets assignés ET sur sites attribués
  accessibleSiteIds = await getAllPrestataireSiteIds({ userId }); // cross-clients
  conditions.push(eq(tickets.assigneEntrepriseId, entrepriseId));
  conditions.push(inArray(tickets.siteId, accessibleSiteIds));
}
```

**Détail du fix dans `canUserAccessTicket`** :
```typescript
if (posture === "prestataire") {
  if (ticket.assigneEntrepriseId !== entrepriseId) return false;
  if (prestataireAdhesion.role === "admin") return true;
  const siteIds = await getAllPrestataireSiteIds({ userId });
  return siteIds.includes(ticket.siteId);
}
```

---

## BUGS NON CORRIGÉS

### ✅ BUG-06 — Fonctions de permission : prestataire admin bloqué sur l'édition

**Fichiers** :
- `src/server/utils/ticketsPermissions.utils.ts`
- `src/server/utils/ticketsTransitions.utils.ts`

**Problème** : Les fonctions `canUserEditTicketBasicFields`, `canUserEditStatut`, etc. utilisaient `resolvePostureAwareSiteRole` pour obtenir le rôle effectif. Pour un **prestataire admin** sans attribution de site explicite chez le client, ce rôle était `null` → toutes les permissions d'édition retournaient `false`.

**Règle métier clarifiée** : L'admin entreprise n'est **pas** équivalent à `responsable_site` — il est **au-dessus** : accès à tous les sites sans attribution explicite. Le manager n'a aucun traitement spécial ; les utilisateurs non-admin tombent dans les rôles de site (`responsable_site`, `demandeur_site`, `observateur_site`, `intervenant_site`).

**Fix** :

Ajout d'un helper privé `isTicketsEnterpriseAdmin` dans `ticketsPermissions.utils.ts` (pattern identique à `canManageOccurrence`) :

```typescript
async function isTicketsEnterpriseAdmin(userId: string, entrepriseId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;
  if (posture === "prestataire") {
    const adhesion = await getUserPrestataireAdhesion({ userId });
    return adhesion?.role === "admin";
  }
  const adhesion = await getUserClientAdhesion({ userId, entrepriseId });
  return adhesion?.role === "admin";
}
```

Toutes les fonctions (`canUserEditTicketBasicFields`, `canUserEditStatut`, `canUserAssignTicket`, `canUserEditAssignedEntreprise`, `canUserEditPriorite`, `canUserCreateTicket`, `getAvailableStatutsForUser`) suivent désormais le pattern :
1. Résoudre le rôle site via `resolvePostureAwareSiteRole`
2. Si le niveau est suffisant → `return true`
3. Sinon → `return isTicketsEnterpriseAdmin(userId, entrepriseId)` (fallback admin bypass)

Dans `ticketsTransitions.utils.ts`, `isResponsable` inclut désormais l'admin entreprise :
```typescript
const isResponsable = effectiveRoleStr === "responsable_site" || isEnterpriseAdmin;
```

---

### ✅ BUG-07 — `getEntreprisesPrestatairesAction` : retourne TOUS les prestataires

**Fichier** : `src/server/actions/entreprisesActions.ts`

**Problème** : L'action ne vérifiait que l'authentification. Elle retournait tous les prestataires de la plateforme à n'importe quel utilisateur connecté.

**Impact** : Un client voyait des prestataires qui ne sont pas les siens dans le filtre "Assigné à" des tickets.

**Fix** : Scopé selon la posture (lecture du cookie `fm4all:postureActive`) :
- **Plateforme** → `getEntreprisesPrestataires()` (tous)
- **Prestataire** → `getUserPrestataireAdhesion({ userId })` puis lookup nom → tableau à 1 élément (lui-même)
- **Client** (défaut) → `userClientAdhesions` (unique par userId) → `getClientPrestataires(entrepriseId)` (ses prestataires actifs via executions)

---

### ✅ BUG-09 — Périmètre occurrences : prestataire voit toutes les occurrences d'une prestation

**Fichiers** :
- `src/app/.../prestations/[prestationId]/page.tsx`
- `src/app/.../prestations/[prestationId]/occurrences/[occurrenceId]/page.tsx`

**Problème** : `prestataireHasExecutionOnPrestation` ne vérifiait que l'entreprise (company-level). Un prestataire non-admin pouvait accéder via URL directe à une prestation dont son entreprise a une exécution, même si le site n'est pas dans ses attributions.

**Note** : Le flux UX normal (liste → détail) était déjà protégé (`attributedSiteIds` dans `getPrestationsByPrestataire`). C'est le bypass par URL directe qui était le vrai risque.

**Fix** : Après `prestataireHasExecutionOnPrestation`, si non-admin, vérification du site via `getAllPrestataireSiteIds({ userId })` dans les deux pages :
```typescript
if (pAdhesion.role !== "admin") {
  const attributedSiteIds = await getAllPrestataireSiteIds({ userId: currentUser.id });
  if (!attributedSiteIds.includes(prestation.siteId)) notFound();
}
```

---

### ✅ BUG-10 — `getUsers` en posture prestataire : filtre `statut: "actif"` manquant

**Fichier** : `src/server/queries/users.query.ts`

**Verdict** : Pas un bug. Les branches prestataire et client sont identiques — pas de filtre `statut` par défaut, filtrable via `statutAdhesion`. `/app/utilisateurs` est une page de gestion : montrer tous les utilisateurs (actifs et inactifs) par défaut est intentionnel.

---

### ✅ BUG-11 — Machine d'état : annulation depuis états avancés + prestataire responsable_site

**Fichiers** :
- `src/server/utils/ticketsTransitions.utils.ts`
- `src/server/utils/ticketsPermissions.utils.ts`

**Verdict getAvailableStatutsForUser** : Pas un bug (résolu par BUG-06). `resolvePostureAwareSiteRole` → `getUserPrestataireSiteRole` retourne bien `"responsable_site"` pour un prestataire attributé → level 3 → statuts disponibles.

**Écart machine d'état corrigé** : Le brainstorming limite l'annulation à `nouveau` et `pris_en_charge` uniquement. Le code autorisait aussi `annule` depuis `en_attente_prestataire`, `en_attente_client` et `a_valider`. Ces transitions ont été supprimées pour s'aligner avec la spec.

---

### ✅ BUG-12 — UX : select "Sites" vide pour prestataire sans filtre client

**Fichier** : `src/app/.../app/tickets/TicketsFiltersDialog.tsx`

**Fix** : Select "Site" disabled + placeholder "Sélectionnez d'abord un client" quand `postureActive === "prestataire"` et aucun client sélectionné.

---

### ✅ BUG-13 — `insertTicketAction` : un prestataire peut-il créer un ticket ?

**Fichier** : `src/app/.../app/tickets/TicketsTable.tsx`

**Verdict** : Oui — le brainstorming le confirme (admin, responsable_site, demandeur_site en posture prestataire).

**Fix** : Suppression de la condition `posture !== "prestataire"` qui masquait le bouton. Le `TicketFormDialog` gérait déjà la posture prestataire (select client, sites filtrés, `proprietaireEntrepriseId = client`, `demandeurEntrepriseId = prestataire`). La permission serveur `canUserCreateTicket` rejette observateur/intervenant.

---

### ✅ BUG-14 — `getUsersAction` en posture plateforme : retourne seulement les users FM4ALL

**Fichiers** : `src/server/actions/usersActions.ts`, `src/app/.../app/utilisateurs/UsersClient.tsx`

**Contexte** : En posture plateforme, `getUsers` retournait uniquement les users ayant `userPlateformeAdhesions` (l'équipe FM4ALL). La branche "client" de `getUsersAction` n'avait pas de fallback plateforme, empêchant un admin plateforme de voir les users des entreprises clientes/prestataires.

**Fix** :
1. **`usersActions.ts`** — Ajout du fallback `getEffectivePlateformeRole` dans la branche client (cohérent avec la branche prestataire qui l'avait déjà).
2. **`UsersClient.tsx`** — Ajout d'un sélecteur "Type" (Plateforme / Client / Prestataire) + sélecteur "Entreprise" affiché uniquement en posture plateforme. Par défaut : Type=Plateforme (→ userPlateformeAdhesions de FM4ALL). En sélectionnant Client ou Prestataire, la liste des entreprises se charge dynamiquement et les users correspondants s'affichent.

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
| BUG-11 | Moyen | Tickets permissions | ✅ Corrigé |
| BUG-12 | Faible | Tickets UX | ✅ Corrigé |
| BUG-13 | Faible | Tickets création | ✅ Corrigé |
| BUG-14 | Faible | Utilisateurs plateforme | ✅ Corrigé |
