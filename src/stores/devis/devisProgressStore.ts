"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { DevisProgressType } from "@/zod-schemas/devisProgress.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type DevisProgressStore = {
  devisProgress: DevisProgressType;
  setDevisProgress: (
    value: DevisProgressType | ((prev: DevisProgressType) => DevisProgressType),
  ) => void;
  reset: () => void;
};

const initialDevisProgress: DevisProgressType = {
  currentStep: 1,
  completedSteps: [],
};

const createDevisProgressStore = (): StoreApi<DevisProgressStore> =>
  create<DevisProgressStore>()(
    persist(
      (set) => ({
        devisProgress: initialDevisProgress,
        setDevisProgress: (value) =>
          set((state) => ({
            devisProgress:
              typeof value === "function" ? value(state.devisProgress) : value,
          })),
        reset: () => set(() => ({ devisProgress: initialDevisProgress })),
      }),
      { name: "devisProgress" },
    ),
  );

const ctx = createStoreContext<DevisProgressStore>(
  createDevisProgressStore,
  "DevisProgress",
);

export const DevisProgressStoreProvider = ctx.Provider;
export const useDevisProgressStore = ctx.useTypedStore;
export const useDevisProgressStoreApi = ctx.useStoreApi;
