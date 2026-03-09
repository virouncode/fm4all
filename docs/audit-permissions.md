# Audit Permissions — FM4ALL

> Date : 2026-03-08
> Branch : new-bo
> Scope : `src/app/[locale]/(main)/(application)/(portail)/app` + imports

---

## Légende

- ✅ Corrigé cette session
- 🔴 Bug critique non corrigé
- 🟠 Bug moyen non corrigé
- 🟡 Comportement discutable / à valider

---

## BUGS CORRIGÉS CETTE SESSION (2026-03-08)

### ✅ BUG-01 — `getAccessibleSitesAction` : erreur forbidden en posture prestataire

**Fichier** : `src/server/actions/sitesActions.ts`

**Problème** : L'action ne vérifiait que `userClientAdhesions`. Un prestataire obtenait systématiquement "Vous n'avez pas accès à cette entreprise." en ouvrant `/app/tickets`.

**Fix** : Ajout d'une branche prestataire :
- `entrepriseId` = propre entreprise du prestataire → retourne `[]`
- `entrepriseId` = client lié (via `clientPrestataireRelations`) → retourne les sites du client

---

### ✅ BUG-02 — `getEntreprisesClientesAction` : interdit aux prestataires

**Fichier** : `src/server/actions/entreprisesActions.ts`

**Problème** : L'action était réservée à la plateforme uniquement. Résultat : le select "Client" dans le filtre des tickets était toujours vide pour un prestataire.

**Fix** : Ajout branche prestataire → `getMesClients(prestataireEntrepriseId)` (réutilise la logique existante de `/app/mes-clients`).

---

### ✅ BUG-03 — `getTicketsByPerimetre` : périmètre prestataire trop restrictif

**Fichier** : `src/server/queries/tickets.query.ts`

**Problème** : Le périmètre prestataire filtrait par `assigneEntrepriseId = prestataire.id`, donc un prestataire ne voyait QUE les tickets explicitement assignés à son entreprise. Or un prestataire doit voir tous les tickets de ses clients (même non assignés).

**Fix** : Périmètre prestataire → `proprietaireEntrepriseId IN (clientIds via clientPrestataireRelations)`.

---

## BUGS NON CORRIGÉS

### 🔴 BUG-04 — `canUserAccessTicket` : incohérent avec le nouveau périmètre prestataire

**Fichier** : `src/server/utils/ticketsPerimetre.utils.ts` (ligne 101-108)

**Problème** : `canUserAccessTicket` pour un prestataire vérifie uniquement :
```typescript
ticket.assigneEntrepriseId === entrepriseId
|| ticket.assigneUserId === userId
|| ticket.demandeurEntrepriseId === entrepriseId
```
Depuis notre fix de BUG-03, un prestataire peut voir un ticket dans la liste (`proprietaireEntrepriseId IN clients`), mais quand il clique dessus, `canUserAccessTicket` retourne `false` → page `notFound()`.

**Conséquence** : Le prestataire voit les tickets en liste mais **ne peut pas les ouvrir** (sauf si explicitement assigné).

**Fix attendu** :
```typescript
if (posture === "prestataire") {
  // Ticket assigné directement
  if (ticket.assigneEntrepriseId === entrepriseId || ticket.assigneUserId === userId || ticket.demandeurEntrepriseId === entrepriseId) return true;
  // Ticket d'un client lié
  const relation = await db.query.clientPrestataireRelations.findFirst({
    where: and(
      eq(clientPrestataireRelations.clientEntrepriseId, ticket.proprietaireEntrepriseId),
      eq(clientPrestataireRelations.prestataireEntrepriseId, entrepriseId),
    ),
  });
  return !!relation;
}
```

---

### 🔴 BUG-05 — Page `[ticketId]/page.tsx` : prestataire bloqué sur les tickets non assignés

**Fichier** : `src/app/[locale]/(main)/(application)/(portail)/app/tickets/[ticketId]/page.tsx` (lignes 65-77)

**Problème** : La logique de résolution d'`entrepriseId` pour la posture prestataire :
```typescript
if (ticket.assigneEntrepriseId === prestId || ticket.demandeurEntrepriseId === prestId) {
  entrepriseId = prestId;
  posture = "prestataire";
}
```
Si le ticket appartient à un client du prestataire mais n'est pas encore assigné au prestataire → `entrepriseId` reste `null` → `notFound()`.

**Fix attendu** : Ajouter la vérification via `clientPrestataireRelations` :
```typescript
// Fallback: vérifier si le prestataire est lié au client propriétaire du ticket
const relation = await db.query.clientPrestataireRelations.findFirst({
  where: and(
    eq(clientPrestataireRelations.clientEntrepriseId, ticket.proprietaireEntrepriseId),
    eq(clientPrestataireRelations.prestataireEntrepriseId, prestId),
  ),
});
if (relation) {
  entrepriseId = prestId;
  posture = "prestataire";
}
```

---

### 🔴 BUG-06 — `canUserEditStatut` / `canUserEditTicketBasicFields` : prestataire bloqué

**Fichier** : `src/server/utils/ticketsPermissions.utils.ts`

**Problème** : Ces fonctions utilisent `resolvePostureAwareSiteRole({ siteId, entrepriseId: ticket.proprietaireEntrepriseId })`. Pour un prestataire sur un ticket non assigné (accès via relation client), `resolvePostureAwareSiteRole` retourne `null` si le prestataire n'a pas d'attribution de site chez ce client → toutes les permissions sont `false`.

**Conséquence** : Un prestataire lié à un client peut voir ses tickets mais ne peut ni changer le statut, ni modifier le titre, même s'il a le bon rôle sur le site.

**Note** : Ce bug existe uniquement pour les tickets NON assignés explicitement au prestataire. S'il est `assigneEntrepriseId`, le check `isInvolved` passe.

**Fix attendu** : Vérifier `isInvolved` en ajoutant le cas "prestataire lié au client" :
```typescript
const isInvolved =
  ticket.proprietaireEntrepriseId === entrepriseId ||
  ticket.demandeurEntrepriseId === entrepriseId ||
  ticket.assigneEntrepriseId === entrepriseId ||
  (posture === "prestataire" && await prestataireIsLinkedToClient(entrepriseId, ticket.proprietaireEntrepriseId));
```

---

### 🟠 BUG-07 — `getEntreprisesPrestatairesAction` : retourne TOUS les prestataires à tous les utilisateurs

**Fichier** : `src/server/actions/entreprisesActions.ts`

**Problème** : `getEntreprisesPrestatairesAction` ne vérifie que l'authentification (`Auth uniquement`). Elle retourne la liste de tous les prestataires de la plateforme à n'importe quel utilisateur connecté.

**Impact** : Un prestataire peut voir les noms de tous les autres prestataires dans les filtres de tickets (colonne "Assigné à").

**Fix attendu** : Scoper selon la posture :
- Plateforme → tous les prestataires
- Client → seulement ses prestataires liés (`getClientPrestataires(entrepriseId)`)
- Prestataire → seulement lui-même

---

### 🟠 BUG-08 — `canUserAccessTicket` : prestataire lié comme demandeur non vérifié correctement

**Fichier** : `src/server/utils/ticketsPerimetre.utils.ts`

**Problème** : La vérification `ticket.demandeurEntrepriseId === entrepriseId` dans `canUserAccessTicket` pour un prestataire suppose que le prestataire est l'entreprise demandeuse. Mais `demandeurEntrepriseId` est généralement un client. Ce check passe rarement et peut créer de la confusion.

**Impact** : Faible — le cas est rare en pratique.

---

### 🟠 BUG-09 — Périmètre occurrences : prestataire sans attribution de site voit des occurrences

**Fichier** : `src/server/actions/clientServiceOccurrencesActions.ts`

**Problème** : `getOccurrencesByPrestationAction` utilise `hasAccessToPrestation()` qui vérifie `prestataireHasExecutionOnPrestation`. Un prestataire avec une exécution sur une prestation peut voir TOUTES les occurrences de cette prestation, même celles sur des sites pour lesquels il n'a pas d'attribution.

**Impact** : Modéré — fuite de données d'occurrences sur d'autres sites.

---

### 🟠 BUG-10 — `getUsers` en posture prestataire : filtre sur `entrepriseId` de l'adhésion

**Fichier** : `src/server/queries/users.query.ts`

**Problème** : En posture prestataire, `getUsers` retourne les users du prestataire (son équipe). Mais la query ne filtre pas sur `statut: "actif"` des adhésions prestataires.

**Fix** : Ajouter `eq(userPrestataireAdhesions.statut, "actif")` dans la branche prestataire.

---

### 🟡 BUG-11 — `getAvailableStatutsForUser` : prestataire ne peut jamais changer le statut

**Fichier** : `src/server/utils/ticketsPermissions.utils.ts`

**Problème** : `getAvailableStatutsForUser` retourne `[]` si le rôle effectif sur le site est < 3. Pour un prestataire `responsable_site` sur un site client, le rôle est résolu via `getUserPrestataireSiteRole`. Si ce rôle est `responsable_site` mais que la hiérarchie ROLE_HIERARCHY ne l'inclut pas correctement, la liste est vide.

**À vérifier** : `ROLE_HIERARCHY` dans `ticketsPermissions.utils.ts` inclut-il bien `intervenant_site: 0` et `responsable_site: 3` pour les prestataires ?

---

### 🟡 BUG-12 — Frontend `TicketsFiltersDialog` : select "Sites" vide pour prestataire sans filtre client

**Fichier** : `src/app/.../app/tickets/TicketsFiltersDialog.tsx`

**Contexte** : Avec nos fixes, quand un prestataire ouvre le filtre sans avoir sélectionné de client, `getAccessibleSitesAction({ entrepriseId: prestataire.id })` retourne `[]`. C'est le comportement attendu et correct.

**Comportement actuel** : Le select Sites est vide jusqu'à ce que le prestataire choisisse un client dans le filtre. C'est correct fonctionnellement, mais il n'y a pas de message explicatif.

**Amélioration attendue** : Afficher un message "Sélectionnez d'abord un client pour voir ses sites" quand `postureActive === "prestataire"` et aucun client sélectionné.

---

### 🟡 BUG-13 — Bouton "Nouveau ticket" : logique frontend correcte, mais pas de guard serveur

**Fichier** : `src/app/.../app/tickets/TicketsTable.tsx` (ligne 479)

**Contexte** : Le bouton est masqué côté frontend avec `{posture !== "prestataire" && <Button>Nouveau ticket</Button>}`.

**Problème** : `insertTicketAction` côté serveur permet à un prestataire de créer un ticket s'il a une relation client-prestataire et un rôle ≥ demandeur_site. La politique métier est donc : un prestataire PEUT créer un ticket (pour le compte d'un client ?). À valider.

**Question métier** : Un prestataire doit-il pouvoir créer des tickets ? Si non, `canUserCreateTicket` doit retourner `false` pour la posture prestataire.

---

### 🟡 BUG-14 — `getUsersAction` en posture plateforme : retourne seulement les users plateforme

**Fichier** : `src/server/queries/users.query.ts`

**Contexte** : En posture plateforme, `getUsers` retourne uniquement les users ayant `userPlateformeAdhesions` — c'est-à-dire les membres de l'équipe FM4ALL.

**Question** : Est-ce le comportement attendu ? La plateforme ne peut-elle pas voir les users de n'importe quelle entreprise cliente/prestataire depuis `/app/utilisateurs` ?

---

## RÉCAPITULATIF PRIORITÉS

| Bug | Sévérité | Module | Statut |
|-----|----------|--------|--------|
| BUG-01 | Critique | Tickets/Sites | ✅ Corrigé |
| BUG-02 | Critique | Tickets | ✅ Corrigé |
| BUG-03 | Critique | Tickets | ✅ Corrigé |
| BUG-04 | Critique | Tickets détail | 🔴 À corriger |
| BUG-05 | Critique | Tickets détail | 🔴 À corriger |
| BUG-06 | Critique | Tickets permissions | 🔴 À corriger |
| BUG-07 | Moyen | Entreprises | 🟠 À corriger |
| BUG-08 | Faible | Tickets | 🟠 À évaluer |
| BUG-09 | Moyen | Occurrences | 🟠 À corriger |
| BUG-10 | Moyen | Utilisateurs | 🟠 À corriger |
| BUG-11 | Moyen | Tickets permissions | 🟡 À vérifier |
| BUG-12 | UX | Tickets filtre | 🟡 Amélioration |
| BUG-13 | Métier | Tickets création | 🟡 À valider |
| BUG-14 | Métier | Utilisateurs | 🟡 À valider |

---

## ARCHITECTURE — POINTS DE VIGILANCE GLOBAUX

1. **Cohérence liste ↔ détail** : Tout changement de périmètre dans une liste (`getXByPerimetre`) DOIT être répercuté sur la fonction d'accès détail (`canUserAccessX`) ET la page détail (`[id]/page.tsx`).

2. **3 branches posture explicites** : Ne jamais faire de union dynamique de tables Drizzle selon la posture. Toujours 3 `if/else` séparés.

3. **`getMesClients()`** est LA référence pour les clients d'un prestataire. Ne pas recréer cette logique ailleurs.

4. **`getEntreprisesClientesAction`** : depuis 2026-03-08, accessible aux prestataires (retourne seulement leurs clients).

5. **`getAccessibleSitesAction`** : depuis 2026-03-08, accessible aux prestataires (retourne `[]` si propre entreprise, sites du client si lié).
