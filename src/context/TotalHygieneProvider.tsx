"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalHygieneType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalHygieneContext = createContext<{
  totalHygiene: TotalHygieneType;
  setTotalHygiene: Dispatch<SetStateAction<TotalHygieneType>>;
}>({
  totalHygiene: {
    nomFournisseur: null,
    prixTrilogieAbonnement: null,
    prixTrilogieAchat: null,
    prixDesinfectantAbonnement: null,
    prixDesinfectantAchat: null,
    prixParfum: null,
    prixBalai: null,
    prixPoubelle: null,
  },
  setTotalHygiene: () => {},
});

const TotalHygieneProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalHygiene, setTotalHygiene] = useState<TotalHygieneType>({
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
      const storedTotalHygiene = localStorage.getItem("totalHygiene");
      if (storedTotalHygiene) {
        setTotalHygiene(JSON.parse(storedTotalHygiene));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("totalHygiene", JSON.stringify(totalHygiene));
    }
  }, [totalHygiene, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalHygieneContext.Provider value={{ totalHygiene, setTotalHygiene }}>
      {children}
    </TotalHygieneContext.Provider>
  );
};

export default TotalHygieneProvider;
