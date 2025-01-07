"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevisDataContext } from "@/context/DevisDataProvider";
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
  selectedServicesIds: number[];
};

const Nettoyage = ({
  handleClickNext,
  handleClickPrevious,
}: NettoyageProps) => {
  const { devisData } = useContext(DevisDataContext);
  const [comment, setComment] = useState<string>(
    "*moyenne sur l'année (12 mois de 21,67 jours ouvrés)"
  );

  const { nettoyagePropositions, repassePropositions, vitreriePropositions } =
    useFetchNettoyage();
  const nettoyagePropositionId =
    devisData.services.nettoyage.nettoyagePropositionId;

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

  const formattedNettoyagePropositions = Object.values(
    nettoyagePropositionsByFournisseurId
  );

  const selectedFournisseurId = nettoyagePropositions.find(
    (nettoyage) => nettoyage.id === nettoyagePropositionId
  )?.fournisseurId;
  const selectedGamme = nettoyagePropositions.find(
    (nettoyage) => nettoyage.id === nettoyagePropositionId
  )?.gamme;

  const filteredNettoyageProposition = selectedFournisseurId
    ? nettoyagePropositionsByFournisseurId[selectedFournisseurId].find(
        (proposition) => proposition.gamme === selectedGamme
      )
    : undefined;

  const filteredRepasseProposition = repassePropositions
    .filter(
      (item) =>
        item.fournisseurId ===
        nettoyagePropositions.find(
          (nettoyage) => nettoyage.id === nettoyagePropositionId
        )?.fournisseurId
    )
    .find((proposition) => proposition.gamme === selectedGamme);

  const filteredVitrerieProposition = vitreriePropositions.find(
    (item) =>
      item.fournisseurId ===
      nettoyagePropositions.find(
        (nettoyage) => nettoyage.id === nettoyagePropositionId
      )?.fournisseurId
  );

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
            disabled={!nettoyagePropositionId}
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
        {filteredNettoyageProposition && (
          <TabsContentNettoyageOptions
            filteredNettoyageProposition={filteredNettoyageProposition}
            filteredRepasseProposition={filteredRepasseProposition}
            filteredVitrerieProposition={filteredVitrerieProposition}
          />
        )}
      </Tabs>
      {comment && <p className="text-sm italic text-end px-1">{comment}</p>}

      <NextServiceButton
        handleClickNext={handleClickNext}
        disabled={!nettoyagePropositionId}
      />
    </div>
  );
};

export default Nettoyage;
