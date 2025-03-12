import { FontainesContext } from "@/context/FontainesProvider";
import { FoodBeverageContext } from "@/context/FoodBeverageProvider";
import { useContext, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export default function useScrollIntoFontainesEspace() {
  const { fontaines, setFontaines } = useContext(FontainesContext);
  const { foodBeverage } = useContext(FoodBeverageContext);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  useEffect(() => {
    if (isTabletOrMobile) return;
    console.log(
      "fontaines.infos.currentEspaceId",
      fontaines.infos.currentEspaceId
    );
    if (
      fontaines.infos.currentEspaceId === null ||
      foodBeverage.currentFoodBeverageId !== 4
    ) {
      setFontaines((prev) => ({
        ...prev,
        infos: { ...fontaines.infos, currentEspaceId: 1 },
      }));
      return;
    }

    const currentEspace = document.getElementById(
      `espace_fontaine_${fontaines.infos.currentEspaceId.toString()}`
    );
    console.log("currentEspace", currentEspace);

    if (currentEspace) {
      currentEspace.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontaines.infos.currentEspaceId, isTabletOrMobile]);
}
