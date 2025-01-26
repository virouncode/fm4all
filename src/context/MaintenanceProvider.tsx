"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { MaintenanceType } from "@/zod-schemas/maintenance";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export const MaintenanceContext = createContext<{
  maintenance: MaintenanceType;
  setMaintenance: Dispatch<SetStateAction<MaintenanceType>>;
}>({
  maintenance: {
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      gammeSelected: null,
    },
    quantites: {
      freqAnnuelle: null,
      hParPassage: null,
    },
    prix: {
      tauxHoraire: null,
      prixQ18: null,
      prixLegio: null,
      prixQualiteAir: null,
    },
  },
  setMaintenance: () => {},
});

const MaintenanceProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [maintenance, setMaintenance] = useState<MaintenanceType>({
    infos: {
      fournisseurId: null,
      nomFournisseur: null,
      sloganFournisseur: null,
      gammeSelected: null,
    },
    quantites: {
      freqAnnuelle: null,
      hParPassage: null,
    },
    prix: {
      tauxHoraire: null,
      prixQ18: null,
      prixLegio: null,
      prixQualiteAir: null,
    },
  });

  // Update state after mounting
  useEffect(() => {
    if (isMounted) {
      const storedMaintenance = localStorage.getItem("maintenance");
      if (storedMaintenance) {
        setMaintenance(JSON.parse(storedMaintenance));
      }
    }
  }, [isMounted]);

  // Save to localStorage when `hygiene` changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("maintenance", JSON.stringify(maintenance));
    }
  }, [maintenance, isMounted]);

  // Conditional rendering after hooks are initialized
  if (!isMounted) return null;

  return (
    <MaintenanceContext.Provider value={{ maintenance, setMaintenance }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export default MaintenanceProvider;
