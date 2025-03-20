"use client";

import { ManagementContext } from "@/context/ManagementProvider";
import useScrollIntoManagement from "@/hooks/use-scroll-into-management";
import { SelectOfficeManagerQuantitesType } from "@/zod-schemas/officeManagerQuantites";
import { SelectOfficeManagerTarifsType } from "@/zod-schemas/officeManagerTarifs";
import { UserRoundCog } from "lucide-react";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import PropositionsTitleMobile from "../../../PropositionsTitleMobile";
import OfficeManagerPropositions from "./OfficeManagerPropositions";

type OfficeManagerProps = {
  officeManagerQuantites: SelectOfficeManagerQuantitesType[];
  officeManagerTarifs: SelectOfficeManagerTarifsType[];
};

const OfficeManager = ({
  officeManagerQuantites,
  officeManagerTarifs,
}: OfficeManagerProps) => {
  const { setManagement } = useContext(ManagementContext);
  const handleClickPrevious = () => {};
  const handleClickNext = () => {
    setManagement((prev) => ({
      currentManagementId: prev.currentManagementId + 1,
    }));
  };
  useScrollIntoManagement();

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="1">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title="Office/Hospitality Manager"
          description="Gestion opérationnelle sur site, animation des bureaux, contact direct avec les occupants, gestion des imprévus en temps réel… Un expert métier dédié directement chez vous pour tout gérer ! Le nombre de demi-journées d'intervention détermine la gamme"
          icon={UserRoundCog}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          title="Office/Hospitality Manager"
          description="Gestion opérationnelle sur site, animation des bureaux, contact direct avec les occupants, gestion des imprévus en temps réel… Un expert métier dédié directement chez vous pour tout gérer ! Le nombre de demi-journées d'intervention détermine la gamme"
          icon={UserRoundCog}
          handleClickPrevious={handleClickPrevious}
          previousButton={false}
        />
      )}
      <div
        className="w-full flex-1 overflow-auto transition"
        ref={propositionsRef}
      >
        <OfficeManagerPropositions
          officeManagerQuantites={officeManagerQuantites}
          officeManagerTarifs={officeManagerTarifs}
        />
      </div>
      {!isTabletOrMobile ? (
        <PropositionsFooter
          handleClickNext={handleClickNext}
          comment="*selon lieu d'exécution les demi journées pourront être proposées en télétravail"
        />
      ) : null}
    </div>
  );
};

export default OfficeManager;
