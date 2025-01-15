import { CafeType } from "@/zod-schemas/cafe";
import { SelectClientType } from "@/zod-schemas/client";
import { DevisProgressType } from "@/zod-schemas/devisProgress";
import { FoodBeverageType } from "@/zod-schemas/foodBeverage";
import { HygieneType } from "@/zod-schemas/hygiene";
import { IncendieType } from "@/zod-schemas/incendie";
import { MaintenanceType } from "@/zod-schemas/maintenance";
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
  setMaintenance: (maintenance: MaintenanceType) => void,
  setIncendie: (incendie: IncendieType) => void,
  setCafe: (cafe: CafeType) => void,
  setThe: (the: TheType) => void,
  setServices: (services: ServicesType) => void,
  setFoodBeverage: (foodBeverage: FoodBeverageType) => void,
  setTotalNettoyage: (totalNettoyage: TotalNettoyageType) => void,
  setTotalHygiene: (totalHygiene: TotalHygieneType) => void,
  setTotalMaintenance: (totalMaintenance: TotalMaintenanceType) => void,
  setTotalIncendie: (totalIncendie: TotalIncendieType) => void,
  setTotalCafe: (totalCafe: TotalCafeType) => void
) => {
  //Devis
  setDevisProgress({ currentStep: 2, completedSteps: [1] });
  //Services
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
  setMaintenance({
    fournisseurId: null,
    gammeSelected: null,
  });
  setIncendie({
    fournisseurId: null,
    nbExtincteurs: 0,
    nbBaes: 0,
    nbTelBaes: 0,
  });

  setCafe({
    currentMachineId: null,
    cafeFournisseurId: null,
    machines: [
      {
        machineId: 1,
        gammeSelected: null,
        typeBoissons: "cafe",
        dureeLocation: "pa12M",
        nbPersonnes: client.effectif ?? 0,
        nbMachines: 0,
      },
    ],
  });
  setThe({
    gammeSelected: null,
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
