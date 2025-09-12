"use client";

import { NettoyageType } from "@/zod-schemas/nettoyage";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useClientStore } from "./clientStore";

// Récupération de la surface du client pour l'initialisation
const clientSurface = useClientStore.getState().client.surface ?? 0;

type NettoyageStore = {
  nettoyage: NettoyageType;
  setNettoyage: (
    value: NettoyageType | ((prev: NettoyageType) => NettoyageType),
  ) => void;
};

export const useNettoyageStore = create<NettoyageStore>()(
  persist(
    (set) => ({
      nettoyage: {
        infos: {
          fournisseurId: null,
          nomFournisseur: null,
          sloganFournisseur: null,
          logoUrl: null,
          gammeSelected: null,
          repasseSelected: false,
          samediSelected: false,
          dimancheSelected: false,
          vitrerieSelected: false,
          plainPied: true,
          commentaires: null,
        },
        quantites: {
          freqAnnuelle: null,
          hParPassage: null,
          hParPassageRepasse: null,
          surfaceCloisons: clientSurface * 0.15,
          surfaceVitres: clientSurface * 0.15,
          cadenceCloisons: null,
          cadenceVitres: null,
          nbPassagesVitrerie: 2,
        },
        prix: {
          tauxHoraire: null,
          tauxHoraireRepasse: null,
          tauxHoraireVitrerie: null,
          minFacturationVitrerie: null,
          fraisDeplacementVitrerie: null,
        },
      },
      setNettoyage: (value) =>
        set((state) => ({
          nettoyage:
            typeof value === "function" ? value(state.nettoyage) : value,
        })),
    }),
    { name: "nettoyage" },
  ),
);
