"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { FontainesType } from "@/zod-schemas/fontaines";
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

export const FontainesContext = createContext<{
  fontaines: FontainesType;
  setFontaines: Dispatch<SetStateAction<FontainesType>>;
}>({
  fontaines: {
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      currentEspaceId: 1,
      dureeLocation: "pa12M",
      commentaires: null,
    },
    nbLotsFontaines: 0,
    lotsFontaines: [],
  },
  setFontaines: () => {},
});

const FontainesProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();
  const { client } = useContext(ClientContext);

  // Always initialize state
  const [fontaines, setFontaines] = useState<FontainesType>({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      currentEspaceId: 1,
      dureeLocation: "pa12M",
      commentaires: null,
    },
    nbLotsFontaines: 1,
    lotsFontaines: [
      {
        infos: {
          espaceId: 1,
          typeEau: "EF",
          typePose: "aposer",
          marque: null,
          modele: null,
          reconditionne: false,
        },
        quantites: {
          nbPersonnes: client.effectif ?? 0,
          nbFontaines: null,
        },
        prix: {
          prixUnitaireLoc: null,
          prixUnitaireInstal: null,
          prixUnitaireMaintenance: null,
          prixUnitaireConsoFiltres: null,
          prixUnitaireConsoCO2: null,
          prixUnitaireConsoEauChaude: null,
        },
      },
    ],
  });

  useEffect(() => {
    if (isMounted) {
      const storedFontaines = localStorage.getItem("fontaines");
      if (storedFontaines) {
        setFontaines(JSON.parse(storedFontaines));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("fontaines", JSON.stringify(fontaines));
    }
  }, [fontaines, isMounted]);

  if (!isMounted) return null;

  return (
    <FontainesContext.Provider value={{ fontaines, setFontaines }}>
      {children}
    </FontainesContext.Provider>
  );
};

export default FontainesProvider;
