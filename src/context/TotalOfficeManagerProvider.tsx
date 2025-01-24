"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalOfficeManagerType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalOfficeManagerContext = createContext<{
  totalOfficeManager: TotalOfficeManagerType;
  setTotalOfficeManager: Dispatch<SetStateAction<TotalOfficeManagerType>>;
}>({
  totalOfficeManager: {
    totalService: 0,
  },
  setTotalOfficeManager: () => {},
});

const TotalOfficeManagerProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalOfficeManager, setTotalOfficeManager] =
    useState<TotalOfficeManagerType>({
      totalService: 0,
    });

  useEffect(() => {
    if (isMounted) {
      const storedOfficeManager = localStorage.getItem("totalOfficeManager");
      if (storedOfficeManager) {
        setTotalOfficeManager(JSON.parse(storedOfficeManager));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        "totalOfficeManager",
        JSON.stringify(totalOfficeManager)
      );
    }
  }, [totalOfficeManager, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalOfficeManagerContext.Provider
      value={{ totalOfficeManager, setTotalOfficeManager }}
    >
      {children}
    </TotalOfficeManagerContext.Provider>
  );
};

export default TotalOfficeManagerProvider;
