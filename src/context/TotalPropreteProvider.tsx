"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalPropreteType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalPropreteContext = createContext<{
  totalProprete: TotalPropreteType;
  setTotalProprete: Dispatch<SetStateAction<TotalPropreteType>>;
}>({
  totalProprete: {
    nomFournisseur: null,
    prixTrilogieAbonnement: null,
    prixTrilogieAchat: null,
    prixDesinfectantAbonnement: null,
    prixDesinfectantAchat: null,
    prixParfum: null,
    prixBalai: null,
    prixPoubelle: null,
  },
  setTotalProprete: () => {},
});

const TotalPropreteProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalProprete, setTotalProprete] = useState<TotalPropreteType>({
    nomFournisseur: null,
    prixTrilogieAbonnement: null,
    prixTrilogieAchat: null,
    prixDesinfectantAbonnement: null,
    prixDesinfectantAchat: null,
    prixParfum: null,
    prixBalai: null,
    prixPoubelle: null,
  });

  useEffect(() => {
    if (isMounted) {
      const storedProprete = localStorage.getItem("totalProprete");
      if (storedProprete) {
        setTotalProprete(JSON.parse(storedProprete));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("totalProprete", JSON.stringify(totalProprete));
    }
  }, [totalProprete, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalPropreteContext.Provider value={{ totalProprete, setTotalProprete }}>
      {children}
    </TotalPropreteContext.Provider>
  );
};

export default TotalPropreteProvider;
