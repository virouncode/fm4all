import { TotalCafeType } from "@/zod-schemas/total";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TotalCafeStore {
  totalCafe: TotalCafeType;
  setTotalCafe: (
    value: TotalCafeType | ((prev: TotalCafeType) => TotalCafeType),
  ) => void;
  reset: () => void;
}

export const useTotalCafeStore = create<TotalCafeStore>()(
  persist(
    (set) => ({
      totalCafe: {
        totalEspaces: [
          {
            espaceId: 1,
            total: null,
            totalInstallation: null,
          },
        ],
      },
      setTotalCafe: (value) =>
        set((state) => ({
          totalCafe:
            typeof value === "function" ? value(state.totalCafe) : value,
        })),
      reset: () =>
        set({
          totalCafe: {
            totalEspaces: [
              {
                espaceId: 1,
                total: null,
                totalInstallation: null,
              },
            ],
          },
        }),
    }),
    {
      name: "totalCafe",
    },
  ),
);
