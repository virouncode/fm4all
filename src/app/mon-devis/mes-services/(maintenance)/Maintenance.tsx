"use client";
import { HygieneContext } from "@/context/HygieneProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { gammes } from "@/zod-schemas/gamme";
import { SelectMaintenanceQuantitesType } from "@/zod-schemas/maintenanceQuantites";
import { SelectMaintenanceTarifsType } from "@/zod-schemas/maintenanceTarifs";
import { Wrench } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../PropositionsFooter";
import PropositionsTitle from "../PropositionsTitle";
import MaintenancePropositions from "./MaintenancePropositions";

type MaintenanceProps = {
  maintenanceQuantites: SelectMaintenanceQuantitesType[];
  maintenanceTarifs: SelectMaintenanceTarifsType[];
};

const Maintenance = ({
  maintenanceQuantites,
  maintenanceTarifs,
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

  const propositions = maintenanceTarifs.map((tarif) => {
    const {
      id,
      gamme,
      nomFournisseur,
      slogan: sloganFournisseur,
      fournisseurId,
      hParPassage,
      tauxHoraire,
    } = tarif;
    const freqAnnuelle =
      maintenanceQuantites.find((quantite) => quantite.gamme === tarif.gamme)
        ?.freqAnnuelle ?? 0;
    return {
      id,
      gamme,
      nomFournisseur,
      fournisseurId,
      sloganFournisseur,
      hParPassage,
      tauxHoraire,
      freqAnnuelle,
      prixAnnuel: Math.round(
        tarif.hParPassage * tarif.tauxHoraire * freqAnnuelle
      ),
    };
  });

  const propositionsByFournisseurId = propositions.reduce<
    Record<
      number,
      {
        id: number;
        gamme: "essentiel" | "confort" | "excellence";
        nomFournisseur: string;
        fournisseurId: number;
        sloganFournisseur: string | null;
        hParPassage: number;
        tauxHoraire: number;
        freqAnnuelle: number;
        prixAnnuel: number;
      }[]
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
    <div className="flex flex-col gap-4 w-full mx-auto h-full py-2" id="5">
      <PropositionsTitle
        title="Maintenance"
        description="Veille réglementaire, obligations légales, bien-être au travail, petits travaux, lien avec le gestionnaire de l’immeuble... déléguez la maintenance de vos locaux et le suivi de vos contrôles."
        icon={Wrench}
        handleClickPrevious={handleClickPrevious}
      />
      {maintenanceQuantites && maintenanceTarifs && (
        <div className="w-full flex-1">
          <MaintenancePropositions
            formattedPropositions={formattedPropositions}
          />
        </div>
      )}
      <PropositionsFooter handleClickNext={handleClickNext} />
    </div>
  );
};

export default Maintenance;
