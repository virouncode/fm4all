import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const TotalHygiene = () => {
  const { totalHygiene } = useContext(TotalHygieneContext);
  const totalParAn = formatNumber(
    [
      totalHygiene.prixTrilogieAbonnement,
      totalHygiene.prixTrilogieAchat?.prixConsommables,
      totalHygiene.prixDesinfectantAbonnement,
      totalHygiene.prixDesinfectantAchat?.prixConsommables,
      totalHygiene.prixParfum,
      totalHygiene.prixBalai,
      totalHygiene.prixPoubelle,
    ]
      .filter((value) => value !== null && value !== undefined)
      .reduce((acc, curr) => acc + curr, 0)
  ); // Initial value of 0 prevents null
  const totalAchat = formatNumber(
    [
      totalHygiene.prixTrilogieAchat?.prixAchat,
      totalHygiene.prixDesinfectantAchat?.prixAchat,
    ]
      .filter((value) => value !== null && value !== undefined)
      .reduce((acc, curr) => acc + curr, 0)
  );
  return (
    <div className="flex flex-col gap-4">
      {totalHygiene.nomFournisseur && (
        <div className="flex flex-col gap-4">
          <div>Hygiene ({totalHygiene.nomFournisseur})</div>
          <div className="flex flex-col ml-4 text-xs ">
            {totalHygiene.prixTrilogieAbonnement && (
              <div className="flex items-center justify-between">
                <p>Trilogie EMP / Savon / PH</p>
                <p className="text-end">
                  {formatNumber(totalHygiene.prixTrilogieAbonnement)} € HT / an
                </p>
              </div>
            )}
            {totalHygiene.prixTrilogieAchat && (
              <div className="flex justify-between">
                <p>Trilogie EMP / Savon / PH</p>
                <div className="flex flex-col">
                  <p className="text-end">
                    {formatNumber(totalHygiene.prixTrilogieAchat.prixAchat)} €
                    HT / achat
                  </p>
                  <p className="text-end">
                    {formatNumber(
                      totalHygiene.prixTrilogieAchat.prixConsommables
                    )}{" "}
                    € HT / an
                  </p>
                </div>
              </div>
            )}
            {totalHygiene.prixDesinfectantAbonnement && (
              <div className="flex items-center justify-between">
                <p>Option désinfectant</p>
                <p className="text-end">
                  {formatNumber(totalHygiene.prixDesinfectantAbonnement)} € HT /
                  an
                </p>
              </div>
            )}
            {totalHygiene.prixDesinfectantAchat && (
              <div className="flex justify-between">
                <p>Option désinfectants cuvettes</p>
                <div className="flex flex-col">
                  <p className="text-end">
                    {formatNumber(totalHygiene.prixDesinfectantAchat.prixAchat)}{" "}
                    € HT / achat
                  </p>
                  <p className="text-end">
                    {formatNumber(
                      totalHygiene.prixDesinfectantAchat.prixConsommables
                    )}{" "}
                    € HT / an
                  </p>
                </div>
              </div>
            )}
            {totalHygiene.prixParfum && (
              <div className="flex items-center justify-between">
                <p>Option parfum</p>
                <p className="text-end">
                  {formatNumber(totalHygiene.prixParfum)} € HT / an
                </p>
              </div>
            )}
            {totalHygiene.prixBalai && (
              <div className="flex items-center justify-between">
                <p>Option balais WC</p>
                <p className="text-end">
                  {formatNumber(totalHygiene.prixBalai)} € HT / an
                </p>
              </div>
            )}
            {totalHygiene.prixPoubelle && (
              <div className="flex items-center justify-between">
                <p>Option poubelle hygiène féminine</p>
                <p className="text-end">
                  {formatNumber(totalHygiene.prixPoubelle)} € HT / an
                </p>
              </div>
            )}
            {totalAchat !== "0" ? (
              <>
                <div className="flex items-center justify-between border-t border-foreground mt-2">
                  <p>TOTAL</p>
                  <p className="text-end">{totalParAn} € HT / an</p>
                </div>
                <div className="flex items-center justify-between">
                  <p>TOTAL ACHAT</p>
                  <p className="text-end">{totalAchat} € HT</p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between border-t border-foreground mt-2">
                <p>TOTAL</p>
                <p className="text-end">{totalParAn} € HT / an</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalHygiene;
