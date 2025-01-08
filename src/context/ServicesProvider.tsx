"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { ServicesType } from "@/zod-schemas/services";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization of context
export const ServicesContext = createContext<{
  services: ServicesType;
  setServices: Dispatch<SetStateAction<ServicesType>>;
}>({
  services: { currentServiceId: 1 },
  setServices: () => {},
});

const ServicesProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Default state initialization
  const [services, setServices] = useState<ServicesType>({
    currentServiceId: 1,
  });

  // Load data from localStorage after mounting
  useEffect(() => {
    if (isMounted) {
      const storedServices = localStorage.getItem("services");
      if (storedServices) {
        setServices(JSON.parse(storedServices));
      }
    }
  }, [isMounted]);

  // Save data to localStorage when state changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("services", JSON.stringify(services));
    }
  }, [services, isMounted]);

  // Conditional rendering to ensure client-only hooks work
  if (!isMounted) return null;

  return (
    <ServicesContext.Provider value={{ services, setServices }}>
      {children}
    </ServicesContext.Provider>
  );
};

export default ServicesProvider;
