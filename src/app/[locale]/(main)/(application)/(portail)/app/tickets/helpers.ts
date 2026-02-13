import { TicketPrioriteType, TicketStatutType, TicketTypeType } from "@/zod-schemas/enums";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Retourne le badge de statut avec couleur appropriée
 */
export function getTicketStatutBadge(statut: TicketStatutType): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  switch (statut) {
    case "nouveau":
      return { label: "Nouveau", variant: "default" };
    case "pris_en_charge":
      return { label: "Pris en charge", variant: "secondary" };
    case "en_attente_fournisseur":
      return { label: "En attente fournisseur", variant: "outline" };
    case "en_attente_client":
      return { label: "En attente client", variant: "outline" };
    case "a_valider":
      return { label: "À valider", variant: "secondary" };
    case "clos":
      return { label: "Clos", variant: "secondary" };
    case "annule":
      return { label: "Annulé", variant: "destructive" };
    case "rejete":
      return { label: "Rejeté", variant: "destructive" };
    default:
      return { label: statut, variant: "outline" };
  }
}

/**
 * Retourne le badge de priorité avec couleur appropriée
 */
export function getTicketPrioriteBadge(priorite: TicketPrioriteType): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  switch (priorite) {
    case "critique":
      return { label: "Critique", variant: "destructive" };
    case "haute":
      return { label: "Haute", variant: "default" };
    case "normale":
      return { label: "Normale", variant: "secondary" };
    case "basse":
      return { label: "Basse", variant: "outline" };
    default:
      return { label: priorite, variant: "outline" };
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
