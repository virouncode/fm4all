import { MARGE } from "@/constants/constants";
import { HygieneContext } from "@/context/HygieneProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useTranslations } from "next-intl";
import { useContext } from "react";

const TotalHygiene = () => {
  const t = useTranslations("Total");
  const { hygiene } = useContext(HygieneContext);
  const { totalHygiene } = useContext(TotalHygieneContext);
  const {
    totalTrilogie,
    totalDesinfectant,
    totalParfum,
    totalBalai,
    totalPoubelle,
    totalInstallation,
  } = totalHygiene;

  const total = totalTrilogie
    ? (totalTrilogie ?? 0) +
      (totalDesinfectant ?? 0) +
      (totalParfum ?? 0) +
      (totalBalai ?? 0) +
      (totalPoubelle ?? 0)
    : null;

  if (!total) return null;

  const colorTrilogie = getFm4AllColor(hygiene.infos.trilogieGammeSelected);
  const colorDesinfectant = getFm4AllColor(
    hygiene.infos.desinfectantGammeSelected
  );
  const colorParfum = getFm4AllColor(hygiene.infos.parfumGammeSelected);
  const colorBalai = getFm4AllColor(hygiene.infos.balaiGammeSelected);
  const colorPoubelle = getFm4AllColor(hygiene.infos.poubelleGammeSelected);

  return (
    <div className="flex flex-col gap-4 total-section" id="total-hygiene">
      <div className="flex flex-col gap-4">
        <div>
          {t("hygiene")} ({hygiene.infos.nomFournisseur})
        </div>
        <div className="flex flex-col ml-4 text-xs ">
          {totalTrilogie ? (
            <div
              className={`flex items-center justify-between text-${colorTrilogie} font-bold`}
            >
              <p>{t("trilogie-emp-savon-ph")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalTrilogie * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalDesinfectant ? (
            <div
              className={`flex items-center justify-between text-${colorDesinfectant} font-bold`}
            >
              <p>{t("option-desinfectant")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalDesinfectant * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalParfum ? (
            <div
              className={`flex items-center justify-between text-${colorParfum} font-bold`}
            >
              <p>{t("option-parfum")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalParfum * MARGE))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalBalai ? (
            <div
              className={`flex items-center justify-between text-${colorBalai} font-bold`}
            >
              <p>{t("option-balais-wc")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalBalai * MARGE))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalPoubelle ? (
            <div
              className={`flex items-center justify-between text-${colorPoubelle} font-bold`}
            >
              <p>{t("option-poubelle-hygiene-feminine")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalPoubelle * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalInstallation ? (
            <div className="flex items-center justify-between">
              <p>{t("installation")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalInstallation * MARGE))}{" "}
                {t("eur-ht")}
              </p>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-foreground mt-2">
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
  );
};

export default TotalHygiene;
