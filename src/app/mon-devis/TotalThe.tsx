import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const TotalThe = () => {
  const { totalCafe } = useContext(TotalCafeContext);
  const prixThe = totalCafe.prixThe ?? 0;

  const total = formatNumber(prixThe);
  return (
    <div className="flex flex-col gap-4">
      {totalCafe.nomFournisseur && (
        <div className="flex flex-col gap-4">
          <div>Thés ({totalCafe.nomFournisseur})</div>
          <div className="flex flex-col ml-4 text-xs ">
            {prixThe && (
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

export default TotalThe;
