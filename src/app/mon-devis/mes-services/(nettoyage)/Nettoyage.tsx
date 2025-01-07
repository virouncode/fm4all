"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NettoyageContext } from "@/context/NettoyageProvider";
import useFetchNettoyage from "@/hooks/use-fetch-nettoyage";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { useContext, useState } from "react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
import TabsContentNettoyage from "./TabsContentNettoyage";
import TabsContentNettoyageOptions from "./TabsContentNettoyageOptions";

type NettoyageProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
};

const Nettoyage = ({
  handleClickNext,
  handleClickPrevious,
}: NettoyageProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const [comment, setComment] = useState<string>(
    "*moyenne sur l'année (12 mois de 21,67 jours ouvrés)"
  );
  const { nettoyagePropositions, repassePropositions, vitreriePropositions } =
    useFetchNettoyage();
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

  //already selected proposition
  const nettoyageProposition = nettoyage.propositionId
    ? nettoyagePropositions.find((item) => item.id === nettoyage.propositionId)
    : null;

  const repasseProposition =
    nettoyage.fournisseurId && nettoyage.gammeSelected
      ? repassePropositions.find(
          (item) =>
            item.fournisseurId === nettoyage.fournisseurId &&
            item.gamme === nettoyage.gammeSelected
        )
      : null;

  const vitrerieProposition = nettoyage.fournisseurId
    ? vitreriePropositions.find(
        (item) => item.fournisseurId === nettoyage.fournisseurId
      )
    : null;

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-[600px] py-2" id="1">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-baseline">
          <p className="text-lg">Nettoyage et propreté :</p>
          <p className="text-base italic">
            sélectionnez vos services et options
          </p>
        </div>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>

      <Tabs defaultValue="nettoyage" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="nettoyage"
            className="text-base"
            onClick={() =>
              setComment("*moyenne sur l'année (12 mois de 21,67 jours ouvrés)")
            }
          >
            Nettoyage
          </TabsTrigger>
          <TabsTrigger
            value="options"
            className="text-base"
            disabled={!nettoyage.propositionId}
            onClick={() =>
              setComment("*moyenne sur l'année (12 mois de 21,67 jours ouvrés)")
            }
          >
            Options
          </TabsTrigger>
        </TabsList>
        <TabsContentNettoyage
          formattedNettoyagePropositions={formattedNettoyagePropositions}
          nettoyagePropositions={nettoyagePropositions}
        />
        {nettoyageProposition && repasseProposition && vitrerieProposition && (
          <TabsContentNettoyageOptions
            nettoyageProposition={nettoyageProposition}
            repasseProposition={repasseProposition}
            vitrerieProposition={vitrerieProposition}
          />
        )}
      </Tabs>
      {comment && <p className="text-sm italic text-end px-1">{comment}</p>}

      <NextServiceButton
        handleClickNext={handleClickNext}
        disabled={!nettoyage.propositionId}
      />
    </div>
  );
};

export default Nettoyage;
