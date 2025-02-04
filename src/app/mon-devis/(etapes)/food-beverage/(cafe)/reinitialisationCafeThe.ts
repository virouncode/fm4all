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
      currentEspaceId: 1,
      dureeLocation: "pa12M",
      commentaires: null,
    },
    nbEspaces: null,
    espaces: [],
  });
  setThe({
    infos: {
      gammeSelected: null,
      commentaires: null,
    },
    quantites: {
      nbPersonnes: Math.round((client.effectif ?? 0) * 0.15),
    },
    prix: {
      prixUnitaire: null,
    },
  });
  setTotalCafe({
    totalEspaces: [],
  });
  setTotalThe({
    totalService: 0,
  });
};
