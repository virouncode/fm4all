"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { NettoyageType } from "@/zod-schemas/nettoyage";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const NettoyageContext = createContext<{
  nettoyage: NettoyageType;
  setNettoyage: Dispatch<SetStateAction<NettoyageType>>;
}>({
  nettoyage: {
    fournisseurId: null,
    gammeSelected: null,
    repasseSelected: false,
    samediSelected: false,
    dimancheSelected: false,
    vitrerieSelected: false,
    nbPassageVitrerie: 2,
  },
  setNettoyage: () => {},
});

const NettoyageProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [nettoyage, setNettoyage] = useState<NettoyageType>({
    fournisseurId: null,
    gammeSelected: null,
    repasseSelected: false,
    samediSelected: false,
    dimancheSelected: false,
    vitrerieSelected: false,
    nbPassageVitrerie: 2,
  });

  // Update state after mounting
  useEffect(() => {
    if (isMounted) {
      const storedNettoyage = localStorage.getItem("nettoyage");
      if (storedNettoyage) {
        setNettoyage(JSON.parse(storedNettoyage));
      }
    }
  }, [isMounted]);

  // Save to localStorage when `nettoyage` changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("nettoyage", JSON.stringify(nettoyage));
    }
  }, [nettoyage, isMounted]);

  // Conditional rendering after hooks are initialized
  if (!isMounted) return null;

  return (
    <NettoyageContext.Provider value={{ nettoyage, setNettoyage }}>
      {children}
    </NettoyageContext.Provider>
  );
};

export default NettoyageProvider;
