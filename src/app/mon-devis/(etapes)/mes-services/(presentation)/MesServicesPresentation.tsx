"use client";

import { ServicesContext } from "@/context/ServicesProvider";
import { Info, SquareArrowOutUpRight } from "lucide-react";
import { useContext } from "react";
import { useMediaQuery } from "react-responsive";
import NextServiceButton from "../../../NextServiceButton";
import MesServicesPresentationCards from "./MesServicesPresentationCards";
import MesServicesPresentationGammes from "./MesServicesPresentationGammes";
import MesServicesPresentationGammesCarousel from "./MesServicesPresentationGammesCarousel";

const MesServicesPresentation = () => {
  const { setServices } = useContext(ServicesContext);

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  // const isGammeSelected = (gamme: GammeType) => gamme === gammeSelected;
  const handleClickNext = () => {
    setServices((prev) => ({
      ...prev,
      currentServiceId: 1,
    }));
  };
  return (
    <div
      className="flex flex-col gap-4 w-full mx-auto h-full py-2 mb-14 lg:mb-0"
      id="0"
    >
      <div className="w-full flex-1 overflow-auto">
        <div className="h-full flex flex-col gap-6">
          <p>
            <strong>Nous allons vous proposer des offres</strong> de plusieurs
            prestataires dans les <strong>3 gammes</strong> pour chacun des
            services suivants :
          </p>
          <MesServicesPresentationCards />
          <div>
            <p>
              Cliquez sur le <strong>logo du prestataire</strong>{" "}
              <SquareArrowOutUpRight
                size={16}
                className="hidden lg:inline-block"
              />{" "}
              pour plus d&apos;informations sur l&apos;entreprise.
            </p>
            <p>
              Pour chaque offre, <strong>cliquez sur </strong>{" "}
              <Info className="hidden lg:inline-block" size={14} />
              <span className="lg:hidden font-bold">la photo</span> pour en
              savoir plus et sélectionnez l&apos;offre qui vous convient.
            </p>
          </div>
          {isTabletOrMobile ? (
            <MesServicesPresentationGammesCarousel />
          ) : (
            <MesServicesPresentationGammes />
          )}
        </div>
      </div>
      {!isTabletOrMobile && (
        <NextServiceButton handleClickNext={handleClickNext} />
      )}
    </div>
  );
};

export default MesServicesPresentation;
