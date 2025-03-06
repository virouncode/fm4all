"use client";

import { LucideIcon } from "lucide-react";
import { useMediaQuery } from "react-responsive";
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
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  return (
    <div className="flex flex-col gap-4 lg:gap-0 lg:flex-row justify-between items-center">
      <div className="flex justify-center lg:justify-start gap-4 items-center p-4 border-2 rounded-xl w-full lg:w-auto text-fm4allsecondary border-fm4allsecondary">
        <div className="flex items-center gap-1">
          <Icon />
          {Icon2 && <Icon2 />}
          {Icon3 && <Icon3 />}
        </div>
        <p className="font-bold">{title}</p>
      </div>
      <p className="text-base flex-1 px-4">{description}</p>
      {isTabletOrMobile ? null : (
        <PreviousServiceButton
          handleClickPrevious={handleClickPrevious}
          className={previousButton ? "" : "invisible"}
        />
      )}
    </div>
  );
};

export default PropositionsTitle;
