# Audit Permissions — FM4ALL

> Dernière mise à jour : 2026-03-08 (session 2)
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

### 🔴 BUG-06 — Fonctions de permission : prestataire admin bloqué sur l'édition

**Fichier** : `src/server/utils/ticketsPermissions.utils.ts`

**Problème** : Les fonctions `canUserEditTicketBasicFields`, `canUserEditStatut`, etc. utilisent `resolvePostureAwareSiteRole` pour obtenir le rôle effectif. Pour un **prestataire admin** sans attribution de site explicite chez le client, ce rôle est `null` → toutes les permissions d'édition retournent `false`.

Pourtant, l'admin prestataire peut VOIR tous les tickets de son entreprise (BUG-04/05 corrigés).

**Conséquence** : Un prestataire admin peut voir les tickets assignés à son entreprise mais ne peut ni modifier le statut, ni éditer le titre/description.

**Fix attendu** : Ajouter un court-circuit sur le rôle entreprise pour prestataire admin :
```typescript
// Dans canUserEditTicketBasicFields, canUserEditStatut, etc.
const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst({
  where: and(eq(userId), eq(entrepriseId), eq(statut, "actif")),
  columns: { role: true },
});
if (prestataireAdhesion?.role === "admin" && isInvolved) return true;
// Sinon, résoudre via le rôle site...
```

---

### 🟠 BUG-07 — `getEntreprisesPrestatairesAction` : retourne TOUS les prestataires

**Fichier** : `src/server/actions/entreprisesActions.ts`

**Problème** : L'action ne vérifie que l'authentification. Elle retourne tous les prestataires de la plateforme à n'importe quel utilisateur connecté.

**Impact** : Un client voit des prestataires qui ne sont pas les siens dans le filtre "Assigné à" des tickets.

**Fix attendu** : Scoper selon la posture :
- Plateforme → tous les prestataires
- Client → ses prestataires (`getClientPrestataires(clientEntrepriseId)`)
- Prestataire → lui-même uniquement

---

### 🟠 BUG-09 — Périmètre occurrences : prestataire voit toutes les occurrences d'une prestation

**Fichier** : `src/server/actions/clientServiceOccurrencesActions.ts`

**Problème** : `getOccurrencesByPrestationAction` gate via `prestataireHasExecutionOnPrestation`. Un prestataire avec une exécution sur une prestation peut voir TOUTES les occurrences, même sur des sites non attribués.

**Fix attendu** : Filtrer les occurrences par sites attribués (`getAllPrestataireSiteIds`) pour les prestataires non-admin.

---

### 🟠 BUG-10 — `getUsers` en posture prestataire : filtre `statut: "actif"` manquant

**Fichier** : `src/server/queries/users.query.ts`

**Problème** : La branche prestataire ne filtre pas sur `statut: "actif"` des adhésions prestataires → des utilisateurs inactifs apparaissent.

**Fix** : Ajouter `eq(userPrestataireAdhesions.statut, "actif")` dans la branche prestataire.

---

### 🟡 BUG-11 — `getAvailableStatutsForUser` : prestataire non-admin ne peut jamais changer le statut

**Fichier** : `src/server/utils/ticketsPermissions.utils.ts`

**Contexte** : `getAvailableStatutsForUser` retourne `[]` si le rôle site < 3. Pour un prestataire non-admin avec rôle `responsable_site` sur un site client, la fonction devrait retourner les statuts disponibles.

**À vérifier** : Que `resolvePostureAwareSiteRole` retourne bien `"responsable_site"` pour un prestataire attributé à ce site chez ce client.

---

### 🟡 BUG-12 — UX : select "Sites" vide pour prestataire sans filtre client

**Fichier** : `src/app/.../app/tickets/TicketsFiltersDialog.tsx`

**Contexte** : Le select Sites est vide jusqu'à ce que le prestataire choisisse un client. Comportement fonctionnellement correct.

**Amélioration** : Afficher "Sélectionnez d'abord un client pour voir ses sites" quand prestataire et aucun client sélectionné.

---

### 🟡 BUG-13 — `insertTicketAction` : un prestataire peut-il créer un ticket ?

**Fichier** : `src/server/actions/ticketsActions.ts`

**Contexte** : Le bouton "Nouveau ticket" est masqué côté frontend pour un prestataire. Mais `canUserCreateTicket` côté serveur autorise un prestataire s'il a une relation client-prestataire ET un rôle ≥ demandeur_site.

**Question métier** : Un prestataire doit-il pouvoir créer des tickets ? À valider.

---

### 🟡 BUG-14 — `getUsersAction` en posture plateforme : retourne seulement les users FM4ALL

**Fichier** : `src/server/queries/users.query.ts`

**Contexte** : En posture plateforme, `getUsers` retourne uniquement les users ayant `userPlateformeAdhesions` (l'équipe FM4ALL). La plateforme peut-elle voir les users de n'importe quelle entreprise ?

**Question métier** : À valider.

---

## RÉCAPITULATIF PRIORITÉS

| Bug | Sévérité | Module | Statut |
|-----|----------|--------|--------|
| BUG-01 | Critique | Tickets/Sites | ✅ Corrigé |
| BUG-02 | Critique | Tickets filtres | ✅ Corrigé |
| BUG-03 + 04 + 05 | Critique | Tickets périmètre + détail | ✅ Corrigé |
| BUG-06 | Critique | Tickets permissions édition | 🔴 À corriger |
| BUG-07 | Moyen | Entreprises | 🟠 À corriger |
| BUG-09 | Moyen | Occurrences | 🟠 À corriger |
| BUG-10 | Moyen | Utilisateurs | 🟠 À corriger |
| BUG-11 | Moyen | Tickets permissions | 🟡 À valider |
| BUG-12 | Faible | Tickets UX | 🟡 Amélioration |
| BUG-13 | Faible | Tickets création | 🟡 À valider |
| BUG-14 | Faible | Utilisateurs plateforme | 🟡 À valider |
