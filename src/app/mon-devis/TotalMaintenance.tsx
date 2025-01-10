import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { formatNumber } from "@/lib/formatNumber";
import { useContext } from "react";

const TotalMaintenance = () => {
  const { totalMaintenance } = useContext(TotalMaintenanceContext);
  const total = formatNumber(totalMaintenance.prixMaintenance ?? 0);
  return (
    <div className="flex flex-col gap-4">
      {totalMaintenance.nomFournisseur && (
        <div className="flex flex-col gap-4">
          <div>
            Maintenance multi-technique ({totalMaintenance.nomFournisseur})
          </div>
          <div className="flex flex-col ml-4 text-xs ">
            {totalMaintenance.prixMaintenance && (
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

export default TotalMaintenance;
