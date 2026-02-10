import { useCafeStore } from "@/stores/devis/cafeStore";
import { useFoodBeverageStore } from "@/stores/devis/foodBeverageStore";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export default function useScrollIntoCafeEspace() {
  const cafe = useCafeStore((s) => s.cafe);
  const foodBeverage = useFoodBeverageStore((s) => s.foodBeverage);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  useEffect(() => {
    if (isTabletOrMobile) return;
    if (
      cafe.infos.currentEspaceId === null ||
      foodBeverage.currentFoodBeverageId !== 1
    )
      return;
    const currentEspace = document.getElementById(
      `espace_${cafe.infos.currentEspaceId.toString()}`,
    );
    if (currentEspace) {
      currentEspace.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafe.infos.currentEspaceId, isTabletOrMobile]);
}
