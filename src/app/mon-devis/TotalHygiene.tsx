import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useContext } from "react";

const TotalHygiene = () => {
  const { hygiene } = useContext(HygieneContext);
  const { totalHygiene } = useContext(TotalHygieneContext);
  const {
    totalTrilogie,
    totalDesinfectant,
    totalParfum,
    totalBalai,
    totalPoubelle,
  } = totalHygiene;
  const total = Math.round(
    totalTrilogie + totalDesinfectant + totalParfum + totalBalai + totalPoubelle
  );

  if (total === 0) return null;

  const colorTrilogie = getFm4AllColor(hygiene.infos.trilogieGammeSelected);
  const colorDesinfectant = getFm4AllColor(
    hygiene.infos.desinfectantGammeSelected
  );
  const colorParfum = getFm4AllColor(hygiene.infos.parfumGammeSelected);
  const colorBalai = getFm4AllColor(hygiene.infos.balaiGammeSelected);
  const colorPoubelle = getFm4AllColor(hygiene.infos.poubelleGammeSelected);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>Hygiene ({hygiene.infos.nomFournisseur})</div>
        <div className="flex flex-col ml-4 text-xs ">
          {totalTrilogie ? (
            <div
              className={`flex items-center justify-between text-${colorTrilogie} font-bold`}
            >
              <p>Trilogie EMP / Savon / PH</p>
              <p className="text-end">
                {formatNumber(totalTrilogie)} € HT / an
              </p>
            </div>
          ) : null}
          {totalDesinfectant ? (
            <div
              className={`flex items-center justify-between text-${colorDesinfectant} font-bold`}
            >
              <p>Option désinfectant</p>
              <p className="text-end">
                {formatNumber(totalDesinfectant)} € HT / an
              </p>
            </div>
          ) : null}
          {totalParfum ? (
            <div
              className={`flex items-center justify-between text-${colorParfum} font-bold`}
            >
              <p>Option parfum</p>
              <p className="text-end">{formatNumber(totalParfum)} € HT / an</p>
            </div>
          ) : null}
          {totalBalai ? (
            <div
              className={`flex items-center justify-between text-${colorBalai} font-bold`}
            >
              <p>Option balais WC</p>
              <p className="text-end">{formatNumber(totalBalai)} € HT / an</p>
            </div>
          ) : null}
          {totalPoubelle ? (
            <div
              className={`flex items-center justify-between text-${colorPoubelle} font-bold`}
            >
              <p>Option poubelle hygiène féminine</p>
              <p className="text-end">
                {formatNumber(totalPoubelle)} € HT / an
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

export default TotalHygiene;
