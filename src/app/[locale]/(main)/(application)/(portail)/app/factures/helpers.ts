import type { FactureStatutType } from "@/zod-schemas/enums";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function getFactureStatutBadge(statut: FactureStatutType): {
  label: string;
  className: string;
} {
  switch (statut) {
    case "brouillon":
      return {
        label: "Brouillon",
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
    case "emise":
      return {
        label: "Émise",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      };
    case "litige":
      return {
        label: "En litige",
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      };
    case "annulee":
      return {
        label: "Annulée",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    default:
      return {
        label: statut,
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

export function formatFactureDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy", { locale: fr });
}

export function formatMontantTtc(centimes: number | null | undefined): string {
  if (centimes === null || centimes === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(centimes / 100);
}
