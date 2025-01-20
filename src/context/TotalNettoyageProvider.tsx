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
    totalService: 0,
    totalRepasse: 0,
    totalSamedi: 0,
    totalDimanche: 0,
    totalVitrerie: 0,
  },
  setTotalNettoyage: () => {},
});

const TotalNettoyageProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalNettoyage, setTotalNettoyage] = useState<TotalNettoyageType>({
    totalService: 0,
    totalRepasse: 0,
    totalSamedi: 0,
    totalDimanche: 0,
    totalVitrerie: 0,
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
