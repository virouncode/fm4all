"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { InsertClientType } from "@/zod-schemas/client";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const ClientContext = createContext<{
  client: InsertClientType;
  setClient: Dispatch<SetStateAction<InsertClientType>>;
}>({
  client: {
    nomEntreprise: "",
    siret: null,
    prenomContact: "",
    nomContact: "",
    posteContact: "",
    emailContact: "",
    phoneContact: "",
    surface: 100,
    effectif: 20,
    typeBatiment: "bureaux",
    typeOccupation: "partieEtage",
    adresseLigne1: null,
    adresseLigne2: null,
    codePostal: "",
    ville: "",
    dateDeDemarrage: null,
    commentaires: null,
  },
  setClient: () => {},
});

const ClientProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [client, setClient] = useState<InsertClientType>({
    nomEntreprise: "",
    siret: null,
    prenomContact: "",
    nomContact: "",
    posteContact: "",
    emailContact: "",
    phoneContact: "",
    surface: 100,
    effectif: 20,
    typeBatiment: "bureaux",
    typeOccupation: "partieEtage",
    adresseLigne1: null,
    adresseLigne2: null,
    codePostal: "",
    ville: "",
    dateDeDemarrage: null,
    commentaires: null,
  });

  // Update state after mounting
  useEffect(() => {
    if (isMounted) {
      const storedClient = localStorage.getItem("client");
      if (storedClient) {
        setClient(JSON.parse(storedClient));
      }
    }
  }, [isMounted]);

  // Save to localStorage when `client` changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("client", JSON.stringify(client));
    }
  }, [client, isMounted]);

  // Conditional rendering after hooks are initialized
  if (!isMounted) return null;

  return (
    <ClientContext.Provider value={{ client, setClient }}>
      {children}
    </ClientContext.Provider>
  );
};

export default ClientProvider;
