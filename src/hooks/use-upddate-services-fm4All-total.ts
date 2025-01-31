"use client";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { TotalCafeContext } from "@/context/TotalCafeProvider";
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
    const totalFinalOfficeManager = totalOfficeManager.totalService ?? 0;
    const total =
      totalFinalNettoyage +
      totalFinalHygiene +
      totalFinalMaintenance +
      totalFinalIncendie +
      totalFinalCafe +
      totalFinalThe +
      totalFinalSnacksFruits +
      totalFinalOfficeManager;

    const tauxAssurance = servicesFm4All.prix.tauxAssurance;
    const tauxPlateforme = servicesFm4All.prix.tauxPlateforme;
    const tauxSupportAdmin = servicesFm4All.prix.tauxSupportAdmin;
    const tauxSupportOp = servicesFm4All.prix.tauxSupportOp;
    const tauxAccountManager = servicesFm4All.prix.tauxAccountManager;
    const tauxRemiseCa = servicesFm4All.prix.tauxRemiseCa;
    const tauxRemiseHof = servicesFm4All.prix.tauxRemiseHof;
    const remiseCaSeuil = servicesFm4All.prix.remiseCaSeuil;

    const prixAssurance = (tauxAssurance ?? 0.0108) * total;
    const prixPlateforme = (tauxPlateforme ?? 0.01) * total;
    const prixSupportAdmin = (tauxSupportAdmin ?? 0) * total;
    const prixSupportOp = (tauxSupportOp ?? 0.0219) * total;
    const prixAccountManager = (tauxAccountManager ?? 0.0399) * total;
    const remiseCa =
      total > (remiseCaSeuil ?? 26000) ? total * (tauxRemiseCa ?? 0.005) : 0;
    const remiseHof = officeManager.infos.gammeSelected
      ? total * (tauxRemiseHof ?? 0.005)
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
    officeManager.infos.gammeSelected,
    servicesFm4All.prix.remiseCaSeuil,
    servicesFm4All.prix.tauxAccountManager,
    servicesFm4All.prix.tauxAssurance,
    servicesFm4All.prix.tauxPlateforme,
    servicesFm4All.prix.tauxRemiseCa,
    servicesFm4All.prix.tauxRemiseHof,
    servicesFm4All.prix.tauxSupportAdmin,
    servicesFm4All.prix.tauxSupportOp,
    setTotalServicesFm4All,
    totalCafe.totalEspaces,
    totalHygiene,
    totalIncendie,
    totalMaintenance,
    totalNettoyage,
    totalOfficeManager.totalService,
    totalSnacksFruits.total,
    totalThe.totalService,
  ]);
};
