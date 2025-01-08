import { TotalPropreteContext } from "@/context/TotalPropreteProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const TotalProprete = () => {
  const { totalProprete } = useContext(TotalPropreteContext);
  const totalParAn = formatNumber(
    [
      totalProprete.prixTrilogieAbonnement,
      totalProprete.prixTrilogieAchat?.prixConsommables,
      totalProprete.prixDesinfectantAbonnement,
      totalProprete.prixDesinfectantAchat?.prixConsommables,
      totalProprete.prixParfum,
      totalProprete.prixBalai,
      totalProprete.prixPoubelle,
    ]
      .filter((value) => value !== null && value !== undefined)
      .reduce((acc, curr) => acc + curr, 0)
  ); // Initial value of 0 prevents null
  const totalAchat = formatNumber(
    [
      totalProprete.prixTrilogieAchat?.prixAchat,
      totalProprete.prixDesinfectantAchat?.prixAchat,
    ]
      .filter((value) => value !== null && value !== undefined)
      .reduce((acc, curr) => acc + curr, 0)
  );
  return (
    <div className="flex flex-col gap-4">
      {totalProprete.nomFournisseur && (
        <div className="flex flex-col gap-4">
          <div>Proprete ({totalProprete.nomFournisseur})</div>
          <div className="flex flex-col ml-4 text-xs ">
            {totalProprete.prixTrilogieAbonnement && (
              <div className="flex items-center justify-between">
                <p>Trilogie EMP / Savon / PH</p>
                <p className="text-end">
                  {formatNumber(totalProprete.prixTrilogieAbonnement)} € HT / an
                </p>
              </div>
            )}
            {totalProprete.prixTrilogieAchat && (
              <div className="flex justify-between">
                <p>Trilogie EMP / Savon / PH</p>
                <div className="flex flex-col">
                  <p className="text-end">
                    {formatNumber(totalProprete.prixTrilogieAchat.prixAchat)} €
                    HT / achat
                  </p>
                  <p className="text-end">
                    {formatNumber(
                      totalProprete.prixTrilogieAchat.prixConsommables
                    )}{" "}
                    € HT / an
                  </p>
                </div>
              </div>
            )}
            {totalProprete.prixDesinfectantAbonnement && (
              <div className="flex items-center justify-between">
                <p>Option désinfectant</p>
                <p className="text-end">
                  {formatNumber(totalProprete.prixDesinfectantAbonnement)} € HT
                  / an
                </p>
              </div>
            )}
            {totalProprete.prixDesinfectantAchat && (
              <div className="flex justify-between">
                <p>Option désinfectants cuvettes</p>
                <div className="flex flex-col">
                  <p className="text-end">
                    {formatNumber(
                      totalProprete.prixDesinfectantAchat.prixAchat
                    )}{" "}
                    € HT / achat
                  </p>
                  <p className="text-end">
                    {formatNumber(
                      totalProprete.prixDesinfectantAchat.prixConsommables
                    )}{" "}
                    € HT / an
                  </p>
                </div>
              </div>
            )}
            {totalProprete.prixParfum && (
              <div className="flex items-center justify-between">
                <p>Option parfum</p>
                <p className="text-end">
                  {formatNumber(totalProprete.prixParfum)} € HT / an
                </p>
              </div>
            )}
            {totalProprete.prixBalai && (
              <div className="flex items-center justify-between">
                <p>Option balai</p>
                <p className="text-end">
                  {formatNumber(totalProprete.prixBalai)} € HT / an
                </p>
              </div>
            )}
            {totalProprete.prixPoubelle && (
              <div className="flex items-center justify-between">
                <p>Option poubelle hygiène féminine</p>
                <p className="text-end">
                  {formatNumber(totalProprete.prixPoubelle)} € HT / an
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

export default TotalProprete;
