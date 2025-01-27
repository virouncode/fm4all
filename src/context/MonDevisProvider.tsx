"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { MonDevisType } from "@/zod-schemas/monDevis";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization of context
export const MonDevisContext = createContext<{
  monDevis: MonDevisType;
  setMonDevis: Dispatch<SetStateAction<MonDevisType>>;
}>({
  monDevis: { currentMonDevisId: 1 },
  setMonDevis: () => {},
});

const MonDevisProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Default state initialization
  const [monDevis, setMonDevis] = useState<MonDevisType>({
    currentMonDevisId: 1,
  });

  // Load data from localStorage after mounting
  useEffect(() => {
    if (isMounted) {
      const storedMonDevis = localStorage.getItem("monDevis");
      if (storedMonDevis) {
        setMonDevis(JSON.parse(storedMonDevis));
      }
    }
  }, [isMounted]);

  // Save data to localStorage when state changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("monDevis", JSON.stringify(monDevis));
    }
  }, [monDevis, isMounted]);

  // Conditional rendering to ensure client-only hooks work
  if (!isMounted) return null;

  return (
    <MonDevisContext.Provider value={{ monDevis, setMonDevis }}>
      {children}
    </MonDevisContext.Provider>
  );
};

export default MonDevisProvider;
