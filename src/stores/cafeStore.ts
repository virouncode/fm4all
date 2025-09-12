"use client";

import { MAX_NB_PERSONNES_PAR_ESPACE } from "@/constants/constants";
import { CafeType } from "@/zod-schemas/cafe";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useClientStore } from "./clientStore";

// Récupération des données du client pour l'initialisation
const clientEffectif = useClientStore.getState().client.effectif ?? 0;

type CafeStore = {
  cafe: CafeType;
  setCafe: (value: CafeType | ((prev: CafeType) => CafeType)) => void;
};

export const useCafeStore = create<CafeStore>()(
  persist(
    (set) => ({
      cafe: {
        infos: {
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          logoUrl: null,
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
              nbPersonnes:
                clientEffectif > MAX_NB_PERSONNES_PAR_ESPACE
                  ? MAX_NB_PERSONNES_PAR_ESPACE
                  : (clientEffectif ?? 0),
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
      },
      setCafe: (value) =>
        set((state) => ({
          cafe: typeof value === "function" ? value(state.cafe) : value,
        })),
    }),
    { name: "cafe" },
  ),
);
