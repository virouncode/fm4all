import { MARGE } from "@/constants/constants";
import { calcFontainesTotaux } from "@/lib/devis/calc-fontaines";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useFontainesStore } from "@/stores/devis/fontainesStore";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const TotalFontaines = () => {
  const t = useTranslations("Total");
  const fontaines = useFontainesStore((s) => s.fontaines);
  const totalFontaines = useMemo(
    () => calcFontainesTotaux(fontaines),
    [fontaines],
  );
  const total = totalFontaines.totalEspaces
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);
  const totalInstallation = totalFontaines.totalEspaces
    .map(({ totalInstallation }) => totalInstallation ?? 0)
    .reduce((acc, curr) => acc + curr, 0);

  if (!total) return null;
  return (
    <div className="total-section flex flex-col gap-4" id="total-fontaines">
      <div className="flex flex-col gap-4">
        <div>
          {t("fontaines-a-eau")}{" "}
          <span
            className={`${
              false ? "inline-block blur-sm" : ""
            }`}
          >
            ({fontaines.infos.nomPrestataire})
          </span>
        </div>
        <div className="ml-4 flex flex-col text-xs">
          {fontaines.espaces
            .filter(
              (item) =>
                totalFontaines.totalEspaces.find(
                  ({ espaceId }) => espaceId === item.infos.espaceId,
                )?.total ?? 0 > 0,
            )
            .map((item) => (
              <div key={item.infos.espaceId} className="flex flex-col">
                <div className=")} flex items-center justify-between font-bold">
                  <p>
                    {t("1-x")}{" "}
                    <span
                      className={`${
                        false
                          ? "inline-block blur-sm"
                          : ""
                      }`}
                    >
                      {item.infos.marque}
                    </span>{" "}
                    {item.infos.modele}
                  </p>
                  <p data-testid={`total-fontaine-${item.infos.espaceId}`}>
                    {formatNumber(
                      Math.round(
                        (totalFontaines.totalEspaces.find(
                          (total) => total.espaceId === item.infos.espaceId,
                        )?.total ?? 0) * MARGE,
                      ),
                    )}{" "}
                    {t("eur-ht-an")}
                  </p>
                </div>
                {totalFontaines.totalEspaces.find(
                  (total) => total.espaceId === item.infos.espaceId,
                )?.totalInstallation ? (
                  <div className="flex items-center justify-between">
                    <p>{t("installation")}</p>
                    <p>
                      {formatNumber(
                        Math.round(
                          (totalFontaines.totalEspaces.find(
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

export default TotalFontaines;
