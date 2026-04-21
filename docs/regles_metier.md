# Règles Métier — Comparateur de Devis FM4ALL

> Ce document décrit les règles de calcul, les dépendances entre services, et les invariants du comparateur.
> Il sert de référence pour tout développeur modifiant la logique de calcul ou les stores.

---

## 1. Constantes globales

| Constante                              | Valeur                | Rôle                                                                                                                                                                                            |
| -------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MARGE`                                | `1.11111111` (= 10/9) | Coefficient appliqué sur tous les prix prestataires pour obtenir le prix client. Représente une marge de **10% sur le prix de vente** : `(prix_client - prix_prestataire) / prix_client = 10%`. |
| `RATIO`                                | `10000`               | Les prix sont stockés en DB en entiers × 10 000 (ex : 1,50 € → 15 000). Divisé lors du fetch.                                                                                                   |
| `J_OUVRES_PAR_AN`                      | `260.04` (21,67 × 12) | Jours ouvrés annuels.                                                                                                                                                                           |
| `S_OUVREES_PAR_AN`                     | `52.008`              | Semaines ouvrées annuelles.                                                                                                                                                                     |
| `S_PAR_MOIS`                           | `4.33`                | Semaines par mois.                                                                                                                                                                              |
| `MAJORATION_DIMANCHE`                  | `1.2`                 | +20% sur les heures du dimanche.                                                                                                                                                                |
| `MAX_SURFACE`                          | `3 000 m²`            | Surface maximale acceptée par le comparateur.                                                                                                                                                   |
| `MAX_EFFECTIF`                         | `300 pers.`           | Effectif maximal accepté.                                                                                                                                                                       |
| `MAX_NB_PERSONNES_PAR_ESPACE`          | `150`                 | Limite par espace café. Au-delà → 2 espaces suggérés.                                                                                                                                           |
| `MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE` | `110`                 | Limite par espace fontaine.                                                                                                                                                                     |

### Règle d'affichage des prix

Tous les `totalX` dans les stores sont exprimés en **€ HT annuel prestataire** (sans MARGE). La MARGE est appliquée **uniquement à l'affichage** dans les composants `TotalX.tsx`, jamais dans les stores.

**Exception : ServicesFm4All.** Les montants FM4All sont calculés directement sur `total × MARGE` car ce sont des frais de gestion facturés en pourcentage du CA HT géré (prix client). Ils sont donc stockés déjà × MARGE dans `totalServicesFm4AllStore` et affichés sans re-multiplication.

---

## 2. Architecture des stores

### 2.1 Structure générale

Chaque service suit le même pattern à 3 couches :

```
[service]Store       → configuration choisie par l'utilisateur (prestataire, gamme, quantités, prix unitaires)
total[Service]Store  → totaux annuels calculés (HT prestataire, sans MARGE)
totalStore           → agrégat final (total annuel HT client, installation, fm4all)
```

### 2.2 Initialisation dépendante du prospect

Certains stores s'initialisent en lisant `useProspectStore.getState()` au moment de la création ou du reset :

| Store               | Champ lu   | Utilisation                                                          |
| ------------------- | ---------- | -------------------------------------------------------------------- |
| `nettoyageStore`    | `surface`  | `surfaceCloisons = surface × 0.15`, `surfaceVitres = surface × 0.15` |
| `cafeStore`         | `effectif` | `nbPersonnes = min(effectif, 150)` par espace initial                |
| `snacksFruitsStore` | `effectif` | `nbPersonnes = effectif`                                             |

### 2.3 Persistance localStorage

Tous les stores utilisent `zustand/persist` sans `partialize`. La clé localStorage correspond au nom du store :
`nettoyage`, `hygiene`, `incendie`, `maintenance`, `cafe`, `fontaines`, `snacksFruits`, `officeManager`, `servicesFm4All`, `totalNettoyage`, `totalHygiene`, etc.

---

## 3. Service : Nettoyage

### 3.1 Options configurables

- **Gamme** : `essentiel` / `confort` / `excellence`
- **Repasse** : nettoyage des sols durs (tarif horaire spécifique)
- **Samedi** : passage le samedi (même tarif horaire que la semaine)
- **Dimanche** : passage le dimanche (+20% : `MAJORATION_DIMANCHE`)
- **Vitrerie** : nettoyage des vitres et cloisons vitrées
- **Plain-pied** : pas de frais de déplacement vitrerie si `true`

### 3.2 Calcul des surfaces vitrerie

```
surfaceCloisons = surface × 0.15
surfaceVitres   = surface × 0.15
```

Initialisées à partir de la surface du prospect. L'utilisateur peut les modifier manuellement.

`nbPassagesVitrerie = 2` par défaut, modifiable (max 24).

### 3.3 Formules de calcul

```
totalService  = freqAnnuelle × hParPassage × tauxHoraire
totalRepasse  = freqAnnuelle × hParPassageRepasse × tauxHoraireRepasse      (si repasse activé)
totalSamedi   = freqAnnuelle × hParPassage × tauxHoraire                    (si samedi activé)
totalDimanche = freqAnnuelle × hParPassage × tauxHoraire × (MAJORATION_DIMANCHE - 1)   (surcoût seul)
totalVitrerie = max(
    nbPassagesVitrerie × (surfaceVitres / cadenceVitres + surfaceCloisons / cadenceCloisons) × tauxHoraireVitrerie,
    minFacturationVitrerie
  ) + (plainPied ? 0 : nbPassagesVitrerie × fraisDeplacementVitrerie)
```

**Total annuel nettoyage** = somme des champs non-null de `totalNettoyage`.

---

## 4. Service : Hygiène sanitaire

### 4.1 Dépendance avec le Nettoyage

L'hygiène est **fortement liée au nettoyage** : quand un prestataire de nettoyage est sélectionné, ses tarifs hygiène sont automatiquement proposés en priorité. L'utilisateur peut choisir un prestataire hygiène différent.

### 4.2 Composants d'hygiène

| Composant                       | Type                           | Description                                          |
| ------------------------------- | ------------------------------ | ---------------------------------------------------- |
| **Trilogie** (EMP + savon + PH) | Location distributeurs + conso | Distributeurs essuie-mains, savon, papier hygiénique |
| **Désinfectant**                | Location distributeur          | Gel désinfectant                                     |
| **Parfum**                      | Location distributeur          | Diffuseur de parfum                                  |
| **Balai WC**                    | Location distributeur          | Support balayette                                    |
| **Poubelle**                    | Location distributeur          | Poubelle à pédale                                    |
| **Installation**                | One-shot                       | Frais d'installation de tous les distributeurs       |

### 4.3 Calcul du nombre de distributeurs

Issu de `getHygieneDistribQuantite(effectif)` — table en DB arrondie par paliers d'effectif :

```
nbDistribEmpPoubelle  = nbDistribEmp
nbDistribDesinfectant = nbDistribPh
nbDistribParfum       = nbDistribEmp
nbDistribBalai        = nbDistribPh
nbDistribPoubelle     = ceil(nbDistribPh / 2)
```

### 4.4 Formules de calcul

```
totalTrilogie      = nbDistribEmp × prixDistribEmp[duree]
                   + nbDistribSavon × prixDistribSavon[duree]
                   + nbDistribPh × prixDistribPh[duree]
                   + nbPersonnes × (paParPersonneEmp + paParPersonneSavon + paParPersonnePh) × 12
totalDesinfectant  = nbDistribDesinfectant × prixDistribDesinfectant[duree]
                   + nbPersonnes × paParPersonneDesinfectant × 12
totalParfum        = nbDistribParfum × prixDistribParfum[duree]
totalBalai         = nbDistribBalai × prixDistribBalai[duree]
totalPoubelle      = nbDistribPoubelle × prixDistribPoubelle[duree]
totalInstallation  = nbTotalDistributeurs × prixInstalDistrib   (one-shot, voir §12)
```

`dureeLocation` : `pa12M` / `pa24M` / `pa36M`. Le prix par distributeur varie selon la durée.

### 4.5 Minimum de facturation

```
totalTrilogie = max(totalTrilogie, minFacturation)
```

### 4.6 Total hygiène dans le calcul global

`totalInstallation` est exclu du total récurrent et comptabilisé séparément :

```
totalFinalHygiene = Σ(totalHygiene.*) où non-null − totalHygiene.totalInstallation
```

---

## 5. Service : Maintenance multitechnique

### 5.1 Options

- **Gamme** : `essentiel` / `confort` / `excellence`
- Contrôles optionnels : Q18 (qualité eau), Legionella, qualité de l'air

### 5.2 Formules

```
totalService    = freqAnnuelle × hParPassage × tauxHoraire
totalQ18        = prixQ18         (annuel fixe)
totalLegio      = prixLegio       (annuel fixe)
totalQualiteAir = prixQualiteAir  (annuel fixe)
```

**Total annuel maintenance** = somme des champs non-null.

---

## 6. Service : Sécurité incendie

### 6.1 Éléments couverts

Extincteurs, BAES, Tél-BAES, exutoires, exutoires parking, alarmes incendie, portes coupe-feu (battantes et coulissantes), RIA, colonnes sèches (statiques et dynamiques).

### 6.2 Formules

```
totalExtincteurs              = nbExtincteurs × prixParExtincteur + fraisDeplacementTrilogie
totalBaes                     = nbBaes × prixParBaes
totalTelBaes                  = nbTelBaes × prixParTelBaes
totalExutoires                = nbExutoires × prixParExutoire + fraisDeplacementExutoires
totalExutoiresParking         = nbExutoiresParking × prixParExutoireParking + fraisDeplacementExutoiresParking
totalAlarmes                  = nbAlarmes × prixParAlarme
totalPortesCoupeFeuBattantes  = nbPortesBattantes × prixParPorte
totalPortesCoupeFeuCoulissantes = nbPortesCoulissantes × prixParPorte
totalRIA                      = nbRIA × prixParRIA
totalColonnesSechesDynamiques = nb × prixParColonne
totalColonnesStatic           = nb × prixParColonne
```

**Total annuel incendie** = somme des champs non-null de `totalIncendie`.

---

## 7. Service : Machines à café (multi-espaces)

### 7.1 Multi-espaces

Le café supporte plusieurs espaces dans un même devis (même prestataire, machines différentes). Limite : `MAX_NB_PERSONNES_PAR_ESPACE = 150`. Au-delà, un 2ème espace est suggéré.

### 7.2 Types de boissons par espace

- `typeBoissons` : `cafe` / `cafe+the` / `cafe+the+chocolat`
- `typeLait` : dosette / frais / poudre (ratios : `RATIO_LAIT = 0.2` consommations lait / conso café)
- `typeChocolat` : sachet / poudre (ratio : `RATIO_CHOCO = 0.2`)
- Sucre : `RATIO_SUCRE = 0.5`

### 7.3 Formules par espace

```
totalLoc         = prixLoc × 12                          (location mensuelle → annuel)
totalMaintenance = prixMaintenance × 12
totalInstal      = prixInstal                            (one-shot, voir §12)
totalConsoCafe   = nbPersonnes × nbPassagesParJour × J_OUVRES_PAR_AN × prixUnitaireCafe
totalConsoLait   = totalConsoCafe × RATIO_LAIT × prixUnitaireLait
totalConsoChoco  = totalConsoCafe × RATIO_CHOCO × prixUnitaireChocolat
totalConsoSucre  = totalConsoCafe × RATIO_SUCRE × prixUnitaireSucre
total espace     = totalLoc + totalMaintenance + Σ totalConso*
```

`totalCafeStore` contient un array `totalEspaces[{ espaceId, total, totalInstallation }]`.

---

## 8. Service : Fontaines à eau (multi-espaces)

### 8.1 Multi-espaces

Même logique que café. Limite : `MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE = 110`.

### 8.2 Types et options

- Fontaine réseau / bonbonne
- Options : CO2, eau chaude
- Durées de location : `pa12M` / `pa24M` / `pa36M` / `pa48M` / `pa60M`

### 8.3 Formules par espace

```
totalLoc           = prix location selon durée
totalMaintenance   = paMaintenance × 12
totalInstal        = fraisInstallation    (one-shot, voir §12)
totalConsoFiltres  = paConsoFiltres × 12
totalConsoCO2      = paConsoCO2 × 12      (si CO2)
totalConsoEauChaude = paConsoEauChaude × 12  (si eau chaude)
total espace       = totalLoc + totalMaintenance + Σ totalConso*
```

`totalFontainesStore` contient un array `totalEspaces[{ espaceId, total, totalInstallation }]`.

---

## 9. Service : Snacks, Fruits & Boissons

### 9.1 Composants configurables

L'utilisateur choisit quels éléments inclure (`choix` : `["fruits"]`, `["fruits", "snacks"]`, etc.).

### 9.2 Formules

```
totalFruits   = fruitsKgParSemaine × prixKgFruits × S_OUVREES_PAR_AN
totalSnacks   = snacksPortionsParSemaine × prixUnitaireSnacks × S_OUVREES_PAR_AN
totalBoissons = boissonsConsosParSemaine × prixUnitaireBoissons × S_OUVREES_PAR_AN
totalLivraison = si (totalCommandes < panierMin) → frais pleins
                 si (totalCommandes >= seuilFranco) → 0
                 sinon → frais proportionnels
```

### 9.3 Remise si même prestataire que le Café

```
isSamePrestataire = (snacksFruits.entrepriseId === cafe.infos.entrepriseId)
remiseSiCafe      = isSamePrestataire ? prixUnitaireLivraisonSiCafe (tarif réduit) : prixUnitaireLivraison
```

Les stores gardent `total` (avec remise appliquée) et `totalSansRemise` pour l'affichage du détail.

---

## 10. Service : Office Manager externalisé

### 10.1 Gammes

- `essentiel` : 0,5 demi-jour/semaine
- `confort` : 1 demi-jour/semaine
- `excellence` : 2 demi-jours/semaine (ou plus)

### 10.2 Options

- `remplace = true` : remplace un poste existant (influe sur la remise HOF dans FM4All)
- `premium = true` : utilise `demiTjmPremium` au lieu de `demiTjm`

### 10.3 Formule

```
totalService = demiJParSemaine × (premium ? demiTjmPremium : demiTjm) × S_OUVREES_PAR_AN × 2
```

---

## 11. Services FM4ALL (frais de gestion)

### 11.1 Gammes

| Gamme        | Composants                                      |
| ------------ | ----------------------------------------------- |
| `essentiel`  | Assurance + Plateforme + Support admin (inclus) |
| `confort`    | + Support opérationnel                          |
| `excellence` | + Account manager                               |

### 11.2 Base de calcul

Les frais FM4ALL sont des **pourcentages du CA HT géré** (prix client), soit la somme de tous les services × MARGE :

```
totalBase = (Σ tous services hors FM4ALL) × MARGE
```

C'est le seul cas où `MARGE` est incluse dans le calcul d'un store.

### 11.3 Formules

```
prixAssurance      = tauxAssurance × totalBase                                    (taux : 1,08%)
prixPlateforme     = max(tauxPlateforme × totalBase, minFacturationPlateforme)    (taux : 1,00% ; min : 249 €)
prixSupportAdmin   = 0 (inclus, affiché "inclus")
prixSupportOp      = max(tauxSupportOp × totalBase, minFacturationSupportOp)      (taux : 2,19% ; min : 1 190 €)
prixAccountManager = max(tauxAccountManager × totalBase, minFacturationAccountManager)  (taux : 3,99% ; min : 2 050 €)
```

### 11.4 Remises FM4ALL

```
remiseCa  = (totalBase >= 26 000 €) ? 0,5% × totalBase : 0   (remise sur volume)
remiseHof = officeManager.gammeSelected ? 0,5% × totalBase : 0  (remise si HOF sélectionné)
```

### 11.5 Total FM4ALL selon gamme

```
essentiel  : assurance + plateforme + supportAdmin − remiseCa − remiseHof
confort    : + supportOp
excellence : + accountManager
```

Ces montants sont stockés directement dans `totalServicesFm4AllStore` (déjà × MARGE) et ajoutés sans coefficient supplémentaire au `totalAnnuelHt`.

---

## 12. Calcul du total global (`Total.tsx`)

### 12.1 Séparation récurrent / one-shot

Les installations sont des frais **one-shot** (une seule fois à la mise en place) :

```
totalInstallationHt = (
    totalHygiene.totalInstallation
  + Σ totalCafe.totalEspaces[i].totalInstallation
  + Σ totalFontaines.totalEspaces[i].totalInstallation
) × MARGE
```

### 12.2 Total annuel HT (récurrent)

```
totalFinalNettoyage     = Σ(totalNettoyage.*) où non-null
totalFinalHygiene       = Σ(totalHygiene.*) où non-null − totalHygiene.totalInstallation
totalFinalMaintenance   = Σ(totalMaintenance.*) où non-null
totalFinalIncendie      = Σ(totalIncendie.*) où non-null
totalFinalCafe          = Σ(totalCafe.totalEspaces[i].total ?? 0)
totalFinalThe           = totalThe.totalService ?? 0
totalFinalSnacksFruits  = totalSnacksFruits.total ?? 0
totalFinalFontaines     = Σ(totalFontaines.totalEspaces[i].total ?? 0)
totalFinalOfficeManager = totalOfficeManager.totalService ?? 0

totalAnnuelHtSansServicesFm4all = Σ(totalFinal*) × MARGE
totalAnnuelHt = totalAnnuelHtSansServicesFm4all + totalFinalServicesFm4All
```

### 12.3 Affichage

- **Bouton flottant** : `totalAnnuelHt` si `totalAnnuelHtSansServicesFm4all` est non-null, sinon `0`
- **Mensuel** : `totalAnnuelHt / 12`
- **Installation** : affichée séparément comme mention `+ X € HT d'installation`

---

## 13. Gestion des arrondis et unités

- Les prix sont affichés arrondis à l'entier (`Math.round`)
- Tous les totaux sont **annuels HT** sauf mention contraire
- La TVA (`1.2`) n'est pas appliquée dans le comparateur — les prix sont présentés HT
- Conversion mensuel = `total / 12` calculée à l'affichage uniquement, jamais stockée

---

## 14. Dépendances entre services

```
Nettoyage     ──→ Hygiène        tarifs hygiène du même prestataire proposés en priorité
Café          ──→ SnacksFruits   remise livraison si isSamePrestataire
OfficeManager ──→ FM4All         remiseHof (0,5%) si HOF sélectionné
Tous services ──→ FM4All         totalBase = Σ services × MARGE (base des taux FM4All)
```

---

## 15. Émission du devis (`finaliserDevisAction`)

### 15.1 Flux côté client (`MonDevisForm.tsx`)

1. Vérification de cohérence des prix (voir §16)
2. Génération du PDF via `fillDevis()` → `urlTemp` (blob URL)
3. Affichage **immédiat** du PDF depuis le blob URL (sans attendre S3)
4. Upload du PDF sur S3 via URL présignée
5. Appel de `finaliserDevisAction` en arrière-plan avec `devisS3Key`, `pdfFilename`, `pdfSizeBytes`, `texte`

### 15.2 Flux côté serveur (`finaliserDevisAction`)

1. Mise à jour du prospect en DB
2. Récupération du `devisTemporaire` le plus récent pour ce prospect (par `prospectId` + `createdAt DESC`)
3. Téléchargement du PDF depuis S3 (Buffer pour la pièce jointe email)
4. Dans une transaction :
   - INSERT dans `documents` (`proprietaireEntrepriseId = FM4ALL_ENTREPRISE_ID`, `categorie = "devis_temporaire"`, `storageProvider = "s3"`)
   - UPDATE `devisTemporaires.documentId` + `texte` (snapshot localStorage à la date d'émission)
   - INSERT dans `documentsLinks` (`devisTemporaireId`)
5. Envoi d'un email à `BREVO_CONTACT_EMAIL` avec le PDF en pièce jointe (+ BCC via `BREVO_BCC_EMAIL`)

Les étapes 3–5 sont non bloquantes : en cas d'échec, le prospect est mis à jour et le PDF reste accessible sur S3.

---

## 16. Anti-falsification des prix à l'émission

### 16.1 Principe

`verifierCoherenceDevisAction` est appelée **avant** la génération du PDF. Elle relit les tarifs directement depuis la DB et les compare aux prix stockés dans le localStorage (stores Zustand). Si une divergence est détectée, les corrections sont appliquées dans les stores et le formulaire redemande une soumission.

### 16.2 Services vérifiés

| Service          | Clé de lookup                                                                                     | Champs vérifiés                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Nettoyage        | `entrepriseId + surface + gamme`                                                                  | `tauxHoraire`, `hParPassage`, + options repasse/vitrerie                  |
| Maintenance      | `entrepriseId + surface + gamme`                                                                  | `tauxHoraire`, `hParPassage`                                              |
| Hygiène          | `entrepriseId + effectif + dureeLocation`                                                         | Tous les prix trilogie, désinfectant, parfum, balai, poubelle, instal     |
| Incendie         | `entrepriseId`                                                                                    | Tous les prix par élément                                                 |
| Snacks & Fruits  | `entrepriseId + effectif`                                                                         | `prixKgFruits`, `prixUnitaireSnacks`, `prixUnitaireBoissons`, livraisons  |
| Office Manager   | `entrepriseId + gamme`                                                                            | `demiTjm`, `demiTjmPremium`                                               |
| Café (par espace)| `entrepriseId + roundNbPersonnesCafeMachines(nbPersonnes)` + `roundNbPersonnesCafeConso`          | `prixLoc`, `prixMaintenance`, `prixInstal`, toutes les consos             |
| Thé              | `cafe.infos.entrepriseId + roundNbPersonnesCafeConso(nbPersonnes / 0.15)`                         | `prixUnitaire`                                                            |
| Fontaines (espace)| `entrepriseId + roundNbPersonnesFontaine(nbPersonnes) + typeFontaine + dureeLocation`            | `prixLocation`, `prixMaintenance`, `prixInstallation`, consos             |
| ServicesFm4All   | `gamme`                                                                                           | Tous les taux et minimums                                                 |

### 16.3 Règles d'arrondi pour les lookups

```
roundNbPersonnesCafeConso(n)    → Math.floor(n / 5) × 5   (arrondi vers le bas par palier de 5)
roundNbPersonnesCafeMachines(n) → Math.ceil(n / 5) × 5    (arrondi vers le haut par palier de 5)
roundNbPersonnesFontaine(n)     → Math.ceil(n / 5) × 5    (arrondi vers le haut par palier de 5)
```

### 16.4 Corrections par espace (café / fontaines)

Les corrections sont retournées sous forme de tableau `[{ espaceId, prix: Partial<...> }]` et appliquées espace par espace dans le store.

---

## 17. Limites et invariants

- **MARGE invariante** : la constante `MARGE = 1.11111111` ne doit jamais être modifiée sans recalibrer tous les taux FM4All et les minFacturations qui sont calibrés sur cette base.
- **Diviseurs DB** : prix standards `/ RATIO`, taux servicesFm4All `/ (RATIO × 100)`, minimums servicesFm4All `/ RATIO`.
- **Logos prestataires** : stockés en S3, jamais en URL statique. Les composants `PresignedLogoImage` et `PresignedTarifImage` génèrent une URL présignée au montage via `getPresignedReadUrl()`.
