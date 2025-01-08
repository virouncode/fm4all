import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const TotalNettoyage = () => {
  const { totalNettoyage } = useContext(TotalNettoyageContext);
  const total = formatNumber(
    [
      totalNettoyage.prixService,
      totalNettoyage.prixRepasse,
      totalNettoyage.prixSamedi,
      totalNettoyage.prixDimanche,
      totalNettoyage.prixVitrerie,
    ]
      .filter((value) => value !== null)
      .reduce((acc, curr) => acc + curr, 0)
  ); // Initial value of 0 prevents null
  return (
    <div className="flex flex-col gap-4">
      {totalNettoyage.nomFournisseur && (
        <div className="flex flex-col gap-4">
          <div>Nettoyage ({totalNettoyage.nomFournisseur})</div>
          <div className="flex flex-col ml-4 text-xs ">
            {totalNettoyage.prixService && (
              <div className="flex items-center justify-between">
                <p>Service</p>
                <p className="text-end">
                  {formatNumber(totalNettoyage.prixService)} € HT / an
                </p>
              </div>
            )}
            {totalNettoyage.prixRepasse && (
              <div className="flex items-center justify-between">
                <p>Option repasse</p>
                <p className="text-end">
                  {formatNumber(totalNettoyage.prixRepasse)} € HT / an
                </p>
              </div>
            )}
            {totalNettoyage.prixSamedi && (
              <div className="flex items-center justify-between">
                <p>Option samedi</p>
                <p className="text-end">
                  {formatNumber(totalNettoyage.prixSamedi)} € HT / an
                </p>
              </div>
            )}
            {totalNettoyage.prixDimanche && (
              <div className="flex items-center justify-between">
                <p>Option dimanche</p>
                <p className="text-end">
                  {formatNumber(totalNettoyage.prixDimanche)} € HT / an
                </p>
              </div>
            )}
            {totalNettoyage.prixVitrerie && (
              <div className="flex items-center justify-between">
                <p>Option vitrerie</p>
                <p className="text-end">
                  {formatNumber(totalNettoyage.prixVitrerie)} € HT / an
                </p>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-foreground mt-2">
              <p>TOTAL</p>
              <p className="text-end">{total} € HT / an</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalNettoyage;
