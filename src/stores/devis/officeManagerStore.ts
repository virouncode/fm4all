"use client";

import { OfficeManagerType } from "@/zod-schemas/officeManager";
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
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          logoUrl: null,
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
              fournisseurId: null,
              nomFournisseur: null,
              sloganFournisseur: null,
              logoUrl: null,
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
