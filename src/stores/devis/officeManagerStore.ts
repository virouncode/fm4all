"use client";

import { OfficeManagerType } from "@/zod-schemas/officeManager.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type OfficeManagerStore = {
  officeManager: OfficeManagerType;
  setOfficeManager: (
    value: OfficeManagerType | ((prev: OfficeManagerType) => OfficeManagerType),
  ) => void;
  reset: () => void;
};

export const useOfficeManagerStore = create<OfficeManagerStore>()(
  persist(
    (set) => ({
      officeManager: {
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
      },
      setOfficeManager: (value) =>
        set((state) => ({
          officeManager:
            typeof value === "function" ? value(state.officeManager) : value,
        })),
      reset: () =>
        set({
          officeManager: {
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
          },
        }),
    }),
    { name: "officeManager" },
  ),
);
