import { TotalMaintenanceType } from "@/zod-schemas/total.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TotalMaintenanceStore = {
  totalMaintenance: TotalMaintenanceType;
  setTotalMaintenance: (
    value:
      | TotalMaintenanceType
      | ((prev: TotalMaintenanceType) => TotalMaintenanceType),
  ) => void;
  reset: () => void;
};

export const useTotalMaintenanceStore = create<TotalMaintenanceStore>()(
  persist(
    (set) => ({
      totalMaintenance: {
        totalService: null,
        totalQ18: null,
        totalLegio: null,
        totalQualiteAir: null,
      },
      setTotalMaintenance: (value) =>
        set((state) => ({
          totalMaintenance:
            typeof value === "function" ? value(state.totalMaintenance) : value,
        })),
      reset: () =>
        set({
          totalMaintenance: {
            totalService: null,
            totalQ18: null,
            totalLegio: null,
            totalQualiteAir: null,
          },
        }),
    }),
    {
      name: "totalMaintenance",
    },
  ),
);
