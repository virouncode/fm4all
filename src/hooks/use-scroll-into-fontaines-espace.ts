import { FontainesContext } from "@/context/FontainesProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { useContext, useEffect } from "react";

export default function useScrollIntoFontainesEspace() {
  const { fontaines } = useContext(FontainesContext);
  const { foodBeverage } = useContext(FoodBeverageContext);
  useEffect(() => {
    if (
      fontaines.infos.currentEspaceId === null ||
      foodBeverage.currentFoodBeverageId !== 1
    )
      return;
    const currentEspace = document.getElementById(
      `espace_fontaine_${fontaines.infos.currentEspaceId.toString()}`
    );
    if (currentEspace) {
      currentEspace.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontaines.infos.currentEspaceId]);
}
