_ClickFirstLotProposition_

**Je coche**

1. Nouveau fournisseur

cafe
-> Mettre le fournisseur à jour dans cafe.infos
-> router.push cafeFournisseurId

Lot courant
-> Maj gammeCafeSelected, modele, marque, reco
-> Maj prix unitaires (pas besoin de les calculer car ils sont dans la proosition)
-> Maj des totaux (idem pas besoin de les calculer)

Autres lots
-> Le nouveau fournisseur propose-t-il une offre correspondant aux critères de ce lot ?
-> OUI

- si gammeCafeSelected => Maj prix unitaires,marque, modele, reconditionne et maj totaux (les calculer pour ces critères)
- si !gammeSelected : ne rien faire
  -> NON
- Maj prix unitaires,marque, modele, reconditionne à null, maj totaux à 0
- Montrer une indication : "Le fournisseur précédemment selectionné ne propose pas d'offre pour ces critères...

The

- si gammeSelected => Maj prix unitaire et totalThe

1. Même fournisseur
   Lot courant
   -> Maj gammeCafeSelected
   -> Maj prix unitaires (pas besoin de les calculer car ils sont dans la proposition)
   -> Maj des totaux (idem pas besoin de les calculer)

Autres lots
Pour les autres lots ça ne change rien car même fournisseur donc mêmes propositions pour les critères donnés

**Je décoche**

Lot courant

- gammeSelected, marque, modele, reconditionne : null
- prix : tous null
- totaux : null

Autres lots

- marque, modele reconditionne : null
- prix :null
- totaux :null

The

- prix null
- total 0

_ClickProposition_

**Je coche**

- Maj gammeSelected, marque, modele, reconditionne
- prix: maj
- totaux : maj
  **Je décoche**
- gammeSelected, marque, modele, reconditionne : null
- prix : nulls
- totaux:null
