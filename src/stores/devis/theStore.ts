"use client";

import { TheType } from "@/zod-schemas/the.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useProspectStore } from "./prospectStore";

type TheStore = {
  the: TheType;
  setThe: (value: TheType | ((prev: TheType) => TheType)) => void;
  reset: () => void;
};

const buildInitialThe = (): TheType => {
  const { effectif = 0 } = useProspectStore.getState().prospect;

  return {
    infos: {
      gammeSelected: null,
      commentaires: null,
    },
    quantites: {
      nbPersonnes: Math.round(effectif * 0.15),
    },
    prix: {
      prixUnitaire: null,
    },
  };
};

export const useTheStore = create<TheStore>()(
  persist(
    (set) => ({
      the: buildInitialThe(),

      setThe: (value) =>
        set((state) => ({
          the: typeof value === "function" ? value(state.the) : value,
        })),

      reset: () =>
        set(() => ({
          the: buildInitialThe(), // ← relit le prospect et recalcule nbPersonnes
        })),
    }),
    {
      name: "the",
    },
  ),
);
