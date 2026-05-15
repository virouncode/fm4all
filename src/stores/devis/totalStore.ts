"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { TotalType } from "@/zod-schemas/total.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type TotalStore = {
  total: TotalType;
  setTotal: (value: TotalType | ((prev: TotalType) => TotalType)) => void;
  reset: () => void;
};

const initialTotal: TotalType = {
  totalAnnuelHt: null,
  totalAnnuelHtSansServicesFm4all: null,
  totalInstallationHt: null,
};

const createTotalStore = (): StoreApi<TotalStore> =>
  create<TotalStore>()(
    persist(
      (set) => ({
        total: initialTotal,
        setTotal: (value) =>
          set((state) => ({
            total: typeof value === "function" ? value(state.total) : value,
          })),
        reset: () => set(() => ({ total: initialTotal })),
      }),
      { name: "total" },
    ),
  );

const ctx = createStoreContext<TotalStore>(createTotalStore, "Total");

export const TotalStoreProvider = ctx.Provider;
export const useTotalStore = ctx.useTypedStore;
export const useTotalStoreApi = ctx.useStoreApi;
