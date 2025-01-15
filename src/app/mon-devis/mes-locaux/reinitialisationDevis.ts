import { CafeType } from "@/zod-schemas/cafe";
import { SelectClientType } from "@/zod-schemas/client";
import { DevisProgressType } from "@/zod-schemas/devisProgress";
import { FoodBeverageType } from "@/zod-schemas/foodBeverage";
import { HygieneType } from "@/zod-schemas/hygiene";
import { NettoyageType } from "@/zod-schemas/nettoyage";
import { ServicesType } from "@/zod-schemas/services";
import { TheType } from "@/zod-schemas/the";
import {
  TotalCafeType,
  TotalHygieneType,
  TotalIncendieType,
  TotalMaintenanceType,
  TotalNettoyageType,
} from "@/zod-schemas/total";

export const reinitialisationDevis = (
  client: Partial<SelectClientType>,
  setDevisProgress: (devisProgress: DevisProgressType) => void,
  setNettoyage: (nettoyage: NettoyageType) => void,
  setHygiene: (hygiene: HygieneType) => void,
  setCafe: (cafe: CafeType) => void,
  setThe: (the: TheType) => void,
  setServices: (services: ServicesType) => void,
  setFoodBeverage: (foodBeverage: FoodBeverageType) => void,
  setTotalNettoyage: (totalNettoyage: TotalNettoyageType) => void,
  setTotalHygiene: (totalHygiene: TotalHygieneType) => void,
  setTotalIncendie: (totalIncendie: TotalIncendieType) => void,
  setTotalMaintenance: (totalMaintenance: TotalMaintenanceType) => void,
  setTotalCafe: (totalCafe: TotalCafeType) => void
) => {
  //Devis
  setDevisProgress({ currentStep: 2, completedSteps: [1] });
  //Services
  setNettoyage({
    fournisseurId: null,
    propositionId: null,
    gammeSelected: null,
    repassePropositionId: null,
    samediPropositionId: null,
    dimanchePropositionId: null,
    vitreriePropositionId: null,
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
  setCafe({
    currentMachineId: null,
    cafeFournisseurId: null,
    machines: [
      {
        machineId: 1,
        typeBoissons: "cafe",
        dureeLocation: "pa12M",
        nbPersonnes: client.effectif ?? 0,
        nbMachines: 0,
        propositionId: null,
      },
    ],
  });
  setThe({
    theGammeSelected: null,
    nbPersonnes: Math.round((client.effectif ?? 0) * 0.15),
  });
  //Navigation
  setServices({
    currentServiceId: 1,
  });
  setFoodBeverage({
    currentFoodBeverageId: 1,
  });
  //Total
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
  setTotalIncendie({
    nomFournisseur: null,
    prixIncendie: null,
  });
  setTotalMaintenance({
    nomFournisseur: null,
    prixMaintenance: null,
  });
  setTotalCafe({
    nomFournisseur: null,
    prixCafeMachines: [
      {
        machineId: 1,
        prix: null,
        marque: "",
        modele: "",
        reconditionnne: false,
        nbMachines: 0,
      },
    ],
    prixThe: null,
  });
};
