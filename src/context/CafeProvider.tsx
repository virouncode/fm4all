"use client";

import { MAX_NB_PERSONNES_PAR_ESPACE } from "@/app/mon-devis/food-beverage/(cafe)/CafeEspacePropositions";
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
      currentEspaceId: 1,
      dureeLocation: "pa12M",
      commentaires: null,
    },
    nbEspaces: 0,
    espaces: [],
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
      currentEspaceId: 1,
      dureeLocation: "pa12M",
      commentaires: null,
    },
    nbEspaces: 1,
    espaces: [
      {
        infos: {
          espaceId: 1,
          typeBoissons: "cafe",
          typeLait: null,
          typeChocolat: null,
          gammeCafeSelected: null,
          marque: null,
          modele: null,
          reconditionne: false,
        },
        quantites: {
          nbPersonnes:
            client.effectif > MAX_NB_PERSONNES_PAR_ESPACE
              ? MAX_NB_PERSONNES_PAR_ESPACE
              : client.effectif ?? 0,
          nbMachines: null,
          nbPassagesParAn: null,
        },
        prix: {
          prixLoc: null,
          prixInstal: null,
          prixMaintenance: null,
          prixUnitaireConsoCafe: null,
          prixUnitaireConsoLait: null,
          prixUnitaireConsoChocolat: null,
          prixUnitaireConsoSucre: null,
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
