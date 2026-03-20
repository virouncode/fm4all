"use client";
import { MARGE } from "@/constants/constants";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { useTotalNettoyageStore } from "@/stores/devis/totalNettoyageStore";
import { useTranslations } from "next-intl";

const TotalNettoyage = () => {
  const t = useTranslations("Total");
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
  const totalNettoyage = useTotalNettoyageStore((s) => s.totalNettoyage);
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
    <div className="total-section flex flex-col gap-4" id="total-nettoyage">
      <div className="flex flex-col gap-4">
        <div>
          {t("nettoyage")} ({nettoyage.infos.nomPrestataire})
        </div>
        <div className="ml-4 flex flex-col text-xs">
          {totalService ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("nettoyage")}</p>
              <p className="text-end" data-testid="total-service">
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
              <p className="text-end" data-testid="total-repasse">
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
              <p className="text-end" data-testid="total-samedi">
                {formatNumber(Math.round(totalSamedi * MARGE))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalDimanche ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("option-dimanche")}</p>
              <p className="text-end" data-testid="total-dimanche">
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
              <p className="text-end" data-testid="total-vitrerie">
                {formatNumber(Math.round(totalVitrerie * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          <div className="border-foreground mt-2 flex items-center justify-between border-t">
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
