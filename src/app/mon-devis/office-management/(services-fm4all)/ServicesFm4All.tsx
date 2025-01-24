"use client";

import { ManagementContext } from "@/context/ManagementProvider";
import { SelectServicesFm4AllOffresType } from "@/zod-schemas/servicesFm4AllOffresType";
import { SelectServicesFm4AllTauxType } from "@/zod-schemas/servicesFm4AllTaux";
import { HandPlatter } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";
import ServicesFm4AllPropositions from "./ServicesFm4AllPropositions";

type ServicesFm4AllProps = {
  servicesFm4AllTaux: SelectServicesFm4AllTauxType[];
  servicesFm4AllOffres: SelectServicesFm4AllOffresType[];
};

const ServicesFm4All = ({
  servicesFm4AllTaux,
  servicesFm4AllOffres,
}: ServicesFm4AllProps) => {
  const { setManagement } = useContext(ManagementContext);
  const handleClickPrevious = () => {
    setManagement((prev) => ({
      currentManagementId: prev.currentManagementId - 1,
    }));
  };
  const handleClickNext = () => {
    //TODO: envoyez vers sauvgarder devis
  };
  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="2">
      <PropositionsTitle
        title="Services fm4all"
        description="fm4all est votre interlocuteur unique pour toutes vos prestations. Regroupés sous un contrat et une facture, nous réalisons un pilotage à distance des prestations de services, gestion administrative et suivi qualité."
        icon={HandPlatter}
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1">
        <ServicesFm4AllPropositions
          servicesFm4AllOffres={servicesFm4AllOffres}
          servicesFm4AllTaux={servicesFm4AllTaux}
        />
      </div>
      <PropositionsFooter
        handleClickNext={handleClickNext}
        comment={
          "\u00B9remise de 0,5% à partir d'un chiffre d'affaires de 26 000€ HT/an, \u00B2remise de 0,5% pour le choix d'un Office Manager"
        }
      />
    </div>
  );
};

export default ServicesFm4All;
