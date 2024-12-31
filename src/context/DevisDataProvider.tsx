"use client";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { z } from "zod";
// Définir le type de données de progression
type DevisDataType = {
  firstCompanyInfo: FirstCompanyInfoType;
  services: ServicesType;
  allCompanyInfo: AllCompanyInfoType;
};

export const DevisDataContext = createContext<{
  devisData: DevisDataType;
  setDevisData: React.Dispatch<React.SetStateAction<DevisDataType>>;
}>({
  devisData: {
    firstCompanyInfo: {
      codePostal: "",
      surface: "",
      effectif: "",
      typeBatiment: "",
      typeOccupation: "",
    },
    services: {
      service1: false,
      service2: false,
      service3: false,
    },
    allCompanyInfo: {
      siret: "",
      raisonSociale: "",
      adresseLigne1: "",
      adresseLigne2: "",
      codePostal: "",
      ville: "",
      telephone: "",
      email: "",
    },
  },
  setDevisData: () => {},
});
const DevisDataProvider = ({ children }: PropsWithChildren) => {
  const [devisData, setDevisData] = useState<DevisDataType>(() => {
    if (typeof window !== "undefined") {
      const storedDevisData = localStorage.getItem("devisData");
      return storedDevisData
        ? JSON.parse(storedDevisData)
        : {
            firstCompanyInfo: {
              codePostal: "",
              surface: "",
              effectif: "",
              typeBatiment: "",
              typeOccupation: "",
            },
            services: {
              service1: false,
              service2: false,
              service3: false,
            },
            allCompanyInfo: {
              siret: "",
              raisonSociale: "",
              adresseLigne1: "",
              adresseLigne2: "",
              codePostal: "",
              ville: "",
              telephone: "",
              email: "",
            },
          };
    } else {
      return {
        firstCompanyInfo: {
          codePostal: "",
          surface: "",
          effectif: "",
          typeBatiment: "",
          typeOccupation: "",
        },
        services: {
          service1: false,
          service2: false,
          service3: false,
        },
        allCompanyInfo: {
          siret: "",
          raisonSociale: "",
          adresseLigne1: "",
          adresseLigne2: "",
          codePostal: "",
          ville: "",
          telephone: "",
          email: "",
        },
      };
    }
  });

  useEffect(() => {
    localStorage.setItem("devisData", JSON.stringify(devisData));
  }, [devisData]);

  return (
    <DevisDataContext.Provider value={{ devisData, setDevisData }}>
      {children}
    </DevisDataContext.Provider>
  );
};

export default DevisDataProvider;

export const firstInfoSchema = z.object({
  codePostal: z
    .string()
    .regex(/^\d{5}$/, "Code postal invalide : 5 chiffres attendus"),
  surface: z
    .string()
    .regex(/^\d+$/, "Surface invalide : entrez un chiffre entier"),
  effectif: z
    .string()
    .regex(/^\d+$/, "Nombre de personnes invalide : entrez un chiffre entier"),
  typeBatiment: z.string().min(1, "Veuillez renseigner un type de batiment"),
  typeOccupation: z.string().min(1, "Veuillez renseigner un type d'occupation"),
});
export type FirstCompanyInfoType = z.infer<typeof firstInfoSchema>;

export const servicesSchema = z.object({
  service1: z.boolean(),
  service2: z.boolean(),
  service3: z.boolean(),
});

export type ServicesType = z.infer<typeof servicesSchema>;

export const allCompanyInfoSchema = z.object({
  siret: z.string().min(14, "SIRET invalide"),
  raisonSociale: z.string().min(1, "Raison sociale invalide"),
  adresseLigne1: z.string().min(1, "Adresse ligne 1 invalide"),
  adresseLigne2: z.string(),
  codePostal: z.string().regex(/^\d{5}$/, "Code postal invalide"),
  ville: z.string().min(1, "Ville invalide"),
  telephone: z.string().min(10, "Téléphone invalide"),
  email: z.string().email("Adresse email invalide"),
});

export type AllCompanyInfoType = z.infer<typeof allCompanyInfoSchema>;
