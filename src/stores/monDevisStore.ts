"use client";

import { MonDevisType } from "@/zod-schemas/monDevis";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type MonDevisStore = {
  monDevis: MonDevisType;
  setMonDevis: (
    value: MonDevisType | ((prev: MonDevisType) => MonDevisType),
  ) => void;
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
    }),
    { name: "monDevis" },
  ),
);
