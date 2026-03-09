import type { DevisDemandeStatutType, DevisStatutType } from "@/zod-schemas/enums";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function getDevisStatutBadge(statut: DevisStatutType): {
  label: string;
  className: string;
} {
  switch (statut) {
    case "brouillon":
      return {
        label: "Brouillon",
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
    case "emis":
      return {
        label: "Émis",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      };
    case "signe":
      return {
        label: "Signé",
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
    case "refuse":
      return {
        label: "Refusé",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    default:
      return {
        label: statut,
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

export function getDevisDemandeStatutBadge(statut: DevisDemandeStatutType): {
  label: string;
  className: string;
} {
  switch (statut) {
    case "ouverte":
      return {
        label: "Ouverte",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      };
    case "en_cours":
      return {
        label: "En cours",
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      };
    case "cloturee":
      return {
        label: "Clôturée",
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
    case "annulee":
      return {
        label: "Annulée",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    case "archivee":
      return {
        label: "Archivée",
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
    default:
      return {
        label: statut,
        className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
  }
}

export function formatDevisDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy", { locale: fr });
}

export function formatMontantHt(centimes: number | null | undefined): string {
  if (centimes === null || centimes === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(centimes / 100);
}
