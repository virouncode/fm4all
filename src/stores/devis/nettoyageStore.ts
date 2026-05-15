"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { NettoyageType } from "@/zod-schemas/nettoyage.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type NettoyageStore = {
  nettoyage: NettoyageType;
  setNettoyage: (
    value: NettoyageType | ((prev: NettoyageType) => NettoyageType),
  ) => void;
  reset: (surface?: number) => void;
};

const buildNettoyage = (surface: number): NettoyageType => ({
  infos: {
    entrepriseId: null,
    nomPrestataire: null,
    sloganPrestataire: null,
    logoStorageKey: null,
    gammeSelected: null,
    repasseSelected: false,
    samediSelected: false,
    dimancheSelected: false,
    vitrerieSelected: false,
    plainPied: true,
    commentaires: null,
  },
  quantites: {
    freqAnnuelle: null,
    hParPassage: null,
    hParPassageRepasse: null,
    surfaceCloisons: surface * 0.15,
    surfaceVitres: surface * 0.15,
    cadenceCloisons: null,
    cadenceVitres: null,
    nbPassagesVitrerie: 2,
  },
  prix: {
    tauxHoraire: null,
    tauxHoraireRepasse: null,
    tauxHoraireVitrerie: null,
    minFacturationVitrerie: null,
    fraisDeplacementVitrerie: null,
  },
});

const createNettoyageStore = (): StoreApi<NettoyageStore> =>
  create<NettoyageStore>()(
    persist(
      (set) => ({
        nettoyage: buildNettoyage(0),
        setNettoyage: (value) =>
          set((state) => ({
            nettoyage:
              typeof value === "function" ? value(state.nettoyage) : value,
          })),
        reset: (surface = 0) =>
          set(() => ({ nettoyage: buildNettoyage(surface) })),
      }),
      { name: "nettoyage" },
    ),
  );

const ctx = createStoreContext<NettoyageStore>(createNettoyageStore, "Nettoyage");

export const NettoyageStoreProvider = ctx.Provider;
export const useNettoyageStore = ctx.useTypedStore;
export const useNettoyageStoreApi = ctx.useStoreApi;
