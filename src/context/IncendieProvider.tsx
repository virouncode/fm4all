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
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      commentaires: null,
    },
    quantites: {
      nbExtincteurs: null,
      nbBaes: null,
      nbTelBaes: null,
      nbExutoires: null,
      nbAlarmesT4SSI: null,
      nbPortesCoupFeu: null,
      nbRIA: null,
      nbColonnesSeches: null,
    },
    prix: {
      prixParExtincteur: null,
      prixParBaes: null,
      prixParTelBaes: null,
      fraisDeplacement: null,
    },
  },
  setIncendie: () => {},
});

const IncendieProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [incendie, setIncendie] = useState<IncendieType>({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      commentaires: null,
    },
    quantites: {
      nbExtincteurs: null,
      nbBaes: null,
      nbTelBaes: null,
      nbExutoires: null,
      nbAlarmesT4SSI: null,
      nbPortesCoupFeu: null,
      nbRIA: null,
      nbColonnesSeches: null,
    },
    prix: {
      prixParExtincteur: null,
      prixParBaes: null,
      prixParTelBaes: null,
      fraisDeplacement: null,
    },
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
