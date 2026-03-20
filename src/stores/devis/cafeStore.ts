"use client";

import { MAX_NB_PERSONNES_PAR_ESPACE } from "@/constants/constants";
import { CafeType } from "@/zod-schemas/cafe.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useProspectStore } from "./prospectStore";

// Récupération des données du prospect pour l'initialisation

type CafeStore = {
  cafe: CafeType;
  setCafe: (value: CafeType | ((prev: CafeType) => CafeType)) => void;
  reset: () => void;
};

const buildInitialCafe = (): CafeType => {
  const { effectif = 0 } = useProspectStore.getState().prospect;

  const nbPersonnes =
    effectif > MAX_NB_PERSONNES_PAR_ESPACE
      ? MAX_NB_PERSONNES_PAR_ESPACE
      : effectif;

  return {
    infos: {
      entrepriseId: null,
      nomPrestataire: null,
      sloganPrestataire: null,
      logoStorageKey: null,
      currentEspaceId: 1,
      dureeLocation: "pa12M",
      commentaires: null,
    },
    nbEspaces: 1,
    espaces: [
      {
        infos: {
          espaceId: 1,
          typeBoissons: "cafe",
          typeLait: null,
          typeChocolat: null,
          gammeCafeSelected: null,
          marque: null,
          modele: null,
          reconditionne: false,
        },
        quantites: {
          nbPersonnes,
          nbMachines: null,
          nbPassagesParAn: null,
        },
        prix: {
          prixLoc: null,
          prixInstal: null,
          prixMaintenance: null,
          prixUnitaireConsoCafe: null,
          prixUnitaireConsoLait: null,
          prixUnitaireConsoChocolat: null,
          prixUnitaireConsoSucre: null,
        },
      },
    ],
  };
};

export const useCafeStore = create<CafeStore>()(
  persist(
    (set) => ({
      cafe: buildInitialCafe(),

      setCafe: (value) =>
        set((state) => ({
          cafe: typeof value === "function" ? value(state.cafe) : value,
        })),

      reset: () =>
        set(() => ({
          cafe: buildInitialCafe(), // ← relit le prospect et recalcule nbPersonnes
        })),
    }),
    { name: "cafe" },
  ),
);
