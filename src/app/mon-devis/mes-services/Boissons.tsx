import NextServiceButton from "./NextServiceButton";
import PreviousServiceButton from "./PreviousServiceButton";

type BoissonsProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
  selectedServicesIds: number[];
};

const Boissons = ({
  handleClickNext,
  handleClickPrevious,
  selectedServicesIds,
}: BoissonsProps) => {
  return (
    <div className="flex flex-col gap-10 w-full mx-auto h-full relative" id="8">
      <div className="flex justify-between items-center">
        <p className="text-lg">Boissons</p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      {selectedServicesIds[selectedServicesIds.length - 1] === 8 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default Boissons;
