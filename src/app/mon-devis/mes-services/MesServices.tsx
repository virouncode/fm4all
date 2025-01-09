"use client";
import { DevisProgressContext } from "@/context/DevisProgressProvider";
import { ServicesContext } from "@/context/ServicesProvider";
import { FireExtinguisher, SprayCan, Toilet, Wrench } from "lucide-react";
import Link from "next/link";
import { useContext, useEffect } from "react";
import Hygiene from "./(hygiene)/Hygiene";
import HygieneOptions from "./(hygiene)/HygieneOptions";
import Nettoyage from "./(nettoyage)/Nettoyage";
import NettoyageOptions from "./(nettoyage)/NettoyageOptions";

import { NettoyageContext } from "@/context/NettoyageProvider";
import SecuriteIncendie from "./(incendie)/SecuriteIncendie";
import Maintenance from "./(maintenance)/Maintenance";

const servicesChoices = [
  {
    id: 1,
    description: "Nettoyage et Propreté",
    icon: <SprayCan />,
  },
  { id: 2, description: "Nettoyage options", icon: <SprayCan /> },
  { id: 3, description: "Hygiène sanitaire", icon: <Toilet /> },
  { id: 4, description: "Hygiène options", icon: <Toilet /> },
  {
    id: 5,
    description: "Maintenance",
    icon: <Wrench />,
  },
  {
    id: 6,
    description: "Protection incendie",
    icon: <FireExtinguisher />,
  },
];

const MesServices = () => {
  const { nettoyage } = useContext(NettoyageContext);
  const { services, setServices } = useContext(ServicesContext);
  const { devisProgress, setDevisProgress } = useContext(DevisProgressContext);

  useEffect(() => {
    setDevisProgress((prev) => ({ ...prev, currentStep: 2 }));
  }, [setDevisProgress]);

  useEffect(() => {
    const currentService = document.getElementById(
      services.currentServiceId.toString()
    );
    if (currentService) {
      currentService.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [services.currentServiceId]);

  const handleClickNext = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId + 1,
    }));
  };

  const handleClickPrevious = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: prev.currentServiceId - 1,
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
    <section className="flex-1 overflow-hidden">
      <Nettoyage />
      {nettoyage.propositionId && (
        <>
          <NettoyageOptions
            handleClickNext={handleClickNext}
            handleClickPrevious={handleClickPrevious}
          />
          <Hygiene
            handleClickNext={handleClickNext}
            handleClickPrevious={handleClickPrevious}
          />
          <HygieneOptions
            handleClickNext={handleClickNext}
            handleClickPrevious={handleClickPrevious}
          />
        </>
      )}
      <Maintenance handleClickNext={handleClickNext} />
      <SecuriteIncendie
        handleClickNext={handleClickNext}
        handleClickPrevious={handleClickPrevious}
      />
    </section>
  );
};

export default MesServices;
