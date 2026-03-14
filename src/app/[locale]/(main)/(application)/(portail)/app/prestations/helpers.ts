import {
  type ClientServiceStatutType,
  type FamillePlanificationType,
  type ModeCommercialType,
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

// ==================== FAMILLE PLANIFICATION ====================

export function getFamillePlanificationLabel(
  famille: FamillePlanificationType,
): string {
  switch (famille) {
    case "recurrence_auto":
      return "Récurrence automatique";
    case "quota_manuel":
      return "Quota à planifier";
    case "ponctuel":
      return "Ponctuel";
    default:
      return famille;
  }
}

export function getFamillePlanificationBadge(famille: FamillePlanificationType): {
  label: string;
  className: string;
} {
  switch (famille) {
    case "recurrence_auto":
      return {
        label: "Récurrence auto",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      };
    case "quota_manuel":
      return {
        label: "Quota manuel",
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      };
    case "ponctuel":
      return {
        label: "Ponctuel",
        className:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
    default:
      return {
        label: famille,
        className:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

export function getModeCommercialBadge(mode: ModeCommercialType): {
  label: string;
  className: string;
} {
  switch (mode) {
    case "direct":
      return {
        label: "Direct",
        className:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
    case "intermediaire_fm4all":
      return {
        label: "Intermédiaire FM4ALL",
        className:
          "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
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

export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const timeStr =
    hours === 0 && minutes === 0
      ? ""
      : ` ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return format(d, "dd/MM/yyyy", { locale: fr }) + timeStr;
}
