"use client";

import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { TotalServicesFm4AllContext } from "@/context/TotalServicesFm4AllProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useContext } from "react";

const TotalServicesFm4All = () => {
  const { servicesFm4All } = useContext(ServicesFm4AllContext);

  const { totalServicesFm4All } = useContext(TotalServicesFm4AllContext);

  const total =
    totalServicesFm4All.totalAssurance +
    totalServicesFm4All.totalPlateforme +
    totalServicesFm4All.totalSupportAdmin +
    totalServicesFm4All.totalSupportOp +
    totalServicesFm4All.totalAccountManager -
    totalServicesFm4All.totalRemiseCa -
    totalServicesFm4All.totalRemiseHof;
  const color = getFm4AllColor(servicesFm4All.infos.gammeSelected);

  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>Services fm4All</div>
        <div className={`flex flex-col ml-4 text-xs`}>
          <div
            className={`flex items-center justify-between text-${color} font-bold`}
          >
            <p>Assurance</p>
            <p className="text-end">
              {Math.round(totalServicesFm4All.totalAssurance)} € HT / an
            </p>
          </div>
          <div
            className={`flex items-center justify-between text-${color} font-bold`}
          >
            <p>Plateforme</p>
            <p className="text-end">
              {Math.round(totalServicesFm4All.totalPlateforme)} € HT / an
            </p>
          </div>
          <div
            className={`flex items-center justify-between text-${color} font-bold`}
          >
            <p>Support Administratif</p>
            <p className="text-end">inclus</p>
          </div>
          {servicesFm4All.infos.gammeSelected !== "essentiel" && (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Support Opérationnel</p>
              <p className="text-end">
                {servicesFm4All.infos.gammeSelected === "confort"
                  ? `${Math.round(
                      totalServicesFm4All.totalSupportOp
                    )} € HT / an`
                  : "inclus"}
              </p>
            </div>
          )}
          {servicesFm4All.infos.gammeSelected === "excellence" && (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Account Manager</p>
              <p className="text-end">
                {formatNumber(totalServicesFm4All.totalAccountManager)} € HT /
                an
              </p>
            </div>
          )}
          {totalServicesFm4All.totalRemiseCa ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Remise sur chiffre d&apos;affaires</p>
              <p className="text-end">
                {formatNumber(-totalServicesFm4All.totalRemiseCa)} € HT / an
              </p>
            </div>
          ) : null}
          {totalServicesFm4All.totalRemiseHof ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Remise Office Manager</p>
              <p className="text-end">
                {formatNumber(-totalServicesFm4All.totalRemiseHof)} € HT / an
              </p>
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-foreground mt-2">
            <p>TOTAL</p>
            <p className="text-end">{formatNumber(total)} € HT / an</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalServicesFm4All;
