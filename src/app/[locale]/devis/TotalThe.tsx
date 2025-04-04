import { MARGE } from "@/constants/constants";
import { CafeContext } from "@/context/CafeProvider";
import { TheContext } from "@/context/TheProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { formatNumber } from "@/lib/formatNumber";
import { getFm4AllColor } from "@/lib/getFm4AllColor";
import { useTranslations } from "next-intl";
import { useContext } from "react";

const TotalThe = () => {
  const t = useTranslations("Total");
  const { cafe } = useContext(CafeContext);
  const { the } = useContext(TheContext);
  const { totalThe } = useContext(TotalTheContext);

  const total = totalThe.totalService;
  if (!total) return null;

  const color = getFm4AllColor(the.infos.gammeSelected);

  return (
    <div className="flex flex-col gap-4 total-section" id="total-the">
      <div className="flex flex-col gap-4">
        <div>
          {t("thes")} ({cafe.infos.nomFournisseur})
        </div>
        <div className="flex flex-col ml-4 text-xs ">
          <div
            className={`flex items-center justify-between text-${color} font-bold`}
          >
            <p>{t("sachets")}</p>
            <p className="text-end">
              {formatNumber(Math.round(total * MARGE))} {t("eur-ht-an")}
            </p>
          </div>
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

export default TotalThe;
