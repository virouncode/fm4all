"use client";
import { MARGE } from "@/constants/constants";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useTranslations } from "next-intl";
import { useContext } from "react";

const TotalNettoyage = () => {
  const t = useTranslations("Total");
  const { nettoyage } = useContext(NettoyageContext);
  const { totalNettoyage } = useContext(TotalNettoyageContext);
  const {
    totalService,
    totalRepasse,
    totalSamedi,
    totalDimanche,
    totalVitrerie,
  } = totalNettoyage;
  const total = Object.values(totalNettoyage)
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);

  if (!total) return null;

  const color = getFm4AllColor(nettoyage.infos.gammeSelected);

  return (
    <div className="flex flex-col gap-4 total-section" id="total-nettoyage">
      <div className="flex flex-col gap-4">
        <div>
          {t("nettoyage")} ({nettoyage.infos.nomFournisseur})
        </div>
        <div className="flex flex-col ml-4 text-xs">
          {totalService ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("nettoyage")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalService * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalRepasse ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("option-repasse")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalRepasse * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalSamedi ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("option-samedi")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalSamedi * MARGE))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalDimanche ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("option-dimanche")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalDimanche * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalVitrerie ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("option-vitrerie")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalVitrerie * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-foreground mt-2">
            <p>TOTAL</p>
            <p className="text-end">
              {formatNumber(Math.round(total * MARGE))} {t("eur-ht-an")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalNettoyage;
