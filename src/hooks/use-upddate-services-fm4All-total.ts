"use client";
import { MARGE } from "@/constants/constants";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
import { TotalFontainesContext } from "@/context/TotalFontainesProvider";
import { TotalHygieneContext } from "@/context/TotalHygieneProvider";
import { TotalIncendieContext } from "@/context/TotalIncendieProvider";
import { TotalMaintenanceContext } from "@/context/TotalMaintenanceProvider";
import { TotalNettoyageContext } from "@/context/TotalNettoyageProvider";
import { TotalOfficeManagerContext } from "@/context/TotalOfficeManagerProvider";
import { TotalServicesFm4AllContext } from "@/context/TotalServicesFm4AllProvider";
import { TotalSnacksFruitsContext } from "@/context/TotalSnacksFruitsProvider";
import { TotalTheContext } from "@/context/TotalTheProvider";
import { useContext, useEffect } from "react";

export const useUpddateServicesFm4AllTotal = () => {
  const { totalNettoyage } = useContext(TotalNettoyageContext);
  const { totalHygiene } = useContext(TotalHygieneContext);
  const { totalMaintenance } = useContext(TotalMaintenanceContext);
  const { totalIncendie } = useContext(TotalIncendieContext);
  const { totalCafe } = useContext(TotalCafeContext);
  const { totalThe } = useContext(TotalTheContext);
  const { totalSnacksFruits } = useContext(TotalSnacksFruitsContext);
  const { totalFontaines } = useContext(TotalFontainesContext);
  const { totalOfficeManager } = useContext(TotalOfficeManagerContext);
  const { setTotalServicesFm4All } = useContext(TotalServicesFm4AllContext);
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
  const { officeManager } = useContext(OfficeManagerContext);

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
