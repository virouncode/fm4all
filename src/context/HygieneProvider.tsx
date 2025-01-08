"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { HygieneType } from "@/zod-schemas/hygiene";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export const HygieneContext = createContext<{
  hygiene: HygieneType;
  setHygiene: Dispatch<SetStateAction<HygieneType>>;
}>({
  hygiene: {
    fournisseurId: null,
    nbDistribEmp: 0,
    nbDistribSavon: 0,
    nbDistribPh: 0,
    nbDistribDesinfectant: 0,
    nbDistribParfum: 0,
    nbDistribBalai: 0,
    nbDistribPoubelle: 0,
    dureeLocation: "pa36M",
    trilogieGammeSelected: null,
    desinfectantGammeSelected: null,
    parfumGammeSelected: null,
    balaiGammeSelected: null,
    poubelleGammeSelected: null,
  },
  setHygiene: () => {},
});

const HygieneProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [hygiene, setHygiene] = useState<HygieneType>({
    fournisseurId: null,
    nbDistribEmp: 0,
    nbDistribSavon: 0,
    nbDistribPh: 0,
    nbDistribDesinfectant: 0,
    nbDistribParfum: 0,
    nbDistribBalai: 0,
    nbDistribPoubelle: 0,
    dureeLocation: "pa36M",
    trilogieGammeSelected: null,
    desinfectantGammeSelected: null,
    parfumGammeSelected: null,
    balaiGammeSelected: null,
    poubelleGammeSelected: null,
  });

  // Update state after mounting
  useEffect(() => {
    if (isMounted) {
      const storedHygiene = localStorage.getItem("hygiene");
      if (storedHygiene) {
        setHygiene(JSON.parse(storedHygiene));
      }
    }
  }, [isMounted]);

  // Save to localStorage when `hygiene` changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("hygiene", JSON.stringify(hygiene));
    }
  }, [hygiene, isMounted]);

  // Conditional rendering after hooks are initialized
  if (!isMounted) return null;

  return (
    <HygieneContext.Provider value={{ hygiene, setHygiene }}>
      {children}
    </HygieneContext.Provider>
  );
};

export default HygieneProvider;
