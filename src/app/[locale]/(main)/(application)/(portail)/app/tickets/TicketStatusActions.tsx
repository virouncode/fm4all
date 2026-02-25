"use client";

import { Button } from "@/components/ui/button";
import { changeTicketStatusAction } from "@/server/actions/ticketsActions";
import { useAppStore } from "@/stores/application/appStore";
import { SelectTicketType } from "@/zod-schemas/ticket.schema";
import { TicketStatutType } from "@/zod-schemas/enums";
import { toast } from "sonner";

interface TicketStatusActionsProps {
  ticket: SelectTicketType;
  onStatusChanged: () => void;
}

export function TicketStatusActions({
  ticket,
  onStatusChanged,
}: TicketStatusActionsProps) {
  const entreprise = useAppStore((state) => state.entreprise);

  const handleStatusChange = async (newStatut: TicketStatutType) => {
    if (!entreprise?.id) return;

    const result = await changeTicketStatusAction({
      ticketId: ticket.id,
      entrepriseId: entreprise.id,
      newStatut,
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data?.ticket) {
      toast.success("Statut mis à jour");
      onStatusChanged();
    }
  };

  // Determine available transitions based on current status
  const getAvailableTransitions = (): Array<{
    statut: TicketStatutType;
    label: string;
    variant?: "default" | "destructive" | "outline";
  }> => {
    switch (ticket.statut) {
      case "nouveau":
        return [
          { statut: "pris_en_charge", label: "Prendre en charge" },
          { statut: "annule", label: "Annuler", variant: "destructive" },
          { statut: "rejete", label: "Rejeter", variant: "destructive" },
        ];

      case "pris_en_charge":
        return [
          {
            statut: "en_attente_prestataire",
            label: "Attente prestataire",
            variant: "outline",
          },
        ];

      case "en_attente_prestataire":
        return [
          {
            statut: "en_attente_client",
            label: "Attente client",
            variant: "outline",
          },
          { statut: "a_valider", label: "À valider" },
        ];

      case "a_valider":
        return [{ statut: "clos", label: "Clôturer" }];

      default:
        return [];
    }
  };

  const transitions = getAvailableTransitions();

  if (transitions.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {transitions.map((transition) => (
        <Button
          key={transition.statut}
          size="sm"
          variant={transition.variant || "default"}
          onClick={() => handleStatusChange(transition.statut)}
        >
          {transition.label}
        </Button>
      ))}
    </div>
  );
}
