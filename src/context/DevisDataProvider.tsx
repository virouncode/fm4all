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
      selectedServicesIds: [],
      nettoyage: {
        nettoyageFournisseurId: null,
        nettoyagePropositionId: null,
        repassePropositionId: null,
        samediPropositionId: null,
        dimanchePropositionId: null,
        vitreriePropositionId: null,
        nbPassageVitrerie: 2,
        propreteFournisseurId: null,
        trilogieGammeSelected: null,
        nbDistribEmp: 0,
        nbDistribSavon: 0,
        nbDistribPh: 0,
        nbDistribDesinfectant: 0,
        nbDistribParfum: 0,
        nbDistribBalai: 0,
        nbDistribPoubelle: 0,
        dureeLocation: "pa36M",
        desinfectantGammeSelected: null,
        parfumGammeSelected: null,
        balaiGammeSelected: null,
        poubelleGammeSelected: null,
      },
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
              selectedServicesIds: [],
              nettoyage: {
                nettoyageFournisseurId: null,
                nettoyagePropositionId: null,
                repassePropositionId: null,
                samediPropositionId: null,
                dimanchePropositionId: null,
                vitreriePropositionId: null,
                nbPassageVitrerie: 2,
                propreteFournisseurId: null,
                trilogieGammeSelected: null,
                nbDistribEmp: 0,
                nbDistribSavon: 0,
                nbDistribPh: 0,
                nbDistribDesinfectant: 0,
                nbDistribParfum: 0,
                nbDistribBalai: 0,
                nbDistribPoubelle: 0,
                dureeLocation: "pa36M",
                desinfectantGammeSelected: null,
                parfumGammeSelected: null,
                balaiGammeSelected: null,
                poubelleGammeSelected: null,
              },
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
          selectedServicesIds: [],
          nettoyage: {
            nettoyageFournisseurId: null,
            nettoyagePropositionId: null,
            repassePropositionId: null,
            samediPropositionId: null,
            dimanchePropositionId: null,
            vitreriePropositionId: null,
            nbPassageVitrerie: 2,
            propreteFournisseurId: null,
            trilogieGammeSelected: null,
            nbDistribEmp: 0,
            nbDistribSavon: 0,
            nbDistribPh: 0,
            nbDistribDesinfectant: 0,
            nbDistribParfum: 0,
            nbDistribBalai: 0,
            nbDistribPoubelle: 0,
            dureeLocation: "pa36M",
            desinfectantGammeSelected: null,
            parfumGammeSelected: null,
            balaiGammeSelected: null,
            poubelleGammeSelected: null,
          },
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
  selectedServicesIds: z.array(z.number()),
  nettoyage: z.object({
    nettoyageFournisseurId: z.number().nullable(),
    nettoyagePropositionId: z.number().nullable(),
    repassePropositionId: z.number().nullable(),
    samediPropositionId: z.number().nullable(),
    dimanchePropositionId: z.number().nullable(),
    vitreriePropositionId: z.number().nullable(),
    nbPassageVitrerie: z.number(),
    propreteFournisseurId: z.number().nullable(),
    trilogieGammeSelected: z.string().nullable(),
    nbDistribEmp: z.number(),
    nbDistribSavon: z.number(),
    nbDistribPh: z.number(),
    nbDistribDesinfectant: z.number(),
    nbDistribParfum: z.number(),
    nbDistribBalai: z.number(),
    nbDistribPoubelle: z.number(),
    dureeLocation: z.string(),
    desinfectantGammeSelected: z.string().nullable(),
    parfumGammeSelected: z.string().nullable(),
    balaiGammeSelected: z.string().nullable(),
    poubelleGammeSelected: z.string().nullable(),
  }),
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
