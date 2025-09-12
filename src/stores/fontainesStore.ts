"use client";

import { MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE } from "@/constants/constants";
import { FontainesType } from "@/zod-schemas/fontaines";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useClientStore } from "./clientStore";

// Récupération des données du client pour l'initialisation
const clientEffectif = useClientStore.getState().client.effectif ?? 0;

type FontainesStore = {
  fontaines: FontainesType;
  setFontaines: (
    value: FontainesType | ((prev: FontainesType) => FontainesType),
  ) => void;
};

export const useFontainesStore = create<FontainesStore>()(
  persist(
    (set) => ({
      fontaines: {
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
              typeEau: ["Eau froide"],
              marque: null,
              modele: null,
              reconditionne: false,
              poseSelected: null,
            },
            quantites: {
              nbPersonnes:
                clientEffectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
                  ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
                  : clientEffectif,
            },
            prix: {
              prixLoc: null,
              prixInstal: null,
              prixMaintenance: null,
              prixUnitaireConsoFiltres: null,
              prixUnitaireConsoCO2: null,
              prixUnitaireConsoEauChaude: null,
            },
          },
        ],
      },
      setFontaines: (value) =>
        set((state) => ({
          fontaines:
            typeof value === "function" ? value(state.fontaines) : value,
        })),
    }),
    { name: "fontaines" },
  ),
);
