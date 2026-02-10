import { useCafeStore } from "@/stores/devis/cafeStore";
import { useCommentairesStore } from "@/stores/devis/commentairesStore";
import { useDevisProgressStore } from "@/stores/devis/devisProgressStore";
import { useFontainesStore } from "@/stores/devis/fontainesStore";
import { useFoodBeverageStore } from "@/stores/devis/foodBeverageStore";
import { useHygieneStore } from "@/stores/devis/hygieneStore";
import { useIncendieStore } from "@/stores/devis/incendieStore";
import { useMaintenanceStore } from "@/stores/devis/maintenanceStore";
import { useManagementStore } from "@/stores/devis/managementStore";
import { useMonDevisStore } from "@/stores/devis/monDevisStore";
import { useNettoyageStore } from "@/stores/devis/nettoyageStore";
import { useOfficeManagerStore } from "@/stores/devis/officeManagerStore";
import { usePersonnalisationStore } from "@/stores/devis/personnalisationStore";
import { useServicesFm4AllStore } from "@/stores/devis/servicesFm4AllStore";
import { useSnacksFruitsStore } from "@/stores/devis/snacksFruitsStore";
import { useTheStore } from "@/stores/devis/theStore";
import { useTotalCafeStore } from "@/stores/devis/totalCafeStore";
import { useTotalFontainesStore } from "@/stores/devis/totalFontainesStore";
import { useTotalHygieneStore } from "@/stores/devis/totalHygieneStore";
import { useTotalIncendieStore } from "@/stores/devis/totalIncendieStore";
import { useTotalMaintenanceStore } from "@/stores/devis/totalMaintenanceStore";
import { useTotalNettoyageStore } from "@/stores/devis/totalNettoyageStore";
import { useTotalOfficeManagerStore } from "@/stores/devis/totalOfficeManagerStore";
import { useTotalServicesFm4AllStore } from "@/stores/devis/totalServicesFm4AllStore";
import { useTotalSnacksFruitsStore } from "@/stores/devis/totalSnacksFruitsStore";
import { useTotalStore } from "@/stores/devis/totalStore";
import { useTotalTheStore } from "@/stores/devis/totalTheStore";

export const initialisationDevis = () => {
  //Devis
  const setDevisProgress = useDevisProgressStore.getState().setDevisProgress;
  setDevisProgress({
    currentStep: 2,
    completedSteps: [1],
  });
  useNettoyageStore.getState().reset();
  useHygieneStore.getState().reset();
  useMaintenanceStore.getState().reset();
  useIncendieStore.getState().reset();
  useCafeStore.getState().reset();
  useTheStore.getState().reset();
  useSnacksFruitsStore.getState().reset();
  useFontainesStore.getState().reset();
  useOfficeManagerStore.getState().reset();
  useServicesFm4AllStore.getState().reset();
  useCommentairesStore.getState().reset();
  useServicesFm4AllStore.getState().reset();
  useFoodBeverageStore.getState().reset();
  useManagementStore.getState().reset();
  usePersonnalisationStore.getState().reset();
  useMonDevisStore.getState().reset();
  useTotalNettoyageStore.getState().reset();
  useTotalHygieneStore.getState().reset();
  useTotalMaintenanceStore.getState().reset();
  useTotalIncendieStore.getState().reset();
  useTotalCafeStore.getState().reset();
  useTotalTheStore.getState().reset();
  useTotalSnacksFruitsStore.getState().reset();
  useTotalFontainesStore.getState().reset();
  useTotalOfficeManagerStore.getState().reset();
  useTotalServicesFm4AllStore.getState().reset();
  useTotalStore.getState().reset();
};
