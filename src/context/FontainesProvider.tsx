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

export const MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE = 110;

export const FontainesContext = createContext<{
  fontaines: FontainesType;
  setFontaines: Dispatch<SetStateAction<FontainesType>>;
}>({
  fontaines: {
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      logoUrl: null,
      currentEspaceId: 1,
      dureeLocation: "pa12M",
      commentaires: null,
    },
    nbEspaces: 0,
    espaces: [],
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
      logoUrl: null,
      currentEspaceId: 1,
      dureeLocation: "pa12M",
      commentaires: null,
    },
    nbEspaces: 1,
    espaces: [
      {
        infos: {
          espaceId: 1,
          typeEau: ["Eau froide"],
          marque: null,
          modele: null,
          reconditionne: false,
          poseSelected: null,
        },
        quantites: {
          nbPersonnes:
            client.effectif > MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
              ? MAX_NB_PERSONNES_PAR_ESPACE_FONTAINE
              : client.effectif ?? 0,
        },
        prix: {
          prixLoc: null,
          prixInstal: null,
          prixMaintenance: null,
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
