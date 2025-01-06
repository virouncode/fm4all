import NextServiceButton from "./NextServiceButton";
import PreviousServiceButton from "./PreviousServiceButton";

type OfficeManagerProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
  selectedServicesIds: number[];
};

const OfficeManager = ({
  handleClickNext,
  handleClickPrevious,
  selectedServicesIds,
}: OfficeManagerProps) => {
  return (
    <div className="flex flex-col gap-10 w-full mx-auto h-[600px] py-2" id="4">
      <div className="flex justify-between items-center">
        <p className="text-lg">OfficeManager</p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      {selectedServicesIds[selectedServicesIds.length - 1] === 9 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default OfficeManager;
