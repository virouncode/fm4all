import NextServiceButton from "./NextServiceButton";
import PreviousServiceButton from "./PreviousServiceButton";

type MaintenanceProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
};

const Maintenance = ({
  handleClickNext,
  handleClickPrevious,
}: MaintenanceProps) => {
  return (
    <div className="flex flex-col gap-10 w-full  mx-auto h-[600px] py-2" id="5">
      <div className="flex justify-between items-center">
        <p className="text-lg">Maintenance</p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default Maintenance;
