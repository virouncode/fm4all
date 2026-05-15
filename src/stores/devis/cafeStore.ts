"use client";

import { MAX_NB_PERSONNES_PAR_ESPACE } from "@/constants/constants";
import { createStoreContext } from "@/stores/lib/createStoreContext";
import { CafeType } from "@/zod-schemas/cafe.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type CafeStore = {
  cafe: CafeType;
  setCafe: (value: CafeType | ((prev: CafeType) => CafeType)) => void;
  reset: (effectif?: number) => void;
};

const buildCafe = (effectif: number): CafeType => {
  const nbPersonnes =
    effectif > MAX_NB_PERSONNES_PAR_ESPACE
      ? MAX_NB_PERSONNES_PAR_ESPACE
      : effectif;

  return {
    infos: {
      entrepriseId: null,
      nomPrestataire: null,
      sloganPrestataire: null,
      logoStorageKey: null,
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
          nbPersonnes,
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
  };
};

const createCafeStore = (): StoreApi<CafeStore> =>
  create<CafeStore>()(
    persist(
      (set) => ({
        cafe: buildCafe(0),
        setCafe: (value) =>
          set((state) => ({
            cafe: typeof value === "function" ? value(state.cafe) : value,
          })),
        reset: (effectif = 0) => set(() => ({ cafe: buildCafe(effectif) })),
      }),
      { name: "cafe" },
    ),
  );

const ctx = createStoreContext<CafeStore>(createCafeStore, "Cafe");

export const CafeStoreProvider = ctx.Provider;
export const useCafeStore = ctx.useTypedStore;
export const useCafeStoreApi = ctx.useStoreApi;
