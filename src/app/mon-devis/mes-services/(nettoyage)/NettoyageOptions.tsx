"use client";

import { NettoyageContext } from "@/context/NettoyageProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { SelectRepasseTarifsType } from "@/zod-schemas/nettoyageRepasse";
import { SelectNettoyageTarifsType } from "@/zod-schemas/nettoyageTarifs";
import { SelectVitrerieTarifsType } from "@/zod-schemas/nettoyageVitrerie";
import { SprayCan } from "lucide-react";
import { useContext } from "react";
import PropositionsFooter from "../PropositionsFooter";
import PropositionsTitle from "../PropositionsTitle";
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

  if (!nettoyage.fournisseurId && !nettoyage.gammeSelected) {
    return null; //pour skiper le service
  }

  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="2">
      <PropositionsTitle
        title="Nettoyage et Propreté"
        description={`Choisissez vos options en gamme ${nettoyage.gammeSelected} chez ${samediDimancheProposition?.nomEntreprise}`}
        icon={SprayCan}
        handleClickPrevious={handleClickPrevious}
      />
      <div className="w-full flex-1">
        <NettoyageOptionsPropositions
          samediDimancheProposition={samediDimancheProposition}
          repasseProposition={repasseProposition}
          vitrerieProposition={vitrerieProposition}
        />
      </div>
      <PropositionsFooter
        comment="*emplacement pour remarque"
        handleClickNext={handleClickNext}
      />
    </div>
  );
};

export default NettoyageOptions;
