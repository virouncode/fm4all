import { CafeContext } from "@/context/CafeProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { useContext, useEffect } from "react";

export default function useScrollIntoLot() {
  const { cafe } = useContext(CafeContext);
  const { foodBeverage } = useContext(FoodBeverageContext);
  useEffect(() => {
    if (
      cafe.infos.currentLotId === null ||
      foodBeverage.currentFoodBeverageId !== 1
    )
      return;
    const currentLot = document.getElementById(
      `lot_${cafe.infos.currentLotId.toString()}`
    );
    if (currentLot) {
      currentLot.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafe.infos.currentLotId]);
}
