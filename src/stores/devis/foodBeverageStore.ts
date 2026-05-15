"use client";

import { createStoreContext } from "@/stores/lib/createStoreContext";
import { FoodBeverageType } from "@/zod-schemas/foodBeverage.schema";
import { create, type StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type FoodBeverageStore = {
  foodBeverage: FoodBeverageType;
  setFoodBeverage: (
    value: FoodBeverageType | ((prev: FoodBeverageType) => FoodBeverageType),
  ) => void;
  reset: () => void;
};

const initialFoodBeverage: FoodBeverageType = {
  currentFoodBeverageId: 1,
};

const createFoodBeverageStore = (): StoreApi<FoodBeverageStore> =>
  create<FoodBeverageStore>()(
    persist(
      (set) => ({
        foodBeverage: initialFoodBeverage,
        setFoodBeverage: (value) =>
          set((state) => ({
            foodBeverage:
              typeof value === "function" ? value(state.foodBeverage) : value,
          })),
        reset: () => set(() => ({ foodBeverage: initialFoodBeverage })),
      }),
      { name: "foodBeverage" },
    ),
  );

const ctx = createStoreContext<FoodBeverageStore>(
  createFoodBeverageStore,
  "FoodBeverage",
);

export const FoodBeverageStoreProvider = ctx.Provider;
export const useFoodBeverageStore = ctx.useTypedStore;
export const useFoodBeverageStoreApi = ctx.useStoreApi;
