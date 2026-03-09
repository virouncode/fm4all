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

*Dernière mise à jour : 2026-03-09*
