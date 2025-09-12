"use client";

import { FoodBeverageType } from "@/zod-schemas/foodBeverage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type FoodBeverageStore = {
  foodBeverage: FoodBeverageType;
  setFoodBeverage: (
    value: FoodBeverageType | ((prev: FoodBeverageType) => FoodBeverageType),
  ) => void;
};

export const useFoodBeverageStore = create<FoodBeverageStore>()(
  persist(
    (set) => ({
      foodBeverage: {
        currentFoodBeverageId: 1,
      },
      setFoodBeverage: (value) =>
        set((state) => ({
          foodBeverage:
            typeof value === "function" ? value(state.foodBeverage) : value,
        })),
    }),
    { name: "foodBeverage" },
  ),
);
