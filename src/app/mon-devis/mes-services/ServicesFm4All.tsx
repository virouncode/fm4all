import NextServiceButton from "./NextServiceButton";
import PreviousServiceButton from "./PreviousServiceButton";

type ServicesFm4AllProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
  selectedServicesIds: number[];
};

const ServicesFm4All = ({
  handleClickNext,
  handleClickPrevious,
  selectedServicesIds,
}: ServicesFm4AllProps) => {
  return (
    <div className="flex flex-col gap-10 w-full mx-auto h-[600px] py-2" id="5">
      <div className="flex justify-between items-center">
        <p className="text-lg">ServicesFm4All</p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      {selectedServicesIds[selectedServicesIds.length - 1] === 10 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default ServicesFm4All;
