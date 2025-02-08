import { CafeContext } from "@/context/CafeProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { useContext, useEffect } from "react";

export default function useScrollIntoCafeEspace() {
  const { cafe } = useContext(CafeContext);
  const { foodBeverage } = useContext(FoodBeverageContext);
  useEffect(() => {
    if (
      cafe.infos.currentEspaceId === null ||
      foodBeverage.currentFoodBeverageId !== 1
    )
      return;
    const currentEspace = document.getElementById(
      `espace_${cafe.infos.currentEspaceId.toString()}`
    );
    if (currentEspace) {
      currentEspace.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafe.infos.currentEspaceId]);
}
