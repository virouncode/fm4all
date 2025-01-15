"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TheType } from "@/zod-schemas/the";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { ClientContext } from "./ClientProvider";

export const TheContext = createContext<{
  the: TheType;
  setThe: Dispatch<SetStateAction<TheType>>;
}>({
  the: {
    theGammeSelected: null,
    nbPersonnes: 0,
  },
  setThe: () => {},
});

const TheProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();
  const { client } = useContext(ClientContext);

  // Always initialize state
  const [the, setThe] = useState<TheType>({
    theGammeSelected: null,
    nbPersonnes: Math.round((client.effectif ?? 0) * 0.15),
  });

  // Update state after mounting
  useEffect(() => {
    if (isMounted) {
      const storedThe = localStorage.getItem("the");
      if (storedThe) {
        setThe(JSON.parse(storedThe));
      }
    }
  }, [isMounted]);

  // Save to localStorage when `hygiene` changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("the", JSON.stringify(the));
    }
  }, [the, isMounted]);

  // Conditional rendering after hooks are initialized
  if (!isMounted) return null;

  return (
    <TheContext.Provider value={{ the, setThe }}>
      {children}
    </TheContext.Provider>
  );
};

export default TheProvider;
