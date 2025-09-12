import { useFontainesStore } from "@/stores/fontainesStore";
import { useFoodBeverageStore } from "@/stores/foodBeverageStore";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";

export default function useScrollIntoFontainesEspace() {
  const { fontaines, setFontaines } = useFontainesStore(
    useShallow((s) => ({
      fontaines: s.fontaines,
      setFontaines: s.setFontaines,
    })),
  );
  const foodBeverage = useFoodBeverageStore((s) => s.foodBeverage);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  useEffect(() => {
    if (isTabletOrMobile) return;
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
      `espace_fontaine_${fontaines.infos.currentEspaceId.toString()}`,
    );

    if (currentEspace) {
      currentEspace.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontaines.infos.currentEspaceId, isTabletOrMobile]);
}
