"use client";

import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { TotalServicesFm4AllContext } from "@/context/TotalServicesFm4AllProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useTranslations } from "next-intl";
import { useContext } from "react";

const TotalServicesFm4All = () => {
  const t = useTranslations("Total");
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
  const { totalServicesFm4All } = useContext(TotalServicesFm4AllContext);

  const {
    totalAssurance,
    totalPlateforme,
    totalSupportOp,
    totalSupportAdmin,
    totalAccountManager,
    totalRemiseCa,
    totalRemiseHof,
  } = totalServicesFm4All;

  const total =
    servicesFm4All.infos.gammeSelected === "essentiel"
      ? (totalAssurance ?? 0) +
        (totalPlateforme ?? 0) +
        (totalSupportAdmin ?? 0) -
        (totalRemiseCa ?? 0) -
        (totalRemiseHof ?? 0)
      : servicesFm4All.infos.gammeSelected === "confort"
        ? (totalAssurance ?? 0) +
          (totalPlateforme ?? 0) +
          (totalSupportAdmin ?? 0) +
          (totalSupportOp ?? 0) -
          (totalRemiseCa ?? 0) -
          (totalRemiseHof ?? 0)
        : (totalAssurance ?? 0) +
          (totalPlateforme ?? 0) +
          (totalSupportAdmin ?? 0) +
          (totalSupportOp ?? 0) +
          (totalAccountManager ?? 0) -
          (totalRemiseCa ?? 0) -
          (totalRemiseHof ?? 0);

  const color = getFm4AllColor(servicesFm4All.infos.gammeSelected);

  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-4 total-section" id="total-fm4all">
      <div className="flex flex-col gap-4">
        <div>{t("services-fm4all")}</div>
        <div className={`flex flex-col ml-4 text-xs`}>
          {totalAssurance ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("assurance")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalAssurance))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalPlateforme ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("plateforme")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalPlateforme))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          <div
            className={`flex items-center justify-between text-${color} font-bold`}
          >
            <p>{t("support-administratif")}</p>
            <p className="text-end">{t("inclus")}</p>
          </div>
          {servicesFm4All.infos.gammeSelected !== "essentiel" &&
          totalSupportOp ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("support-operationnel")}</p>
              <p className="text-end">
                {servicesFm4All.infos.gammeSelected === "confort"
                  ? `${formatNumber(Math.round(totalSupportOp))}` +
                    t("eur-ht-an")
                  : t("inclus")}
              </p>
            </div>
          ) : null}
          {servicesFm4All.infos.gammeSelected === "excellence" &&
          totalAccountManager ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("account-manager")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalAccountManager))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalRemiseCa ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("remise-sur-chiffre-daffaires")}</p>
              <p className="text-end">
                {formatNumber(-Math.round(totalRemiseCa))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalRemiseHof ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("remise-office-manager")}</p>
              <p className="text-end">
                {formatNumber(-Math.round(totalRemiseHof))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-foreground mt-2">
            <p>TOTAL</p>
            <p className="text-end">
              {formatNumber(Math.round(total))} {t("eur-ht-an")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalServicesFm4All;
