"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { CafeType } from "@/zod-schemas/cafe";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export const CafeContext = createContext<{
  cafe: CafeType;
  setCafe: Dispatch<SetStateAction<CafeType>>;
}>({
  cafe: {
    currentMachineId: null,
    cafeFournisseurId: null,
    machines: [],
  },
  setCafe: () => {},
});

const CafeProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [cafe, setCafe] = useState<CafeType>({
    currentMachineId: null,
    cafeFournisseurId: null,
    machines: [],
  });

  // Update state after mounting
  useEffect(() => {
    if (isMounted) {
      const storedCafe = localStorage.getItem("cafe");
      if (storedCafe) {
        setCafe(JSON.parse(storedCafe));
      }
    }
  }, [isMounted]);

  // Save to localStorage when `hygiene` changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cafe", JSON.stringify(cafe));
    }
  }, [cafe, isMounted]);

  // Conditional rendering after hooks are initialized
  if (!isMounted) return null;

  return (
    <CafeContext.Provider value={{ cafe, setCafe }}>
      {children}
    </CafeContext.Provider>
  );
};

export default CafeProvider;
