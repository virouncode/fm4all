"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalHygieneType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalHygieneContext = createContext<{
  totalHygiene: TotalHygieneType;
  setTotalHygiene: Dispatch<SetStateAction<TotalHygieneType>>;
}>({
  totalHygiene: {
    totalTrilogie: 0,
    totalDesinfectant: 0,
    totalParfum: 0,
    totalBalai: 0,
    totalPoubelle: 0,
    totalInstallation: 0,
  },
  setTotalHygiene: () => {},
});

const TotalHygieneProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalHygiene, setTotalHygiene] = useState<TotalHygieneType>({
    totalTrilogie: 0,
    totalDesinfectant: 0,
    totalParfum: 0,
    totalBalai: 0,
    totalPoubelle: 0,
    totalInstallation: 0,
  });

  useEffect(() => {
    if (isMounted) {
      const storedTotalHygiene = localStorage.getItem("totalHygiene");
      if (storedTotalHygiene) {
        setTotalHygiene(JSON.parse(storedTotalHygiene));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("totalHygiene", JSON.stringify(totalHygiene));
    }
  }, [totalHygiene, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalHygieneContext.Provider value={{ totalHygiene, setTotalHygiene }}>
      {children}
    </TotalHygieneContext.Provider>
  );
};

export default TotalHygieneProvider;
