import { MonDevisContext } from "@/context/MonDevisProvider";
import { useContext, useEffect } from "react";

export default function useScrollIntoMonDevis() {
  const { monDevis } = useContext(MonDevisContext);
  useEffect(() => {
    const currentMonDevis = document.getElementById(
      monDevis.currentMonDevisId.toString()
    );
    if (currentMonDevis) {
      currentMonDevis.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [monDevis.currentMonDevisId]);
}
