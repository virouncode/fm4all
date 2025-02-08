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
    totalTrilogie: null,
    totalDesinfectant: null,
    totalParfum: null,
    totalBalai: null,
    totalPoubelle: null,
    totalInstallation: null,
  },
  setTotalHygiene: () => {},
});

const TotalHygieneProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalHygiene, setTotalHygiene] = useState<TotalHygieneType>({
    totalTrilogie: null,
    totalDesinfectant: null,
    totalParfum: null,
    totalBalai: null,
    totalPoubelle: null,
    totalInstallation: null,
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
