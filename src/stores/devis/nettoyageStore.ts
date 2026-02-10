"use client";

import { NettoyageType } from "@/zod-schemas/nettoyage.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useProspectStore } from "./prospectStore";

// Récupération de la surface du prospect pour l'initialisation

type NettoyageStore = {
  nettoyage: NettoyageType;
  setNettoyage: (
    value: NettoyageType | ((prev: NettoyageType) => NettoyageType),
  ) => void;
  reset: () => void;
};

const buildInitialNettoyage = (): NettoyageType => {
  const { surface = 0 } = useProspectStore.getState().prospect;

  return {
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
      surfaceCloisons: surface * 0.15,
      surfaceVitres: surface * 0.15,
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
  };
};

export const useNettoyageStore = create<NettoyageStore>()(
  persist(
    (set) => ({
      nettoyage: buildInitialNettoyage(),

      setNettoyage: (value) =>
        set((state) => ({
          nettoyage:
            typeof value === "function" ? value(state.nettoyage) : value,
        })),

      reset: () =>
        set(() => ({
          nettoyage: buildInitialNettoyage(), // ← relit le prospect et recalcule les surfaces
        })),
    }),
    { name: "nettoyage" },
  ),
);
