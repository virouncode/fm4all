"use client";

import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import useScrollIntoService from "@/hooks/use-scroll-into-service";
import { gammes } from "@/zod-schemas/gamme";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SprayCan } from "lucide-react";
import { useContext } from "react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
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
  useScrollIntoService();

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

  //An array of arrays of propositions by fournisseurId
  const formattedNettoyagePropositions = Object.values(
    nettoyagePropositionsByFournisseurId
  );

  console.log("formattedNettoyagePropositions", formattedNettoyagePropositions);

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
  const handleClickPrevious = () => {};

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="1">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center p-4 border rounded-xl">
          <SprayCan />
          <p>Nettoyage et propreté</p>
        </div>
        <p className="text-base w-2/3 text-center italic px-4">
          D’un nettoyage essentiel à une expérience 5 étoiles, choisissez la
          prestation propreté qui vous ressemble.
        </p>
        <PreviousServiceButton
          handleClickPrevious={handleClickPrevious}
          className="invisible"
        />
      </div>
      <div className="w-full flex-1">
        <NettoyagePropositions
          formattedNettoyagePropositions={formattedNettoyagePropositions}
          nettoyagePropositions={nettoyagePropositions}
        />
      </div>
      <p className="text-sm italic text-end px-1">
        *moyenne sur l&apos;année (12 mois de 21,67 jours ouvrés)
      </p>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};
export default Nettoyage;
