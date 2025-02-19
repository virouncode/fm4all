import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { useContext, useEffect } from "react";

export default function useScrollIntoPersonnalisation() {
  const { personnalisation } = useContext(PersonnalisationContext);
  useEffect(() => {
    if (!personnalisation.currentPersonnalisationId) return;
    const currentService = document.getElementById(
      personnalisation.currentPersonnalisationId.toString()
    );
    if (currentService) {
      setTimeout(() => {
        currentService.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [personnalisation.currentPersonnalisationId]);
}
