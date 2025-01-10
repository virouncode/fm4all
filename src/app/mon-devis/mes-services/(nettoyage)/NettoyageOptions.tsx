"use client";

import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { SprayCan } from "lucide-react";
import { useContext } from "react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
import NettoyageOptionsPropositions from "./NettoyageOptionsPropositions";

type NettoyageOptionsProps = {
  repasseProposition:
    | (SelectRepasseTarifsType & {
        freqAnnuelle: number;
        prixAnnuel: number;
      })
    | null;
  samediDimancheProposition:
    | (SelectNettoyageTarifsType & {
        prixAnnuelSamedi: number;
        prixAnnuelDimanche: number;
      })
    | null;
  vitrerieProposition:
    | (SelectVitrerieTarifsType & {
        prixParPassage: number;
      })
    | null;
};

const NettoyageOptions = ({
  samediDimancheProposition,
  repasseProposition,
  vitrerieProposition,
}: NettoyageOptionsProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const { setServices } = useContext(ServicesContext);

  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
    }));
  };
  const handleClickNext = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId + 1,
    }));
  };

  if (!nettoyage.propositionId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="2">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center p-4 border rounded-xl">
          <SprayCan />
          <p>Nettoyage et Propreté</p>
        </div>
        <p className="text-base w-2/3 text-center italic px-4">
          Choisissez vos options
        </p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <div className="w-full flex-1">
        <NettoyageOptionsPropositions
          samediDimancheProposition={samediDimancheProposition}
          repasseProposition={repasseProposition}
          vitrerieProposition={vitrerieProposition}
        />
      </div>
      <p className="text-sm italic text-end px-1"></p>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default NettoyageOptions;
