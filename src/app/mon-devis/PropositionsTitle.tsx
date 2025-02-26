import { LucideIcon } from "lucide-react";
import PreviousServiceButton from "./PreviousServiceButton";

type PropositionsTitleProps = {
  icon: LucideIcon;
  icon2?: LucideIcon;
  icon3?: LucideIcon;
  title: string;
  description: string;
  handleClickPrevious: () => void;
  previousButton?: boolean;
};

const PropositionsTitle = ({
  icon: Icon,
  icon2: Icon2,
  icon3: Icon3,
  title,
  description,
  handleClickPrevious,
  previousButton = true,
}: PropositionsTitleProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-4 items-center p-4 border rounded-xl">
        <div className="flex items-center gap-1">
          <Icon />
          {Icon2 && <Icon2 />}
          {Icon3 && <Icon3 />}
        </div>
        <p>{title}</p>
      </div>
      <p className="text-base flex-1 px-4">{description}</p>
      <PreviousServiceButton
        handleClickPrevious={handleClickPrevious}
        className={previousButton ? "" : "invisible"}
      />
    </div>
  );
};

export default PropositionsTitle;
