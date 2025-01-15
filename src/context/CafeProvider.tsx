"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { CafeType } from "@/zod-schemas/cafe";
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

export const CafeContext = createContext<{
  cafe: CafeType;
  setCafe: Dispatch<SetStateAction<CafeType>>;
}>({
  cafe: {
    currentMachineId: 1,
    cafeFournisseurId: null,
    machines: [],
  },
  setCafe: () => {},
});

const CafeProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();
  const { client } = useContext(ClientContext);

  // Always initialize state
  const [cafe, setCafe] = useState<CafeType>({
    currentMachineId: 1,
    cafeFournisseurId: null,
    machines: [
      {
        machineId: 1,
        typeBoissons: "cafe",
        dureeLocation: "pa12M",
        nbPersonnes: client.effectif ?? 0,
        nbMachines: 0,
        gammeSelected: null,
      },
    ],
  });

  useEffect(() => {
    if (isMounted) {
      const storedCafe = localStorage.getItem("cafe");
      if (storedCafe) {
        setCafe(JSON.parse(storedCafe));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cafe", JSON.stringify(cafe));
    }
  }, [cafe, isMounted]);

  if (!isMounted) return null;

  return (
    <CafeContext.Provider value={{ cafe, setCafe }}>
      {children}
    </CafeContext.Provider>
  );
};

export default CafeProvider;
