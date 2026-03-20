"use client";

import { MonDevisType } from "@/zod-schemas/monDevis.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type MonDevisStore = {
  monDevis: MonDevisType;
  setMonDevis: (
    value: MonDevisType | ((prev: MonDevisType) => MonDevisType),
  ) => void;
  reset: () => void;
};

export const useMonDevisStore = create<MonDevisStore>()(
  persist(
    (set) => ({
      monDevis: {
        currentMonDevisId: 1,
      },
      setMonDevis: (value) =>
        set((state) => ({
          monDevis: typeof value === "function" ? value(state.monDevis) : value,
        })),
      reset: () => set({ monDevis: { currentMonDevisId: 1 } }),
    }),
    { name: "monDevis" },
  ),
);
