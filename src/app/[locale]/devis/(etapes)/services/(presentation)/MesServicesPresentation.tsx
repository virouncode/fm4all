"use client";

import { ServicesContext } from "@/context/ServicesProvider";
import { Info, SquareArrowOutUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { useMediaQuery } from "react-responsive";
import NextServiceButton from "../../../NextServiceButton";
import MesServicesPresentationCards from "./MesServicesPresentationCards";
import MesServicesPresentationGammes from "./MesServicesPresentationGammes";
import MesServicesPresentationGammesCarousel from "./MesServicesPresentationGammesCarousel";

const MesServicesPresentation = () => {
  const t = useTranslations("DevisPage.services.presentation");
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
            <strong>{t("nous-allons-vous-proposer-des-offres")}</strong>{" "}
            {t("de-plusieurs-prestataires-dans-les")}{" "}
            <strong>{t("3-gammes")}</strong>{" "}
            {t("pour-chacun-des-services-suivants")}
          </p>
          <MesServicesPresentationCards />
          <div>
            <p className="mb-2">{t("pour-chaque-offre")} </p>
            <ul className="ml-10">
              <li className="list-finger">
                {t("cliquez-sur-le")}{" "}
                <strong>{t("logo-du-prestataire")}</strong>{" "}
                <SquareArrowOutUpRight
                  size={16}
                  className="hidden lg:inline-block"
                />{" "}
                {t("pour-plus-d-informations-sur-l-entreprise")}
              </li>
              <li className="list-finger">
                {t("cliquez-sur")}{" "}
                <Info className="hidden lg:inline-block" size={14} />
                <span className="lg:hidden font-bold">
                  {t("la-photo")}
                </span>{" "}
                {t(
                  "pour-en-savoir-plus-et-selectionnez-l-offre-qui-vous-convient"
                )}
              </li>
            </ul>
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
