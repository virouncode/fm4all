"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { CafeType } from "@/zod-schemas/cafe";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { ClientContext } from "./ClientProvider";

export const CafeContext = createContext<{
  cafe: CafeType;
  setCafe: Dispatch<SetStateAction<CafeType>>;
}>({
  cafe: {
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      currentLotId: 1,
      dureeLocation: "pa12M",
      commentaires: null,
    },
    nbLotsMachines: 0,
    lotsMachines: [],
  },
  setCafe: () => {},
});

const CafeProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();
  const { client } = useContext(ClientContext);

  // Always initialize state
  const [cafe, setCafe] = useState<CafeType>({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      currentLotId: 1,
      dureeLocation: "pa12M",
      commentaires: null,
    },
    nbLotsMachines: 1,
    lotsMachines: [
      {
        infos: {
          lotId: 1,
          typeBoissons: "cafe",
          gammeCafeSelected: null,
          marque: null,
          modele: null,
          reconditionne: false,
        },
        quantites: {
          nbPersonnes: client.effectif ?? 0,
          nbMachines: null,
        },
        prix: {
          prixUnitaireLoc: null,
          prixUnitaireInstal: null,
          prixUnitaireMaintenance: null,
          prixUnitaireConsoCafe: null,
          prixUnitaireConsoLait: null,
          prixUnitaireConsoChocolat: null,
        },
      },
    ],
  });

  useEffect(() => {
    if (isMounted) {
      const storedCafe = localStorage.getItem("cafe");
      if (storedCafe) {
        setCafe(JSON.parse(storedCafe));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cafe", JSON.stringify(cafe));
    }
  }, [cafe, isMounted]);

  if (!isMounted) return null;

  return (
    <CafeContext.Provider value={{ cafe, setCafe }}>
      {children}
    </CafeContext.Provider>
  );
};

export default CafeProvider;
