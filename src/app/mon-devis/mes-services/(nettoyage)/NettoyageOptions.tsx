import { NettoyageContext } from "@/context/NettoyageProvider";
import useFetchNettoyage from "@/hooks/use-fetch-nettoyage";
import { SprayCan } from "lucide-react";
import { useContext } from "react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
import NettoyageOptionsPropositions from "./NettoyageOptionsPropositions";

type NettoyageOptionsProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
};

const NettoyageOptions = ({
  handleClickNext,
  handleClickPrevious,
}: NettoyageOptionsProps) => {
  const { nettoyage } = useContext(NettoyageContext);
  const { nettoyagePropositions, repassePropositions, vitreriePropositions } =
    useFetchNettoyage();
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
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="2">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="flex gap-4 items-center p-4 border-2 rounded-xl">
            <SprayCan />
            <p>Nettoyage et propreté</p>
          </div>
          <p className="text-base italic">Choisissez vos options</p>
        </div>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <div className="w-full flex-1">
        <NettoyageOptionsPropositions
          nettoyageProposition={nettoyageProposition}
          repasseProposition={repasseProposition}
          vitrerieProposition={vitrerieProposition}
        />
      </div>
      <p className="text-sm italic text-end px-1">
        *2 passages anuels vitrerie par défaut
      </p>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default NettoyageOptions;
