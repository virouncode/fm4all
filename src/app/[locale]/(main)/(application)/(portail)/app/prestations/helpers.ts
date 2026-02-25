import {
  type ClientServiceModePlanningType,
  type ClientServiceStatutType,
  type FrequenceType,
} from "@/zod-schemas/clientServices.schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// ==================== STATUT ====================

export function getPrestationStatutBadge(statut: ClientServiceStatutType): {
  label: string;
  className: string;
} {
  switch (statut) {
    case "brouillon":
      return {
        label: "Brouillon",
        className:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
    case "actif":
      return {
        label: "Actif",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
    case "en_pause":
      return {
        label: "En pause",
        className:
          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      };
    case "termine":
      return {
        label: "Terminé",
        className:
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    default:
      return {
        label: statut,
        className:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

// ==================== FREQUENCE ====================

export function getFrequenceLabel(
  frequence: FrequenceType,
  frequenceParPeriode?: number | null,
  intervalleJours?: number | null,
): string {
  switch (frequence) {
    case "one_shot":
      return "Ponctuel";
    case "tous_les_x_jours":
      return intervalleJours
        ? `Tous les ${intervalleJours} jours`
        : "Intervalle personnalisé";
    case "hebdomadaire":
      return frequenceParPeriode && frequenceParPeriode > 1
        ? `${frequenceParPeriode}× / semaine`
        : "Hebdomadaire";
    case "mensuelle":
      return frequenceParPeriode && frequenceParPeriode > 1
        ? `${frequenceParPeriode}× / mois`
        : "Mensuelle";
    case "trimestrielle":
      return "Trimestrielle";
    case "semestrielle":
      return "Semestrielle";
    case "annuelle":
      return "Annuelle";
    default:
      return frequence;
  }
}

// ==================== MODE PLANNING ====================

export function getModePlanningLabel(
  mode: ClientServiceModePlanningType,
): string {
  switch (mode) {
    case "planifie":
      return "Planifié";
    case "a_la_demande":
      return "À la demande";
    default:
      return mode;
  }
}

export function getModePlanningBadge(mode: ClientServiceModePlanningType): {
  label: string;
  className: string;
} {
  switch (mode) {
    case "planifie":
      return {
        label: "Planifié",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      };
    case "a_la_demande":
      return {
        label: "À la demande",
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      };
    default:
      return {
        label: mode,
        className:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

// ==================== DURATION ====================

export function formatDuree(minutes: number | null | undefined): string {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

// ==================== DATE ====================

export function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy", { locale: fr });
}
