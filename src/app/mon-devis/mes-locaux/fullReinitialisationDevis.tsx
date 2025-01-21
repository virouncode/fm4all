import { CafeType } from "@/zod-schemas/cafe";
import { SelectClientType } from "@/zod-schemas/client";
import { DevisProgressType } from "@/zod-schemas/devisProgress";
import { FoodBeverageType } from "@/zod-schemas/foodBeverage";
import { HygieneType } from "@/zod-schemas/hygiene";
import { IncendieType } from "@/zod-schemas/incendie";
import { MaintenanceType } from "@/zod-schemas/maintenance";
import { ManagementType } from "@/zod-schemas/management";
import { NettoyageType } from "@/zod-schemas/nettoyage";
import { ServicesType } from "@/zod-schemas/services";
import { SnacksFruitsType } from "@/zod-schemas/snacksFruits";
import { TheType } from "@/zod-schemas/the";
import {
  TotalCafeType,
  TotalHygieneType,
  TotalIncendieType,
  TotalMaintenanceType,
  TotalNettoyageType,
  TotalSnacksFruitsType,
  TotalTheType,
} from "@/zod-schemas/total";

export const fullReinitialisationDevis = (
  client: Partial<SelectClientType>,
  setClient: (client: Partial<SelectClientType>) => void,
  setDevisProgress: (devisProgress: DevisProgressType) => void,
  setNettoyage: (nettoyage: NettoyageType) => void,
  setHygiene: (hygiene: HygieneType) => void,
  setMaintenance: (maintenance: MaintenanceType) => void,
  setIncendie: (incendie: IncendieType) => void,
  setCafe: (cafe: CafeType) => void,
  setThe: (the: TheType) => void,
  setSnacksFruits: (snacksFruits: SnacksFruitsType) => void,
  setServices: (services: ServicesType) => void,
  setFoodBeverage: (foodBeverage: FoodBeverageType) => void,
  setManagement: (management: ManagementType) => void,
  setTotalNettoyage: (totalNettoyage: TotalNettoyageType) => void,
  setTotalHygiene: (totalHygiene: TotalHygieneType) => void,
  setTotalMaintenance: (totalMaintenance: TotalMaintenanceType) => void,
  setTotalIncendie: (totalIncendie: TotalIncendieType) => void,
  setTotalCafe: (totalCafe: TotalCafeType) => void,
  setTotalThe: (totalThe: TotalTheType) => void,
  setTotalSnacksFruits: (totalSnacksFruits: TotalSnacksFruitsType) => void
) => {
  //Client
  setClient({
    codePostal: "",
    surface: 100,
    effectif: 20,
    typeBatiment: "bureaux",
    typeOccupation: "partieEtage",
  });
  //Devis
  setDevisProgress({ currentStep: 1, completedSteps: [] });
  //Services
  setNettoyage({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      gammeSelected: null,
      repasseSelected: false,
      samediSelected: false,
      dimancheSelected: false,
      vitrerieSelected: false,
    },
    quantites: {
      freqAnnuelle: 0,
      hParPassage: 0,
      hParPassageRepasse: 0,
      surfaceCloisons: 0,
      surfaceVitres: 0,
      cadenceCloisons: 0,
      cadenceVitres: 0,
      nbPassagesVitrerie: 2,
    },
    prix: {
      tauxHoraire: 0,
      tauxHoraireRepasse: 0,
      tauxHoraireVitrerie: 0,
      minFacturationVitrerie: 0,
    },
  });
  setHygiene({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      dureeLocation: "pa12M",
      trilogieGammeSelected: "essentiel",
      desinfectantGammeSelected: null,
      parfumGammeSelected: null,
      balaiGammeSelected: null,
      poubelleGammeSelected: null,
    },
    quantites: {
      nbDistribEmp: null,
      nbDistribSavon: null,
      nbDistribPh: null,
      nbDistribDesinfectant: null,
      nbDistribParfum: null,
      nbDistribBalai: null,
      nbDistribPoubelle: null,
    },
    prix: {
      prixDistribEmp: null,
      prixDistribSavon: null,
      prixDistribPh: null,
      prixDistribDesinfectant: null,
      prixDistribParfum: null,
      prixDistribBalai: null,
      prixDistribPoubelle: null,
      prixInstalDistrib: null,
      paParPersonneEmp: null,
      paParPersonneSavon: null,
      paParPersonnePh: null,
      paParPersonneDesinfectant: null,
    },
  });
  setMaintenance({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      gammeSelected: null,
    },
    quantites: {
      freqAnnuelle: 0,
      hParPassage: 0,
    },
    prix: {
      tauxHoraire: 0,
      prixQ18: 0,
      prixLegio: 0,
      prixQualiteAir: 0,
    },
  });
  setIncendie({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
    },
    quantites: {
      nbExtincteurs: null,
      nbBaes: null,
      nbTelBaes: null,
    },
    prix: {
      prixParExtincteur: 0,
      prixParBaes: 0,
      prixParTelBaes: 0,
      fraisDeplacement: 0,
    },
  });
  setCafe({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      currentLotId: 1,
      dureeLocation: "pa12M",
    },
    nbLotsMachines: 1,
    lotsMachines: [
      {
        infos: {
          lotId: 1,
          typeBoissons: "cafe",
          gammeCafeSelected: null,
          marque: null,
          modele: null,
          reconditionne: false,
        },
        quantites: {
          nbPersonnes: client.effectif ?? 0,
          nbMachines: null,
        },
        prix: {
          prixUnitaireLoc: null,
          prixUnitaireInstal: null,
          prixUnitaireMaintenance: null,
          prixUnitaireConsoCafe: null,
          prixUnitaireConsoLait: null,
          prixUnitaireConsoChocolat: null,
        },
      },
    ],
  });
  setThe({
    infos: {
      gammeSelected: null,
    },
    quantites: {
      nbPersonnes: Math.round((client.effectif ?? 0) * 0.15),
    },
    prix: {
      prixUnitaire: 0,
    },
  });
  setSnacksFruits({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      isSameFournisseur: false,
      gammeSelected: null,
      choix: ["fruits"],
    },
    quantites: {
      nbPersonnes: client.effectif ?? 0,
      fruitsKgParSemaine: 0,
      snacksPortionsParSemaine: 0,
      boissonsConsosParSemaine: 0,
    },
    prix: {
      prixKgFruits: null,
      prixUnitaireSnacks: null,
      prixUnitaireBoissons: null,
      prixUnitaireLivraisonSiCafe: null,
      prixUnitaireLivraison: null,
      seuilFranco: null,
      panierMin: null,
    },
  });
  //Navigation
  setServices({
    currentServiceId: 1,
  });
  setFoodBeverage({
    currentFoodBeverageId: 1,
  });
  setManagement({
    currentManagementId: 1,
  });
  //Total
  setTotalNettoyage({
    totalService: 0,
    totalRepasse: 0,
    totalSamedi: 0,
    totalDimanche: 0,
    totalVitrerie: 0,
  });
  setTotalHygiene({
    totalTrilogie: 0,
    totalDesinfectant: 0,
    totalParfum: 0,
    totalBalai: 0,
    totalPoubelle: 0,
    totalInstallation: 0,
  });
  setTotalMaintenance({
    totalService: 0,
    totalQ18: 0,
    totalLegio: 0,
    totalQualiteAir: 0,
  });
  setTotalIncendie({
    totalService: 0,
  });
  setTotalCafe({
    totalMachines: [
      {
        lotId: 1,
        total: 0,
        totalInstallation: 0,
      },
    ],
  });
  setTotalThe({
    totalService: 0,
  });
  setTotalSnacksFruits({
    totalFruits: 0,
    totalSnacks: 0,
    totalBoissons: 0,
    totalLivraison: 0,
    total: 0,
  });
};
