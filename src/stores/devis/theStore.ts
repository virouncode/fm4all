"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { TheType } from "@/zod-schemas/the.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type TheStore = {
  the: TheType;
  setThe: (value: TheType | ((prev: TheType) => TheType)) => void;
  reset: (effectif?: number) => void;
};

const buildThe = (effectif: number): TheType => ({
  infos: {
    gammeSelected: null,
    commentaires: null,
  },
  quantites: {
    nbPersonnes: Math.round(effectif * 0.15),
  },
  prix: {
    prixUnitaire: null,
  },
});

const createTheStore = (): StoreApi<TheStore> =>
  create<TheStore>()(
    persist(
      (set) => ({
        the: buildThe(0),
        setThe: (value) =>
          set((state) => ({
            the: typeof value === "function" ? value(state.the) : value,
          })),
        reset: (effectif = 0) => set(() => ({ the: buildThe(effectif) })),
      }),
      { name: "the" },
    ),
  );

const ctx = createStoreContext<TheStore>(createTheStore, "The");

export const TheStoreProvider = ctx.Provider;
export const useTheStore = ctx.useTypedStore;
export const useTheStoreApi = ctx.useStoreApi;
