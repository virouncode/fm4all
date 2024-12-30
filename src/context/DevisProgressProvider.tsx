"use client";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

// Définir le type de données de progression
type DevisProgressType = {
  currentStep: number;
  completedSteps: number[];
};

export const DevisProgressContext = createContext<{
  devisProgress: DevisProgressType;
  setDevisProgress: React.Dispatch<React.SetStateAction<DevisProgressType>>;
}>({
  devisProgress: { currentStep: 1, completedSteps: [] },
  setDevisProgress: () => {},
});
const DevisProgressProvider = ({ children }: PropsWithChildren) => {
  const [devisProgress, setDevisProgress] = useState<DevisProgressType>(() => {
    if (typeof window !== "undefined") {
      const storedDevisProgress = localStorage.getItem("devisProgress");
      return storedDevisProgress
        ? JSON.parse(storedDevisProgress)
        : { currentStep: 1, completedSteps: [] };
    } else {
      return { currentStep: 1, completedSteps: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem("devisProgress", JSON.stringify(devisProgress));
  }, [devisProgress]);

  return (
    <DevisProgressContext.Provider value={{ devisProgress, setDevisProgress }}>
      {children}
    </DevisProgressContext.Provider>
  );
};

export default DevisProgressProvider;
