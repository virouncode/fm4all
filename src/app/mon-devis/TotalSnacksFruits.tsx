import { MARGE } from "@/constants/constants";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useContext } from "react";

const TotalSnacksFruits = () => {
  const { snacksFruits } = useContext(SnacksFruitsContext);
  const { totalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const totalFruits = totalSnacksFruits.totalFruits;
  const totalSnacks = totalSnacksFruits.totalSnacks;
  const totalBoissons = totalSnacksFruits.totalBoissons;
  const totalLivraison = totalSnacksFruits.totalLivraison ?? 0; //car on veut afficher même si 0
  const total = totalSnacksFruits.total;
  const color = getFm4AllColor(snacksFruits.infos.gammeSelected);

  if (!total) return null;

  return (
    <div className="flex flex-col gap-4 total-section" id="total-snacks">
      <div className="flex flex-col gap-4">
        <div>Snacks & Fruits ({snacksFruits.infos.nomFournisseur})</div>
        <div className={`flex flex-col ml-4 text-xs`}>
          {totalFruits ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Fruits</p>
              <p className="text-end">
                {formatNumber(Math.round(totalFruits * MARGE))} € HT/an
              </p>
            </div>
          ) : null}
          {totalSnacks ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Snacks</p>
              <p className="text-end">
                {formatNumber(Math.round(totalSnacks * MARGE))} € HT/an
              </p>
            </div>
          ) : null}
          {totalBoissons ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Fruits</p>
              <p className="text-end">
                {formatNumber(Math.round(totalBoissons * MARGE))} € HT/an
              </p>
            </div>
          ) : null}

          <div className={`flex items-center justify-between  font-bold`}>
            <p>Livraison</p>
            <p className="text-end">
              {formatNumber(Math.round(totalLivraison * MARGE))} € HT/an
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-foreground mt-2">
            <p>TOTAL</p>
            <p className="text-end">
              {formatNumber(Math.round(total * MARGE))} € HT/an
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalSnacksFruits;
