"use client";

import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { ManagementContext } from "@/context/ManagementProvider";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { TotalServicesFm4AllContext } from "@/context/TotalServicesFm4AllProvider";
import { toast } from "@/hooks/use-toast";
import { SelectServicesFm4AllOffresType } from "@/zod-schemas/servicesFm4AllOffresType";
import { SelectServicesFm4AllTauxType } from "@/zod-schemas/servicesFm4AllTaux";
import { HandPlatter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
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
  const { client } = useContext(ClientContext);
  const { totalServicesFm4All } = useContext(TotalServicesFm4AllContext);
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const router = useRouter();
  const handleClickPrevious = () => {
    setManagement((prev) => ({
      currentManagementId: prev.currentManagementId - 1,
    }));
  };
  const handleClickNext = () => {
    const totalFinalServicesFm4All =
      servicesFm4All.infos.gammeSelected === "essentiel"
        ? (totalServicesFm4All.totalAssurance ?? 0) +
          (totalServicesFm4All.totalPlateforme ?? 0) +
          (totalServicesFm4All.totalSupportAdmin ?? 0) -
          (totalServicesFm4All.totalRemiseCa ?? 0) -
          (totalServicesFm4All.totalRemiseHof ?? 0)
        : servicesFm4All.infos.gammeSelected === "confort"
        ? (totalServicesFm4All.totalAssurance ?? 0) +
          (totalServicesFm4All.totalPlateforme ?? 0) +
          (totalServicesFm4All.totalSupportAdmin ?? 0) +
          (totalServicesFm4All.totalSupportOp ?? 0) -
          (totalServicesFm4All.totalRemiseCa ?? 0) -
          (totalServicesFm4All.totalRemiseHof ?? 0)
        : (totalServicesFm4All.totalAssurance ?? 0) +
          (totalServicesFm4All.totalPlateforme ?? 0) +
          (totalServicesFm4All.totalSupportAdmin ?? 0) +
          (totalServicesFm4All.totalSupportOp ?? 0) +
          (totalServicesFm4All.totalAccountManager ?? 0) -
          (totalServicesFm4All.totalRemiseCa ?? 0) -
          (totalServicesFm4All.totalRemiseHof ?? 0);
    if (!totalFinalServicesFm4All) {
      toast({
        variant: "destructive",
        title: "Panier vide",
        description:
          "Vous n'avez choisi aucun service, veuillez sélectionner au moins un service",
      });
      return;
    }
    setManagement({
      currentManagementId: 1,
    });
    const searchParams = new URLSearchParams();
    if (client.effectif)
      searchParams.set("effectif", client.effectif.toString());
    if (client.surface) searchParams.set("surface", client.surface.toString());
    if (client.typeBatiment)
      searchParams.set("typeBatiment", client.typeBatiment);
    if (client.typeOccupation)
      searchParams.set("typeOccupation", client.typeOccupation);
    const newCompletedSteps = [
      ...new Set([...devisProgress.completedSteps, 1, 2, 3, 4]),
    ].sort((a, b) => a - b);
    setDevisProgress({ currentStep: 5, completedSteps: newCompletedSteps });
    router.push(
      `/mon-devis/sauvegarder-ma-progression?${searchParams.toString()}`
    );
  };
  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="2">
      <PropositionsTitle
        title="Services fm4all"
        description="fm4all est votre interlocuteur unique pour toutes vos prestations. Regroupés sous un contrat et une facture, nous réalisons un pilotage à distance des prestations de services, gestion administrative et suivi qualité."
        icon={HandPlatter}
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1 overflow-auto">
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
