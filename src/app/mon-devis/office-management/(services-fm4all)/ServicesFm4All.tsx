"use client";

import { ManagementContext } from "@/context/ManagementProvider";
import { HandPlatter } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";

const ServicesFm4All = () => {
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
      <div className="w-full flex-1"></div>
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default ServicesFm4All;
