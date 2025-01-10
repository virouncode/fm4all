"use client";
import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import useScrollIntoService from "@/hooks/use-scroll-into-service";
import { gammes } from "@/zod-schemas/gamme";
import { SelectMaintenanceQuantitesType } from "@/zod-schemas/maintenanceQuantites";
import { SelectMaintenanceTarifsType } from "@/zod-schemas/maintenanceTarifs";
import { Wrench } from "lucide-react";
import { useContext } from "react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
import MaintenancePropositions from "./MaintenancePropositions";

type MaintenanceProps = {
  maintenanceQuantites?: SelectMaintenanceQuantitesType[];
  maintenanceTarifs?: SelectMaintenanceTarifsType[];
};

const Maintenance = ({
  maintenanceQuantites,
  maintenanceTarifs,
}: MaintenanceProps) => {
  const { hygiene } = useContext(HygieneContext);
  const { nettoyage } = useContext(NettoyageContext);
  const { setServices } = useContext(ServicesContext);
  useScrollIntoService();

  const handleClickNext = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId + 1,
    }));
  };

  const handleClickPrevious = () => {
    if (nettoyage.propositionId) {
      if (!hygiene.trilogieGammeSelected) {
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
  const propositions =
    maintenanceTarifs && maintenanceQuantites
      ? maintenanceTarifs.map((tarif) => {
          const freqAnnuelle =
            maintenanceQuantites.find(
              (quantite) => quantite.gamme === tarif.gamme
            )?.freqAnnuelle ?? 0;
          return {
            ...tarif,
            freqAnnuelle,
            prixAnnuel: Math.round(
              tarif.hParPassage * tarif.tauxHoraire * freqAnnuelle
            ),
          };
        })
      : [];

  const propositionsByFournisseurId = propositions.reduce<
    Record<
      number,
      (SelectMaintenanceTarifsType & {
        prixAnnuel: number;
        freqAnnuelle: number;
      })[]
    >
  >((acc, item) => {
    const { fournisseurId } = item;
    if (!acc[fournisseurId]) {
      acc[fournisseurId] = [];
    }
    // Add the item to the appropriate array
    acc[fournisseurId].push(item);
    acc[fournisseurId].sort(
      (a, b) => gammes.indexOf(a.gamme) - gammes.indexOf(b.gamme)
    );
    return acc;
  }, {});

  //An array of arrays of propositions by fournisseurId
  const formattedPropositions = Object.values(propositionsByFournisseurId);
  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="5">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center p-4 border rounded-xl">
          <Wrench />
          <p>Maintenance</p>
        </div>
        <p className="text-base w-2/3 text-center italic px-4">
          Veille réglementaire, obligations légales, bien-être au travail,
          petits travaux, lien avec le gestionnaire de l’immeuble... déléguez la
          maintenance de vos locaux et le suivi de vos contrôles.
        </p>

        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      {maintenanceQuantites && maintenanceTarifs && (
        <div className="w-full flex-1">
          <MaintenancePropositions
            formattedPropositions={formattedPropositions}
            propositions={propositions}
          />
        </div>
      )}
      <p className="text-sm italic text-end px-1">
        *frais de déplacement inclus
      </p>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default Maintenance;
