import { IncendieContext } from "@/context/IncendieProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const TotalIncendie = () => {
  const { incendie } = useContext(IncendieContext);
  const { totalIncendie } = useContext(TotalIncendieContext);
  const total = totalIncendie.totalService;

  if (!total) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>Securité Incendie ({incendie.infos.nomFournisseur})</div>
        <div className="flex flex-col ml-4 text-xs ">
          <div className="flex items-center justify-between font-bold">
            <p>Service</p>
            <p className="text-end">{formatNumber(total)} € HT/an</p>
          </div>

          <div className="flex items-center justify-between border-t border-foreground mt-2">
            <p>TOTAL</p>
            <p className="text-end">{formatNumber(total)} € HT/an</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalIncendie;
