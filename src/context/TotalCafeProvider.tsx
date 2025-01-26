"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalCafeType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalCafeContext = createContext<{
  totalCafe: TotalCafeType;
  setTotalCafe: Dispatch<SetStateAction<TotalCafeType>>;
}>({
  totalCafe: {
    totalMachines: [],
  },
  setTotalCafe: () => {},
});

const TotalCafeProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalCafe, setTotalCafe] = useState<TotalCafeType>({
    totalMachines: [
      {
        lotId: 1,
        total: null,
        totalInstallation: null,
      },
    ],
  });

  useEffect(() => {
    if (isMounted) {
      const storedTotalCafe = localStorage.getItem("totalCafe");
      if (storedTotalCafe) {
        setTotalCafe(JSON.parse(storedTotalCafe));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("totalCafe", JSON.stringify(totalCafe));
    }
  }, [totalCafe, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalCafeContext.Provider value={{ totalCafe, setTotalCafe }}>
      {children}
    </TotalCafeContext.Provider>
  );
};

export default TotalCafeProvider;
