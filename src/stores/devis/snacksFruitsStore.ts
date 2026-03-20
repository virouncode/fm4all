import { SnacksFruitsType } from "@/zod-schemas/snacksFruits.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useProspectStore } from "./prospectStore";

type SnacksFruitsStore = {
  snacksFruits: SnacksFruitsType;
  setSnacksFruits: (
    value: SnacksFruitsType | ((prev: SnacksFruitsType) => SnacksFruitsType),
  ) => void;
  reset: () => void;
};

const buildInitialSnacksFruits = (): SnacksFruitsType => {
  const { effectif = 0 } = useProspectStore.getState().prospect;

  return {
    infos: {
      entrepriseId: null,
      nomPrestataire: null,
      sloganPrestataire: null,
      isSamePrestataire: false,
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
