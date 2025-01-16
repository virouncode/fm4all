"use client";

import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { Toilet } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../PropositionsFooter";
import PropositionsTitle from "../PropositionsTitle";
import HygieneOptionsPropositions from "./HygieneOptionsPropositions";

type HygieneOptionsProps = {
  distribQuantites?: SelectHygieneDistribQuantitesType | null;
  distribTarifs?: SelectHygieneDistribTarifsType[];
  consosTarifs?: SelectHygieneConsoTarifsType[];
};

const HygieneOptions = ({
  distribQuantites,
  distribTarifs,
  consosTarifs,
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
  if (
    !nettoyage.gammeSelected ||
    !nettoyage.fournisseurId ||
    !hygiene.trilogieGammeSelected
  ) {
    return null;
  }
  const distribTarifsDuFournisseur = distribTarifs?.filter(
    (tarif) => tarif.fournisseurId === hygiene.fournisseurId
  );
  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="4">
      <PropositionsTitle
        icon={Toilet}
        title="Hygiène sanitaire"
        description={
          "Choisissez vos options en gamme chez " +
          (distribTarifsDuFournisseur?.[0]?.nomEntreprise ?? "")
        }
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1">
        {distribQuantites && distribTarifs && consosTarifs && (
          <HygieneOptionsPropositions
            distribQuantites={distribQuantites}
            distribTarifs={distribTarifs}
            consosTarifs={consosTarifs}
          />
        )}
      </div>
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default HygieneOptions;
