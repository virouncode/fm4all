"use client";
import { DevisDataContext } from "@/context/DevisDataProvider";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import Link from "next/link";
import { useContext, useState } from "react";
import Boissons from "./Boissons";
import Cafe from "./Cafe";
import Fontaine from "./Fontaine";
import Fruits from "./Fruits";
import Maintenance from "./Maintenance";
import Nettoyage from "./Nettoyage";
import OfficeManager from "./OfficeManager";
import SecuriteIncendie from "./SecuriteIncendie";
import ServicesFm4All from "./ServicesFm4All";
import ServicesSelection from "./ServicesSelection";
import Snacks from "./Snacks";

const MesServices = () => {
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);
  const { devisData, setDevisData } = useContext(DevisDataContext);
  const [selectedServicesIds, setSelectedServicesIds] = useState<number[]>([]);
  const [currentServiceId, setCurrentServiceId] = useState<number | null>(null);

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
  const handleClickNext = () => {
    console.log("selectedServicesIds", selectedServicesIds);
    console.log("currentServiceId", currentServiceId);

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

  return (
    <div className="h-full overflow-hidden">
      <ServicesSelection
        selectedServicesIds={selectedServicesIds}
        setSelectedServicesIds={setSelectedServicesIds}
        handleClickNext={handleClickNext}
      />
      {selectedServicesIds.includes(1) && (
        <Nettoyage
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(2) && (
        <Maintenance
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(3) && (
        <SecuriteIncendie
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(4) && (
        <Fontaine
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(5) && (
        <Cafe
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(6) && (
        <Fruits
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(7) && (
        <Snacks
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(8) && (
        <Boissons
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(9) && (
        <OfficeManager
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
      {selectedServicesIds.includes(10) && (
        <ServicesFm4All
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
          selectedServicesIds={selectedServicesIds}
        />
      )}
    </div>
  );
};

export default MesServices;
