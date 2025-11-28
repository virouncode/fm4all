"use client";

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
    <div className="flex flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
      <div className="border-primary text-primary flex w-full items-center justify-center gap-4 rounded-xl border-2 p-4 lg:w-auto lg:justify-start">
        <div className="flex items-center gap-1">
          <Icon />
          {Icon2 && <Icon2 />}
          {Icon3 && <Icon3 />}
        </div>
        <p className="font-bold">{title}</p>
      </div>
      <p className="flex-1 px-4 text-base text-wrap hyphens-auto">
        {description}
      </p>
      <PreviousServiceButton
        handleClickPrevious={handleClickPrevious}
        className={previousButton ? "" : "hidden"}
      />
    </div>
  );
};

export default PropositionsTitle;
