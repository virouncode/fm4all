"use client";

import { MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE } from "@/constants/constants";
import { FontainesType } from "@/zod-schemas/fontaines";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useProspectStore } from "./prospectStore";

// Récupération des données du prospect pour l'initialisation

type FontainesStore = {
  fontaines: FontainesType;
  setFontaines: (
    value: FontainesType | ((prev: FontainesType) => FontainesType),
  ) => void;
  reset: () => void;
};

const buildInitialFontaines = (): FontainesType => {
  const { effectif = 0 } = useProspectStore.getState().prospect;

  const nbPersonnes =
    effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
      ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
      : effectif;

  return {
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
          nbPersonnes,
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
  };
};

export const useFontainesStore = create<FontainesStore>()(
  persist(
    (set) => ({
      fontaines: buildInitialFontaines(),

      setFontaines: (value) =>
        set((state) => ({
          fontaines:
            typeof value === "function" ? value(state.fontaines) : value,
        })),

      reset: () =>
        set(() => ({
          fontaines: buildInitialFontaines(), // ← relit le prospect et recalcule nbPersonnes
        })),
    }),
    { name: "fontaines" },
  ),
);
