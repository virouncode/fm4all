import NextServiceButton from "./NextServiceButton";
import PreviousServiceButton from "./PreviousServiceButton";

type CafeProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
  selectedServicesIds: number[];
};

const Cafe = ({
  handleClickNext,
  handleClickPrevious,
  selectedServicesIds,
}: CafeProps) => {
  return (
    <div className="flex flex-col gap-10 w-full mx-auto h-[600px] py-2" id="5">
      <div className="flex justify-between items-center">
        <p className="text-lg">Café</p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      {selectedServicesIds[selectedServicesIds.length - 1] === 5 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default Cafe;
