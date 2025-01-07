"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { PropreteType } from "@/zod-schemas/proprete";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export const PropreteContext = createContext<{
  proprete: PropreteType;
  setProprete: Dispatch<SetStateAction<PropreteType>>;
}>({
  proprete: {
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
  setProprete: () => {},
});

const PropreteProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [proprete, setProprete] = useState<PropreteType>({
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
      const storedProprete = localStorage.getItem("proprete");
      if (storedProprete) {
        setProprete(JSON.parse(storedProprete));
      }
    }
  }, [isMounted]);

  // Save to localStorage when `proprete` changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("proprete", JSON.stringify(proprete));
    }
  }, [proprete, isMounted]);

  // Conditional rendering after hooks are initialized
  if (!isMounted) return null;

  return (
    <PropreteContext.Provider value={{ proprete, setProprete }}>
      {children}
    </PropreteContext.Provider>
  );
};

export default PropreteProvider;
