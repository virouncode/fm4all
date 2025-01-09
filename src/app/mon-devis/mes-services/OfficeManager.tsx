import { ServicesContext } from "@/context/ServicesProvider";
import { useContext } from "react";
import NextServiceButton from "./NextServiceButton";
import PreviousServiceButton from "./PreviousServiceButton";

type OfficeManagerProps = {
  handleClickNext: () => void;
  handleClickPrevious: () => void;
};

const OfficeManager = ({
  handleClickNext,
  handleClickPrevious,
}: OfficeManagerProps) => {
  const { services } = useContext(ServicesContext);
  return (
    <div className="flex flex-col gap-10 w-full mx-auto h-[600px] py-2" id="5">
      <div className="flex justify-between items-center">
        <p className="text-lg">OfficeManager</p>
        <PreviousServiceButton handleClickPrevious={handleClickPrevious} />
      </div>

      <NextServiceButton handleClickNext={handleClickNext} />
    </div>
  );
};

export default OfficeManager;
