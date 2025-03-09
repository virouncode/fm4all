"use client";

import { LucideIcon } from "lucide-react";
import { RefObject, useRef } from "react";
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
  propositionsRef?: RefObject<HTMLDivElement | null>;
};

const PropositionsTitle = ({
  icon: Icon,
  icon2: Icon2,
  icon3: Icon3,
  title,
  description,
  handleClickPrevious,
  previousButton = true,
  propositionsRef,
}: PropositionsTitleProps) => {
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);
  // const handleToggleContainerSize = () => {
  //   console.log("propositionsRef?.current", propositionsRef?.current);

  //   if (propositionsRef?.current) {
  //     propositionsRef.current.classList.toggle("hidden");
  //   }
  //   if (descriptionRef.current) {
  //     descriptionRef.current.classList.toggle("hidden");
  //   }
  //   if (separatorRef.current) {
  //     separatorRef.current.classList.toggle("hidden");
  //   }
  // };
  return (
    <div
      className="flex flex-col gap-4 lg:gap-0 lg:flex-row justify-between items-center pt-4 lg:pt-0 sticky top-[7.6rem] lg:static bg-white z-[15]"
      // onClick={handleToggleContainerSize}
    >
      <div className="flex justify-center lg:justify-start gap-4 items-center p-4 border-2 rounded-xl w-full lg:w-auto text-fm4allsecondary border-fm4allsecondary">
        <div className="flex items-center gap-1">
          <Icon />
          {Icon2 && <Icon2 />}
          {Icon3 && <Icon3 />}
        </div>
        <p className="font-bold">{title}</p>
      </div>
      <p
        className="text-base flex-1 px-4 hyphens-auto text-wrap"
        ref={descriptionRef}
      >
        {description}
      </p>
      <div className="w-3/4 border border-slate-400" ref={separatorRef}></div>
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
