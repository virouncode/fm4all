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
    let initialContainerTop = 0;
    if (containerRef.current) {
      initialContainerTop = containerRef.current.getBoundingClientRect().top;
    }
    if (titleRef?.current) {
      titleRef.current.classList.toggle("text-primary");
      titleRef.current.classList.toggle("border-primary");
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
    if (containerRef.current && initialContainerTop < 122) {
      window.scroll(0, containerRef.current.offsetTop - 120);
    }
  };
  return (
    <>
      <div
        className="sticky top-[7.6rem] z-[15] cursor-pointer bg-background py-2"
        onClick={handleClickTitle}
        ref={containerRef}
      >
        <div
          className="border-primary text-primary dark:border-foreground dark:text-foreground flex w-full items-center justify-between rounded-xl border-2 p-4 font-bold"
          ref={titleRef}
        >
          <div className="flex flex-1 items-center gap-4">
            <div className="flex items-center gap-1">
              <Icon />
              {Icon2 && <Icon2 />}
              {Icon3 && <Icon3 />}
            </div>
            <p>{title}</p>
          </div>
          <Triangle
            size={14}
            className="-rotate-180 transition fill-primary dark:fill-foreground"
            ref={triangleRef}
          />
        </div>
      </div>
      <p
        className="flex-1 px-4 text-base text-wrap hyphens-auto"
        ref={descriptionRef}
      >
        {description}
      </p>
    </>
  );
};

export default PropositionsTitleMobile;
