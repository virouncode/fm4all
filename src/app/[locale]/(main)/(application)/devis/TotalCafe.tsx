import { MARGE } from "@/constants/constants";
import { calcCafeTotaux } from "@/lib/devis/calc-cafe";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const TotalCafe = () => {
  const t = useTranslations("Total");
  const cafe = useCafeStore((s) => s.cafe);
  const totalCafe = useMemo(() => calcCafeTotaux(cafe), [cafe]);
  const total = totalCafe.totalEspaces
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);
  const totalInstallation = totalCafe.totalEspaces
    .map(({ totalInstallation }) => totalInstallation ?? 0)
    .reduce((acc, curr) => acc + curr, 0);

  if (!total) return null;
  return (
    <div className="total-section flex flex-col gap-4" id="total-cafe">
      <div className="flex flex-col gap-4">
        <div>
          {t("machines-a-cafe")} ({cafe.infos.nomPrestataire})
        </div>
        <div className="ml-4 flex flex-col text-xs">
          {cafe.espaces
            .filter(
              (item) =>
                totalCafe.totalEspaces.find(
                  ({ espaceId }) => espaceId === item.infos.espaceId,
                )?.total ?? 0 > 0,
            )
            .map((item) => (
              <div key={item.infos.espaceId} className="flex flex-col">
                <div
                  className={`flex items-center justify-between text-${getFm4AllColor(
                    item.infos.gammeCafeSelected,
                  )} font-bold`}
                >
                  <p>
                    {item.quantites.nbMachines} x {item.infos.marque}{" "}
                    {item.infos.modele}
                  </p>
                  <p data-testid={`total-cafe-${item.infos.espaceId}`}>
                    {formatNumber(
                      Math.round(
                        (totalCafe.totalEspaces.find(
                          (total) => total.espaceId === item.infos.espaceId,
                        )?.total ?? 0) * MARGE,
                      ),
                    )}{" "}
                    {t("eur-ht-an")}
                  </p>
                </div>
                {totalCafe.totalEspaces.find(
                  (total) => total.espaceId === item.infos.espaceId,
                )?.totalInstallation ? (
                  <div className="flex items-center justify-between">
                    <p>{t("installation")}</p>
                    <p>
                      {formatNumber(
                        Math.round(
                          (totalCafe.totalEspaces.find(
                            (total) => total.espaceId === item.infos.espaceId,
                          )?.totalInstallation ?? 0) * MARGE,
                        ),
                      )}{" "}
                      {t("eur-ht")}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          <div className="border-foreground mt-2 flex flex-col border-t">
            <div className="flex w-full justify-between">
              <p>TOTAL</p>
              <p className="text-end">
                {formatNumber(Math.round(total * MARGE))} {t("eur-ht-an")}
              </p>
            </div>
            {totalInstallation ? (
              <div className="flex w-full justify-between">
                <p>{t("total-installation")}</p>
                <p className="text-end">
                  {formatNumber(Math.round(totalInstallation * MARGE))}{" "}
                  {t("eur-ht")}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalCafe;
