"use client";

import PropositionsTitleMobile from "@/app/[locale]/(site)/devis/PropositionsTitleMobile";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { Toilet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import HygienePropositions from "./HygienePropositions";

type HygieneProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  hygieneDistribInstalTarifs: SelectHygieneInstalDistribTarifsType[];
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[];
};

const Hygiene = ({
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  hygieneDistribInstalTarifs,
  hygieneConsosTarifs,
}: HygieneProps) => {
  const tHygiene = useTranslations("DevisPage.services.hygiene");
  const tPresentation = useTranslations(
    "DevisPage.services.presentation.cards"
  );
  const tNettoyage = useTranslations("DevisPage.services.nettoyage");
  const { nettoyage } = useContext(NettoyageContext);
  const { services, setServices } = useContext(ServicesContext);
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
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="3">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          icon={Toilet}
          title={tPresentation("hygiene-sanitaire")}
          description={tHygiene(
            "un-tarif-forfaitaire-tout-compris-pour-vos-sanitaires-avec-distributeurs-et-consommables-mis-en-place-essuie-main-papier-savon-and-papier-hygienique-la-gamme-determine-la-finition-des-distributeurs"
          )}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={Toilet}
          title={tPresentation("hygiene-sanitaire")}
          description={tHygiene(
            "un-tarif-forfaitaire-tout-compris-pour-vos-sanitaires-avec-distributeurs-et-consommables-mis-en-place-essuie-main-papier-savon-and-papier-hygienique-la-gamme-determine-la-finition-des-distributeurs"
          )}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div className="w-full flex-1 overflow-auto" ref={propositionsRef}>
        {!nettoyage.infos.fournisseurId || !nettoyage.infos.gammeSelected ? (
          <div className="flex h-full items-center justify-center text-base lg:text-lg">
            <p className="text-center text-fm4alldestructive">
              {tNettoyage(
                "veuillez-d-abord-selectionner-une-offre-de-nettoyage"
              )}
            </p>
          </div>
        ) : (
          <HygienePropositions
            hygieneDistribQuantite={hygieneDistribQuantite}
            hygieneDistribTarifs={hygieneDistribTarifs}
            hygieneDistribInstalTarifs={hygieneDistribInstalTarifs}
            hygieneConsosTarifs={hygieneConsosTarifs}
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
