"use client";
import { MARGE } from "@/constants/constants";
import { useOfficeManagerStore } from "@/stores/officeManagerStore";
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
import { useTotalTheStore } from "@/stores/totalTheStore";
import { useEffect } from "react";

export const useUpddateServicesFm4AllTotal = () => {
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
  const setTotalServicesFm4All = useTotalServicesFm4AllStore(
    (s) => s.setTotalServicesFm4All,
  );
  const servicesFm4All = useServicesFm4AllStore((s) => s.servicesFm4All);
  const officeManager = useOfficeManagerStore((s) => s.officeManager);

  useEffect(() => {
    //mettra à jour le total des services FM4ALL
    const totalFinalNettoyage = Object.values(totalNettoyage)
      .filter((item) => item !== null)
      .reduce((sum, value) => sum + value, 0);
    const totalFinalHygiene = Object.values(totalHygiene)
      .filter((item) => item !== null)
      .reduce((sum, value) => sum + value, 0);
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
    const total =
      totalFinalNettoyage +
      totalFinalHygiene +
      totalFinalMaintenance +
      totalFinalIncendie +
      totalFinalCafe +
      totalFinalThe +
      totalFinalSnacksFruits +
      totalFinalFontaines +
      totalFinalOfficeManager;

    const assurance = servicesFm4All.infos.assurance;
    const plateforme = servicesFm4All.infos.plateforme;
    const supportAdmin = servicesFm4All.infos.supportAdmin;
    const supportOp = servicesFm4All.infos.supportOp;
    const accountManager = servicesFm4All.infos.accountManager;
    const tauxAssurance = servicesFm4All.prix.tauxAssurance;
    const tauxPlateforme = servicesFm4All.prix.tauxPlateforme;
    const tauxSupportAdmin = servicesFm4All.prix.tauxSupportAdmin;
    const tauxSupportOp = servicesFm4All.prix.tauxSupportOp;
    const tauxAccountManager = servicesFm4All.prix.tauxAccountManager;
    const tauxRemiseCa = servicesFm4All.prix.tauxRemiseCa;
    const tauxRemiseHof = servicesFm4All.prix.tauxRemiseHof;
    const remiseCaSeuil = servicesFm4All.prix.remiseCaSeuil;
    const minFacturationPlateforme =
      servicesFm4All.prix.minFacturationPlateforme;
    const minFacturationSupportOp = servicesFm4All.prix.minFacturationSupportOp;
    const minFacturationAccountManager =
      servicesFm4All.prix.minFacturationAccountManager;

    const prixAssurance =
      assurance === "non propose"
        ? null
        : assurance === "inclus"
          ? 0
          : tauxAssurance * total * MARGE;
    const prixPlateforme =
      plateforme === "non propose"
        ? null
        : plateforme === "inclus"
          ? 0
          : Math.max(tauxPlateforme * total * MARGE, minFacturationPlateforme);
    const prixSupportAdmin =
      supportAdmin === "non propose"
        ? null
        : supportAdmin === "inclus"
          ? 0
          : tauxSupportAdmin * total * MARGE;
    const prixSupportOp =
      supportOp === "non propose"
        ? null
        : supportOp === "inclus"
          ? 0
          : Math.max(tauxSupportOp * total * MARGE, minFacturationSupportOp);
    const prixAccountManager =
      accountManager === "non propose"
        ? null
        : accountManager === "inclus"
          ? 0
          : Math.max(
              tauxAccountManager * total * MARGE,
              minFacturationAccountManager,
            );
    const remiseCa =
      total * MARGE >= remiseCaSeuil ? tauxRemiseCa * total * MARGE : 0;
    const remiseHof = officeManager.infos.gammeSelected
      ? tauxRemiseHof * total * MARGE
      : 0;

    setTotalServicesFm4All({
      totalAssurance: prixAssurance,
      totalPlateforme: prixPlateforme,
      totalSupportAdmin: prixSupportAdmin,
      totalSupportOp: prixSupportOp,
      totalAccountManager: prixAccountManager,
      totalRemiseCa: remiseCa,
      totalRemiseHof: remiseHof,
    });
  }, [
    totalNettoyage,
    totalHygiene,
    totalMaintenance,
    totalIncendie,
    totalCafe.totalEspaces,
    totalThe.totalService,
    totalSnacksFruits.total,
    totalFontaines.totalEspaces,
    totalOfficeManager.totalService,
    officeManager.infos.gammeSelected,
    servicesFm4All,
    setTotalServicesFm4All,
  ]);
};
