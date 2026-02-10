"use client";

import { ManagementType } from "@/zod-schemas/management";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ManagementStore = {
  management: ManagementType;
  setManagement: (
    value: ManagementType | ((prev: ManagementType) => ManagementType),
  ) => void;
  reset: () => void;
};

export const useManagementStore = create<ManagementStore>()(
  persist(
    (set) => ({
      management: {
        currentManagementId: 1,
      },
      setManagement: (value) =>
        set((state) => ({
          management:
            typeof value === "function" ? value(state.management) : value,
        })),
      reset: () => set({ management: { currentManagementId: 1 } }),
    }),
    { name: "management" },
  ),
);
