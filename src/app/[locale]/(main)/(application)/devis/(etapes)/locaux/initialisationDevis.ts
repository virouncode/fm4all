"use client";

import { useCafeStoreApi } from "@/stores/devis/cafeStore";
import { useCommentairesStoreApi } from "@/stores/devis/commentairesStore";
import { useDevisProgressStoreApi } from "@/stores/devis/devisProgressStore";
import { useFontainesStoreApi } from "@/stores/devis/fontainesStore";
import { useFoodBeverageStoreApi } from "@/stores/devis/foodBeverageStore";
import { useHygieneStoreApi } from "@/stores/devis/hygieneStore";
import { useIncendieStoreApi } from "@/stores/devis/incendieStore";
import { useMaintenanceStoreApi } from "@/stores/devis/maintenanceStore";
import { useManagementStoreApi } from "@/stores/devis/managementStore";
import { useMonDevisStoreApi } from "@/stores/devis/monDevisStore";
import { useNettoyageStoreApi } from "@/stores/devis/nettoyageStore";
import { useOfficeManagerStoreApi } from "@/stores/devis/officeManagerStore";
import { usePersonnalisationStoreApi } from "@/stores/devis/personnalisationStore";
import { useProspectStoreApi } from "@/stores/devis/prospectStore";
import { useServicesFm4AllStoreApi } from "@/stores/devis/servicesFm4AllStore";
import { useServicesStoreApi } from "@/stores/devis/servicesStore";
import { useSnacksFruitsStoreApi } from "@/stores/devis/snacksFruitsStore";
import { useTheStoreApi } from "@/stores/devis/theStore";
import { useTotalServicesFm4AllStoreApi } from "@/stores/devis/totalServicesFm4AllStore";
import { useTotalStoreApi } from "@/stores/devis/totalStore";
import { useCallback } from "react";

/**
 * Hook qui retourne une fonction d'initialisation du devis :
 * - Marque l'étape 1 comme complétée
 * - Reset tous les stores de services (en propageant les valeurs prospect aux stores qui en dépendent)
 */
export const useInitialisationDevis = () => {
  const prospect = useProspectStoreApi();
  const devisProgress = useDevisProgressStoreApi();
  const nettoyage = useNettoyageStoreApi();
  const hygiene = useHygieneStoreApi();
  const maintenance = useMaintenanceStoreApi();
  const incendie = useIncendieStoreApi();
  const cafe = useCafeStoreApi();
  const the = useTheStoreApi();
  const snacksFruits = useSnacksFruitsStoreApi();
  const fontaines = useFontainesStoreApi();
  const officeManager = useOfficeManagerStoreApi();
  const servicesFm4All = useServicesFm4AllStoreApi();
  const commentaires = useCommentairesStoreApi();
  const services = useServicesStoreApi();
  const foodBeverage = useFoodBeverageStoreApi();
  const management = useManagementStoreApi();
  const personnalisation = usePersonnalisationStoreApi();
  const monDevis = useMonDevisStoreApi();
  const totalServicesFm4All = useTotalServicesFm4AllStoreApi();
  const total = useTotalStoreApi();

  return useCallback(() => {
    devisProgress.getState().setDevisProgress({
      currentStep: 2,
      completedSteps: [1],
    });

    const { surface, effectif } = prospect.getState().prospect;
    const surfaceValue = surface ?? 0;
    const effectifValue = effectif ?? 0;

    nettoyage.getState().reset(surfaceValue);
    hygiene.getState().reset();
    maintenance.getState().reset();
    incendie.getState().reset();
    cafe.getState().reset(effectifValue);
    the.getState().reset(effectifValue);
    snacksFruits.getState().reset(effectifValue);
    fontaines.getState().reset(effectifValue);
    officeManager.getState().reset();
    servicesFm4All.getState().reset();
    commentaires.getState().reset();
    services.getState().reset();
    foodBeverage.getState().reset();
    management.getState().reset();
    personnalisation.getState().reset();
    monDevis.getState().reset();
    totalServicesFm4All.getState().reset();
    total.getState().reset();
  }, [
    prospect,
    devisProgress,
    nettoyage,
    hygiene,
    maintenance,
    incendie,
    cafe,
    the,
    snacksFruits,
    fontaines,
    officeManager,
    servicesFm4All,
    commentaires,
    services,
    foodBeverage,
    management,
    personnalisation,
    monDevis,
    totalServicesFm4All,
    total,
  ]);
};
