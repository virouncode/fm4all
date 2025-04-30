"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MARGE } from "@/constants/constants";
import { ClientContext } from "@/context/ClientProvider";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { TotalOfficeManagerContext } from "@/context/TotalOfficeManagerProvider";
import { TotalContext } from "@/context/TotalProvider";
import { TotalServicesFm4AllContext } from "@/context/TotalServicesFm4AllProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { useUpddateServicesFm4AllTotal } from "@/hooks/use-upddate-services-fm4All-total";
import { formatNumber } from "@/lib/utils/formatNumber";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { useContext, useEffect } from "react";
import TotalCafe from "./TotalCafe";
import TotalFontaines from "./TotalFontaines";
import TotalHygiene from "./TotalHygiene";
import TotalIncendie from "./TotalIncendie";
import TotalMaintenance from "./TotalMaintenance";
import TotalNettoyage from "./TotalNettoyage";
import TotalOfficeManager from "./TotalOfficeManager";
import TotalServicesFm4All from "./TotalServicesFm4All";
import TotalSnacksFruits from "./TotalSnacksFruits";
import TotalThe from "./TotalThe";

const Total = () => {
  const t = useTranslations("Total");
  const { client } = useContext(ClientContext);
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
  const { totalNettoyage } = useContext(TotalNettoyageContext);
  const { totalHygiene } = useContext(TotalHygieneContext);
  const { totalMaintenance } = useContext(TotalMaintenanceContext);
  const { totalIncendie } = useContext(TotalIncendieContext);
  const { totalCafe } = useContext(TotalCafeContext);
  const { totalThe } = useContext(TotalTheContext);
  const { totalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const { totalFontaines } = useContext(TotalFontainesContext);
  const { totalOfficeManager } = useContext(TotalOfficeManagerContext);
  const { totalServicesFm4All } = useContext(TotalServicesFm4AllContext);
  const { total, setTotal } = useContext(TotalContext);
  useUpddateServicesFm4AllTotal();

  useEffect(() => {
    const totalFinalNettoyage = Object.values(totalNettoyage)
      .filter((item) => item !== null)
      .reduce((sum, value) => sum + value, 0);
    const totalFinalHygiene =
      Object.values(totalHygiene)
        .filter((item) => item !== null)
        .reduce((sum, value) => sum + value, 0) -
      (totalHygiene.totalInstallation ?? 0);
    const totalFinalMaintenance = Object.values(totalMaintenance)
      .filter((item) => item !== null)
      .reduce((sum, value) => sum + value, 0);
    const totalFinalIncendie = Object.values(totalIncendie)
      .filter((item) => item !== null)
      .reduce((sum, value) => sum + value, 0);
    //TODO voir pour les prix one shot d'installation
    const totalFinalCafe = totalCafe.totalEspaces
      .map(({ total }) => total ?? 0)
      .reduce((acc, curr) => acc + curr, 0);
    const totalFinalThe = totalThe.totalService ?? 0;
    const totalFinalSnacksFruits = totalSnacksFruits.total ?? 0;
    const totalFinalFontaines = totalFontaines.totalEspaces
      .map(({ total }) => total ?? 0)
      .reduce((acc, curr) => acc + curr, 0);
    const totalFinalOfficeManager = totalOfficeManager.totalService ?? 0;
    const totalFinalServicesFm4All =
      servicesFm4All.infos.gammeSelected === "essentiel"
        ? (totalServicesFm4All.totalAssurance ?? 0) +
          (totalServicesFm4All.totalPlateforme ?? 0) +
          (totalServicesFm4All.totalSupportAdmin ?? 0) -
          (totalServicesFm4All.totalRemiseCa ?? 0) -
          (totalServicesFm4All.totalRemiseHof ?? 0)
        : servicesFm4All.infos.gammeSelected === "confort"
          ? (totalServicesFm4All.totalAssurance ?? 0) +
            (totalServicesFm4All.totalPlateforme ?? 0) +
            (totalServicesFm4All.totalSupportAdmin ?? 0) +
            (totalServicesFm4All.totalSupportOp ?? 0) -
            (totalServicesFm4All.totalRemiseCa ?? 0) -
            (totalServicesFm4All.totalRemiseHof ?? 0)
          : (totalServicesFm4All.totalAssurance ?? 0) +
            (totalServicesFm4All.totalPlateforme ?? 0) +
            (totalServicesFm4All.totalSupportAdmin ?? 0) +
            (totalServicesFm4All.totalSupportOp ?? 0) +
            (totalServicesFm4All.totalAccountManager ?? 0) -
            (totalServicesFm4All.totalRemiseCa ?? 0) -
            (totalServicesFm4All.totalRemiseHof ?? 0);
    const totalAnnuelHt =
      (totalFinalNettoyage +
        totalFinalHygiene +
        totalFinalMaintenance +
        totalFinalIncendie +
        totalFinalCafe +
        totalFinalThe +
        totalFinalSnacksFruits +
        totalFinalFontaines +
        totalFinalOfficeManager) *
        MARGE +
      totalFinalServicesFm4All;

    const totalInstallationHt =
      (totalHygiene.totalInstallation ?? 0) +
      totalCafe.totalEspaces
        .map(({ totalInstallation }) => totalInstallation ?? 0)
        .reduce((acc, curr) => acc + curr, 0) +
      totalFontaines.totalEspaces
        .map(({ totalInstallation }) => totalInstallation ?? 0)
        .reduce((acc, curr) => acc + curr, 0);

    setTotal({ totalAnnuelHt, totalInstallationHt });
  }, [
    servicesFm4All.infos.gammeSelected,
    setTotal,
    totalCafe.totalEspaces,
    totalFontaines.totalEspaces,
    totalHygiene,
    totalIncendie,
    totalMaintenance,
    totalNettoyage,
    totalOfficeManager.totalService,
    totalServicesFm4All.totalAccountManager,
    totalServicesFm4All.totalAssurance,
    totalServicesFm4All.totalPlateforme,
    totalServicesFm4All.totalRemiseCa,
    totalServicesFm4All.totalRemiseHof,
    totalServicesFm4All.totalSupportAdmin,
    totalServicesFm4All.totalSupportOp,
    totalSnacksFruits.total,
    totalThe.totalService,
  ]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="text-base fixed bottom-6 right-4 lg:absolute lg:top-[20px] lg:right-0 z-30"
        >
          <Calculator />
          {formatNumber(Math.round(total.totalAnnuelHt ?? 0))} {t("eur-ht-an")}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full">
        <SheetHeader>
          <SheetTitle>
            <span className="text-2xl">
              Total: {formatNumber(Math.round(total.totalAnnuelHt ?? 0))}{" "}
              {t("eur-ht-an")}
            </span>{" "}
          </SheetTitle>
          <SheetDescription>
            <span>
              {t("soit")}{" "}
              {formatNumber(Math.round((total.totalAnnuelHt ?? 0) / 12))}{" "}
              {t("eur-ht-mois-pour")} {client.effectif} {t("personnes")},{" "}
              {client.surface} m<sup>2</sup>
            </span>
            <br />
            <span>
              +{" "}
              {formatNumber(
                Math.round((total.totalInstallationHt ?? 0) * MARGE)
              )}{" "}
              {t("eur-ht-dinstallation")}
            </span>
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 overflow-scroll flex-1 bg-inherit">
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
      </SheetContent>
    </Sheet>
  );
};

export default Total;
