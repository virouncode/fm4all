"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalMaintenanceType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalMaintenanceContext = createContext<{
  totalMaintenance: TotalMaintenanceType;
  setTotalMaintenance: Dispatch<SetStateAction<TotalMaintenanceType>>;
}>({
  totalMaintenance: {
    nomFournisseur: null,
    prixMaintenance: null,
  },
  setTotalMaintenance: () => {},
});

const TotalMaintenanceProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalMaintenance, setTotalMaintenance] =
    useState<TotalMaintenanceType>({
      nomFournisseur: null,
      prixMaintenance: null,
    });

  useEffect(() => {
    if (isMounted) {
      const storedTotalMaintenance = localStorage.getItem("totalMaintenance");
      if (storedTotalMaintenance) {
        setTotalMaintenance(JSON.parse(storedTotalMaintenance));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        "totalMaintenance",
        JSON.stringify(totalMaintenance)
      );
    }
  }, [totalMaintenance, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalMaintenanceContext.Provider
      value={{ totalMaintenance, setTotalMaintenance }}
    >
      {children}
    </TotalMaintenanceContext.Provider>
  );
};

export default TotalMaintenanceProvider;
