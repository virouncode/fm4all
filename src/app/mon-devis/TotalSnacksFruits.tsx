import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const TotalSnacksFruits = () => {
  const { snacksFruits } = useContext(SnacksFruitsContext);
  const { totalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const prixSnacksFruits = totalSnacksFruits.prixTotal ?? 0;
  const total = formatNumber(prixSnacksFruits);

  return (
    <div className="flex flex-col gap-4">
      {totalSnacksFruits.nomFournisseur && (
        <div className="flex flex-col gap-4">
          <div>Snacks & Fruits ({totalSnacksFruits.nomFournisseur})</div>
          <div className="flex flex-col ml-4 text-xs ">
            {totalSnacksFruits.prixFruits &&
              snacksFruits.choix.includes("fruits") && (
                <div className="flex items-center justify-between">
                  <p>Fruits</p>
                  <p className="text-end">
                    {totalSnacksFruits.prixFruits} € HT / an
                  </p>
                </div>
              )}
            {totalSnacksFruits.prixSnacks &&
              snacksFruits.choix.includes("snacks") && (
                <div className="flex items-center justify-between">
                  <p>Snacks</p>
                  <p className="text-end">
                    {totalSnacksFruits.prixSnacks} € HT / an
                  </p>
                </div>
              )}
            {totalSnacksFruits.prixBoissons &&
              snacksFruits.choix.includes("boissons") && (
                <div className="flex items-center justify-between">
                  <p>Boissons</p>
                  <p className="text-end">
                    {totalSnacksFruits.prixBoissons} € HT / an
                  </p>
                </div>
              )}

            <div className="flex items-center justify-between">
              <p>Livraison</p>
              <p className="text-end">
                {totalSnacksFruits.prixLivraison} € HT / an
              </p>
            </div>

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

export default TotalSnacksFruits;
