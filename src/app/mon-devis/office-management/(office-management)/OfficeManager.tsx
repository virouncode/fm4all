"use client";

import { ManagementContext } from "@/context/ManagementProvider";
import useScrollIntoManagement from "@/hooks/use-scroll-into-management";
import { UserRoundCog } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";

const OfficeManager = () => {
  const { setManagement } = useContext(ManagementContext);
  const handleClickPrevious = () => {};
  const handleClickNext = () => {
    setManagement((prev) => ({
      currentManagementId: prev.currentManagementId + 1,
    }));
  };
  useScrollIntoManagement();
  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="1">
      <PropositionsTitle
        title="Office/Hospitality Manager"
        description="Gestion opérationnelle sur site, animation des bureaux, contact direct avec les occupants, gestion des imprévus en temps réel… Un expert métier dédié directement chez vous pour tout gérer !"
        icon={UserRoundCog}
        handleClickPrevious={handleClickPrevious}
        previousButton={false}
      />
      <div className="w-full flex-1"></div>
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default OfficeManager;
