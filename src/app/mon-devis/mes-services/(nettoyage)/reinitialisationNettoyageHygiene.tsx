import { HygieneType } from "@/zod-schemas/hygiene";
import { NettoyageType } from "@/zod-schemas/nettoyage";
import { ServicesType } from "@/zod-schemas/services";
import { TotalHygieneType, TotalNettoyageType } from "@/zod-schemas/total";

export const reinitialisationNettoyageHygiene = (
  setNettoyage: (nettoyage: NettoyageType) => void,
  setHygiene: (hygiene: HygieneType) => void,
  setServices: (services: ServicesType) => void,
  setTotalNettoyage: (totalNettoyage: TotalNettoyageType) => void,
  setTotalHygiene: (totalHygiene: TotalHygieneType) => void
) => {
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
      trilogieGammeSelected: null,
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
  setServices({
    currentServiceId: 1,
  });
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
  });
};
