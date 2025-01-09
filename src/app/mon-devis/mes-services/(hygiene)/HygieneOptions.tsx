"use client";

import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { Toilet } from "lucide-react";
import { useContext } from "react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
import HygieneOptionsPropositions from "./HygieneOptionsPropositions";
import { HygieneContext } from "@/context/HygieneProvider";

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
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center flex-1">
          <div className="flex gap-4 items-center p-4 border-2 rounded-xl">
            <Toilet />
            <p>Hygiène sanitaire</p>
          </div>
          <p className="text-base italic w-2/3">Choisissez vos options</p>
        </div>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <div className="w-full flex-1">
        {distribQuantites && distribTarifs && consosTarif && (
          <HygieneOptionsPropositions
            distribQuantites={distribQuantites}
            distribTarifs={distribTarifs}
            consosTarif={consosTarif}
          />
        )}
      </div>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default HygieneOptions;
