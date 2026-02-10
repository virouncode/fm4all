import { TotalTheType } from "@/zod-schemas/total.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TotalTheStore = {
  totalThe: TotalTheType;
  setTotalThe: (
    value: TotalTheType | ((prev: TotalTheType) => TotalTheType),
  ) => void;
  reset: () => void;
};

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
      reset: () =>
        set({
          totalThe: {
            totalService: null,
          },
        }),
    }),
    {
      name: "totalThe",
    },
  ),
);
