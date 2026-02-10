"use client";
import { useEffect, useMemo } from "react";

import { useIncendieStore } from "@/stores/devis/incendieStore";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { usePersonnalisationStore } from "@/stores/devis/personnalisationStore";

export const usePersonnalisation = () => {
  // Extract all contexts
  const nettoyage = useNettoyageStore((s) => s.nettoyage);
  const incendie = useIncendieStore((s) => s.incendie);
  const setPersonnalisation = usePersonnalisationStore(
    (s) => s.setPersonnalisation,
  );

  // Utility function to derive personalization IDs
  const newPersonnalisationIds = useMemo(() => {
    const ids: number[] = [1];
    if (nettoyage?.infos?.gammeSelected) {
      if (nettoyage?.infos?.vitrerieSelected) ids.push(2);
      // ids.push(3);
    }
    // if (
    //   hygiene?.infos?.trilogieGammeSelected &&
    //   nettoyage?.infos?.gammeSelected
    // )
    //   ids.push(4);
    // if (maintenance?.infos?.gammeSelected) ids.push(5);
    if (incendie?.infos?.fournisseurId) {
      ids.push(6);
      // ids.push(7);
    }
    // if (cafe?.infos?.fournisseurId) ids.push(8);
    // if (the?.infos?.gammeSelected) ids.push(9);
    // if (snacksFruits?.infos?.gammeSelected) ids.push(10);
    // if (officeManager?.infos?.gammeSelected) ids.push(11);
    // if (servicesFm4All?.infos?.gammeSelected) ids.push(12);
    ids.push(13);
    ids.push(14);
    return ids;
  }, [
    incendie?.infos?.fournisseurId,
    nettoyage?.infos?.gammeSelected,
    nettoyage?.infos?.vitrerieSelected,
  ]);

  // Effect to update personalization state when dependencies change
  useEffect(() => {
    setPersonnalisation((prev) => ({
      currentPersonnalisationId: prev.currentPersonnalisationId ?? 1,
      personnalisationIds: newPersonnalisationIds,
    }));
  }, [newPersonnalisationIds, setPersonnalisation]);
};
