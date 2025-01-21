import { CafeType } from "@/zod-schemas/cafe";
import { SelectClientType } from "@/zod-schemas/client";
import { TheType } from "@/zod-schemas/the";
import { TotalCafeType, TotalTheType } from "@/zod-schemas/total";

export const reinitialisationCafeThe = (
  setCafe: (cafe: CafeType) => void,
  setThe: (the: TheType) => void,
  setTotalCafe: (totalCafe: TotalCafeType) => void,
  setTotalThe: (totalThe: TotalTheType) => void,
  client: Partial<SelectClientType>
) => {
  setCafe({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      currentLotId: 1,
      dureeLocation: "pa12M",
    },
    nbLotsMachines: 0,
    lotsMachines: [],
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
  setTotalCafe({
    totalMachines: [],
  });
  setTotalThe({
    totalService: 0,
  });
};
