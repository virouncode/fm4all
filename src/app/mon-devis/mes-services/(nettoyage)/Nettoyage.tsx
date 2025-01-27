"use client";
import { NettoyageContext } from "@/context/NettoyageProvider";
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
import { useContext } from "react";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";
import NettoyagePropositions from "./NettoyagePropositions";

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
  const { nettoyage } = useContext(NettoyageContext);
  const { setServices } = useContext(ServicesContext);
  //Scroller automatiquement vers le service actuel
  useScrollIntoService();

  const handleClickPrevious = () => {};
  const handleClickNext = () => {
    if (nettoyage.infos.fournisseurId && nettoyage.infos.gammeSelected) {
      setServices((prev) => ({
        ...prev,
        currentServiceId: prev.currentServiceId + 1,
      }));
    } else {
      setServices((prev) => ({
        ...prev,
        currentServiceId: 5,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="1">
      <PropositionsTitle
        title="Nettoyage et propreté"
        description="D’un nettoyage essentiel à une expérience 5 étoiles, choisissez la prestation propreté qui vous ressemble."
        icon={SprayCan}
        handleClickPrevious={handleClickPrevious}
        previousButton={false}
      />
      <div className="w-full flex-1 overflow-auto">
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
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};
export default Nettoyage;
