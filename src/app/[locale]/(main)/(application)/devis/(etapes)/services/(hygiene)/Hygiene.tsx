"use client";

import PropositionsTitleMobile from "@/app/[locale]/(main)/(application)/devis/PropositionsTitleMobile";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { useServicesStore } from "@/stores/devis/servicesStore";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs.schema";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs.schema";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs.schema";
import { SelectHygieneMinFacturationType } from "@/zod-schemas/hygieneMinFacturation.schema";
import { Toilet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import HygienePropositions from "./HygienePropositions";

type HygieneProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  hygieneDistribInstalTarifs: SelectHygieneInstalDistribTarifsType[];
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[];
  hygieneMinFacturation: SelectHygieneMinFacturationType[];
};

const Hygiene = ({
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  hygieneDistribInstalTarifs,
  hygieneConsosTarifs,
  hygieneMinFacturation,
}: HygieneProps) => {
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const tPresentation = useTranslations(
    "DevisPage.services.presentation.cards",
  );
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
  const { services, setServices } = useServicesStore(
    useShallow((s) => ({
      services: s.services,
      setServices: s.setServices,
    })),
  );
  const propositionsRef = useRef<HTMLDivElement>(null);

  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
    }));
  };
  const handleClickNext = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: services.currentServiceId + 1,
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4 py-2" id="3">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          icon={Toilet}
          title={tPresentation("hygiene-sanitaire")}
          description={tHygiene(
            "un-tarif-forfaitaire-tout-compris-pour-vos-sanitaires-avec-distributeurs-et-consommables-mis-en-place-essuie-main-papier-savon-and-papier-hygienique-la-gamme-determine-la-finition-des-distributeurs",
          )}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={Toilet}
          title={tPresentation("hygiene-sanitaire")}
          description={tHygiene(
            "un-tarif-forfaitaire-tout-compris-pour-vos-sanitaires-avec-distributeurs-et-consommables-mis-en-place-essuie-main-papier-savon-and-papier-hygienique-la-gamme-determine-la-finition-des-distributeurs",
          )}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div className="w-full flex-1 overflow-auto" ref={propositionsRef}>
        {!nettoyage.infos.entrepriseId || !nettoyage.infos.gammeSelected ? (
          <div className="flex h-full items-center justify-center text-base lg:text-lg">
            <p className="text-destructive text-center">
              {tNettoyage(
                "veuillez-d-abord-selectionner-une-offre-de-nettoyage",
              )}
            </p>
          </div>
        ) : (
          <HygienePropositions
            hygieneDistribQuantite={hygieneDistribQuantite}
            hygieneDistribTarifs={hygieneDistribTarifs}
            hygieneDistribInstalTarifs={hygieneDistribInstalTarifs}
            hygieneConsosTarifs={hygieneConsosTarifs}
            hygieneMinFacturation={hygieneMinFacturation}
          />
        )}
      </div>
      {isTabletOrMobile ? null : (
        <PropositionsFooter handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default Hygiene;
