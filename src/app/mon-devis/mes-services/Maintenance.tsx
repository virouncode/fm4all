import NextServiceButton from "./NextServiceButton";
import PreviousServiceButton from "./PreviousServiceButton";

type MaintenanceProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
  selectedServicesIds: number[];
};

const Maintenance = ({
  handleClickNext,
  handleClickPrevious,
  selectedServicesIds,
}: MaintenanceProps) => {
  return (
    <div className="flex flex-col gap-10 w-full  mx-auto h-[600px] py-2" id="2">
      <div className="flex justify-between items-center">
        <p className="text-lg">Maintenance</p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      {selectedServicesIds[selectedServicesIds.length - 1] === 2 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default Maintenance;
