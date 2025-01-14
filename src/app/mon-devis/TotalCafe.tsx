import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const TotalCafe = () => {
  const { totalCafe } = useContext(TotalCafeContext);
  const prixCafe = totalCafe.prixCafeMachines.reduce(
    (acc, item) => acc + (item.prix ?? 0),
    0
  );
  const total = formatNumber(prixCafe);
  return (
    <div className="flex flex-col gap-4">
      {totalCafe.nomFournisseur && (
        <div className="flex flex-col gap-4">
          <div>
            Machines à Café et consommables ({totalCafe.nomFournisseur})
          </div>
          <div className="flex flex-col ml-4 text-xs ">
            {prixCafe && (
              <div className="flex items-center justify-between">
                <p>Service</p>
                <p className="text-end">{total} € HT / an</p>
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

export default TotalCafe;
