import { TicketPrioriteType, TicketStatutType, TicketTypeType } from "@/zod-schemas/enums";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Retourne le badge de statut avec couleur appropriée
 */
export function getTicketStatutBadge(statut: TicketStatutType): {
  label: string;
  className: string;
} {
  switch (statut) {
    case "nouveau":
      return { label: "Nouveau", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    case "pris_en_charge":
      return { label: "Pris en charge", className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" };
    case "en_attente_fournisseur":
      return { label: "En attente fournisseur", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" };
    case "en_attente_client":
      return { label: "En attente client", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" };
    case "a_valider":
      return { label: "À valider", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" };
    case "clos":
      return { label: "Clos", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    case "annule":
      return { label: "Annulé", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
    case "rejete":
      return { label: "Rejeté", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
    default:
      return { label: statut, className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" };
  }
}

/**
 * Retourne le badge de priorité avec couleur appropriée
 */
export function getTicketPrioriteBadge(priorite: TicketPrioriteType): {
  label: string;
  className: string;
} {
  switch (priorite) {
    case "critique":
      return { label: "Critique", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
    case "haute":
      return { label: "Haute", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" };
    case "normale":
      return { label: "Normale", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
    case "basse":
      return { label: "Basse", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" };
    default:
      return { label: priorite, className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" };
  }
}

/**
 * Retourne le label du type de ticket
 */
export function getTicketTypeLabel(type: TicketTypeType): string {
  switch (type) {
    case "incident":
      return "Incident";
    case "demande":
      return "Demande";
    case "autre":
      return "Autre";
    default:
      return type;
  }
}

/**
 * Formate une date pour affichage
 */
export function formatTicketDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd/MM/yyyy à HH:mm", { locale: fr });
}

/**
 * Formate une date relative (il y a X temps)
 */
export function formatTicketDateRelative(date: Date | null | undefined): string {
  if (!date) return "—";

  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return formatTicketDate(date);
}
