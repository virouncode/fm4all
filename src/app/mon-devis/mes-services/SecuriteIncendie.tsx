import { ServicesContext } from "@/context/ServicesProvider";
import { useContext } from "react";
import PreviousServiceButton from "./PreviousServiceButton";

type SecuriteIncendieProps = {
  handleClickPrevious: () => void;
};

const SecuriteIncendie = ({ handleClickPrevious }: SecuriteIncendieProps) => {
  const { services } = useContext(ServicesContext);
  return (
    <div className="flex flex-col gap-10 w-full mx-auto h-[600px] py-2" id="6">
      <div className="flex justify-between items-center">
        <p className="text-lg">Securité incendie</p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>
    </div>
  );
};

export default SecuriteIncendie;
