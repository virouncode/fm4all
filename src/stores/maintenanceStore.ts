"use client";

import { MaintenanceType } from "@/zod-schemas/maintenance";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type MaintenanceStore = {
  maintenance: MaintenanceType;
  setMaintenance: (
    value: MaintenanceType | ((prev: MaintenanceType) => MaintenanceType),
  ) => void;
  reset: () => void;
};

export const useMaintenanceStore = create<MaintenanceStore>()(
  persist(
    (set) => ({
      maintenance: {
        infos: {
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          logoUrl: null,
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
      },
      setMaintenance: (value) =>
        set((state) => ({
          maintenance:
            typeof value === "function" ? value(state.maintenance) : value,
        })),
      reset: () =>
        set({
          maintenance: {
            infos: {
              fournisseurId: null,
              nomFournisseur: null,
              sloganFournisseur: null,
              logoUrl: null,
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
          },
        }),
    }),
    { name: "maintenance" },
  ),
);
