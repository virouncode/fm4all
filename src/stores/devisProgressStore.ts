"use client";

import { DevisProgressType } from "@/zod-schemas/devisProgress";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type DevisProgressStore = {
  devisProgress: DevisProgressType;
  setDevisProgress: (
    value: DevisProgressType | ((prev: DevisProgressType) => DevisProgressType),
  ) => void;
};

export const useDevisProgressStore = create<DevisProgressStore>()(
  persist(
    (set) => ({
      devisProgress: {
        currentStep: 1,
        completedSteps: [],
      },
      setDevisProgress: (value) =>
        set((state) => ({
          devisProgress:
            typeof value === "function" ? value(state.devisProgress) : value,
        })),
    }),
    { name: "devisProgress" },
  ),
);
