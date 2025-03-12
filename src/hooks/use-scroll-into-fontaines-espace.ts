import { FontainesContext } from "@/context/FontainesProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { useContext, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export default function useScrollIntoFontainesEspace() {
  const { fontaines } = useContext(FontainesContext);
  const { foodBeverage } = useContext(FoodBeverageContext);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  useEffect(() => {
    if (isTabletOrMobile) return;
    if (
      fontaines.infos.currentEspaceId === null ||
      foodBeverage.currentFoodBeverageId !== 4
    )
      return;
    const currentEspace = document.getElementById(
      `espace_fontaine_${fontaines.infos.currentEspaceId.toString()}`
    );
    if (currentEspace) {
      currentEspace.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontaines.infos.currentEspaceId, isTabletOrMobile]);
}
