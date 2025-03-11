import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { useContext, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export default function useScrollIntoFood() {
  const { foodBeverage } = useContext(FoodBeverageContext);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1023px)" });

  useEffect(() => {
    if (isTabletOrMobile) return;
    const currentFoodBeverage = document.getElementById(
      foodBeverage.currentFoodBeverageId.toString()
    );
    if (currentFoodBeverage) {
      currentFoodBeverage.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [foodBeverage.currentFoodBeverageId, isTabletOrMobile]);
}
