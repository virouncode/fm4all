"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { IncendieType } from "@/zod-schemas/incendie";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export const IncendieContext = createContext<{
  incendie: IncendieType;
  setIncendie: Dispatch<SetStateAction<IncendieType>>;
}>({
  incendie: {
    fournisseurId: null,
    nbExtincteurs: 0,
    nbBaes: 0,
    nbTelBaes: 0,
  },
  setIncendie: () => {},
});

const IncendieProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [incendie, setIncendie] = useState<IncendieType>({
    fournisseurId: null,
    nbExtincteurs: 0,
    nbBaes: 0,
    nbTelBaes: 0,
  });

  // Update state after mounting
  useEffect(() => {
    if (isMounted) {
      const storedIncendie = localStorage.getItem("incendie");
      if (storedIncendie) {
        setIncendie(JSON.parse(storedIncendie));
      }
    }
  }, [isMounted]);

  // Save to localStorage when `hygiene` changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("incendie", JSON.stringify(incendie));
    }
  }, [incendie, isMounted]);

  // Conditional rendering after hooks are initialized
  if (!isMounted) return null;

  return (
    <IncendieContext.Provider value={{ incendie, setIncendie }}>
      {children}
    </IncendieContext.Provider>
  );
};

export default IncendieProvider;
