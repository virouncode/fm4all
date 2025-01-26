import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { useContext, useEffect } from "react";

export default function useScrollIntoFood() {
  const { foodBeverage } = useContext(FoodBeverageContext);

  useEffect(() => {
    const currentFoodBeverage = document.getElementById(
      foodBeverage.currentFoodBeverageId.toString()
    );
    if (currentFoodBeverage) {
      currentFoodBeverage.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [foodBeverage.currentFoodBeverageId]);
}
