"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { TotalServicesFm4AllType } from "@/zod-schemas/total.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type TotalServicesFm4AllStore = {
  totalServicesFm4All: TotalServicesFm4AllType;
  setTotalServicesFm4All: (
    value:
      | TotalServicesFm4AllType
      | ((prev: TotalServicesFm4AllType) => TotalServicesFm4AllType),
  ) => void;
  reset: () => void;
};

const initialTotalServicesFm4All: TotalServicesFm4AllType = {
  totalAssurance: null,
  totalPlateforme: null,
  totalSupportAdmin: null,
  totalSupportOp: null,
  totalAccountManager: null,
  totalRemiseCa: null,
  totalRemiseHof: null,
};

const createTotalServicesFm4AllStore = (): StoreApi<TotalServicesFm4AllStore> =>
  create<TotalServicesFm4AllStore>()(
    persist(
      (set) => ({
        totalServicesFm4All: initialTotalServicesFm4All,
        setTotalServicesFm4All: (value) =>
          set((state) => ({
            totalServicesFm4All:
              typeof value === "function"
                ? value(state.totalServicesFm4All)
                : value,
          })),
        reset: () =>
          set(() => ({ totalServicesFm4All: initialTotalServicesFm4All })),
      }),
      { name: "totalServicesFm4All" },
    ),
  );

const ctx = createStoreContext<TotalServicesFm4AllStore>(
  createTotalServicesFm4AllStore,
  "TotalServicesFm4All",
);

export const TotalServicesFm4AllStoreProvider = ctx.Provider;
export const useTotalServicesFm4AllStore = ctx.useTypedStore;
export const useTotalServicesFm4AllStoreApi = ctx.useStoreApi;
