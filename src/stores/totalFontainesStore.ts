import { TotalFontainesType } from "@/zod-schemas/total";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TotalFontainesStore {
  totalFontaines: TotalFontainesType;
  setTotalFontaines: (
    value:
      | TotalFontainesType
      | ((prev: TotalFontainesType) => TotalFontainesType),
  ) => void;
}

export const useTotalFontainesStore = create<TotalFontainesStore>()(
  persist(
    (set) => ({
      totalFontaines: {
        totalEspaces: [
          {
            espaceId: 1,
            total: null,
            totalInstallation: null,
          },
        ],
      },
      setTotalFontaines: (value) =>
        set((state) => ({
          totalFontaines:
            typeof value === "function" ? value(state.totalFontaines) : value,
        })),
    }),
    {
      name: "totalFontaines",
    },
  ),
);
