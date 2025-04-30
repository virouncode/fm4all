import { MARGE } from "@/constants/constants";
import { FontainesContext } from "@/context/FontainesProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useTranslations } from "next-intl";
import { useContext } from "react";

const TotalFontaines = () => {
  const t = useTranslations("Total");
  const { fontaines } = useContext(FontainesContext);
  const { totalFontaines } = useContext(TotalFontainesContext);
  const total = totalFontaines.totalEspaces
    .map(({ total }) => total ?? 0)
    .reduce((acc, curr) => acc + curr, 0);
  const totalInstallation = totalFontaines.totalEspaces
    .map(({ totalInstallation }) => totalInstallation ?? 0)
    .reduce((acc, curr) => acc + curr, 0);

  if (!total) return null;
  return (
    <div className="flex flex-col gap-4 total-section" id="total-fontaines">
      <div className="flex flex-col gap-4">
        <div>
          {t("fontaines-a-eau")}{" "}
          <span
            className={`${
              fontaines.infos.fournisseurId === 13 ? "inline-block blur-sm" : ""
            }`}
          >
            ({fontaines.infos.nomFournisseur})
          </span>
        </div>
        <div className="flex flex-col ml-4 text-xs ">
          {fontaines.espaces
            .filter(
              (item) =>
                totalFontaines.totalEspaces.find(
                  ({ espaceId }) => espaceId === item.infos.espaceId
                )?.total ?? 0 > 0
            )
            .map((item) => (
              <div key={item.infos.espaceId} className="flex flex-col">
                <div
                  className="flex items-center justify-between 
                  )} font-bold"
                >
                  <p>
                    {t("1-x")}{" "}
                    <span
                      className={`${
                        fontaines.infos.fournisseurId === 13
                          ? "inline-block blur-sm"
                          : ""
                      }`}
                    >
                      {item.infos.marque}
                    </span>{" "}
                    {item.infos.modele}
                  </p>
                  <p>
                    {formatNumber(
                      Math.round(
                        (totalFontaines.totalEspaces.find(
                          (total) => total.espaceId === item.infos.espaceId
                        )?.total ?? 0) * MARGE
                      )
                    )}{" "}
                    {t("eur-ht-an")}
                  </p>
                </div>
                {totalFontaines.totalEspaces.find(
                  (total) => total.espaceId === item.infos.espaceId
                )?.totalInstallation ? (
                  <div className="flex items-center justify-between">
                    <p>{t("installation")}</p>
                    <p>
                      {formatNumber(
                        Math.round(
                          (totalFontaines.totalEspaces.find(
                            (total) => total.espaceId === item.infos.espaceId
                          )?.totalInstallation ?? 0) * MARGE
                        )
                      )}{" "}
                      {t("eur-ht")}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          <div className="flex flex-col border-t border-foreground mt-2">
            <div className="flex justify-between w-full">
              <p>TOTAL</p>
              <p className="text-end">
                {formatNumber(Math.round(total * MARGE))} {t("eur-ht-an")}
              </p>
            </div>
            {totalInstallation ? (
              <div className="flex justify-between w-full">
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
