"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalTheType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalTheContext = createContext<{
  totalThe: TotalTheType;
  setTotalThe: Dispatch<SetStateAction<TotalTheType>>;
}>({
  totalThe: {
    totalService: null,
  },
  setTotalThe: () => {},
});

const TotalTheProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalThe, setTotalThe] = useState<TotalTheType>({
    totalService: null,
  });

  useEffect(() => {
    if (isMounted) {
      const storedTotalThe = localStorage.getItem("totalThe");
      if (storedTotalThe) {
        setTotalThe(JSON.parse(storedTotalThe));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("totalThe", JSON.stringify(totalThe));
    }
  }, [totalThe, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalTheContext.Provider value={{ totalThe, setTotalThe }}>
      {children}
    </TotalTheContext.Provider>
  );
};

export default TotalTheProvider;
