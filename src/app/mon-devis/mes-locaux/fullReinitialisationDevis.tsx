import { CafeType } from "@/zod-schemas/cafe";
import { InsertClientType } from "@/zod-schemas/client";
import { DevisProgressType } from "@/zod-schemas/devisProgress";
import { FontainesType } from "@/zod-schemas/fontaines";
import { FoodBeverageType } from "@/zod-schemas/foodBeverage";
import { HygieneType } from "@/zod-schemas/hygiene";
import { IncendieType } from "@/zod-schemas/incendie";
import { MaintenanceType } from "@/zod-schemas/maintenance";
import { ManagementType } from "@/zod-schemas/management";
import { MonDevisType } from "@/zod-schemas/monDevis";
import { NettoyageType } from "@/zod-schemas/nettoyage";
import { OfficeManagerType } from "@/zod-schemas/officeManager";
import { PersonnalisationType } from "@/zod-schemas/personnalisation";
import { ServicesType } from "@/zod-schemas/services";
import { ServicesFm4AllType } from "@/zod-schemas/servicesFm4All";
import { SnacksFruitsType } from "@/zod-schemas/snacksFruits";
import { TheType } from "@/zod-schemas/the";
import {
  TotalCafeType,
  TotalFontainesType,
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
  setClient: (client: InsertClientType) => void,
  setDevisProgress: (devisProgress: DevisProgressType) => void,
  setNettoyage: (nettoyage: NettoyageType) => void,
  setHygiene: (hygiene: HygieneType) => void,
  setMaintenance: (maintenance: MaintenanceType) => void,
  setIncendie: (incendie: IncendieType) => void,
  setCafe: (cafe: CafeType) => void,
  setThe: (the: TheType) => void,
  setSnacksFruits: (snacksFruits: SnacksFruitsType) => void,
  setFontaines: (fontaines: FontainesType) => void,
  setOfficeManager: (officeManager: OfficeManagerType) => void,
  setServicesFm4All: (servicesFm4All: ServicesFm4AllType) => void,
  setServices: (services: ServicesType) => void,
  setFoodBeverage: (foodBeverage: FoodBeverageType) => void,
  setManagement: (management: ManagementType) => void,
  setPersonnalisation: (personnalisation: PersonnalisationType) => void,
  setMonDevis: (monDevis: MonDevisType) => void,
  setTotalNettoyage: (totalNettoyage: TotalNettoyageType) => void,
  setTotalHygiene: (totalHygiene: TotalHygieneType) => void,
  setTotalMaintenance: (totalMaintenance: TotalMaintenanceType) => void,
  setTotalIncendie: (totalIncendie: TotalIncendieType) => void,
  setTotalCafe: (totalCafe: TotalCafeType) => void,
  setTotalThe: (totalThe: TotalTheType) => void,
  setTotalSnacksFruits: (totalSnacksFruits: TotalSnacksFruitsType) => void,
  setTotalFontaines: (totalFontaines: TotalFontainesType) => void,
  setTotalOfficeManager: (totalOfficeManager: TotalOfficeManagerType) => void,
  setTotalServicesFm4All: (totalServicesFm4All: TotalServicesFm4AllType) => void
) => {
  //Client
  setClient({
    nomEntreprise: "",
    siret: null,
    prenomContact: "",
    nomContact: "",
    posteContact: "",
    emailContact: "",
    phoneContact: "",
    surface: 100,
    effectif: 20,
    typeBatiment: "bureaux",
    typeOccupation: "partieEtage",
    adresseLigne1: null,
    adresseLigne2: null,
    codePostal: "",
    ville: "",
    dateDeDemarrage: null,
    commentaires: null,
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
      pleinPied: true,
      commentaires: null,
    },
    quantites: {
      freqAnnuelle: null,
      hParPassage: null,
      hParPassageRepasse: null,
      surfaceCloisons: null,
      surfaceVitres: null,
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
      commentaires: null,
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
      commentaires: null,
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
      commentaires: null,
    },
    quantites: {
      nbExtincteurs: null,
      nbBaes: null,
      nbTelBaes: null,
      nbExutoires: null,
      nbExutoiresParking: null,
      nbAlarmes: null,
      nbPortesCoupeFeuBattantes: null,
      nbPortesCoupeFeuCoulissantes: null,
      nbRIA: null,
      nbColonnesSechesStatiques: null,
      nbColonnesSechesDynamiques: null,
    },
    prix: {
      prixParExtincteur: null,
      prixParBaes: null,
      prixParTelBaes: null,
      prixParExutoire: null,
      prixParExutoireParking: null,
      prixParAlarme: null,
      prixParPorteCoupeFeuBattante: null,
      prixParProteCoupeFeuCoulissante: null,
      prixParRIA: null,
      prixParColonneSecheStatique: null,
      prixParColonneSecheDynamique: null,
      fraisDeplacementTrilogie: null,
      fraisDeplacementExutoires: null,
      fraisDeplacementExutoiresParking: null,
    },
  });
  setCafe({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      currentEspaceId: 1,
      dureeLocation: "pa12M",
      commentaires: null,
    },
    nbEspaces: 1,
    espaces: [
      {
        infos: {
          espaceId: 1,
          typeBoissons: "cafe",
          typeLait: null,
          typeChocolat: null,
          gammeCafeSelected: null,
          marque: null,
          modele: null,
          reconditionne: false,
        },
        quantites: {
          nbPersonnes: null,
          nbMachines: null,
          nbPassagesParAn: null,
        },
        prix: {
          prixLoc: null,
          prixInstal: null,
          prixMaintenance: null,
          prixUnitaireConsoCafe: null,
          prixUnitaireConsoLait: null,
          prixUnitaireConsoChocolat: null,
          prixUnitaireConsoSucre: null,
        },
      },
    ],
  });
  setThe({
    infos: {
      gammeSelected: null,
      commentaires: null,
    },
    quantites: {
      nbPersonnes: null,
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
      commentaires: null,
    },
    quantites: {
      nbPersonnes: null,
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
  setFontaines({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      currentEspaceId: 1,
      dureeLocation: "pa12M",
      commentaires: null,
    },
    nbLotsFontaines: 1,
    lotsFontaines: [
      {
        infos: {
          espaceId: 1,
          typeEau: "EF",
          typePose: "aposer",
          marque: null,
          modele: null,
          reconditionne: false,
        },
        quantites: {
          nbPersonnes: null,
          nbFontaines: null,
        },
        prix: {
          prixUnitaireLoc: null,
          prixUnitaireInstal: null,
          prixUnitaireMaintenance: null,
          prixUnitaireConsoFiltres: null,
          prixUnitaireConsoCO2: null,
          prixUnitaireConsoEauChaude: null,
        },
      },
    ],
  });
  setOfficeManager({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      gammeSelected: null,
      remplace: false,
      commentaires: null,
      premium: false,
    },
    quantites: {
      demiJParSemaine: null,
    },
    prix: {
      demiTjm: null,
      demiTjmPremium: null,
    },
  });
  setServicesFm4All({
    infos: {
      gammeSelected: "essentiel",
      commentaires: null,
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
  setPersonnalisation({
    currentPersonnalisationId: 1,
    personnalisationIds: [1],
  });
  setMonDevis({
    currentMonDevisId: 1,
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
    totalTrilogie: null,
    totalExutoires: null,
    totalExutoiresParking: null,
    totalAlarmes: null,
    totalPortesCoupeFeuBattantes: null,
    totalPortesCoupeFeuCoulissantes: null,
    totalRIA: null,
    totalColonnesSechesStatiques: null,
    totalColonnesSechesDynamiques: null,
    totalDeplacementTrilogie: null,
    totalDeplacementExutoires: null,
    totalDeplacementExutoiresParking: null,
  });
  setTotalCafe({
    totalEspaces: [
      {
        espaceId: 1,
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
  setTotalFontaines({
    totalLotsFontaines: [
      {
        espaceId: 1,
        total: null,
        totalInstallation: null,
      },
    ],
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
