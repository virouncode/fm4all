import { SnacksFruitsType } from "@/zod-schemas/snacksFruits";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useProspectStore } from "./prospectStore";

interface SnacksFruitsStore {
  snacksFruits: SnacksFruitsType;
  setSnacksFruits: (
    value: SnacksFruitsType | ((prev: SnacksFruitsType) => SnacksFruitsType),
  ) => void;
  reset: () => void;
}

const buildInitialSnacksFruits = (): SnacksFruitsType => {
  const { effectif = 0 } = useProspectStore.getState().prospect;

  return {
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
      nbPersonnes: effectif,
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
  };
};

export const useSnacksFruitsStore = create<SnacksFruitsStore>()(
  persist(
    (set) => ({
      snacksFruits: buildInitialSnacksFruits(),

      setSnacksFruits: (value) =>
        set((state) => ({
          snacksFruits:
            typeof value === "function" ? value(state.snacksFruits) : value,
        })),

      reset: () =>
        set(() => ({
          snacksFruits: buildInitialSnacksFruits(), // ← relit le prospect et recalcule nbPersonnes
        })),
    }),
    {
      name: "snacksFruits",
    },
  ),
);
