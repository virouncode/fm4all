"use client";
import useScrollIntoService from "@/hooks/use-scroll-into-service";
import { useServicesStore } from "@/stores/servicesStore";
import { useTranslations } from "next-intl";
import React, { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import PropositionsFooter from "../../../PropositionsFooter";
import PropositionsTitle from "../../../PropositionsTitle";
import PropositionsTitleMobile from "../../../PropositionsTitleMobile";

const ServiceWrapper = ({
  children,
  serviceId,
}: {
  children: React.ReactNode;
  serviceId: number;
}) => {
  const tPresentation = useTranslations(
    "DevisPage.services.presentation.cards",
  );
  const setServices = useServicesStore((s) => s.setServices);
  useScrollIntoService();
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const propositionsRef = useRef<HTMLDivElement>(null);
  return (
    <div
      className="mx-auto flex h-full w-full flex-col gap-4 py-2"
      id={serviceId.toString()}
    >
      {isTabletOrMobile ? (
        <PropositionsTitleMobile
          serviceId={serviceId}
          propositionsRef={propositionsRef}
        />
      ) : (
        <PropositionsTitle serviceId={serviceId} />
      )}
      <div
        className="w-full flex-1 overflow-auto transition"
        ref={propositionsRef}
      >
        {children}
      </div>
      {isTabletOrMobile ? null : <PropositionsFooter serviceId={serviceId} />}
    </div>
  );
};

export default ServiceWrapper;
