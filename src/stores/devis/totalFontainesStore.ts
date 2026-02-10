import { TotalFontainesType } from "@/zod-schemas/total.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TotalFontainesStore = {
  totalFontaines: TotalFontainesType;
  setTotalFontaines: (
    value:
      | TotalFontainesType
      | ((prev: TotalFontainesType) => TotalFontainesType),
  ) => void;
  reset: () => void;
};

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
      reset: () =>
        set({
          totalFontaines: {
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
      name: "totalFontaines",
    },
  ),
);
