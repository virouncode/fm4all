"use client";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import Link from "next/link";
import { useContext, useEffect } from "react";
import Nettoyage from "./(nettoyage)/Nettoyage";
import Proprete from "./(proprete)/Proprete";
import Maintenance from "./Maintenance";
import OfficeManager from "./OfficeManager";
import SecuriteIncendie from "./SecuriteIncendie";
import ServicesFm4All from "./ServicesFm4All";
import ServicesSelection from "./ServicesSelection";

const MesServices = () => {
  const { services, setServices } = useContext(ServicesContext);
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);

  useEffect(() => {
    setDevisProgress((prev) => ({ ...prev, currentStep: 2 }));
  }, [setDevisProgress]);

  useEffect(() => {
    if (services.currentServiceId) {
      const currentService = document.getElementById(
        services.currentServiceId.toString()
      );
      if (currentService) {
        currentService.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } else {
      const servicesSelection = document.getElementById("services-selection");
      if (servicesSelection) {
        servicesSelection.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [services.currentServiceId]);

  const handleClickNext = () => {
    //In ServicesSelection
    if (services.currentServiceId === null) {
      setServices((prev) => ({
        ...prev,
        currentServiceId: 1,
      }));
      return;
    }
    //I'm in a Service
    setServices((prev) => ({
      ...prev,
      currentServiceId:
        services.selectedServicesIds[
          services.selectedServicesIds.indexOf(
            services.currentServiceId as number
          ) + 1
        ],
    }));
  };

  const handleClickPrevious = () => {
    //I'm in the first service
    if (services.currentServiceId === 1) {
      setServices((prev) => ({ ...prev, currentServiceId: null }));
      return;
    }
    //I'm sure that services.currentServiceId is not null
    setServices((prev) => ({
      ...prev,
      currentServiceId:
        services.selectedServicesIds[
          services.selectedServicesIds.indexOf(
            services.currentServiceId as number
          ) - 1
        ],
    }));
  };

  //Breadcrumb links should not authorize this case but just in case
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
      {services.selectedServicesIds.includes(1) && (
        <Nettoyage
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      {services.selectedServicesIds.includes(1) && (
        <Proprete
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
        />
      )}

      {services.selectedServicesIds.includes(3) && (
        <Maintenance
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      {services.selectedServicesIds.includes(4) && (
        <SecuriteIncendie
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      {services.selectedServicesIds.includes(5) && (
        <OfficeManager
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
        />
      )}
      {services.selectedServicesIds.includes(6) && (
        <ServicesFm4All
          handleClickNext={handleClickNext}
          handleClickPrevious={handleClickPrevious}
        />
      )}
    </>
  );
};

export default MesServices;
