import { MARGE } from "@/constants/constants";
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useTranslations } from "next-intl";
import { useContext } from "react";

const TotalMaintenance = () => {
  const t = useTranslations("Total");
  const tMaintenance = useTranslations("DevisPage.services.maintenance");
  const { maintenance } = useContext(MaintenanceContext);
  const { totalMaintenance } = useContext(TotalMaintenanceContext);

  const { totalService, totalQ18, totalLegio, totalQualiteAir } =
    totalMaintenance;

  const total = Object.values(totalMaintenance)
    .filter((item) => item !== null)
    .reduce((sum, value) => sum + value, 0);

  if (!total) return null;

  const color = getFm4AllColor(maintenance.infos.gammeSelected);

  return (
    <div className="flex flex-col gap-4 total-section" id="total-maintenance">
      <div className="flex flex-col gap-4">
        <div>
          {tMaintenance("maintenance-multi-technique")} (
          {maintenance.infos.nomFournisseur})
        </div>
        <div className="flex flex-col ml-4 text-xs ">
          {totalService ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("service")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalService * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {maintenance.infos.gammeSelected === "essentiel" && totalQ18 ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{tMaintenance("controle-q18")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalQ18 * MARGE))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {maintenance.infos.gammeSelected === "confort" &&
          totalQ18 &&
          totalLegio ? (
            <>
              <div
                className={`flex items-center justify-between text-${color} font-bold`}
              >
                <p>{tMaintenance("controle-q18")}</p>
                <p className="text-end">
                  {formatNumber(Math.round(totalQ18 * MARGE))} {t("eur-ht-an")}
                </p>
              </div>
              <div
                className={`flex items-center justify-between text-${color} font-bold`}
              >
                <p>{tMaintenance("controle-legionellose")}</p>
                <p className="text-end">
                  {formatNumber(Math.round(totalLegio * MARGE))}{" "}
                  {t("eur-ht-an")}
                </p>
              </div>
            </>
          ) : null}
          {maintenance.infos.gammeSelected === "excellence" &&
          totalQ18 &&
          totalLegio &&
          totalQualiteAir ? (
            <>
              <div
                className={`flex items-center justify-between text-${color} font-bold`}
              >
                <p>{tMaintenance("controle-q18")}</p>
                <p className="text-end">
                  {formatNumber(Math.round(totalQ18 * MARGE))} {t("eur-ht-an")}
                </p>
              </div>
              <div
                className={`flex items-center justify-between text-${color} font-bold`}
              >
                <p>{tMaintenance("controle-legionellose")}</p>
                <p className="text-end">
                  {formatNumber(Math.round(totalLegio * MARGE))}{" "}
                  {t("eur-ht-an")}
                </p>
              </div>
              <div
                className={`flex items-center justify-between text-${color} font-bold`}
              >
                <p>{tMaintenance("controle-qualite-air")}</p>
                <p className="text-end">
                  {formatNumber(Math.round(totalQualiteAir * MARGE))}{" "}
                  {t("eur-ht-an")}
                </p>
              </div>
            </>
          ) : null}
          <div className="flex items-center justify-between border-t border-foreground mt-2">
            <p>TOTAL</p>
            <p className="text-end">
              {formatNumber(Math.round(total * MARGE))} {t("eur-ht-an")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalMaintenance;
