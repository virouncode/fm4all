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
  const { devisData, setDevisData } = useContext(DevisDataContext);

  const [selectedNettoyagePropositionId, setSelectedNettoyagePropositionId] =
    useState<number | null>(
      devisData.services.nettoyage.nettoyagePropositionId
    );
  const [selectedRepassePropositionId, setSelectedRepassePropositionId] =
    useState<number | null>(devisData.services.nettoyage.repassePropositionId);
  const [selectedSamediPropositionId, setSelectedSamediPropositionId] =
    useState<number | null>(devisData.services.nettoyage.samediPropositionId);
  const [selectedDimanchePropositionId, setSelectedDimanchePropositionId] =
    useState<number | null>(devisData.services.nettoyage.dimanchePropositionId);
  const [selectedVitreriePropositionId, setSelectedVitreriePropositionId] =
    useState<number | null>(devisData.services.nettoyage.vitreriePropositionId);
  const [comment, setComment] = useState<string>(
    "*moyenne sur l'année (12 mois de 21,67 jours ouvrés)"
  );

  const { nettoyagePropositions, repassePropositions, vitreriePropositions } =
    useFetchNettoyage();

  const handleClickNettoyageProposition = (propositionId: number) => {
    if (
      selectedNettoyagePropositionId &&
      selectedNettoyagePropositionId === propositionId
    ) {
      setSelectedNettoyagePropositionId(null);
      setDevisData((prev) => ({
        ...prev,
        services: {
          nettoyage: {
            nettoyageFournisseurId: null,
            nettoyagePropositionId: null,
            repassePropositionId: null,
            samediPropositionId: null,
            dimanchePropositionId: null,
            vitreriePropositionId: null,
            propreteFournisseurId: null,
            trilogieGammeSelected: null,
          },
        },
      }));
      return;
    }
    setSelectedNettoyagePropositionId(propositionId);
    setDevisData((prev) => ({
      ...prev,
      services: {
        nettoyage: {
          nettoyageFournisseurId: nettoyagePropositions.find(
            (nettoyage) => nettoyage.id === propositionId
          )?.fournisseurId as number,
          propreteFournisseurId:
            (nettoyagePropositions.find(
              (nettoyage) => nettoyage.id === propositionId
            )?.fournisseurId as number) === 9
              ? 12
              : (nettoyagePropositions.find(
                  (nettoyage) => nettoyage.id === propositionId
                )?.fournisseurId as number),
          nettoyagePropositionId: propositionId,
          repassePropositionId: null,
          samediPropositionId: null,
          dimanchePropositionId: null,
          vitreriePropositionId: null,
          trilogieGammeSelected: null,
        },
      },
    }));
  };

  const handleClickOption = (type: string, propositionId: number) => {
    switch (type) {
      case "repasse":
        if (
          selectedRepassePropositionId &&
          selectedRepassePropositionId === propositionId
        ) {
          setSelectedRepassePropositionId(null);
          setDevisData((prev) => ({
            ...prev,
            services: {
              nettoyage: {
                ...prev.services.nettoyage,
                repassePropositionId: null,
              },
            },
          }));
          return;
        }
        setSelectedRepassePropositionId(propositionId);
        setDevisData((prev) => ({
          ...prev,
          services: {
            nettoyage: {
              ...prev.services.nettoyage,
              repassePropositionId: propositionId,
            },
          },
        }));
        break;
      case "vitrerie":
        if (
          selectedVitreriePropositionId &&
          selectedVitreriePropositionId === propositionId
        ) {
          setSelectedVitreriePropositionId(null);
          setDevisData((prev) => ({
            ...prev,
            services: {
              nettoyage: {
                ...prev.services.nettoyage,
                vitreriePropositionId: null,
              },
            },
          }));
          return;
        }
        setSelectedVitreriePropositionId(propositionId);
        setDevisData((prev) => ({
          ...prev,
          services: {
            nettoyage: {
              ...prev.services.nettoyage,
              vitreriePropositionId: propositionId,
            },
          },
        }));
        break;
      case "samedi":
        if (
          selectedSamediPropositionId &&
          selectedSamediPropositionId === propositionId
        ) {
          setSelectedSamediPropositionId(null);
          setDevisData((prev) => ({
            ...prev,
            services: {
              nettoyage: {
                ...prev.services.nettoyage,
                samediPropositionId: null,
              },
            },
          }));
          return;
        }
        setSelectedSamediPropositionId(propositionId);
        setDevisData((prev) => ({
          ...prev,
          services: {
            nettoyage: {
              ...prev.services.nettoyage,
              samediPropositionId: propositionId,
            },
          },
        }));
        break;
      case "dimanche":
        if (
          selectedDimanchePropositionId &&
          selectedDimanchePropositionId === propositionId
        ) {
          setSelectedDimanchePropositionId(null);
          setDevisData((prev) => ({
            ...prev,
            services: {
              nettoyage: {
                ...prev.services.nettoyage,
                dimanchePropositionId: null,
              },
            },
          }));
          return;
        }
        setSelectedDimanchePropositionId(propositionId);
        setDevisData((prev) => ({
          ...prev,
          services: {
            nettoyage: {
              ...prev.services.nettoyage,
              dimanchePropositionId: propositionId,
            },
          },
        }));
        break;
    }
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

  const formattedNettoyagePropositions = Object.values(
    nettoyagePropositionsByFournisseurId
  );

  const selectedFournisseurId = nettoyagePropositions.find(
    (nettoyage) => nettoyage.id === selectedNettoyagePropositionId
  )?.fournisseurId;
  const selectedGamme = nettoyagePropositions.find(
    (nettoyage) => nettoyage.id === selectedNettoyagePropositionId
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
          (nettoyage) => nettoyage.id === selectedNettoyagePropositionId
        )?.fournisseurId
    )
    .find((proposition) => proposition.gamme === selectedGamme);

  const filteredVitrerieProposition = vitreriePropositions.find(
    (item) =>
      item.fournisseurId ===
      nettoyagePropositions.find(
        (nettoyage) => nettoyage.id === selectedNettoyagePropositionId
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
            disabled={!selectedNettoyagePropositionId}
            onClick={() =>
              setComment("*moyenne sur l'année (12 mois de 21,67 jours ouvrés)")
            }
          >
            Options
          </TabsTrigger>
        </TabsList>
        <TabsContentNettoyage
          formattedNettoyagePropositions={formattedNettoyagePropositions}
          selectedNettoyagePropositionId={selectedNettoyagePropositionId}
          handleClickProposition={handleClickNettoyageProposition}
        />
        {filteredNettoyageProposition && (
          <TabsContentNettoyageOptions
            filteredNettoyageProposition={filteredNettoyageProposition}
            filteredRepasseProposition={filteredRepasseProposition}
            filteredVitrerieProposition={filteredVitrerieProposition}
            selectedRepassePropositionId={selectedRepassePropositionId}
            selectedVitreriePropositionId={selectedVitreriePropositionId}
            selectedSamediPropositionId={selectedSamediPropositionId}
            selectedDimanchePropositionId={selectedDimanchePropositionId}
            handleClickOption={handleClickOption}
          />
        )}
      </Tabs>
      {comment && <p className="text-sm italic text-end px-1">{comment}</p>}

      <NextServiceButton
        handleClickNext={handleClickNext}
        disabled={!selectedNettoyagePropositionId}
      />
    </div>
  );
};

export default Nettoyage;
