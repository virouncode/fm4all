"use client";
import { DevisDataContext } from "@/context/DevisDataProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import ConsommablesProprete from "./(consommablesProprete)/ConsommablesProprete";
import Nettoyage from "./(nettoyage)/Nettoyage";
import Maintenance from "./Maintenance";
import OfficeManager from "./OfficeManager";
import SecuriteIncendie from "./SecuriteIncendie";
import ServicesFm4All from "./ServicesFm4All";
import ServicesSelection from "./ServicesSelection";

const MesServices = () => {
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const { devisData } = useContext(DevisDataContext);
  const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);
  const selectedServicesIds = devisData.services.selectedServicesIds;

  useEffect(() => {
    setDevisProgress((prev) => ({ ...prev, currentStep: 2 }));
  }, [setDevisProgress]);

  const handleClickNext = () => {
    if (currentServiceId === null) {
      setCurrentServiceId(1);
      const nextService = document.getElementById(
        selectedServicesIds[0].toString()
      );
      if (nextService) {
        nextService.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }
    }
    const nextService = document.getElementById(
      selectedServicesIds[
        selectedServicesIds.indexOf(currentServiceId as number) + 1
      ].toString()
    );

    if (nextService) {
      nextService.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    setCurrentServiceId(
      (currentServiceId) =>
        selectedServicesIds[
          selectedServicesIds.indexOf(currentServiceId as number) + 1
        ]
    );
  };

  const handleClickPrevious = () => {
    if (currentServiceId === 1) {
      setCurrentServiceId(null);
      const servicesSelection = document.getElementById("services-selection");
      if (servicesSelection) {
        servicesSelection.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
        return;
      }
    }
    const previousService = document.getElementById(
      selectedServicesIds[
        selectedServicesIds.indexOf(currentServiceId as number) - 1
      ].toString()
    );
    if (previousService) {
      previousService.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    setCurrentServiceId(
      (currentServiceId) =>
        selectedServicesIds[
          selectedServicesIds.indexOf(currentServiceId as number) - 1
        ]
    );
  };
  if (!devisProgress.completedSteps.includes(1)) {
    return (
      <div className="text-base md:text-lg mx-auto max-w-prose mt-10">
        Vous devez d&apos;abord remplir les informations sur vos{" "}
        <Link href="/mon-devis/mes-locaux" className="underline">
          locaux
        </Link>
        .
      </div>
    );
  }

  return (
    <>
      <ServicesSelection handleClickNext={handleClickNext} />
      {selectedServicesIds.includes(1) && (
        <Nettoyage
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(1) && (
        <ConsommablesProprete
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}

      {selectedServicesIds.includes(3) && (
        <Maintenance
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(4) && (
        <SecuriteIncendie
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(5) && (
        <OfficeManager
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(6) && (
        <ServicesFm4All
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
    </>
  );
};

export default MesServices;
