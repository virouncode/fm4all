"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { OfficeManagerType } from "@/zod-schemas/officeManager";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export const OfficeManagerContext = createContext<{
  officeManager: OfficeManagerType;
  setOfficeManager: Dispatch<SetStateAction<OfficeManagerType>>;
}>({
  officeManager: {
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      logoUrl: null,
      gammeSelected: null,
      remplace: false,
      commentaires: null,
      premium: false,
    },
    quantites: {
      demiJParSemaine: null,
    },
    prix: {
      demiTjm: null,
      demiTjmPremium: null,
    },
  },
  setOfficeManager: () => {},
});

const OfficeManagerProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [officeManager, setOfficeManager] = useState<OfficeManagerType>({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      logoUrl: null,
      gammeSelected: null,
      remplace: false,
      commentaires: null,
      premium: false,
    },
    quantites: {
      demiJParSemaine: null,
    },
    prix: {
      demiTjm: null,
      demiTjmPremium: null,
    },
  });

  useEffect(() => {
    if (isMounted) {
      const storedOfficeManager = localStorage.getItem("officeManager");
      if (storedOfficeManager) {
        setOfficeManager(JSON.parse(storedOfficeManager));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("officeManager", JSON.stringify(officeManager));
    }
  }, [officeManager, isMounted]);

  if (!isMounted) return null;

  return (
    <OfficeManagerContext.Provider value={{ officeManager, setOfficeManager }}>
      {children}
    </OfficeManagerContext.Provider>
  );
};

export default OfficeManagerProvider;
