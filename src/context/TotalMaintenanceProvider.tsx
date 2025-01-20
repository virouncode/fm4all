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
    totalService: 0,
    totalQ18: 0,
    totalLegio: 0,
    totalQualiteAir: 0,
  },
  setTotalMaintenance: () => {},
});

const TotalMaintenanceProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalMaintenance, setTotalMaintenance] =
    useState<TotalMaintenanceType>({
      totalService: 0,
      totalQ18: 0,
      totalLegio: 0,
      totalQualiteAir: 0,
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
