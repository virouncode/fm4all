import { ServicesContext } from "@/context/ServicesProvider";
import { useContext } from "react";
import NextServiceButton from "./NextServiceButton";
import PreviousServiceButton from "./PreviousServiceButton";

type SecuriteIncendieProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
};

const SecuriteIncendie = ({
  handleClickNext,
  handleClickPrevious,
}: SecuriteIncendieProps) => {
  const { services } = useContext(ServicesContext);
  return (
    <div className="flex flex-col gap-10 w-full mx-auto h-[600px] py-2" id="4">
      <div className="flex justify-between items-center">
        <p className="text-lg">Securité incendie</p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
      {services.selectedServicesIds[services.selectedServicesIds.length - 1] ===
      3 ? null : (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default SecuriteIncendie;
