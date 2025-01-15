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
import PropositionsFooter from "../PropositionsFooter";
import PropositionsTitle from "../PropositionsTitle";
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

  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
    }));
  };
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

  if (!nettoyage.gammeSelected || !nettoyage.fournisseurId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="3">
      <PropositionsTitle
        icon={Toilet}
        title="Hygiène sanitaire"
        description="Un tarif forfaitaire tout compris pour vos sanitaires avec distributeurs et consommables mis en place : essuie-main papier, savon & papier hygiénique. La gamme détermine la finition des distributeurs."
        handleClickPrevious={handleClickPrevious}
      />
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
      <PropositionsFooter
        comment="*emplacement pour remarque"
        handleClickNext={handleClickNext}
      />
    </div>
  );
};

export default Hygiene;
