import NextServiceButton from "./NextServiceButton";
import PreviousServiceButton from "./PreviousServiceButton";

type ServicesFm4AllProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
};

const ServicesFm4All = ({
  handleClickNext,
  handleClickPrevious,
}: ServicesFm4AllProps) => {
  return (
    <div className="flex flex-col gap-10 w-full mx-auto h-[600px] py-2" id="6">
      <div className="flex justify-between items-center">
        <p className="text-lg">ServicesFm4All</p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>

      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default ServicesFm4All;
