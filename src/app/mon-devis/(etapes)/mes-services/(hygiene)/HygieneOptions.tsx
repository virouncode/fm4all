"use client";

import PropositionsTitleMobile from "@/app/mon-devis/PropositionsTitleMobile";
import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectHygieneConsoTarifsType } from "@/zod-schemas/hygieneConsoTarifs";
import { SelectHygieneDistribQuantitesType } from "@/zod-schemas/hygieneDistribQuantites";
import { SelectHygieneDistribTarifsType } from "@/zod-schemas/hygieneDistribTarifs";
import { Toilet } from "lucide-react";
import { useContext, useRef } from "react";
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
  const { hygiene } = useContext(HygieneContext);
  const { nettoyage } = useContext(NettoyageContext);
  const { setServices } = useContext(ServicesContext);
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

  if (
    !nettoyage.infos.gammeSelected ||
    !nettoyage.infos.fournisseurId ||
    !hygiene.infos.trilogieGammeSelected
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="4">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          icon={Toilet}
          title="Hygiène sanitaire (options)"
          description={
            "Choisissez vos options chez " +
            (hygiene.infos.nomFournisseur ?? "")
          }
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          icon={Toilet}
          title="Hygiène sanitaire (options)"
          description={
            "Choisissez vos options chez " +
            (hygiene.infos.nomFournisseur ?? "")
          }
          handleClickPrevious={handleClickPrevious}
        />
      )}
      <div className="w-full flex-1 overflow-auto" ref={propositionsRef}>
        <HygieneOptionsPropositions
          hygieneDistribQuantite={hygieneDistribQuantite}
          hygieneDistribTarifs={hygieneDistribTarifs}
          hygieneConsosTarifs={hygieneConsosTarifs}
        />
      </div>
      {isTabletOrMobile ? null : (
        <PropositionsFooter handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default HygieneOptions;
