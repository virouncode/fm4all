"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { MaintenanceType } from "@/zod-schemas/maintenance.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type MaintenanceStore = {
  maintenance: MaintenanceType;
  setMaintenance: (
    value: MaintenanceType | ((prev: MaintenanceType) => MaintenanceType),
  ) => void;
  reset: () => void;
};

const initialMaintenance: MaintenanceType = {
  infos: {
    entrepriseId: null,
    nomPrestataire: null,
    sloganPrestataire: null,
    logoStorageKey: null,
    gammeSelected: null,
    commentaires: null,
  },
  quantites: {
    freqAnnuelle: null,
    hParPassage: null,
  },
  prix: {
    tauxHoraire: null,
    prixQ18: null,
    prixLegio: null,
    prixQualiteAir: null,
  },
};

const createMaintenanceStore = (): StoreApi<MaintenanceStore> =>
  create<MaintenanceStore>()(
    persist(
      (set) => ({
        maintenance: initialMaintenance,
        setMaintenance: (value) =>
          set((state) => ({
            maintenance:
              typeof value === "function" ? value(state.maintenance) : value,
          })),
        reset: () => set(() => ({ maintenance: initialMaintenance })),
      }),
      { name: "maintenance" },
    ),
  );

const ctx = createStoreContext<MaintenanceStore>(
  createMaintenanceStore,
  "Maintenance",
);

export const MaintenanceStoreProvider = ctx.Provider;
export const useMaintenanceStore = ctx.useTypedStore;
export const useMaintenanceStoreApi = ctx.useStoreApi;
