"use client";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import useScrollIntoService from "@/hooks/use-scroll-into-service";
import { gammes } from "@/zod-schemas/gamme";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SprayCan } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../PropositionsFooter";
import PropositionsTitle from "../PropositionsTitle";
import NettoyagePropositions from "./NettoyagePropositions";

type NettoyageProps = {
  nettoyagePropositions: (SelectNettoyageTarifsType & {
    freqAnnuelle: number;
    prixAnnuel: number;
  })[];
};

const Nettoyage = ({ nettoyagePropositions }: NettoyageProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const { setServices } = useContext(ServicesContext);
  //Scroller automatiquement vers le service actuel
  useScrollIntoService();

  const handleClickPrevious = () => {};
  const handleClickNext = () => {
    if (nettoyage.propositionId) {
      setServices((prev) => ({
        ...prev,
        currentServiceId: prev.currentServiceId + 1,
      }));
    } else {
      setServices((prev) => ({
        ...prev,
        currentServiceId: 5,
      }));
    }
  };

  const nettoyagePropositionsByFournisseurId = nettoyagePropositions.reduce<
    Record<
      number,
      (SelectNettoyageTarifsType & {
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

  //Un tableau de tableaux de propositions de nettoyage par fournisseur pour itérer
  const formattedNettoyagePropositions = Object.values(
    nettoyagePropositionsByFournisseurId
  );

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="1">
      <PropositionsTitle
        title="Nettoyage et propreté"
        description="D’un nettoyage essentiel à une expérience 5 étoiles, choisissez la prestation propreté qui vous ressemble."
        icon={SprayCan}
        handleClickPrevious={handleClickPrevious}
        previousButton={false}
      />
      <div className="w-full flex-1">
        <NettoyagePropositions
          formattedNettoyagePropositions={formattedNettoyagePropositions}
        />
      </div>
      <PropositionsFooter
        comment="*moyenne sur l'année (12 mois de 21,67 jours ouvrés)"
        handleClickNext={handleClickNext}
      />
    </div>
  );
};
export default Nettoyage;
