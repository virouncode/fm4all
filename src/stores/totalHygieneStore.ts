import { TotalHygieneType } from "@/zod-schemas/total";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TotalHygieneStore {
  totalHygiene: TotalHygieneType;
  setTotalHygiene: (
    value: TotalHygieneType | ((prev: TotalHygieneType) => TotalHygieneType),
  ) => void;
}

export const useTotalHygieneStore = create<TotalHygieneStore>()(
  persist(
    (set) => ({
      totalHygiene: {
        totalTrilogie: null,
        totalDesinfectant: null,
        totalParfum: null,
        totalBalai: null,
        totalPoubelle: null,
        totalInstallation: null,
      },
      setTotalHygiene: (value) =>
        set((state) => ({
          totalHygiene:
            typeof value === "function" ? value(state.totalHygiene) : value,
        })),
    }),
    {
      name: "totalHygiene",
    },
  ),
);
