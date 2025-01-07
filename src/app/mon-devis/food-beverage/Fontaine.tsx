import NextServiceButton from "../mes-services/NextServiceButton";
import PreviousServiceButton from "../mes-services/PreviousServiceButton";

type FontaineProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
  selectedServicesIds: number[];
};

const Fontaine = ({
  handleClickNext,
  handleClickPrevious,
  selectedServicesIds,
}: FontaineProps) => {
  return (
    <div className="flex flex-col gap-10 w-full mx-auto h-[600px] py-2" id="4">
      <div className="flex justify-between items-center">
        <p className="text-lg">Fontaine à eau</p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      {selectedServicesIds[selectedServicesIds.length - 1] === 4 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default Fontaine;
