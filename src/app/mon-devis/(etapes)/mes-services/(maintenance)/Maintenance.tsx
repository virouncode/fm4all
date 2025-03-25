"use client";
import PropositionsTitleMobile from "@/app/mon-devis/PropositionsTitleMobile";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectLegioTarifsType } from "@/zod-schemas/legioTarifs";
import { SelectMaintenanceQuantitesType } from "@/zod-schemas/maintenanceQuantites";
import { SelectMaintenanceTarifsType } from "@/zod-schemas/maintenanceTarifs";
import { SelectQ18TarifsType } from "@/zod-schemas/q18Tarifs";
import { SelectQualiteAirTarifsType } from "@/zod-schemas/qualiteAirTarifs";
import { Wrench } from "lucide-react";
import { useContext, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import MaintenancePropositions from "./MaintenancePropositions";

type MaintenanceProps = {
  maintenanceQuantites: SelectMaintenanceQuantitesType[];
  maintenanceTarifs: SelectMaintenanceTarifsType[];
  q18Tarifs: SelectQ18TarifsType[];
  legioTarifs: SelectLegioTarifsType[];
  qualiteAirTarifs: SelectQualiteAirTarifsType[];
};

const Maintenance = ({
  maintenanceQuantites,
  maintenanceTarifs,
  q18Tarifs,
  legioTarifs,
  qualiteAirTarifs,
}: MaintenanceProps) => {
  const { setServices } = useContext(ServicesContext);
  const propositionsRef = useRef<HTMLDivElement>(null);

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

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="5">
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          title="Maintenance"
          description="Obligations légales & veille réglementaire, bien-être, petits travaux, lien avec le gestionnaire de l’immeuble... déléguez la maintenance et le suivi de vos contrôles."
          icon={Wrench}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle
          title="Maintenance"
          description="Obligations légales & veille réglementaire, bien-être, petits travaux, lien avec le gestionnaire de l’immeuble... déléguez la maintenance et le suivi de vos contrôles."
          icon={Wrench}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      {maintenanceQuantites && maintenanceTarifs && (
        <div className="w-full flex-1 overflow-auto" ref={propositionsRef}>
          <MaintenancePropositions
            maintenanceQuantites={maintenanceQuantites}
            maintenanceTarifs={maintenanceTarifs}
            q18Tarifs={q18Tarifs}
            legioTarifs={legioTarifs}
            qualiteAirTarifs={qualiteAirTarifs}
          />
        </div>
      )}
      {isTabletOrMobile ? null : (
        <PropositionsFooter handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default Maintenance;
