"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalSnacksFruitsType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalSnacksFruitsContext = createContext<{
  totalSnacksFruits: TotalSnacksFruitsType;
  setTotalSnacksFruits: Dispatch<SetStateAction<TotalSnacksFruitsType>>;
}>({
  totalSnacksFruits: {
    totalFruits: null,
    totalSnacks: null,
    totalBoissons: null,
    totalLivraison: null,
    total: null,
    totalSansRemise: null,
  },
  setTotalSnacksFruits: () => {},
});

const TotalSnacksFruitsProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalSnacksFruits, setTotalSnacksFruits] =
    useState<TotalSnacksFruitsType>({
      totalFruits: null,
      totalSnacks: null,
      totalBoissons: null,
      totalLivraison: null,
      total: null,
      totalSansRemise: null,
    });

  useEffect(() => {
    if (isMounted) {
      const storedTotalSnacksFruits = localStorage.getItem("totalSnacksFruits");
      if (storedTotalSnacksFruits) {
        setTotalSnacksFruits(JSON.parse(storedTotalSnacksFruits));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        "totalSnacksFruits",
        JSON.stringify(totalSnacksFruits)
      );
    }
  }, [totalSnacksFruits, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalSnacksFruitsContext.Provider
      value={{ totalSnacksFruits, setTotalSnacksFruits }}
    >
      {children}
    </TotalSnacksFruitsContext.Provider>
  );
};

export default TotalSnacksFruitsProvider;
