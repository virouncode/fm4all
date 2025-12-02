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
import { useUpddateServicesFm4AllTotal } from "@/hooks/use-upddate-services-fm4All-total";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useProspectStore } from "@/stores/prospectStore";
import { useServicesFm4AllStore } from "@/stores/servicesFm4AllStore";
import { useTotalCafeStore } from "@/stores/totalCafeStore";
import { useTotalFontainesStore } from "@/stores/totalFontainesStore";
import { useTotalHygieneStore } from "@/stores/totalHygieneStore";
import { useTotalIncendieStore } from "@/stores/totalIncendieStore";
import { useTotalMaintenanceStore } from "@/stores/totalMaintenanceStore";
import { useTotalNettoyageStore } from "@/stores/totalNettoyageStore";
import { useTotalOfficeManagerStore } from "@/stores/totalOfficeManagerStore";
import { useTotalServicesFm4AllStore } from "@/stores/totalServicesFm4AllStore";
import { useTotalSnacksFruitsStore } from "@/stores/totalSnacksFruitsStore";
import { useTotalStore } from "@/stores/totalStore";
import { useTotalTheStore } from "@/stores/totalTheStore";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
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
  const prospect = useProspectStore((s) => s.prospect);
  const servicesFm4All = useServicesFm4AllStore((s) => s.servicesFm4All);
  const totalNettoyage = useTotalNettoyageStore((s) => s.totalNettoyage);
  const totalHygiene = useTotalHygieneStore((s) => s.totalHygiene);
  const totalMaintenance = useTotalMaintenanceStore((s) => s.totalMaintenance);
  const totalIncendie = useTotalIncendieStore((s) => s.totalIncendie);
  const totalCafe = useTotalCafeStore((s) => s.totalCafe);
  const totalThe = useTotalTheStore((s) => s.totalThe);
  const totalSnacksFruits = useTotalSnacksFruitsStore(
    (s) => s.totalSnacksFruits,
  );
  const totalFontaines = useTotalFontainesStore((s) => s.totalFontaines);
  const totalOfficeManager = useTotalOfficeManagerStore(
    (s) => s.totalOfficeManager,
  );
  const totalServicesFm4All = useTotalServicesFm4AllStore(
    (s) => s.totalServicesFm4All,
  );
  const { total, setTotal } = useTotalStore(
    useShallow((s) => ({
      total: s.total,
      setTotal: s.setTotal,
    })),
  );
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

    const totalAnnuelHtSansServicesFm4all =
      (totalFinalNettoyage +
        totalFinalHygiene +
        totalFinalMaintenance +
        totalFinalIncendie +
        totalFinalCafe +
        totalFinalThe +
        totalFinalSnacksFruits +
        totalFinalFontaines +
        totalFinalOfficeManager) *
      MARGE;
    const totalAnnuelHt =
      totalAnnuelHtSansServicesFm4all + totalFinalServicesFm4All;

    const totalInstallationHt =
      (totalHygiene.totalInstallation ?? 0) +
      totalCafe.totalEspaces
        .map(({ totalInstallation }) => totalInstallation ?? 0)
        .reduce((acc, curr) => acc + curr, 0) +
      totalFontaines.totalEspaces
        .map(({ totalInstallation }) => totalInstallation ?? 0)
        .reduce((acc, curr) => acc + curr, 0);

    setTotal({
      totalAnnuelHt,
      totalInstallationHt,
      totalAnnuelHtSansServicesFm4all,
    });
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
          className="fixed right-4 bottom-6 z-30 text-base lg:absolute lg:top-[20px] lg:right-0"
          data-testid="total-button"
        >
          <Calculator />
          {total.totalAnnuelHtSansServicesFm4all
            ? formatNumber(Math.round(total.totalAnnuelHt ?? 0))
            : 0}{" "}
          {t("eur-ht-an")}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col p-6">
        <SheetHeader className="p-0">
          <SheetTitle>
            <span className="text-2xl">
              Total:{" "}
              {total.totalAnnuelHtSansServicesFm4all
                ? formatNumber(Math.round(total.totalAnnuelHt ?? 0))
                : 0}{" "}
              {t("eur-ht-an")}
            </span>{" "}
          </SheetTitle>
          <SheetDescription>
            <span>
              {t("soit")}{" "}
              {total.totalAnnuelHtSansServicesFm4all
                ? formatNumber(Math.round((total.totalAnnuelHt ?? 0) / 12))
                : 0}{" "}
              {t("eur-ht-mois-pour")} {prospect.effectif} {t("personnes")},{" "}
              {prospect.surface} m<sup>2</sup>
            </span>
            <br />
            <span>
              +{" "}
              {formatNumber(
                Math.round((total.totalInstallationHt ?? 0) * MARGE),
              )}{" "}
              {t("eur-ht-dinstallation")}
            </span>
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-scroll bg-inherit">
          <TotalNettoyage />
          <TotalHygiene />
          <TotalMaintenance />
          <TotalIncendie />
          <TotalCafe />
          <TotalThe />
          <TotalSnacksFruits />
          <TotalFontaines />
          <TotalOfficeManager />
          {total.totalAnnuelHtSansServicesFm4all ? (
            <TotalServicesFm4All />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Total;
