"use client";
import useFetchNettoyage from "@/hooks/use-fetch-nettoyage";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SprayCan } from "lucide-react";
import NextServiceButton from "../NextServiceButton";
import NettoyagePropositions from "./NettoyagePropositions";

type NettoyageProps = {
  handleClickNext: () => void;
};

const Nettoyage = ({ handleClickNext }: NettoyageProps) => {
  const { nettoyagePropositions } = useFetchNettoyage();
  const order = ["essentiel", "confort", "excellence"];

  const nettoyagePropositionsByFournisseurId = nettoyagePropositions.reduce<
    Record<
      number,
      (SelectNettoyageTarifsType & {
        prixAnnuel: number;
        freqAnnuelle: number;
        prixAnnuelSamedi: number;
        prixAnnuelDimanche: number;
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
      (a, b) => order.indexOf(a.gamme) - order.indexOf(b.gamme)
    );
    return acc;
  }, {});

  //An array of arrays of propositions by fournisseurId
  const formattedNettoyagePropositions = Object.values(
    nettoyagePropositionsByFournisseurId
  );

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="1">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="flex gap-4 items-center p-4 border-2 rounded-xl">
            <SprayCan />
            <p>Nettoyage et propreté</p>
          </div>
          <p className="text-base italic">
            D’un nettoyage essentiel à une expérience 5 étoiles, choisissez la
            prestation propreté qui vous ressemble.
          </p>
        </div>
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
