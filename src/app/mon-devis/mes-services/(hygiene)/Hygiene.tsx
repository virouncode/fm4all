"use client";

import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { SelectHygieneInstalDistribTarifsType } from "@/zod-schemas/hygieneInstalDistribTarifs";
import { Toilet } from "lucide-react";
import { useContext } from "react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
import HygienePropositions from "./HygienePropositions";

type HygieneProps = {
  distribQuantites?: SelectHygieneDistribQuantitesType | null;
  distribTarifs?: SelectHygieneDistribTarifsType[];
  distribInstalTarif?: SelectHygieneInstalDistribTarifsType | null;
  consosTarif?: SelectHygieneConsoTarifsType | null;
};

const Hygiene = ({
  distribQuantites,
  distribTarifs,
  distribInstalTarif,
  consosTarif,
}: HygieneProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const { hygiene } = useContext(HygieneContext);
  const { services, setServices } = useContext(ServicesContext);

  const handleClickNext = () => {
    if (hygiene.trilogieGammeSelected) {
      setServices((prev) => ({
        ...prev,
        currentServiceId: services.currentServiceId + 1,
      }));
    } else {
      setServices((prev) => ({
        ...prev,
        currentServiceId: 5,
      }));
    }
  };

  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
    }));
  };

  if (!nettoyage.propositionId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="3">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="flex gap-4 items-center p-4 border-2 rounded-xl">
            <Toilet />
            <p>Hygiène sanitaire</p>
          </div>
          <p className="text-base italic w-2/3">
            Un tarif forfaitaire tout compris pour vos sanitaires avec
            distributeurs et consommables mis en place : essuie-main papier,
            savon & papier hygiénique. La gamme détermine la finition des
            distributeurs.
          </p>
        </div>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <div className="w-full flex-1">
        {distribQuantites &&
          distribTarifs &&
          distribInstalTarif &&
          consosTarif && (
            <HygienePropositions
              distribQuantites={distribQuantites}
              distribTarifs={distribTarifs}
              distribInstalTarif={distribInstalTarif}
              consosTarif={consosTarif}
            />
          )}
      </div>
      <p className="text-sm italic text-end px-1">*ma NB</p>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default Hygiene;
