import { TotalNettoyageType } from "@/zod-schemas/total";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TotalNettoyageStore {
  totalNettoyage: TotalNettoyageType;
  setTotalNettoyage: (
    value:
      | TotalNettoyageType
      | ((prev: TotalNettoyageType) => TotalNettoyageType),
  ) => void;
  reset: () => void;
}

export const useTotalNettoyageStore = create<TotalNettoyageStore>()(
  persist(
    (set) => ({
      totalNettoyage: {
        totalService: null,
        totalRepasse: null,
        totalSamedi: null,
        totalDimanche: null,
        totalVitrerie: null,
      },
      setTotalNettoyage: (value) =>
        set((state) => ({
          totalNettoyage:
            typeof value === "function" ? value(state.totalNettoyage) : value,
        })),
      reset: () =>
        set({
          totalNettoyage: {
            totalService: null,
            totalRepasse: null,
            totalSamedi: null,
            totalDimanche: null,
            totalVitrerie: null,
          },
        }),
    }),
    {
      name: "totalNettoyage",
    },
  ),
);
