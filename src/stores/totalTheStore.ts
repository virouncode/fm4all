import { TotalTheType } from "@/zod-schemas/total";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TotalTheStore {
  totalThe: TotalTheType;
  setTotalThe: (
    value: TotalTheType | ((prev: TotalTheType) => TotalTheType),
  ) => void;
}

export const useTotalTheStore = create<TotalTheStore>()(
  persist(
    (set) => ({
      totalThe: {
        totalService: null,
      },
      setTotalThe: (value) =>
        set((state) => ({
          totalThe: typeof value === "function" ? value(state.totalThe) : value,
        })),
    }),
    {
      name: "totalThe",
    },
  ),
);
