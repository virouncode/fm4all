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
import { calcCafeTotaux } from "@/lib/devis/calc-cafe";
import { calcFontainesTotaux } from "@/lib/devis/calc-fontaines";
import { calcHygieneTotaux } from "@/lib/devis/calc-hygiene";
import { calcIncendieTotaux } from "@/lib/devis/calc-incendie";
import { calcMaintenanceTotaux } from "@/lib/devis/calc-maintenance";
import { calcNettoyageTotaux } from "@/lib/devis/calc-nettoyage";
import { calcOfficeManagerTotaux } from "@/lib/devis/calc-office-manager";
import { calcSnacksFruitsTotaux } from "@/lib/devis/calc-snacks-fruits";
import { calcTheTotaux } from "@/lib/devis/calc-the";
import { formatNumber } from "@/lib/utils/formatNumber";
import { useCafeStore } from "@/stores/devis/cafeStore";
import { useFontainesStore } from "@/stores/devis/fontainesStore";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useIncendieStore } from "@/stores/devis/incendieStore";
import { useMaintenanceStore } from "@/stores/devis/maintenanceStore";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { useOfficeManagerStore } from "@/stores/devis/officeManagerStore";
import { useProspectStore } from "@/stores/devis/prospectStore";
import { useServicesFm4AllStore } from "@/stores/devis/servicesFm4AllStore";
import { useSnacksFruitsStore } from "@/stores/devis/snacksFruitsStore";
import { useTheStore } from "@/stores/devis/theStore";
import { useTotalServicesFm4AllStore } from "@/stores/devis/totalServicesFm4AllStore";
import { useTotalStore } from "@/stores/devis/totalStore";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
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
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
  const hygiene = useHygieneStore((s) => s.hygiene);
  const maintenance = useMaintenanceStore((s) => s.maintenance);
  const incendie = useIncendieStore((s) => s.incendie);
  const cafe = useCafeStore((s) => s.cafe);
  const the = useTheStore((s) => s.the);
  const snacksFruits = useSnacksFruitsStore((s) => s.snacksFruits);
  const fontaines = useFontainesStore((s) => s.fontaines);
  const officeManager = useOfficeManagerStore((s) => s.officeManager);
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

  const effectif = prospect.effectif ?? 0;

  const totalNettoyage = useMemo(
    () => calcNettoyageTotaux(nettoyage),
    [nettoyage],
  );
  const totalHygiene = useMemo(
    () => calcHygieneTotaux(hygiene, effectif),
    [hygiene, effectif],
  );
  const totalMaintenance = useMemo(
    () => calcMaintenanceTotaux(maintenance),
    [maintenance],
  );
  const totalIncendie = useMemo(
    () => calcIncendieTotaux(incendie),
    [incendie],
  );
  const totalCafe = useMemo(() => calcCafeTotaux(cafe), [cafe]);
  const totalThe = useMemo(() => calcTheTotaux(the), [the]);
  const totalCafeAnnuel = useMemo(
    () =>
      totalCafe.totalEspaces
        .map(({ total }) => total ?? 0)
        .reduce((acc, curr) => acc + curr, 0),
    [totalCafe.totalEspaces],
  );
  const totalSnacksFruits = useMemo(
    () => calcSnacksFruitsTotaux(snacksFruits, totalCafeAnnuel),
    [snacksFruits, totalCafeAnnuel],
  );
  const totalFontaines = useMemo(
    () => calcFontainesTotaux(fontaines),
    [fontaines],
  );
  const totalOfficeManager = useMemo(
    () => calcOfficeManagerTotaux(officeManager),
    [officeManager],
  );

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
      ((totalHygiene.totalInstallation ?? 0) +
        totalCafe.totalEspaces
          .map(({ totalInstallation }) => totalInstallation ?? 0)
          .reduce((acc, curr) => acc + curr, 0) +
        totalFontaines.totalEspaces
          .map(({ totalInstallation }) => totalInstallation ?? 0)
          .reduce((acc, curr) => acc + curr, 0)) *
      MARGE;

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
              + {formatNumber(Math.round(total.totalInstallationHt ?? 0))}{" "}
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
