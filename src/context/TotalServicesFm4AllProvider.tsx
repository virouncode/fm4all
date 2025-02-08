"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { TotalServicesFm4AllType } from "@/zod-schemas/total";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const TotalServicesFm4AllContext = createContext<{
  totalServicesFm4All: TotalServicesFm4AllType;
  setTotalServicesFm4All: Dispatch<SetStateAction<TotalServicesFm4AllType>>;
}>({
  totalServicesFm4All: {
    totalAssurance: null,
    totalPlateforme: null,
    totalSupportAdmin: null,
    totalSupportOp: null,
    totalAccountManager: null,
    totalRemiseCa: null,
    totalRemiseHof: null,
  },
  setTotalServicesFm4All: () => {},
});

const TotalServicesFm4AllProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [totalServicesFm4All, setTotalServicesFm4All] =
    useState<TotalServicesFm4AllType>({
      totalAssurance: null,
      totalPlateforme: null,
      totalSupportAdmin: null,
      totalSupportOp: null,
      totalAccountManager: null,
      totalRemiseCa: null,
      totalRemiseHof: null,
    });

  useEffect(() => {
    if (isMounted) {
      const storedServicesFm4All = localStorage.getItem("totalServicesFm4All");
      if (storedServicesFm4All) {
        setTotalServicesFm4All(JSON.parse(storedServicesFm4All));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        "totalServicesFm4All",
        JSON.stringify(totalServicesFm4All)
      );
    }
  }, [totalServicesFm4All, isMounted]);

  if (!isMounted) return null;

  return (
    <TotalServicesFm4AllContext.Provider
      value={{ totalServicesFm4All, setTotalServicesFm4All }}
    >
      {children}
    </TotalServicesFm4AllContext.Provider>
  );
};

export default TotalServicesFm4AllProvider;
