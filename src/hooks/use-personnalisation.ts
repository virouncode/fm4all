"use client";
import { useContext, useEffect, useMemo } from "react";

import { CafeContext } from "@/context/CafeProvider";
import { HygieneContext } from "@/context/HygieneProvider";
import { IncendieContext } from "@/context/IncendieProvider";
import { MaintenanceContext } from "@/context/MaintenanceProvider";
import { NettoyageContext } from "@/context/NettoyageProvider";
import { OfficeManagerContext } from "@/context/OfficeManagerProvider";
import { PersonnalisationContext } from "@/context/PersonnalisationProvider";
import { ServicesFm4AllContext } from "@/context/ServicesFm4AllProvider";
import { SnacksFruitsContext } from "@/context/SnacksFruitsProvider";
import { TheContext } from "@/context/TheProvider";

export const usePersonnalisation = () => {
  // Extract all contexts
  const { nettoyage } = useContext(NettoyageContext);
  const { hygiene } = useContext(HygieneContext);
  const { maintenance } = useContext(MaintenanceContext);
  const { incendie } = useContext(IncendieContext);
  const { cafe } = useContext(CafeContext);
  const { the } = useContext(TheContext);
  const { snacksFruits } = useContext(SnacksFruitsContext);
  const { officeManager } = useContext(OfficeManagerContext);
  const { servicesFm4All } = useContext(ServicesFm4AllContext);
  const { setPersonnalisation } = useContext(PersonnalisationContext);

  // Utility function to derive personalization IDs
  const newPersonnalisationIds = useMemo(() => {
    const ids: number[] = [1];
    if (nettoyage?.infos?.gammeSelected) {
      if (nettoyage?.infos?.vitrerieSelected) ids.push(2);
      ids.push(3);
    }
    if (
      hygiene?.infos?.trilogieGammeSelected &&
      nettoyage?.infos?.gammeSelected
    )
      ids.push(4);
    if (maintenance?.infos?.gammeSelected) ids.push(5);
    if (incendie?.infos?.fournisseurId) {
      ids.push(6);
      ids.push(7);
    }
    if (cafe?.infos?.fournisseurId) ids.push(8);
    if (the?.infos?.gammeSelected) ids.push(9);
    if (snacksFruits?.infos?.gammeSelected) ids.push(10);
    if (officeManager?.infos?.gammeSelected) ids.push(11);
    if (servicesFm4All?.infos?.gammeSelected) ids.push(12);
    ids.push(13);
    return ids;
  }, [
    nettoyage?.infos?.gammeSelected,
    nettoyage?.infos?.vitrerieSelected,
    hygiene?.infos?.trilogieGammeSelected,
    maintenance?.infos?.gammeSelected,
    incendie?.infos?.fournisseurId,
    cafe?.infos?.fournisseurId,
    the?.infos?.gammeSelected,
    snacksFruits?.infos?.gammeSelected,
    officeManager?.infos?.gammeSelected,
    servicesFm4All?.infos?.gammeSelected,
  ]);

  // Effect to update personalization state when dependencies change
  useEffect(() => {
    setPersonnalisation((prev) => ({
      currentPersonnalisationId: prev.currentPersonnalisationId ?? 1,
      personnalisationIds: newPersonnalisationIds,
    }));
  }, [newPersonnalisationIds, setPersonnalisation]);
};
