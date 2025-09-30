"use client";

import { useServicesStore } from "@/stores/servicesStore";
import PreviousServiceButton from "./PreviousServiceButton";

type PropositionsTitleProps = {
  service: {
    id: number;
    icon: React.ReactNode;
    title: string;
    description: string;
  };
  previousButton?: boolean;
};

const PropositionsTitle = ({
  service,
  previousButton = true,
}: PropositionsTitleProps) => {
  const setServices = useServicesStore((s) => s.setServices);
  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
    }));
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
      <div className="border-fm4allsecondary text-fm4allsecondary flex w-full items-center justify-center gap-4 rounded-xl border-2 p-4 lg:w-auto lg:justify-start">
        <div className="flex items-center gap-1">{service.icon}</div>
        <p className="font-bold">{service.title}</p>
      </div>
      <p className="flex-1 px-4 text-base text-wrap hyphens-auto">
        {service.description}
      </p>
      <PreviousServiceButton
        handleClickPrevious={handleClickPrevious}
        className={previousButton ? "" : "hidden"}
      />
    </div>
  );
};

export default PropositionsTitle;
