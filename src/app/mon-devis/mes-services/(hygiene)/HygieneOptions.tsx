"use client";

import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { Toilet } from "lucide-react";
import { useContext } from "react";
import PropositionsTitle from "../PropositionsTitle";
import HygieneOptionsPropositions from "./HygieneOptionsPropositions";
import PropositionsFooter from "../PropositionsFooter";

type HygieneOptionsProps = {
  distribQuantites?: SelectHygieneDistribQuantitesType | null;
  distribTarifs?: SelectHygieneDistribTarifsType[];
  consosTarif?: SelectHygieneConsoTarifsType | null;
};

const HygieneOptions = ({
  distribQuantites,
  distribTarifs,
  consosTarif,
}: HygieneOptionsProps) => {
  const { hygiene } = useContext(HygieneContext);
  const { nettoyage } = useContext(NettoyageContext);
  const { setServices } = useContext(ServicesContext);

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
  if (!nettoyage.propositionId || !hygiene.trilogieGammeSelected) {
    return null;
  }
  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="4">
      <PropositionsTitle
        icon={Toilet}
        title="Hygiène sanitaire"
        description={
          "Choisissez vos options en gamme chez " +
          distribTarifs?.[0]?.nomEntreprise
        }
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1">
        {distribQuantites && distribTarifs && consosTarif && (
          <HygieneOptionsPropositions
            distribQuantites={distribQuantites}
            distribTarifs={distribTarifs}
            consosTarif={consosTarif}
          />
        )}
      </div>
      <PropositionsFooter
        comment="*emplacement pour remarque"
        handleClickNext={handleClickNext}
      />
    </div>
  );
};

export default HygieneOptions;
