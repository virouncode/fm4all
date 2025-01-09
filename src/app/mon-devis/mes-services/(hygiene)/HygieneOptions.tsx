import useFetchHygiene from "@/hooks/use-fetch-hygiene";
import { Toilet } from "lucide-react";
import NextServiceButton from "../NextServiceButton";
import PreviousServiceButton from "../PreviousServiceButton";
import HygieneOptionsPropositions from "./HygieneOptionsPropositions";

type HygieneOptionsProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
};

const HygieneOptions = ({
  handleClickNext,
  handleClickPrevious,
}: HygieneOptionsProps) => {
  const { distribQuantites, distribTarifs, consoTarifs } = useFetchHygiene();
  return (
    <div className="flex flex-col gap-6 w-full mx-auto h-full py-2" id="4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center flex-1">
          <div className="flex gap-4 items-center p-4 border-2 rounded-xl">
            <Toilet />
            <p>Hygiène sanitaire</p>
          </div>
          <p className="text-base italic w-2/3">Choisissez vos options</p>
        </div>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <div className="w-full flex-1">
        {distribQuantites && (
          <HygieneOptionsPropositions
            distribQuantites={distribQuantites}
            distribTarifs={distribTarifs}
            consoTarifs={consoTarifs}
          />
        )}
      </div>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default HygieneOptions;
