"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalNettoyageType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalNettoyageContext = createContext<{
  totalNettoyage: TotalNettoyageType;
  setTotalNettoyage: Dispatch<SetStateAction<TotalNettoyageType>>;
}>({
  totalNettoyage: {
    nomFournisseur: null,
    prixService: null,
    prixRepasse: null,
    prixSamedi: null,
    prixDimanche: null,
    prixVitrerie: null,
  },
  setTotalNettoyage: () => {},
});

const TotalNettoyageProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalNettoyage, setTotalNettoyage] = useState<TotalNettoyageType>({
    nomFournisseur: null,
    prixService: null,
    prixRepasse: null,
    prixSamedi: null,
    prixDimanche: null,
    prixVitrerie: null,
  });

  useEffect(() => {
    if (isMounted) {
      const storedNettoyage = localStorage.getItem("totalNettoyage");
      if (storedNettoyage) {
        setTotalNettoyage(JSON.parse(storedNettoyage));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("totalNettoyage", JSON.stringify(totalNettoyage));
    }
  }, [totalNettoyage, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalNettoyageContext.Provider
      value={{ totalNettoyage, setTotalNettoyage }}
    >
      {children}
    </TotalNettoyageContext.Provider>
  );
};

export default TotalNettoyageProvider;
