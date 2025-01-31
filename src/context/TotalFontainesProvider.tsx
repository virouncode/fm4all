"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalFontainesType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalFontainesContext = createContext<{
  totalFontaines: TotalFontainesType;
  setTotalFontaines: Dispatch<SetStateAction<TotalFontainesType>>;
}>({
  totalFontaines: {
    totalLotsFontaines: [],
  },
  setTotalFontaines: () => {},
});

const TotalFontainesProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalFontaines, setTotalFontaines] = useState<TotalFontainesType>({
    totalLotsFontaines: [
      {
        espaceId: 1,
        total: null,
        totalInstallation: null,
      },
    ],
  });

  useEffect(() => {
    if (isMounted) {
      const storedTotalFontaines = localStorage.getItem("totalFontaines");
      if (storedTotalFontaines) {
        setTotalFontaines(JSON.parse(storedTotalFontaines));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("totalFontaines", JSON.stringify(totalFontaines));
    }
  }, [totalFontaines, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalFontainesContext.Provider
      value={{ totalFontaines, setTotalFontaines }}
    >
      {children}
    </TotalFontainesContext.Provider>
  );
};

export default TotalFontainesProvider;
