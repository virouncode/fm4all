import { CafeType } from "@/zod-schemas/cafe";
import { SelectClientType } from "@/zod-schemas/client";
import { TheType } from "@/zod-schemas/the";
import { TotalCafeType } from "@/zod-schemas/total";

export const reinitialisationCafeThe = (
  setCafe: (cafe: CafeType) => void,
  setThe: (the: TheType) => void,
  setTotalCafe: (totalCafe: TotalCafeType) => void,
  client: Partial<SelectClientType>
) => {
  setCafe({
    currentMachineId: 1,
    cafeFournisseurId: null,
    machines: [],
  });
  setThe({
    gammeSelected: null,
    nbPersonnes: Math.round((client.effectif ?? 0) * 0.15),
  });
  setTotalCafe({
    nomFournisseur: null,
    prixCafeMachines: [],
    prixThe: null,
  });
};
