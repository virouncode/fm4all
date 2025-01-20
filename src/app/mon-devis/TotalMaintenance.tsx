import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useContext } from "react";

const TotalMaintenance = () => {
  const { maintenance } = useContext(MaintenanceContext);
  const { totalMaintenance } = useContext(TotalMaintenanceContext);

  const total =
    totalMaintenance.totalService +
    totalMaintenance.totalQ18 +
    totalMaintenance.totalLegio +
    totalMaintenance.totalQualiteAir;

  if (total === 0) return null;

  const color = getFm4AllColor(maintenance.infos.gammeSelected);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div>
          Maintenance multi-technique ({maintenance.infos.nomFournisseur})
        </div>
        <div className="flex flex-col ml-4 text-xs ">
          <div
            className={`flex items-center justify-between text-${color} font-bold`}
          >
            <p>Service</p>
            <p className="text-end">
              {formatNumber(totalMaintenance.totalService)} € HT / an
            </p>
          </div>
          {maintenance.infos.gammeSelected === "essentiel" && (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>Contrôle Q18</p>
              <p className="text-end">
                {formatNumber(totalMaintenance.totalQ18)} € HT / an
              </p>
            </div>
          )}
          {maintenance.infos.gammeSelected === "confort" && (
            <>
              <div
                className={`flex items-center justify-between text-${color} font-bold`}
              >
                <p>Contrôle Q18</p>
                <p className="text-end">
                  {formatNumber(totalMaintenance.totalQ18)} € HT / an
                </p>
              </div>
              <div
                className={`flex items-center justify-between text-${color} font-bold`}
              >
                <p>Contrôle Legio</p>
                <p className="text-end">
                  {formatNumber(totalMaintenance.totalLegio)} € HT / an
                </p>
              </div>
            </>
          )}
          {maintenance.infos.gammeSelected === "excellence" && (
            <>
              <div
                className={`flex items-center justify-between text-${color} font-bold`}
              >
                <p>Contrôle Q18</p>
                <p className="text-end">
                  {formatNumber(totalMaintenance.totalQ18)} € HT / an
                </p>
              </div>
              <div
                className={`flex items-center justify-between text-${color} font-bold`}
              >
                <p>Contrôle Legio</p>
                <p className="text-end">
                  {formatNumber(totalMaintenance.totalLegio)} € HT / an
                </p>
              </div>
              <div
                className={`flex items-center justify-between text-${color} font-bold`}
              >
                <p>Contrôle Qualité Air</p>
                <p className="text-end">
                  {formatNumber(totalMaintenance.totalQualiteAir)} € HT / an
                </p>
              </div>
            </>
          )}
          <div className="flex items-center justify-between border-t border-foreground mt-2">
            <p>TOTAL</p>
            <p className="text-end">{formatNumber(total)} € HT / an</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalMaintenance;
