"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalContext = createContext<{
  total: TotalType;
  setTotal: Dispatch<SetStateAction<TotalType>>;
}>({
  total: {
    totalAnnuelHt: null,
    totalInstallationHt: null,
  },
  setTotal: () => {},
});

const TotalProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [total, setTotal] = useState<TotalType>({
    totalAnnuelHt: null,
    totalInstallationHt: null,
  });

  useEffect(() => {
    if (isMounted) {
      const storedTotal = localStorage.getItem("total");
      if (storedTotal) {
        setTotal(JSON.parse(storedTotal));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("total", JSON.stringify(total));
    }
  }, [total, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalContext.Provider value={{ total, setTotal }}>
      {children}
    </TotalContext.Provider>
  );
};

export default TotalProvider;
