"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { ManagementType } from "@/zod-schemas/management.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type ManagementStore = {
  management: ManagementType;
  setManagement: (
    value: ManagementType | ((prev: ManagementType) => ManagementType),
  ) => void;
  reset: () => void;
};

const initialManagement: ManagementType = {
  currentManagementId: 1,
};

const createManagementStore = (): StoreApi<ManagementStore> =>
  create<ManagementStore>()(
    persist(
      (set) => ({
        management: initialManagement,
        setManagement: (value) =>
          set((state) => ({
            management:
              typeof value === "function" ? value(state.management) : value,
          })),
        reset: () => set(() => ({ management: initialManagement })),
      }),
      { name: "management" },
    ),
  );

const ctx = createStoreContext<ManagementStore>(
  createManagementStore,
  "Management",
);

export const ManagementStoreProvider = ctx.Provider;
export const useManagementStore = ctx.useTypedStore;
export const useManagementStoreApi = ctx.useStoreApi;
