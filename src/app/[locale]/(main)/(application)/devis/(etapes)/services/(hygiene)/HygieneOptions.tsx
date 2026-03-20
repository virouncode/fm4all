"use client";

import PropositionsTitleMobile from "@/app/[locale]/(main)/(application)/devis/PropositionsTitleMobile";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { useServicesStore } from "@/stores/devis/servicesStore";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs.schema";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites.schema";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs.schema";
import { Toilet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import HygieneOptionsPropositions from "./(desktop)/HygieneOptionsPropositions";

type HygieneOptionsProps = {
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[];
};

const HygieneOptions = ({
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  hygieneConsosTarifs,
}: HygieneOptionsProps) => {
  const t = useTranslations("DevisPage.services.hygiene");
  const hygiene = useHygieneStore((s) => s.hygiene);
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
  const setServices = useServicesStore((s) => s.setServices);
  const propositionsRef = useRef<HTMLDivElement>(null);
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  const handleClickNext = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId + 1,
    }));
  };
  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
    }));
  };

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4 py-2" id="4">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          icon={Toilet}
          title={t("hygiene-sanitaire-options")}
          description={
            nettoyage.infos.entrepriseId &&
            nettoyage.infos.gammeSelected &&
            hygiene.infos.trilogieGammeSelected
              ? t("choisissez-vos-options-chez") +
                " " +
                (hygiene.infos.nomPrestataire ?? "")
              : ""
          }
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={Toilet}
          title={t("hygiene-sanitaire-options")}
          description={
            nettoyage.infos.entrepriseId &&
            nettoyage.infos.gammeSelected &&
            hygiene.infos.trilogieGammeSelected
              ? t("choisissez-vos-options-chez") +
                " " +
                (hygiene.infos.nomPrestataire ?? "")
              : ""
          }
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div
        className="w-full flex-1 overflow-auto transition"
        ref={propositionsRef}
      >
        {!nettoyage.infos.gammeSelected ||
        !nettoyage.infos.entrepriseId ||
        !hygiene.infos.trilogieGammeSelected ? (
          <div className="flex h-full items-center justify-center text-base lg:text-lg">
            <p className="text-destructive text-center">
              {t(
                "veuillez-d-abord-selectionner-une-offre-de-nettoyage-et-une-offre-d-hygiene-sanitaire",
              )}
            </p>
          </div>
        ) : (
          <HygieneOptionsPropositions
            hygieneDistribQuantite={hygieneDistribQuantite}
            hygieneDistribTarifs={hygieneDistribTarifs}
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

export default HygieneOptions;
