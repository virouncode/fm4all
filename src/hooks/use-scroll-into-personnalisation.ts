import { usePersonnalisationStore } from "@/stores/personnalisationStore";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export default function useScrollIntoPersonnalisation() {
  const personnalisation = usePersonnalisationStore((s) => s.personnalisation);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  useEffect(() => {
    if (isTabletOrMobile) return;
    if (!personnalisation.currentPersonnalisationId) return;
    const currentService = document.getElementById(
      personnalisation.currentPersonnalisationId.toString(),
    );
    if (currentService) {
      currentService.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [personnalisation.currentPersonnalisationId, isTabletOrMobile]);
}
