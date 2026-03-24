"use client";

import { TotalServicesFm4AllType } from "@/zod-schemas/total.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TotalServicesFm4AllStore = {
  totalServicesFm4All: TotalServicesFm4AllType;
  setTotalServicesFm4All: (
    value:
      | TotalServicesFm4AllType
      | ((prev: TotalServicesFm4AllType) => TotalServicesFm4AllType),
  ) => void;
  reset: () => void;
};

export const useTotalServicesFm4AllStore = create<TotalServicesFm4AllStore>()(
  persist(
    (set) => ({
      totalServicesFm4All: {
        totalAssurance: null,
        totalPlateforme: null,
        totalSupportAdmin: null,
        totalSupportOp: null,
        totalAccountManager: null,
        totalRemiseCa: null,
        totalRemiseHof: null,
      },
      setTotalServicesFm4All: (value) =>
        set((state) => ({
          totalServicesFm4All:
            typeof value === "function"
              ? value(state.totalServicesFm4All)
              : value,
        })),
      reset: () =>
        set({
          totalServicesFm4All: {
            totalAssurance: null,
            totalPlateforme: null,
            totalSupportAdmin: null,
            totalSupportOp: null,
            totalAccountManager: null,
            totalRemiseCa: null,
            totalRemiseHof: null,
          },
        }),
    }),
    {
      name: "totalServicesFm4All",
    },
  ),
);
