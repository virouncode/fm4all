import { MARGE } from "@/constants/constants";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { useTheStore } from "@/stores/devis/theStore";
import { useTotalTheStore } from "@/stores/devis/totalTheStore";
import { useTranslations } from "next-intl";

const TotalThe = () => {
  const t = useTranslations("Total");
  const cafe = useCafeStore((s) => s.cafe);
  const the = useTheStore((s) => s.the);
  const totalThe = useTotalTheStore((s) => s.totalThe);

  const total = totalThe.totalService;
  if (!total) return null;

  const color = getFm4AllColor(the.infos.gammeSelected);

  return (
    <div className="total-section flex flex-col gap-4" id="total-the">
      <div className="flex flex-col gap-4">
        <div>
          {t("thes")} ({cafe.infos.nomPrestataire})
        </div>
        <div className="ml-4 flex flex-col text-xs">
          <div
            className={`flex items-center justify-between text-${color} font-bold`}
          >
            <p>{t("sachets")}</p>
            <p className="text-end">
              {formatNumber(Math.round(total * MARGE))} {t("eur-ht-an")}
            </p>
          </div>
          <div className="border-foreground mt-2 flex items-center justify-between border-t">
            <p>TOTAL</p>
            <p className="text-end" data-testid="total-the">
              {formatNumber(Math.round(total * MARGE))} {t("eur-ht-an")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalThe;
