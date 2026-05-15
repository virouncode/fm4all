"use client";

import { MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE } from "@/constants/constants";
import { createStoreContext } from "@/stores/lib/createStoreContext";
import { FontainesType } from "@/zod-schemas/fontaines.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type FontainesStore = {
  fontaines: FontainesType;
  setFontaines: (
    value: FontainesType | ((prev: FontainesType) => FontainesType),
  ) => void;
  reset: (effectif?: number) => void;
};

const buildFontaines = (effectif: number): FontainesType => {
  const nbPersonnes =
    effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
      ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
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

const createFontainesStore = (): StoreApi<FontainesStore> =>
  create<FontainesStore>()(
    persist(
      (set) => ({
        fontaines: buildFontaines(0),
        setFontaines: (value) =>
          set((state) => ({
            fontaines:
              typeof value === "function" ? value(state.fontaines) : value,
          })),
        reset: (effectif = 0) =>
          set(() => ({ fontaines: buildFontaines(effectif) })),
      }),
      { name: "fontaines" },
    ),
  );

const ctx = createStoreContext<FontainesStore>(createFontainesStore, "Fontaines");

export const FontainesStoreProvider = ctx.Provider;
export const useFontainesStore = ctx.useTypedStore;
export const useFontainesStoreApi = ctx.useStoreApi;
