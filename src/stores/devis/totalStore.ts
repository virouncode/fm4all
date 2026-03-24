"use client";

import { TotalType } from "@/zod-schemas/total.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TotalStore = {
  total: TotalType;
  setTotal: (value: TotalType | ((prev: TotalType) => TotalType)) => void;
  reset: () => void;
};

export const useTotalStore = create<TotalStore>()(
  persist(
    (set) => ({
      total: {
        totalAnnuelHt: null,
        totalAnnuelHtSansServicesFm4all: null,
        totalInstallationHt: null,
      },
      setTotal: (value) =>
        set((state) => ({
          total: typeof value === "function" ? value(state.total) : value,
        })),
      reset: () =>
        set({
          total: {
            totalAnnuelHt: null,
            totalAnnuelHtSansServicesFm4all: null,
            totalInstallationHt: null,
          },
        }),
    }),
    {
      name: "total",
    },
  ),
);
