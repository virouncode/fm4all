"use client";

import NextEtapeSauverButton from "@/app/[locale]/(site)/devis/NextEtapeSauverButton";
import PropositionsTitleMobile from "@/app/[locale]/(site)/devis/PropositionsTitleMobile";
import { ClientContext } from "@/context/ClientProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { ManagementContext } from "@/context/ManagementProvider";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { TotalServicesFm4AllContext } from "@/context/TotalServicesFm4AllProvider";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { SelectServicesFm4AllOffresType } from "@/zod-schemas/servicesFm4AllOffresType";
import { SelectServicesFm4AllTauxType } from "@/zod-schemas/servicesFm4AllTaux";
import { HandPlatter } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
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
  const tFm4all = useTranslations("DevisPage.pilotage.servicesFm4all");
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
        title: tFm4all("panier-vide"),
        description: tFm4all(
          "vous-navez-choisi-aucun-service-veuillez-selectionner-au-moins-un-service"
        ),
      });
      return;
    }
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
    router.push({
      pathname: "/devis/sauvegarder",
      query: Object.fromEntries(searchParams.entries()),
    });
  };

  const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 });
  const propositionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="2">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title={tFm4all("services-fm4all")}
          description={tFm4all(
            "fm4all-est-votre-interlocuteur-unique-pour-toutes-vos-prestations-regroupes-sous-un-contrat-et-une-facture-nous-realisons-un-pilotage-a-distance-des-prestations-de-services-gestion-administrative-et-suivi-qualite"
          )}
          icon={HandPlatter}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          title={tFm4all("services-fm4all")}
          description={tFm4all(
            "fm4all-est-votre-interlocuteur-unique-pour-toutes-vos-prestations-regroupes-sous-un-contrat-et-une-facture-nous-realisons-un-pilotage-a-distance-des-prestations-de-services-gestion-administrative-et-suivi-qualite"
          )}
          icon={HandPlatter}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div
        className="w-full flex-1 overflow-auto transition"
        ref={propositionsRef}
      >
        <ServicesFm4AllPropositions
          servicesFm4AllOffres={servicesFm4AllOffres}
          servicesFm4AllTaux={servicesFm4AllTaux}
        />
      </div>
      {isTabletOrMobile ? (
        <NextEtapeSauverButton />
      ) : (
        <PropositionsFooter
          handleClickNext={handleClickNext}
          comment={tFm4all(
            "u00b9remise-de-0-5-a-partir-dun-chiffre-daffaires-de-26-000eur-ht-an-u00b2remise-de-0-5-pour-le-choix-dun-office-manager"
          )}
        />
      )}
    </div>
  );
};

export default ServicesFm4All;
