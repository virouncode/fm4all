"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { DevisProgressType } from "@/zod-schemas/devisProgress";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const DevisProgressContext = createContext<{
  devisProgress: DevisProgressType;
  setDevisProgress: Dispatch<SetStateAction<DevisProgressType>>;
}>({
  devisProgress: { currentStep: 1, completedSteps: [] },
  setDevisProgress: () => {},
});

const DevisProgressProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();
  const [devisProgress, setDevisProgress] = useState<DevisProgressType>({
    currentStep: 1,
    completedSteps: [],
  });

  useEffect(() => {
    if (isMounted) {
      const storedDevisProgress = localStorage.getItem("devisProgress");
      if (storedDevisProgress) {
        setDevisProgress(JSON.parse(storedDevisProgress));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("devisProgress", JSON.stringify(devisProgress));
    }
  }, [devisProgress, isMounted]);

  if (!isMounted) return null;

  return (
    <DevisProgressContext.Provider value={{ devisProgress, setDevisProgress }}>
      {children}
    </DevisProgressContext.Provider>
  );
};

export default DevisProgressProvider;
