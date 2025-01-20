"use client";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useContext } from "react";

const TotalNettoyage = () => {
  const { nettoyage } = useContext(NettoyageContext);
  const { totalNettoyage } = useContext(TotalNettoyageContext);
  const {
    totalService,
    totalRepasse,
    totalSamedi,
    totalDimanche,
    totalVitrerie,
  } = totalNettoyage;
  const total = Math.round(
    totalService + totalRepasse + totalSamedi + totalDimanche + totalVitrerie
  );

  if (total === 0) return null;

  const color = getFm4AllColor(nettoyage.infos.gammeSelected);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>Nettoyage ({nettoyage.infos.nomFournisseur})</div>
        <div className="flex flex-col ml-4 text-xs ">
          {totalService ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Service</p>
              <p className="text-end">{formatNumber(totalService)} € HT / an</p>
            </div>
          ) : null}
          {totalRepasse ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Option repasse</p>
              <p className="text-end">{formatNumber(totalRepasse)} € HT / an</p>
            </div>
          ) : null}
          {totalSamedi ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Option samedi</p>
              <p className="text-end">{formatNumber(totalSamedi)} € HT / an</p>
            </div>
          ) : null}
          {totalDimanche ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Option dimanche</p>
              <p className="text-end">
                {formatNumber(totalDimanche)} € HT / an
              </p>
            </div>
          ) : null}
          {totalVitrerie ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Option vitrerie</p>
              <p className="text-end">
                {formatNumber(totalVitrerie)} € HT / an
              </p>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-foreground mt-2">
            <p>TOTAL</p>
            <p className="text-end">{total} € HT / an</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalNettoyage;
