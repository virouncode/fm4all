import { CafeType } from "@/zod-schemas/cafe";
import { SelectClientType } from "@/zod-schemas/client";
import { DevisProgressType } from "@/zod-schemas/devisProgress";
import { FoodBeverageType } from "@/zod-schemas/foodBeverage";
import { HygieneType } from "@/zod-schemas/hygiene";
import { IncendieType } from "@/zod-schemas/incendie";
import { MaintenanceType } from "@/zod-schemas/maintenance";
import { ManagementType } from "@/zod-schemas/management";
import { NettoyageType } from "@/zod-schemas/nettoyage";
import { OfficeManagerType } from "@/zod-schemas/officeManager";
import { ServicesType } from "@/zod-schemas/services";
import { ServicesFm4AllType } from "@/zod-schemas/servicesFm4All";
import { SnacksFruitsType } from "@/zod-schemas/snacksFruits";
import { TheType } from "@/zod-schemas/the";
import {
  TotalCafeType,
  TotalHygieneType,
  TotalIncendieType,
  TotalMaintenanceType,
  TotalNettoyageType,
  TotalOfficeManagerType,
  TotalServicesFm4AllType,
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
  setOfficeManager: (officeManager: OfficeManagerType) => void,
  setServicesFm4All: (servicesFm4All: ServicesFm4AllType) => void,
  setServices: (services: ServicesType) => void,
  setFoodBeverage: (foodBeverage: FoodBeverageType) => void,
  setManagement: (management: ManagementType) => void,
  setTotalNettoyage: (totalNettoyage: TotalNettoyageType) => void,
  setTotalHygiene: (totalHygiene: TotalHygieneType) => void,
  setTotalMaintenance: (totalMaintenance: TotalMaintenanceType) => void,
  setTotalIncendie: (totalIncendie: TotalIncendieType) => void,
  setTotalCafe: (totalCafe: TotalCafeType) => void,
  setTotalThe: (totalThe: TotalTheType) => void,
  setTotalSnacksFruits: (totalSnacksFruits: TotalSnacksFruitsType) => void,
  setTotalOfficeManager: (totalOfficeManager: TotalOfficeManagerType) => void,
  setTotalServicesFm4All: (totalServicesFm4All: TotalServicesFm4AllType) => void
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
      freqAnnuelle: null,
      hParPassage: null,
      hParPassageRepasse: null,
      surfaceCloisons: (client.surface ?? 0) * 0.15,
      surfaceVitres: (client.surface ?? 0) * 0.15,
      cadenceCloisons: null,
      cadenceVitres: null,
      nbPassagesVitrerie: 2,
    },
    prix: {
      tauxHoraire: null,
      tauxHoraireRepasse: null,
      tauxHoraireVitrerie: null,
      minFacturationVitrerie: null,
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
      freqAnnuelle: null,
      hParPassage: null,
    },
    prix: {
      tauxHoraire: null,
      prixQ18: null,
      prixLegio: null,
      prixQualiteAir: null,
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
      prixParExtincteur: null,
      prixParBaes: null,
      prixParTelBaes: null,
      fraisDeplacement: null,
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
      prixUnitaire: null,
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
      nbPersonnes: client.effectif ?? null,
      fruitsKgParSemaine: null,
      snacksPortionsParSemaine: null,
      boissonsConsosParSemaine: null,
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
  setOfficeManager({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      gammeSelected: null,
      remplace: false,
    },
    quantites: {
      demiJParSemaine: null,
    },
    prix: {
      demiTjm: null,
    },
  });
  setServicesFm4All({
    infos: {
      gammeSelected: "essentiel",
    },
    prix: {
      tauxAssurance: null,
      tauxPlateforme: null,
      tauxSupportAdmin: null,
      tauxSupportOp: null,
      tauxAccountManager: null,
      remiseCaSeuil: null,
      tauxRemiseCa: null,
      tauxRemiseHof: null,
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
    totalService: null,
    totalRepasse: null,
    totalSamedi: null,
    totalDimanche: null,
    totalVitrerie: null,
  });
  setTotalHygiene({
    totalTrilogie: null,
    totalDesinfectant: null,
    totalParfum: null,
    totalBalai: null,
    totalPoubelle: null,
    totalInstallation: null,
  });
  setTotalMaintenance({
    totalService: null,
    totalQ18: null,
    totalLegio: null,
    totalQualiteAir: null,
  });
  setTotalIncendie({
    totalService: null,
  });
  setTotalCafe({
    totalMachines: [
      {
        lotId: 1,
        total: null,
        totalInstallation: null,
      },
    ],
  });
  setTotalThe({
    totalService: null,
  });
  setTotalSnacksFruits({
    totalFruits: null,
    totalSnacks: null,
    totalBoissons: null,
    totalLivraison: null,
    total: null,
  });
  setTotalOfficeManager({
    totalService: null,
  });
  setTotalServicesFm4All({
    totalAssurance: null,
    totalPlateforme: null,
    totalSupportAdmin: null,
    totalSupportOp: null,
    totalAccountManager: null,
    totalRemiseCa: null,
    totalRemiseHof: null,
  });
};
