"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { FoodBeverageType } from "@/zod-schemas/foodBeverage";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization of context
export const FoodBeverageContext = createContext<{
  foodBeverage: FoodBeverageType;
  setFoodBeverage: Dispatch<SetStateAction<FoodBeverageType>>;
}>({
  foodBeverage: { currentFoodBeverageId: 1 },
  setFoodBeverage: () => {},
});

const FoodBeverageProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Default state initialization
  const [foodBeverage, setFoodBeverage] = useState<FoodBeverageType>({
    currentFoodBeverageId: 1,
  });

  // Load data from localStorage after mounting
  useEffect(() => {
    if (isMounted) {
      const storedFoodBeverage = localStorage.getItem("foodBeverage");
      if (storedFoodBeverage) {
        setFoodBeverage(JSON.parse(storedFoodBeverage));
      }
    }
  }, [isMounted]);

  // Save data to localStorage when state changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("foodBeverage", JSON.stringify(foodBeverage));
    }
  }, [foodBeverage, isMounted]);

  // Conditional rendering to ensure client-only hooks work
  if (!isMounted) return null;

  return (
    <FoodBeverageContext.Provider value={{ foodBeverage, setFoodBeverage }}>
      {children}
    </FoodBeverageContext.Provider>
  );
};

export default FoodBeverageProvider;
