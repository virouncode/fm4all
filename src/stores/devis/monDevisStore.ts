"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { MonDevisType } from "@/zod-schemas/monDevis.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type MonDevisStore = {
  monDevis: MonDevisType;
  setMonDevis: (
    value: MonDevisType | ((prev: MonDevisType) => MonDevisType),
  ) => void;
  reset: () => void;
};

const initialMonDevis: MonDevisType = {
  currentMonDevisId: 1,
};

const createMonDevisStore = (): StoreApi<MonDevisStore> =>
  create<MonDevisStore>()(
    persist(
      (set) => ({
        monDevis: initialMonDevis,
        setMonDevis: (value) =>
          set((state) => ({
            monDevis:
              typeof value === "function" ? value(state.monDevis) : value,
          })),
        reset: () => set(() => ({ monDevis: initialMonDevis })),
      }),
      { name: "monDevis" },
    ),
  );

const ctx = createStoreContext<MonDevisStore>(createMonDevisStore, "MonDevis");

export const MonDevisStoreProvider = ctx.Provider;
export const useMonDevisStore = ctx.useTypedStore;
export const useMonDevisStoreApi = ctx.useStoreApi;
