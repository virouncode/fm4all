import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { useTranslations } from "next-intl";
import React from "react";
import HygieneMobileDistribQuantitesInputs from "./HygieneMobileDistribQuantitesInputs";
import HygieneMobileTrilogieCarousel from "./HygieneMobileTrilogieCarousel";

type HygieneMobilePropositionsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  handleChangeDistribNbr: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => void;
  handleChangeDureeLocation: (
    value: "oneShot" | "pa12M" | "pa24M" | "pa36M"
  ) => void;
  nbDistribEmp: number;
  nbDistribSavon: number;
  nbDistribPh: number;
  dureeLocation: "oneShot" | "pa12M" | "pa24M" | "pa36M";
  handleClickProposition: (proposition: {
    gamme: "essentiel" | "confort" | "excellence";
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribEmpPoubelle: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    totalAnnuelTrilogie: number | null;
    minFacturation: number | null;
    imageUrlEmp: string | null;
    imageUrlSavon: string | null;
    imageUrlPh: string | null;
  }) => void;
  prixInstalDistrib: number | null;
  propositions: {
    gamme: "essentiel" | "confort" | "excellence";
    nomFournisseur: string;
    sloganFournisseur: string | null;
    logoUrl: string | null;
    locationUrl: string | null;
    anneeCreation: number | null;
    ca: string | null;
    effectifFournisseur: string | null;
    nbClients: number | null;
    noteGoogle: string | null;
    nbAvis: number | null;
    nbDistribEmp: number;
    nbDistribSavon: number;
    nbDistribPh: number;
    prixDistribEmp: number | null;
    prixDistribEmpPoubelle: number | null;
    prixDistribSavon: number | null;
    prixDistribPh: number | null;
    prixInstalDistrib: number | null;
    totalAnnuelTrilogie: number | null;
    minFacturation: number | null;
    imageUrlEmp: string | null;
    imageUrlSavon: string | null;
    imageUrlPh: string | null;
  }[];

  handleIncrement: (type: "emp" | "savon" | "ph") => void;
  handleDecrement: (type: "emp" | "savon" | "ph") => void;
};

const HygieneMobilePropositions = ({
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  handleChangeDistribNbr,
  handleChangeDureeLocation,
  nbDistribEmp,
  nbDistribSavon,
  nbDistribPh,
  dureeLocation,
  handleClickProposition,
  prixInstalDistrib,
  propositions,
  handleIncrement,
  handleDecrement,
}: HygieneMobilePropositionsProps) => {
  const t = useTranslations("DevisPage.services.hygiene");
  return (
    <div className="flex flex-col gap-6 w-full">
      <p className="font-bold text-xl lg:hidden">
        {t("essuie-mains-papier-savon-papier-hygienique")}
      </p>
      <HygieneMobileDistribQuantitesInputs
        hygieneDistribQuantite={hygieneDistribQuantite}
        hygieneDistribTarifs={hygieneDistribTarifs}
        handleChangeDistribNbr={handleChangeDistribNbr}
        handleChangeDureeLocation={handleChangeDureeLocation}
        nbDistribEmp={nbDistribEmp}
        nbDistribSavon={nbDistribSavon}
        nbDistribPh={nbDistribPh}
        dureeLocation={dureeLocation}
        handleIncrement={handleIncrement}
        handleDecrement={handleDecrement}
      />
      <HygieneMobileTrilogieCarousel
        propositions={propositions}
        handleClickProposition={handleClickProposition}
        prixInstalDistrib={prixInstalDistrib}
      />
    </div>
  );
};

export default HygieneMobilePropositions;
