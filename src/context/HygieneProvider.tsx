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
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      dureeLocation: "pa12M",
      trilogieGammeSelected: "essentiel",
      desinfectantGammeSelected: null,
      parfumGammeSelected: null,
      balaiGammeSelected: null,
      poubelleGammeSelected: null,
      commentaires: null,
    },
    quantites: {
      nbDistribEmp: null,
      nbDistribSavon: null,
      nbDistribPh: null,
      nbDistribDesinfectant: null,
      nbDistribParfum: null,
      nbDistribBalai: null,
      nbDistribPoubelle: null,
    },
    prix: {
      prixDistribEmp: null,
      prixDistribSavon: null,
      prixDistribPh: null,
      prixDistribDesinfectant: null,
      prixDistribParfum: null,
      prixDistribBalai: null,
      prixDistribPoubelle: null,
      prixInstalDistrib: null,
      paParPersonneEmp: null,
      paParPersonneSavon: null,
      paParPersonnePh: null,
      paParPersonneDesinfectant: null,
    },
  },
  setHygiene: () => {},
});

const HygieneProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [hygiene, setHygiene] = useState<HygieneType>({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      dureeLocation: "pa12M",
      trilogieGammeSelected: "essentiel",
      desinfectantGammeSelected: null,
      parfumGammeSelected: null,
      balaiGammeSelected: null,
      poubelleGammeSelected: null,
      commentaires: null,
    },
    quantites: {
      nbDistribEmp: null,
      nbDistribSavon: null,
      nbDistribPh: null,
      nbDistribDesinfectant: null,
      nbDistribParfum: null,
      nbDistribBalai: null,
      nbDistribPoubelle: null,
    },
    prix: {
      prixDistribEmp: null,
      prixDistribSavon: null,
      prixDistribPh: null,
      prixDistribDesinfectant: null,
      prixDistribParfum: null,
      prixDistribBalai: null,
      prixInstalDistrib: null,
      prixDistribPoubelle: null,
      paParPersonneEmp: null,
      paParPersonneSavon: null,
      paParPersonnePh: null,
      paParPersonneDesinfectant: null,
    },
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
