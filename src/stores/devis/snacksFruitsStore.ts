"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { SnacksFruitsType } from "@/zod-schemas/snacksFruits.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type SnacksFruitsStore = {
  snacksFruits: SnacksFruitsType;
  setSnacksFruits: (
    value: SnacksFruitsType | ((prev: SnacksFruitsType) => SnacksFruitsType),
  ) => void;
  reset: (effectif?: number) => void;
};

const buildSnacksFruits = (effectif: number): SnacksFruitsType => ({
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
});

const createSnacksFruitsStore = (): StoreApi<SnacksFruitsStore> =>
  create<SnacksFruitsStore>()(
    persist(
      (set) => ({
        snacksFruits: buildSnacksFruits(0),
        setSnacksFruits: (value) =>
          set((state) => ({
            snacksFruits:
              typeof value === "function" ? value(state.snacksFruits) : value,
          })),
        reset: (effectif = 0) =>
          set(() => ({ snacksFruits: buildSnacksFruits(effectif) })),
      }),
      { name: "snacksFruits" },
    ),
  );

const ctx = createStoreContext<SnacksFruitsStore>(
  createSnacksFruitsStore,
  "SnacksFruits",
);

export const SnacksFruitsStoreProvider = ctx.Provider;
export const useSnacksFruitsStore = ctx.useTypedStore;
export const useSnacksFruitsStoreApi = ctx.useStoreApi;
