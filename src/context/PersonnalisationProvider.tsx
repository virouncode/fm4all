"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { PersonnalisationType } from "@/zod-schemas/personnalisation";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization of context
export const PersonnalisationContext = createContext<{
  personnalisation: PersonnalisationType;
  setPersonnalisation: Dispatch<SetStateAction<PersonnalisationType>>;
}>({
  personnalisation: { currentPersonnalisationId: 1, personnalisationIds: [1] },

  setPersonnalisation: () => {},
});

const PersonnalisationProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Default state initialization
  const [personnalisation, setPersonnalisation] =
    useState<PersonnalisationType>({
      currentPersonnalisationId: 1,
      personnalisationIds: [1],
    });

  // Load data from localStorage after mounting
  useEffect(() => {
    if (isMounted) {
      const storedPersonnalisation = localStorage.getItem("personnalisation");
      if (storedPersonnalisation) {
        setPersonnalisation(JSON.parse(storedPersonnalisation));
      }
    }
  }, [isMounted]);

  // Save data to localStorage when state changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        "personnalisation",
        JSON.stringify(personnalisation)
      );
    }
  }, [personnalisation, isMounted]);

  // Conditional rendering to ensure client-only hooks work
  if (!isMounted) return null;

  return (
    <PersonnalisationContext.Provider
      value={{ personnalisation, setPersonnalisation }}
    >
      {children}
    </PersonnalisationContext.Provider>
  );
};

export default PersonnalisationProvider;
