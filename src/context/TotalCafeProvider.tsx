"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalCafeType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalCafeContext = createContext<{
  totalCafe: TotalCafeType;
  setTotalCafe: Dispatch<SetStateAction<TotalCafeType>>;
}>({
  totalCafe: {
    nomFournisseur: null,
    prixCafeMachines: [],
    prixThe: null,
  },
  setTotalCafe: () => {},
});

const TotalCafeProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalCafe, setTotalCafe] = useState<TotalCafeType>({
    nomFournisseur: null,
    prixCafeMachines: [],
    prixThe: null,
  });

  useEffect(() => {
    if (isMounted) {
      const storedTotalCafe = localStorage.getItem("totalCafe");
      if (storedTotalCafe) {
        setTotalCafe(JSON.parse(storedTotalCafe));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("totalCafe", JSON.stringify(totalCafe));
    }
  }, [totalCafe, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalCafeContext.Provider value={{ totalCafe, setTotalCafe }}>
      {children}
    </TotalCafeContext.Provider>
  );
};

export default TotalCafeProvider;
