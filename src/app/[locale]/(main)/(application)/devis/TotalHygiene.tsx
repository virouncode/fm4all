import { MARGE } from "@/constants/constants";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useTotalHygieneStore } from "@/stores/devis/totalHygieneStore";
import { useTranslations } from "next-intl";

const TotalHygiene = () => {
  const t = useTranslations("Total");
  const hygiene = useHygieneStore((s) => s.hygiene);
  const totalHygiene = useTotalHygieneStore((s) => s.totalHygiene);
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
    hygiene.infos.desinfectantGammeSelected,
  );
  const colorParfum = getFm4AllColor(hygiene.infos.parfumGammeSelected);
  const colorBalai = getFm4AllColor(hygiene.infos.balaiGammeSelected);
  const colorPoubelle = getFm4AllColor(hygiene.infos.poubelleGammeSelected);

  return (
    <div className="total-section flex flex-col gap-4" id="total-hygiene">
      <div className="flex flex-col gap-4">
        <div>
          {t("hygiene")} ({hygiene.infos.nomFournisseur})
        </div>
        <div className="ml-4 flex flex-col text-xs">
          {totalTrilogie ? (
            <div
              className={`flex items-center justify-between text-${colorTrilogie} font-bold`}
            >
              <p>{t("trilogie-emp-savon-ph")}</p>
              <p className="text-end" data-testid="total-trilogie">
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
              <p className="text-end" data-testid="total-desinfectant">
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
              <p className="text-end" data-testid="total-parfum">
                {formatNumber(Math.round(totalParfum * MARGE))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalBalai ? (
            <div
              className={`flex items-center justify-between text-${colorBalai} font-bold`}
            >
              <p>{t("option-balais-wc")}</p>
              <p className="text-end" data-testid="total-balai">
                {formatNumber(Math.round(totalBalai * MARGE))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalPoubelle ? (
            <div
              className={`flex items-center justify-between text-${colorPoubelle} font-bold`}
            >
              <p>{t("option-poubelle-hygiene-feminine")}</p>
              <p className="text-end" data-testid="total-poubelle">
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
          <div className="border-foreground mt-2 flex items-center justify-between border-t">
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
  );
};

export default TotalHygiene;
