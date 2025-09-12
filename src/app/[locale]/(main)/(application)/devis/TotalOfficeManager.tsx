import { MARGE } from "@/constants/constants";
import { formatNumber } from "@/lib/utils/formatNumber";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { useOfficeManagerStore } from "@/stores/officeManagerStore";
import { useTotalOfficeManagerStore } from "@/stores/totalOfficeManagerStore";
import { useTranslations } from "next-intl";

const TotalOfficeManager = () => {
  const t = useTranslations("Total");
  const { officeManager } = useOfficeManagerStore();
  const { totalOfficeManager } = useTotalOfficeManagerStore();
  const total = totalOfficeManager.totalService;
  const color = getFm4AllColor(officeManager.infos.gammeSelected);

  if (!total) return null;

  return (
    <div
      className="total-section flex flex-col gap-4"
      id="total-office-manager"
    >
      <div className="flex flex-col gap-4">
        <div>
          {t("office-manager")} ({officeManager.infos.nomFournisseur})
        </div>
        <div className={`ml-4 flex flex-col text-xs`}>
          <div
            className={`flex items-center justify-between text-${color} font-bold`}
          >
            <p>{t("service")}</p>
            <p className="text-end">
              {formatNumber(Math.round(total * MARGE))} {t("eur-ht-an")}
            </p>
          </div>

          <div className="border-foreground mt-2 flex items-center justify-between border-t">
            <p>TOTAL</p>
            <p className="text-end" data-testid="total-office-manager">
              {formatNumber(Math.round(total * MARGE))} {t("eur-ht-an")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalOfficeManager;
