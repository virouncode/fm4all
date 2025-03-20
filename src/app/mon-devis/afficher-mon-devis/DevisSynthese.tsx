"use client";

import { MARGE } from "@/constants/constants";
import { ClientContext } from "@/context/ClientProvider";
import { TotalContext } from "@/context/TotalProvider";
import { formatNumber } from "@/lib/formatNumber";
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

  return (
    <div
      className={`flex flex-col gap-6 w-[18cm] mx-auto border rounded-xl p-4 absolute -translate-x-[3000px]`}
    >
      <div id="total-summary">
        <p className="text-2xl">
          Total: {formatNumber(Math.round(total.totalAnnuelHt ?? 0))} € HT/an
        </p>
        <p>
          Soit {formatNumber(Math.round((total.totalAnnuelHt ?? 0) / 12))} €
          HT/mois pour {client.effectif} personnes, {client.surface} m
          <sup>2</sup>
        </p>
        <p>
          + {formatNumber(Math.round((total.totalInstallationHt ?? 0) * MARGE))}{" "}
          € HT d&apos;installation
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
