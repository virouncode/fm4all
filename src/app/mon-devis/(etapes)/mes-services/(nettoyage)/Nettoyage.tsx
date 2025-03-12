"use client";
import PropositionsTitleMobile from "@/app/mon-devis/PropositionsTitleMobile";
import { ServicesContext } from "@/context/ServicesProvider";
import useScrollIntoService from "@/hooks/use-scroll-into-service";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { SelectNettoyageQuantitesType } from "@/zod-schemas/nettoyageQuantites";
import { SelectRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { SprayCan } from "lucide-react";
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
}: NettoyageProps) => {
  const { services, setServices } = useContext(ServicesContext);
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
    console.log("currentServiceId+1", services.currentServiceId + 1);
  };

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="1">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title="Nettoyage et propreté"
          description="D’un nettoyage essentiel à une expérience 5 étoiles, choisissez la prestation propreté qui vous ressemble. La gamme détermine la fréquence de passage et la cadence de nettoyage"
          icon={SprayCan}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={SprayCan}
          title="Nettoyage et propreté"
          description="D’un nettoyage essentiel à une expérience 5 étoiles, choisissez la prestation propreté qui vous ressemble. La gamme détermine la fréquence de passage et la cadence de nettoyage"
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
        />
      </div>
      {isTabletOrMobile ? null : (
        <PropositionsFooter handleClickNext={handleClickNext} />
      )}
    </div>
  );
};
export default Nettoyage;
