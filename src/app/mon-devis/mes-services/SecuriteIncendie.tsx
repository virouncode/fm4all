import NextServiceButton from "./NextServiceButton";
import PreviousServiceButton from "./PreviousServiceButton";

type SecuriteIncendieProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
  selectedServicesIds: number[];
};

const SecuriteIncendie = ({
  handleClickNext,
  handleClickPrevious,
  selectedServicesIds,
}: SecuriteIncendieProps) => {
  return (
    <div className="flex flex-col gap-10 w-full mx-auto h-[600px] py-2" id="3">
      <div className="flex justify-between items-center">
        <p className="text-lg">Securité incendie</p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      {selectedServicesIds[selectedServicesIds.length - 1] === 3 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default SecuriteIncendie;
