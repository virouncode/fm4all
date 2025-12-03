"use client";

import { MARGE } from "@/constants/constants";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useProspectStore } from "@/stores/prospectStore";
import { useTotalStore } from "@/stores/totalStore";
import { useTranslations } from "next-intl";
import TotalCafe from "../TotalCafe";
import TotalFontaines from "../TotalFontaines";
import TotalHygiene from "../TotalHygiene";
import TotalIncendie from "../TotalIncendie";
import TotalMaintenance from "../TotalMaintenance";
import TotalNettoyage from "../TotalNettoyage";
import TotalOfficeManager from "../TotalOfficeManager";
import TotalServicesFm4All from "../TotalServicesFm4All";
import TotalSnacksFruits from "../TotalSnacksFruits";
import TotalThe from "../TotalThe";

// Font files can be colocated inside of `pages`

const DevisSynthese = () => {
  const prospect = useProspectStore((s) => s.prospect);
  const total = useTotalStore((s) => s.total);
  const t = useTranslations("Total");

  return (
    <div
      className={`absolute mx-auto flex w-[18cm] -translate-x-[3000px] flex-col gap-6 rounded-xl border p-4`}
    >
      <div id="total-summary">
        <p className="text-2xl">
          Total:{" "}
          {total.totalAnnuelHtSansServicesFm4all
            ? formatNumber(Math.round(total.totalAnnuelHt ?? 0))
            : 0}{" "}
          {t("eur-ht-an")}
        </p>
        <p>
          {t("soit")}{" "}
          {total.totalAnnuelHtSansServicesFm4all
            ? formatNumber(Math.round((total.totalAnnuelHt ?? 0) / 12))
            : 0}{" "}
          {t("eur-ht-mois-pour")} {prospect.effectif} {t("personnes")},{" "}
          {prospect.surface} m<sup>2</sup>
        </p>
        <p>
          + {formatNumber(Math.round((total.totalInstallationHt ?? 0) * MARGE))}{" "}
          {t("eur-ht-dinstallation")}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <TotalNettoyage />
        <TotalHygiene />
        <TotalMaintenance />
        <TotalIncendie />
        <TotalCafe />
        <TotalThe />
        <TotalSnacksFruits />
        <TotalFontaines />
        <TotalOfficeManager />
        {total.totalAnnuelHtSansServicesFm4all ? <TotalServicesFm4All /> : null}
      </div>
    </div>
  );
};

export default DevisSynthese;
