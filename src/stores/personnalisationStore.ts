"use client";

import { PersonnalisationType } from "@/zod-schemas/personnalisation";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type PersonnalisationStore = {
  personnalisation: PersonnalisationType;
  setPersonnalisation: (
    value:
      | PersonnalisationType
      | ((prev: PersonnalisationType) => PersonnalisationType),
  ) => void;
};

export const usePersonnalisationStore = create<PersonnalisationStore>()(
  persist(
    (set) => ({
      personnalisation: {
        currentPersonnalisationId: 1,
        personnalisationIds: [1],
      },
      setPersonnalisation: (value) =>
        set((state) => ({
          personnalisation:
            typeof value === "function" ? value(state.personnalisation) : value,
        })),
    }),
    { name: "personnalisation" },
  ),
);
