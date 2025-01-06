"use client";
import {
  getNettoyagePropositions,
  getNettoyageRepassePropositions,
} from "@/actions/getNettoyage";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevisDataContext } from "@/context/DevisDataProvider";
import { SelectNettoyageRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { useContext, useEffect, useState } from "react";
import { roundSurface } from "../../../../lib/roundSurface";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
import TabsContentDimanche from "./TabsContentDimanche";
import TabsContentNettoyage from "./TabsContentNettoyage";
import TabsContentRepasse from "./TabsContentRepasse";
import TabsContentSamedi from "./TabsContentSamedi";

type NettoyageProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
  selectedServicesIds: number[];
};

const Nettoyage = ({
  handleClickNext,
  handleClickPrevious,
  selectedServicesIds,
}: NettoyageProps) => {
  const { devisData, setDevisData } = useContext(DevisDataContext);
  const [nettoyagePropositions, setNettoyagePropositions] = useState<
    (SelectNettoyageTarifsType & {
      prixAnnuel: number;
      freqAnnuelle: number;
      prixAnnuelSamedi: number;
      prixAnnuelDimanche: number;
    })[]
  >([]);
  const [repassePropositions, setRepassePropositions] = useState<
    (SelectNettoyageRepasseTarifsType & {
      prixAnnuel: number;
      freqAnnuelle: number;
    })[]
  >([]);
  const [selectedNettoyagePropositionId, setSelectedNettoyagePropositionId] =
    useState<number | null>(devisData.nettoyagePropositionId);
  const [selectedRepassePropositionId, setSelectedRepassePropositionId] =
    useState<number | null>(devisData.repassePropositionId);
  const [selectedSamediPropositionId, setSelectedSamediPropositionId] =
    useState<number | null>(devisData.samediPropositionId);
  const [selectedDimanchePropositionId, setSelectedDimanchePropositionId] =
    useState<number | null>(devisData.dimanchePropositionId);
  const [comment, setComment] = useState<string>(
    "*moyenne sur l'année (12 mois de 21,67 jours ouvrés)"
  );

  useEffect(() => {
    const fetchNettoyagePropositions = async () => {
      try {
        const response = await getNettoyagePropositions(
          roundSurface(parseInt(devisData.firstCompanyInfo.surface))
        );
        setNettoyagePropositions(response);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        }
      }
    };
    fetchNettoyagePropositions();
  }, [devisData.firstCompanyInfo.surface, devisData]);

  useEffect(() => {
    const fetchNettoyageOptionsRepasse = async () => {
      try {
        const response = await getNettoyageRepassePropositions(
          roundSurface(parseInt(devisData.firstCompanyInfo.surface))
        );
        console.log("response repasse", response);
        setRepassePropositions(response);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        }
      }
    };
    if (!selectedNettoyagePropositionId) setRepassePropositions([]);
    else fetchNettoyageOptionsRepasse();
  }, [
    devisData.firstCompanyInfo.surface,
    devisData,
    selectedNettoyagePropositionId,
  ]);

  const handleClickNettoyageProposition = (propositionId: number) => {
    if (
      selectedNettoyagePropositionId &&
      selectedNettoyagePropositionId === propositionId
    ) {
      setSelectedNettoyagePropositionId(null);
      setDevisData((prev) => ({
        ...prev,
        nettoyagePropositionId: null,
      }));
      return;
    }
    setSelectedNettoyagePropositionId(propositionId);
    setDevisData((prev) => ({
      ...prev,
      nettoyagePropositionId: propositionId,
    }));
  };
  const handleClickRepasseProposition = (propositionId: number) => {
    if (
      selectedRepassePropositionId &&
      selectedRepassePropositionId === propositionId
    ) {
      setSelectedRepassePropositionId(null);
      setDevisData((prev) => ({
        ...prev,
        repassePropositionId: null,
      }));
      return;
    }
    setSelectedRepassePropositionId(propositionId);
    setDevisData((prev) => ({
      ...prev,
      repassePropositionId: propositionId,
    }));
  };

  const handleClickSamediProposition = (propositionId: number) => {
    if (
      selectedSamediPropositionId &&
      selectedSamediPropositionId === propositionId
    ) {
      setSelectedSamediPropositionId(null);
      setDevisData((prev) => ({
        ...prev,
        samediPropositionId: null,
      }));
      return;
    }
    setSelectedSamediPropositionId(propositionId);
    setDevisData((prev) => ({
      ...prev,
      samediPropositionId: propositionId,
    }));
  };

  const handleClickDimancheProposition = (propositionId: number) => {
    if (
      selectedDimanchePropositionId &&
      selectedDimanchePropositionId === propositionId
    ) {
      setSelectedDimanchePropositionId(null);
      setDevisData((prev) => ({
        ...prev,
        dimanchePropositionId: null,
      }));
      return;
    }
    setSelectedDimanchePropositionId(propositionId);
    setDevisData((prev) => ({
      ...prev,
      dimanchePropositionId: propositionId,
    }));
  };

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

  const repassePropositionsByFournisseurId = repassePropositions.reduce<
    Record<
      number,
      (SelectNettoyageRepasseTarifsType & {
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
      (a, b) => order.indexOf(a.gamme) - order.indexOf(b.gamme)
    );
    return acc;
  }, {});

  const formattedNettoyagePropositions = Object.values(
    nettoyagePropositionsByFournisseurId
  );
  const formattedRepassePropositions = Object.values(
    repassePropositionsByFournisseurId
  );

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-[600px] py-2" id="1">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-baseline">
          <p className="text-lg">Nettoyage et propreté</p>
        </div>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>

      <Tabs defaultValue="nettoyage" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5">
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
            value="repasse"
            className="text-base"
            disabled={
              !selectedNettoyagePropositionId ||
              (nettoyagePropositions.find(
                (proposition) =>
                  proposition.id === selectedNettoyagePropositionId
              )?.freqAnnuelle as number) < 2600400
            }
            onClick={() =>
              setComment("*moyenne sur l'année (12 mois de 21,67 jours ouvrés)")
            }
          >
            Option repasse sanitaire
          </TabsTrigger>
          <TabsTrigger
            value="samedi"
            className="text-base"
            onClick={() =>
              setComment("*120% du taux horaire normal, 52 passages/an")
            }
            disabled={!selectedNettoyagePropositionId}
          >
            Option samedi
          </TabsTrigger>
          <TabsTrigger
            value="dimanche"
            className="text-base"
            onClick={() =>
              setComment("*125% du taux horaire normal, 52 passages/an")
            }
            disabled={!selectedNettoyagePropositionId}
          >
            Option dimanche
          </TabsTrigger>
          <TabsTrigger
            value="vitrerie"
            className="text-base"
            disabled={!selectedNettoyagePropositionId}
          >
            Option Vitrerie
          </TabsTrigger>
        </TabsList>
        <TabsContentNettoyage
          formattedNettoyagePropositions={formattedNettoyagePropositions}
          selectedNettoyagePropositionId={selectedNettoyagePropositionId}
          handleClickProposition={handleClickNettoyageProposition}
        />
        <TabsContentRepasse
          formattedRepassePropositions={formattedRepassePropositions}
          selectedRepassePropositionId={selectedRepassePropositionId}
          handleClickProposition={handleClickRepasseProposition}
        />
        <TabsContentSamedi
          formattedNettoyagePropositions={formattedNettoyagePropositions}
          selectedSamediPropositionId={selectedSamediPropositionId}
          handleClickProposition={handleClickSamediProposition}
        />
        <TabsContentDimanche
          formattedNettoyagePropositions={formattedNettoyagePropositions}
          selectedDimanchePropositionId={selectedDimanchePropositionId}
          handleClickProposition={handleClickDimancheProposition}
        />
      </Tabs>
      {comment && <p className="text-sm italic text-end px-1">{comment}</p>}
      {selectedServicesIds[selectedServicesIds.length - 1] === 1 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default Nettoyage;
