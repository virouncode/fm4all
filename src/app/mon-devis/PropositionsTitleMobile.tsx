"use client";

import { LucideIcon, Triangle } from "lucide-react";
import { useRef } from "react";

type PropositionsTitleMobileProps = {
  icon: LucideIcon;
  icon2?: LucideIcon;
  icon3?: LucideIcon;
  title: string;
  description: string;
  propositionsRef: React.RefObject<HTMLDivElement | null>;
};

const PropositionsTitleMobile = ({
  icon: Icon,
  icon2: Icon2,
  icon3: Icon3,
  title,
  description,
  propositionsRef,
}: PropositionsTitleMobileProps) => {
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const triangleRef = useRef<SVGSVGElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleClickTitle = () => {
    if (titleRef?.current) {
      titleRef.current.classList.toggle("text-fm4allsecondary");
      titleRef.current.classList.toggle("border-fm4allsecondary");
      titleRef.current.classList.toggle("border-2");
      titleRef.current.classList.toggle("border");
      titleRef.current.classList.toggle("font-bold");
    }
    if (propositionsRef?.current) {
      propositionsRef.current.classList.toggle("hidden");
    }
    if (descriptionRef.current) {
      descriptionRef.current.classList.toggle("hidden");
    }
    if (triangleRef.current) {
      triangleRef.current.classList.toggle("-rotate-180");
      triangleRef.current.classList.toggle("-rotate-90");
    }
    // if (containerRef.current) {
    //   containerRef.current.scrollIntoView();
    // }
  };
  return (
    <>
      <div
        className="py-2 sticky top-[7.6rem] bg-white z-[15]"
        onClick={handleClickTitle}
        ref={containerRef}
      >
        <div
          className="flex items-center p-4 justify-between border-2 rounded-xl w-full text-fm4allsecondary border-fm4allsecondary font-bold"
          ref={titleRef}
        >
          <div className="flex-1 flex items-center  gap-4">
            <div className="flex items-center gap-1">
              <Icon />
              {Icon2 && <Icon2 />}
              {Icon3 && <Icon3 />}
            </div>
            <p>{title}</p>
          </div>
          <Triangle
            size={14}
            className="-rotate-180 transition"
            fill="#164f64"
            ref={triangleRef}
          />
        </div>
      </div>
      <p
        className="text-base flex-1 px-4 hyphens-auto text-wrap"
        ref={descriptionRef}
      >
        {description}
      </p>
    </>
  );
};

export default PropositionsTitleMobile;
