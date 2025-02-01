"use client";
import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectLegioTarifsType } from "@/zod-schemas/legioTarifs";
import { SelectMaintenanceQuantitesType } from "@/zod-schemas/maintenanceQuantites";
import { SelectMaintenanceTarifsType } from "@/zod-schemas/maintenanceTarifs";
import { SelectQ18TarifsType } from "@/zod-schemas/q18Tarifs";
import { SelectQualiteAirTarifsType } from "@/zod-schemas/qualiteAirTarifs";
import { Wrench } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../../PropositionsFooter";
import PropositionsTitle from "../../PropositionsTitle";
import MaintenancePropositions from "./MaintenancePropositions";

type MaintenanceProps = {
  maintenanceQuantites: SelectMaintenanceQuantitesType[];
  maintenanceTarifs: SelectMaintenanceTarifsType[];
  q18Tarif: SelectQ18TarifsType;
  legioTarif: SelectLegioTarifsType;
  qualiteAirTarif: SelectQualiteAirTarifsType;
};

const Maintenance = ({
  maintenanceQuantites,
  maintenanceTarifs,
  q18Tarif,
  legioTarif,
  qualiteAirTarif,
}: MaintenanceProps) => {
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
    if (nettoyage.infos.gammeSelected && nettoyage.infos.fournisseurId) {
      if (!hygiene.infos.trilogieGammeSelected) {
        setServices((prev) => ({
          ...prev,
          currentServiceId: prev.currentServiceId - 2,
        }));
        return;
      }
      setServices((prev) => ({
        ...prev,
        currentServiceId: prev.currentServiceId - 1,
      }));
    } else {
      setServices((prev) => ({
        ...prev,
        currentServiceId: 1,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="5">
      <PropositionsTitle
        title="Maintenance"
        description="Obligations légales & veille réglementaire, bien-être, petits travaux, lien avec le gestionnaire de l’immeuble... déléguez la maintenance et le suivi de vos contrôles."
        icon={Wrench}
        handleClickPrevious={handleClickPrevious}
      />
      {maintenanceQuantites && maintenanceTarifs && (
        <div className="w-full flex-1 overflow-auto">
          <MaintenancePropositions
            maintenanceQuantites={maintenanceQuantites}
            maintenanceTarifs={maintenanceTarifs}
            q18Tarif={q18Tarif}
            legioTarif={legioTarif}
            qualiteAirTarif={qualiteAirTarif}
          />
        </div>
      )}
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default Maintenance;
