import { MonDevisContext } from "@/context/MonDevisProvider";
import { useContext, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export default function useScrollIntoMonDevis() {
  const { monDevis } = useContext(MonDevisContext);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  useEffect(() => {
    if (!isTabletOrMobile || monDevis.currentMonDevisId !== 2) return;
    const currentMonDevis = document.getElementById(
      monDevis.currentMonDevisId.toString()
    );
    if (currentMonDevis) {
      currentMonDevis.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [monDevis.currentMonDevisId, isTabletOrMobile]);
}
