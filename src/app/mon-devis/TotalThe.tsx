import { MARGE } from "@/constants/constants";
import { CafeContext } from "@/context/CafeProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useContext } from "react";

const TotalThe = () => {
  const { cafe } = useContext(CafeContext);
  const { the } = useContext(TheContext);
  const { totalThe } = useContext(TotalTheContext);

  const total = totalThe.totalService;
  if (!total) return null;

  const color = getFm4AllColor(the.infos.gammeSelected);

  return (
    <div className="flex flex-col gap-4 total-section" id="total-the">
      <div className="flex flex-col gap-4">
        <div>Thés ({cafe.infos.nomFournisseur})</div>
        <div className="flex flex-col ml-4 text-xs ">
          <div
            className={`flex items-center justify-between text-${color} font-bold`}
          >
            <p>Sachets</p>
            <p className="text-end">
              {formatNumber(Math.round(total * MARGE))} € HT/an
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

export default TotalThe;
