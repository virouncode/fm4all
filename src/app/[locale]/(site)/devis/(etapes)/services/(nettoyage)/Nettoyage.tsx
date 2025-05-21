"use client";
import PropositionsTitleMobile from "@/app/[locale]/(site)/devis/PropositionsTitleMobile";
import { ServicesContext } from "@/context/ServicesProvider";
import useScrollIntoService from "@/hooks/use-scroll-into-service";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { SelectHygieneMinFacturationType } from "@/zod-schemas/hygieneMinFacturation";
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites";
import { SelectRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { SprayCan } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import NettoyagePropositions from "./(desktop)/NettoyagePropositions";

type NettoyageProps = {
  nettoyageQuantites: SelectNettoyageQuantitesType[];
  nettoyageTarifs: SelectNettoyageTarifsType[];
  repasseTarifs: SelectRepasseTarifsType[];
  vitrerieTarifs: SelectVitrerieTarifsType[];
  hygieneDistribQuantite: SelectHygieneDistribQuantitesType;
  hygieneDistribTarifs: SelectHygieneDistribTarifsType[];
  hygieneDistribInstalTarifs: SelectHygieneInstalDistribTarifsType[];
  hygieneConsosTarifs: SelectHygieneConsoTarifsType[];
  hygieneMinFacturation: SelectHygieneMinFacturationType[];
};

const Nettoyage = ({
  nettoyageQuantites,
  nettoyageTarifs,
  repasseTarifs,
  vitrerieTarifs,
  hygieneDistribQuantite,
  hygieneDistribTarifs,
  hygieneDistribInstalTarifs,
  hygieneConsosTarifs,
  hygieneMinFacturation,
}: NettoyageProps) => {
  const tPresentation = useTranslations(
    "DevisPage.services.presentation.cards"
  );
  const t = useTranslations("DevisPage.services.nettoyage");
  const { setServices } = useContext(ServicesContext);
  useScrollIntoService();

  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
    }));
  };
  const handleClickNext = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId + 1,
    }));
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="1">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title={tPresentation("nettoyage-et-proprete")}
          description={t(
            "dun-nettoyage-essentiel-a-une-experience-5-etoiles-choisissez-la-prestation-proprete-qui-vous-ressemble-la-gamme-determine-la-frequence-de-passage-et-la-cadence-de-nettoyage"
          )}
          icon={SprayCan}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={SprayCan}
          title={tPresentation("nettoyage-et-proprete")}
          description={t(
            "dun-nettoyage-essentiel-a-une-experience-5-etoiles-choisissez-la-prestation-proprete-qui-vous-ressemble-la-gamme-determine-la-frequence-de-passage-et-la-cadence-de-nettoyage"
          )}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div
        className="w-full flex-1 overflow-auto transition"
        ref={propositionsRef}
      >
        <NettoyagePropositions
          nettoyageQuantites={nettoyageQuantites}
          nettoyageTarifs={nettoyageTarifs}
          repasseTarifs={repasseTarifs}
          vitrerieTarifs={vitrerieTarifs}
          hygieneDistribQuantite={hygieneDistribQuantite}
          hygieneDistribTarifs={hygieneDistribTarifs}
          hygieneDistribInstalTarifs={hygieneDistribInstalTarifs}
          hygieneConsosTarifs={hygieneConsosTarifs}
          hygieneMinFacturation={hygieneMinFacturation}
        />
      </div>
      {isTabletOrMobile ? null : (
        <PropositionsFooter handleClickNext={handleClickNext} />
      )}
    </div>
  );
};
export default Nettoyage;
