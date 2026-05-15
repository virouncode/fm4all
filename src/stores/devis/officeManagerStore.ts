"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { OfficeManagerType } from "@/zod-schemas/officeManager.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type OfficeManagerStore = {
  officeManager: OfficeManagerType;
  setOfficeManager: (
    value: OfficeManagerType | ((prev: OfficeManagerType) => OfficeManagerType),
  ) => void;
  reset: () => void;
};

const initialOfficeManager: OfficeManagerType = {
  infos: {
    entrepriseId: null,
    nomPrestataire: null,
    sloganPrestataire: null,
    logoStorageKey: null,
    gammeSelected: null,
    remplace: false,
    commentaires: null,
    premium: false,
  },
  quantites: {
    demiJParSemaine: null,
  },
  prix: {
    demiTjm: null,
    demiTjmPremium: null,
  },
};

const createOfficeManagerStore = (): StoreApi<OfficeManagerStore> =>
  create<OfficeManagerStore>()(
    persist(
      (set) => ({
        officeManager: initialOfficeManager,
        setOfficeManager: (value) =>
          set((state) => ({
            officeManager:
              typeof value === "function" ? value(state.officeManager) : value,
          })),
        reset: () => set(() => ({ officeManager: initialOfficeManager })),
      }),
      { name: "officeManager" },
    ),
  );

const ctx = createStoreContext<OfficeManagerStore>(
  createOfficeManagerStore,
  "OfficeManager",
);

export const OfficeManagerStoreProvider = ctx.Provider;
export const useOfficeManagerStore = ctx.useTypedStore;
export const useOfficeManagerStoreApi = ctx.useStoreApi;
