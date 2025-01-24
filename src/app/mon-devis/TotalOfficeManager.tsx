import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { TotalOfficeManagerContext } from "@/context/TotalOfficeManagerProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useContext } from "react";

const TotalOfficeManager = () => {
  const { officeManager } = useContext(OfficeManagerContext);
  const { totalOfficeManager } = useContext(TotalOfficeManagerContext);
  const total = totalOfficeManager.totalService;
  const color = getFm4AllColor(officeManager.infos.gammeSelected);

  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>Office Manager ({officeManager.infos.nomFournisseur})</div>
        <div className={`flex flex-col ml-4 text-xs`}>
          <div
            className={`flex items-center justify-between text-${color} font-bold`}
          >
            <p>Service</p>
            <p className="text-end">{formatNumber(total)} € HT / an</p>
          </div>

          <div className="flex items-center justify-between border-t border-foreground mt-2">
            <p>TOTAL</p>
            <p className="text-end">{formatNumber(total)} € HT / an</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalOfficeManager;
