"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalIncendieType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalIncendieContext = createContext<{
  totalIncendie: TotalIncendieType;
  setTotalIncendie: Dispatch<SetStateAction<TotalIncendieType>>;
}>({
  totalIncendie: {
    totalService: 0,
  },
  setTotalIncendie: () => {},
});

const TotalIncendieProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalIncendie, setTotalIncendie] = useState<TotalIncendieType>({
    totalService: 0,
  });

  useEffect(() => {
    if (isMounted) {
      const storedTotalIncendie = localStorage.getItem("totalIncendie");
      if (storedTotalIncendie) {
        setTotalIncendie(JSON.parse(storedTotalIncendie));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("totalIncendie", JSON.stringify(totalIncendie));
    }
  }, [totalIncendie, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalIncendieContext.Provider value={{ totalIncendie, setTotalIncendie }}>
      {children}
    </TotalIncendieContext.Provider>
  );
};

export default TotalIncendieProvider;
