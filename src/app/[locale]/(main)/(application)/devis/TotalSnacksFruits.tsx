import { MARGE } from "@/constants/constants";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useSnacksFruitsStore } from "@/stores/devis/snacksFruitsStore";
import { useTotalSnacksFruitsStore } from "@/stores/devis/totalSnacksFruitsStore";
import { useTranslations } from "next-intl";

const TotalSnacksFruits = () => {
  const t = useTranslations("Total");
  const snacksFruits = useSnacksFruitsStore((s) => s.snacksFruits);
  const totalSnacksFruits = useTotalSnacksFruitsStore(
    (s) => s.totalSnacksFruits,
  );
  const totalFruits = totalSnacksFruits.totalFruits;
  const totalSnacks = totalSnacksFruits.totalSnacks;
  const totalBoissons = totalSnacksFruits.totalBoissons;
  const totalLivraison = totalSnacksFruits.totalLivraison ?? 0; //car on veut afficher même si 0
  let total = totalSnacksFruits.total;
  const totalSansRemise = totalSnacksFruits.totalSansRemise;
  const remiseSiCafe =
    totalSansRemise && total && totalSansRemise !== total
      ? totalSansRemise - total
      : null;

  if (remiseSiCafe && totalSansRemise) {
    total = totalSansRemise - remiseSiCafe;
  }

  const color = getFm4AllColor(snacksFruits.infos.gammeSelected);

  if (!total) return null;

  return (
    <div className="total-section flex flex-col gap-4" id="total-snacks">
      <div className="flex flex-col gap-4">
        <div>
          {t("snacks-and-fruits")} ({snacksFruits.infos.nomFournisseur})
        </div>
        <div className={`ml-4 flex flex-col text-xs`}>
          {totalFruits ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("fruits")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalFruits * MARGE))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalSnacks ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("snacks")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalSnacks * MARGE))} {t("eur-ht-an")}
              </p>
            </div>
          ) : null}
          {totalBoissons ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("fruits")}</p>
              <p className="text-end">
                {formatNumber(Math.round(totalBoissons * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}

          <div className={`flex items-center justify-between font-bold`}>
            <p>{t("livraison")}</p>
            <p className="text-end">
              {formatNumber(Math.round(totalLivraison * MARGE))}{" "}
              {t("eur-ht-an")}
            </p>
          </div>
          {remiseSiCafe ? (
            <div
              className={`flex items-center justify-between text-${color} font-bold`}
            >
              <p>{t("remise-cafe")}</p>
              <p className="text-end">
                {formatNumber(-Math.round(remiseSiCafe * MARGE))}{" "}
                {t("eur-ht-an")}
              </p>
            </div>
          ) : null}

          <div className="border-foreground mt-2 flex items-center justify-between border-t">
            <p>TOTAL</p>
            <p className="text-end" data-testid="total-snacksfruits">
              {formatNumber(Math.round(total * MARGE))} {t("eur-ht-an")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalSnacksFruits;
