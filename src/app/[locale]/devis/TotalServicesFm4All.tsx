"use client";

import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { TotalServicesFm4AllContext } from "@/context/TotalServicesFm4AllProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useContext } from "react";

const TotalServicesFm4All = () => {
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
        <div>Services fm4all</div>
        <div className={`flex flex-col ml-4 text-xs`}>
          {totalAssurance ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Assurance</p>
              <p className="text-end">
                {formatNumber(Math.round(totalAssurance))} € HT/an
              </p>
            </div>
          ) : null}
          {totalPlateforme ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Plateforme</p>
              <p className="text-end">
                {formatNumber(Math.round(totalPlateforme))} € HT/an
              </p>
            </div>
          ) : null}
          <div
            className={`flex items-center justify-between text-${color} font-bold`}
          >
            <p>Support Administratif</p>
            <p className="text-end">inclus</p>
          </div>
          {servicesFm4All.infos.gammeSelected !== "essentiel" &&
          totalSupportOp ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Support Opérationnel</p>
              <p className="text-end">
                {servicesFm4All.infos.gammeSelected === "confort"
                  ? `${formatNumber(Math.round(totalSupportOp))} € HT/an`
                  : "inclus"}
              </p>
            </div>
          ) : null}
          {servicesFm4All.infos.gammeSelected === "excellence" &&
          totalAccountManager ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Account Manager</p>
              <p className="text-end">
                {formatNumber(Math.round(totalAccountManager))} € HT/an
              </p>
            </div>
          ) : null}
          {totalRemiseCa ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Remise sur chiffre d&apos;affaires</p>
              <p className="text-end">
                {formatNumber(-Math.round(totalRemiseCa))} € HT/an
              </p>
            </div>
          ) : null}
          {totalRemiseHof ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Remise Office Manager</p>
              <p className="text-end">
                {formatNumber(-Math.round(totalRemiseHof))} € HT/an
              </p>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-foreground mt-2">
            <p>TOTAL</p>
            <p className="text-end">
              {formatNumber(Math.round(total))} € HT/an
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalServicesFm4All;
