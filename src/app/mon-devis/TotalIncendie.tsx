import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const TotalIncendie = () => {
  const { totalIncendie } = useContext(TotalIncendieContext);
  const total = formatNumber(totalIncendie.prixIncendie ?? 0);
  return (
    <div className="flex flex-col gap-4">
      {totalIncendie.nomFournisseur && (
        <div className="flex flex-col gap-4">
          <div>Securité Incendie ({totalIncendie.nomFournisseur})</div>
          <div className="flex flex-col ml-4 text-xs ">
            {totalIncendie.prixIncendie && (
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

export default TotalIncendie;
