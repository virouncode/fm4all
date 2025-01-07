"use client";

import { useClientOnly } from "@/hooks/use-client-only";
import { CompanyInfoType } from "@/zod-schemas/companyInfo";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";

// Initialization
export const CompanyInfoContext = createContext<{
  companyInfo: CompanyInfoType;
  setCompanyInfo: Dispatch<SetStateAction<CompanyInfoType>>;
}>({
  companyInfo: {
    siret: "",
    nomEntreprise: "",
    nomContact: "",
    prenomContact: "",
    posteContact: "",
    adresseLigne1: "",
    adresseLigne2: "",
    codePostal: "",
    ville: "",
    phone: "",
    email: "",
    surface: "",
    effectif: "",
    typeBatiment: "bureaux",
    typeOccupation: "partieEtage",
  },
  setCompanyInfo: () => {},
});

const CompanyInfoProvider = ({ children }: PropsWithChildren) => {
  const isMounted = useClientOnly();

  // Always initialize state
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoType>({
    siret: "",
    nomEntreprise: "",
    nomContact: "",
    prenomContact: "",
    posteContact: "",
    adresseLigne1: "",
    adresseLigne2: "",
    codePostal: "",
    ville: "",
    phone: "",
    email: "",
    surface: "",
    effectif: "",
    typeBatiment: "bureaux",
    typeOccupation: "partieEtage",
  });

  // Update state after mounting
  useEffect(() => {
    if (isMounted) {
      const storedCompanyInfo = localStorage.getItem("companyInfo");
      if (storedCompanyInfo) {
        setCompanyInfo(JSON.parse(storedCompanyInfo));
      }
    }
  }, [isMounted]);

  // Save to localStorage when `companyInfo` changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("companyInfo", JSON.stringify(companyInfo));
    }
  }, [companyInfo, isMounted]);

  // Conditional rendering after hooks are initialized
  if (!isMounted) return null;

  return (
    <CompanyInfoContext.Provider value={{ companyInfo, setCompanyInfo }}>
      {children}
    </CompanyInfoContext.Provider>
  );
};

export default CompanyInfoProvider;
