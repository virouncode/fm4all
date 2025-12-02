import { TotalSnacksFruitsType } from "@/zod-schemas/total";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TotalSnacksFruitsStore {
  totalSnacksFruits: TotalSnacksFruitsType;
  setTotalSnacksFruits: (
    value:
      | TotalSnacksFruitsType
      | ((prev: TotalSnacksFruitsType) => TotalSnacksFruitsType),
  ) => void;
  reset: () => void;
}

export const useTotalSnacksFruitsStore = create<TotalSnacksFruitsStore>()(
  persist(
    (set) => ({
      totalSnacksFruits: {
        totalFruits: null,
        totalSnacks: null,
        totalBoissons: null,
        totalLivraison: null,
        total: null,
        totalSansRemise: null,
      },
      setTotalSnacksFruits: (value) =>
        set((state) => ({
          totalSnacksFruits:
            typeof value === "function"
              ? value(state.totalSnacksFruits)
              : value,
        })),
      reset: () =>
        set({
          totalSnacksFruits: {
            totalFruits: null,
            totalSnacks: null,
            totalBoissons: null,
            totalLivraison: null,
            total: null,
            totalSansRemise: null,
          },
        }),
    }),
    {
      name: "totalSnacksFruits",
    },
  ),
);
