import { useFoodBeverageStore } from "@/stores/foodBeverageStore";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export default function useScrollIntoFood() {
  const foodBeverage = useFoodBeverageStore((s) => s.foodBeverage);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1023px)" });

  useEffect(() => {
    if (isTabletOrMobile) return;
    const currentFoodBeverage = document.getElementById(
      foodBeverage.currentFoodBeverageId.toString(),
    );
    if (currentFoodBeverage) {
      currentFoodBeverage.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [foodBeverage.currentFoodBeverageId, isTabletOrMobile]);
}
