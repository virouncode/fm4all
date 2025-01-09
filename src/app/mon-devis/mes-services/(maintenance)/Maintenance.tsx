import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { Wrench } from "lucide-react";
import { useContext } from "react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";

type MaintenanceProps = {
  handleClickNext: () => void;
};

const Maintenance = ({ handleClickNext }: MaintenanceProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const { setServices } = useContext(ServicesContext);

  const handleClickPrevious = () => {
    if (nettoyage.propositionId) {
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
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="5">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center flex-1">
          <div className="flex gap-4 items-center p-4 border-2 rounded-xl">
            <Wrench />
            <p>Maintenance</p>
          </div>
          <p className="text-base italic w-2/3">
            Veille réglementaire, obligations légales, bien-être au travail,
            petits travaux, lien avec le gestionnaire de l’immeuble... déléguez
            la maintenance de vos locaux et le suivi de vos contrôles.
          </p>
        </div>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <div className="w-full flex-1">{/*MaintenancePropositions*/}</div>
      <p className="text-sm italic text-end px-1">*ma NB</p>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default Maintenance;
