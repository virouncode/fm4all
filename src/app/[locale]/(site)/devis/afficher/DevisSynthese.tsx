"use client";

import { MARGE } from "@/constants/constants";
import { ClientContext } from "@/context/ClientProvider";
import { TotalContext } from "@/context/TotalProvider";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useTranslations } from "next-intl";
import { useContext } from "react";
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
  const { client } = useContext(ClientContext);
  const { total } = useContext(TotalContext);
  const t = useTranslations("Total");

  return (
    <div
      className={`absolute mx-auto flex w-[18cm] -translate-x-[3000px] flex-col gap-6 rounded-xl border p-4`}
    >
      <div id="total-summary">
        <p className="text-2xl">
          Total: {formatNumber(Math.round(total.totalAnnuelHt ?? 0))}{" "}
          {t("eur-ht-an")}
        </p>
        <p>
          {t("soit")}{" "}
          {formatNumber(Math.round((total.totalAnnuelHt ?? 0) / 12))}{" "}
          {t("eur-ht-mois-pour")} {client.effectif} {t("personnes")},{" "}
          {client.surface} m<sup>2</sup>
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
        <TotalServicesFm4All />
      </div>
    </div>
  );
};

export default DevisSynthese;
