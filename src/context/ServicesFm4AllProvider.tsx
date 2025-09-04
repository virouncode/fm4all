"use client";

import { SERVICES_FM4ALL_DEFAULT_VALUES } from "@/constants/constants";
import { useClientOnly } from "@/hooks/use-client-only";
import { ServicesFm4AllType } from "@/zod-schemas/servicesFm4All";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export const ServicesFm4AllContext = createContext<{
  servicesFm4All: ServicesFm4AllType;
  setServicesFm4All: Dispatch<SetStateAction<ServicesFm4AllType>>;
}>({
  servicesFm4All: SERVICES_FM4ALL_DEFAULT_VALUES,
  setServicesFm4All: () => {},
});

const ServicesFm4AllProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [servicesFm4All, setServicesFm4All] = useState<ServicesFm4AllType>(
    SERVICES_FM4ALL_DEFAULT_VALUES,
  );

  useEffect(() => {
    if (isMounted) {
      const storedServicesFm4All = localStorage.getItem("servicesFm4All");
      if (storedServicesFm4All) {
        setServicesFm4All(JSON.parse(storedServicesFm4All));
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("servicesFm4All", JSON.stringify(servicesFm4All));
    }
  }, [servicesFm4All, isMounted]);

  if (!isMounted) return null;

  return (
    <ServicesFm4AllContext.Provider
      value={{ servicesFm4All, setServicesFm4All }}
    >
      {children}
    </ServicesFm4AllContext.Provider>
  );
};

export default ServicesFm4AllProvider;
