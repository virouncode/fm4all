"use client";
import { calcCafeTotaux } from "@/lib/devis/calc-cafe";
import { calcFontainesTotaux } from "@/lib/devis/calc-fontaines";
import { calcHygieneTotaux } from "@/lib/devis/calc-hygiene";
import { calcIncendieTotaux } from "@/lib/devis/calc-incendie";
import { calcMaintenanceTotaux } from "@/lib/devis/calc-maintenance";
import { calcNettoyageTotaux } from "@/lib/devis/calc-nettoyage";
import { calcOfficeManagerTotaux } from "@/lib/devis/calc-office-manager";
import { calcServicesFm4AllTotaux } from "@/lib/devis/calc-services-fm4all";
import { calcSnacksFruitsTotaux } from "@/lib/devis/calc-snacks-fruits";
import { calcTheTotaux } from "@/lib/devis/calc-the";
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
import { useEffect } from "react";

export const useUpddateServicesFm4AllTotal = () => {
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
  const hygiene = useHygieneStore((s) => s.hygiene);
  const effectif = useProspectStore((s) => s.prospect.effectif ?? 0);
  const maintenance = useMaintenanceStore((s) => s.maintenance);
  const incendie = useIncendieStore((s) => s.incendie);
  const cafe = useCafeStore((s) => s.cafe);
  const the = useTheStore((s) => s.the);
  const snacksFruits = useSnacksFruitsStore((s) => s.snacksFruits);
  const fontaines = useFontainesStore((s) => s.fontaines);
  const officeManager = useOfficeManagerStore((s) => s.officeManager);
  const servicesFm4All = useServicesFm4AllStore((s) => s.servicesFm4All);
  const setTotalServicesFm4All = useTotalServicesFm4AllStore(
    (s) => s.setTotalServicesFm4All,
  );

  useEffect(() => {
    const totalNettoyageObj = calcNettoyageTotaux(nettoyage);
    const totalFinalNettoyage = Object.values(totalNettoyageObj)
      .filter((item) => item !== null)
      .reduce((sum, value) => sum + value, 0);

    const totalHygieneObj = calcHygieneTotaux(hygiene, effectif);
    const totalFinalHygiene =
      Object.values(totalHygieneObj)
        .filter((item) => item !== null)
        .reduce((sum, value) => sum + value, 0) -
      (totalHygieneObj.totalInstallation ?? 0);

    const totalMaintenanceObj = calcMaintenanceTotaux(maintenance);
    const totalFinalMaintenance = Object.values(totalMaintenanceObj)
      .filter((item) => item !== null)
      .reduce((sum, value) => sum + value, 0);

    const totalIncendieObj = calcIncendieTotaux(incendie);
    const totalFinalIncendie = Object.values(totalIncendieObj)
      .filter((item) => item !== null)
      .reduce((sum, value) => sum + value, 0);

    const totalCafeObj = calcCafeTotaux(cafe);
    const totalFinalCafe = totalCafeObj.totalEspaces
      .map(({ total }) => total ?? 0)
      .reduce((acc, curr) => acc + curr, 0);

    const totalFinalThe = calcTheTotaux(the).totalService ?? 0;

    const totalCafeAnnuel = totalFinalCafe;
    const totalFinalSnacksFruits =
      calcSnacksFruitsTotaux(snacksFruits, totalCafeAnnuel).total ?? 0;

    const totalFontainesObj = calcFontainesTotaux(fontaines);
    const totalFinalFontaines = totalFontainesObj.totalEspaces
      .map(({ total }) => total ?? 0)
      .reduce((acc, curr) => acc + curr, 0);

    const totalFinalOfficeManager =
      calcOfficeManagerTotaux(officeManager).totalService ?? 0;

    const result = calcServicesFm4AllTotaux(servicesFm4All, officeManager, {
      totalNettoyage: totalFinalNettoyage,
      totalHygiene: totalFinalHygiene,
      totalMaintenance: totalFinalMaintenance,
      totalIncendie: totalFinalIncendie,
      totalCafe: totalFinalCafe,
      totalThe: totalFinalThe,
      totalSnacksFruits: totalFinalSnacksFruits,
      totalFontaines: totalFinalFontaines,
      totalOfficeManager: totalFinalOfficeManager,
    });

    setTotalServicesFm4All(result);
  }, [
    nettoyage,
    hygiene,
    effectif,
    maintenance,
    incendie,
    cafe,
    the,
    snacksFruits,
    fontaines,
    officeManager,
    servicesFm4All,
    setTotalServicesFm4All,
  ]);
};
