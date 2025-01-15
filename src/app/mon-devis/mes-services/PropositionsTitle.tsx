import { LucideIcon } from "lucide-react";
import PreviousServiceButton from "./PreviousServiceButton";

type PropositionsTitleProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  handleClickPrevious: () => void;
  previousButton?: boolean;
};

const PropositionsTitle = ({
  icon: Icon,
  title,
  description,
  handleClickPrevious,
  previousButton = true,
}: PropositionsTitleProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <Icon />
        <p>{title}</p>
      </div>
      <p className="text-base flex-1 text-center italic px-4">{description}</p>
      <PreviousServiceButton
        handleClickPrevious={handleClickPrevious}
        className={previousButton ? "" : "invisible"}
      />
    </div>
  );
};

export default PropositionsTitle;
