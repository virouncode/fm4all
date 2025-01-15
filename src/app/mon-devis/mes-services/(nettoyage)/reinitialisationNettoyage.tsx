import { HygieneType } from "@/zod-schemas/hygiene";
import { NettoyageType } from "@/zod-schemas/nettoyage";
import { ServicesType } from "@/zod-schemas/services";
import { TotalHygieneType, TotalNettoyageType } from "@/zod-schemas/total";

export const reinitialisationNettoyage = (
  setNettoyage: (nettoyage: NettoyageType) => void,
  setHygiene: (hygiene: HygieneType) => void,
  setServices: (services: ServicesType) => void,
  setTotalNettoyage: (totalNettoyage: TotalNettoyageType) => void,
  setTotalHygiene: (totalHygiene: TotalHygieneType) => void
) => {
  setNettoyage({
    fournisseurId: null,
    gammeSelected: null,
    repasseSelected: false,
    samediSelected: false,
    dimancheSelected: false,
    vitrerieSelected: false,
    nbPassageVitrerie: 2,
  });
  setHygiene({
    fournisseurId: null,
    nbDistribEmp: 0,
    nbDistribSavon: 0,
    nbDistribPh: 0,
    nbDistribDesinfectant: 0,
    nbDistribParfum: 0,
    nbDistribBalai: 0,
    nbDistribPoubelle: 0,
    dureeLocation: "pa36M",
    trilogieGammeSelected: null,
    desinfectantGammeSelected: null,
    parfumGammeSelected: null,
    balaiGammeSelected: null,
    poubelleGammeSelected: null,
  });
  setServices({
    currentServiceId: 1,
  });
  setTotalNettoyage({
    nomFournisseur: null,
    prixRepasse: null,
    prixService: null,
    prixSamedi: null,
    prixDimanche: null,
    prixVitrerie: null,
  });
  setTotalHygiene({
    nomFournisseur: null,
    prixTrilogieAbonnement: null,
    prixTrilogieAchat: null,
    prixDesinfectantAbonnement: null,
    prixDesinfectantAchat: null,
    prixParfum: null,
    prixBalai: null,
    prixPoubelle: null,
  });
};
