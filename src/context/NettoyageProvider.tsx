"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { NettoyageType } from "@/zod-schemas/nettoyage";
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

// Initialization
export const NettoyageContext = createContext<{
  nettoyage: NettoyageType;
  setNettoyage: Dispatch<SetStateAction<NettoyageType>>;
}>({
  nettoyage: {
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      logoUrl: null,
      gammeSelected: null,
      repasseSelected: false,
      samediSelected: false,
      dimancheSelected: false,
      vitrerieSelected: false,
      plainPied: true,
      commentaires: null,
    },
    quantites: {
      freqAnnuelle: null,
      hParPassage: null,
      hParPassageRepasse: null,
      surfaceCloisons: null,
      surfaceVitres: null,
      cadenceCloisons: null,
      cadenceVitres: null,
      nbPassagesVitrerie: 2,
    },
    prix: {
      tauxHoraire: null,
      tauxHoraireRepasse: null,
      tauxHoraireVitrerie: null,
      minFacturationVitrerie: null,
    },
  },
  setNettoyage: () => {},
});

const NettoyageProvider = ({ children }: PropsWithChildren) => {
  const { client } = useContext(ClientContext);
  const isMounted = useClientOnly();

  // Always initialize state
  const [nettoyage, setNettoyage] = useState<NettoyageType>({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      logoUrl: null,
      gammeSelected: null,
      repasseSelected: false,
      samediSelected: false,
      dimancheSelected: false,
      vitrerieSelected: false,
      plainPied: true,
      commentaires: null,
    },
    quantites: {
      freqAnnuelle: null,
      hParPassage: null,
      hParPassageRepasse: null,
      surfaceCloisons: (client.surface ?? 0) * 0.15,
      surfaceVitres: (client.surface ?? 0) * 0.15,
      cadenceCloisons: null,
      cadenceVitres: null,
      nbPassagesVitrerie: 2,
    },
    prix: {
      tauxHoraire: null,
      tauxHoraireRepasse: null,
      tauxHoraireVitrerie: null,
      minFacturationVitrerie: null,
    },
  });

  // Update state after mounting
  useEffect(() => {
    if (isMounted) {
      const storedNettoyage = localStorage.getItem("nettoyage");
      if (storedNettoyage) {
        setNettoyage(JSON.parse(storedNettoyage));
      }
    }
  }, [isMounted]);

  // Save to localStorage when `nettoyage` changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("nettoyage", JSON.stringify(nettoyage));
    }
  }, [nettoyage, isMounted]);

  // Conditional rendering after hooks are initialized
  if (!isMounted) return null;

  return (
    <NettoyageContext.Provider value={{ nettoyage, setNettoyage }}>
      {children}
    </NettoyageContext.Provider>
  );
};

export default NettoyageProvider;
