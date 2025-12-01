import { useMonDevisStore } from "@/stores/monDevisStore";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export default function useScrollIntoMonDevis() {
  const monDevis = useMonDevisStore((s) => s.monDevis);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  useEffect(() => {
    if (monDevis.currentMonDevisId !== 2) return;
    const currentMonDevis = document.getElementById(
      monDevis.currentMonDevisId.toString(),
    );
    if (currentMonDevis) {
      currentMonDevis.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [monDevis.currentMonDevisId, isTabletOrMobile]);
}
