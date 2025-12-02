import { TotalOfficeManagerType } from "@/zod-schemas/total";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TotalOfficeManagerStore {
  totalOfficeManager: TotalOfficeManagerType;
  setTotalOfficeManager: (
    value:
      | TotalOfficeManagerType
      | ((prev: TotalOfficeManagerType) => TotalOfficeManagerType),
  ) => void;
  reset: () => void;
}

export const useTotalOfficeManagerStore = create<TotalOfficeManagerStore>()(
  persist(
    (set) => ({
      totalOfficeManager: {
        totalService: null,
      },
      setTotalOfficeManager: (value) =>
        set((state) => ({
          totalOfficeManager:
            typeof value === "function"
              ? value(state.totalOfficeManager)
              : value,
        })),
      reset: () =>
        set({
          totalOfficeManager: {
            totalService: null,
          },
        }),
    }),
    {
      name: "totalOfficeManager",
    },
  ),
);
