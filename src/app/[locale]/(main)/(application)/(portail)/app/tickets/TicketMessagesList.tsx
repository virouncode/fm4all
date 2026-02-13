"use client";

import { Badge } from "@/components/ui/badge";
import { getTicketMessagesAction } from "@/server/actions/ticketsActions";
import { useAppStore } from "@/stores/application/appStore";
import { SelectTicketMessageType } from "@/zod-schemas/ticket.schema";
import { useEffect, useState } from "react";
import { formatTicketDate } from "./helpers";
import { TicketMessageForm } from "./TicketMessageForm";

interface TicketMessagesListProps {
  ticketId: string;
  onMessageAdded: () => void;
}

export function TicketMessagesList({
  ticketId,
  onMessageAdded,
}: TicketMessagesListProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const [messages, setMessages] = useState<SelectTicketMessageType[]>([]);
  const [loading, setLoading] = useState(true);

  // Load messages
  useEffect(() => {
    if (!entreprise?.id) return;

    async function loadMessages() {
      setLoading(true);
      try {
        const result = await getTicketMessagesAction({
          ticketId,
          entrepriseId: entreprise!.id,
        });

        if (result?.data?.messages) {
          setMessages(result.data.messages);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [ticketId, entreprise]);

  const handleMessageSubmit = async () => {
    // Reload messages after adding a new one
    if (!entreprise?.id) return;

    try {
      const result = await getTicketMessagesAction({
        ticketId,
        entrepriseId: entreprise.id,
      });

      if (result?.data?.messages) {
        setMessages(result.data.messages);
        onMessageAdded();
      }
    } catch (error) {
      console.error("Failed to reload messages:", error);
    }
  };

  const getVisibilityBadge = (visibilite: string) => {
    switch (visibilite) {
      case "public":
        return { label: "Public", variant: "outline" as const };
      case "client_only":
        return { label: "Client uniquement", variant: "secondary" as const };
      case "fournisseur_only":
        return {
          label: "Fournisseur uniquement",
          variant: "secondary" as const,
        };
      case "fm4all_only":
        return { label: "FM4ALL uniquement", variant: "default" as const };
      default:
        return { label: visibilite, variant: "outline" as const };
    }
  };

  if (loading) {
    return <div className="text-muted-foreground text-sm">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="text-muted-foreground text-center text-sm">
          Aucun message pour le moment
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const visibilityBadge = getVisibilityBadge(msg.visibilite);

            return (
              <div key={msg.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {msg.auteurUserId || "Système"}
                    </p>
                    <Badge
                      variant={visibilityBadge.variant}
                      className="text-xs"
                    >
                      {visibilityBadge.label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {formatTicketDate(msg.createdAt)}
                  </p>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* New Message Form */}
      <TicketMessageForm ticketId={ticketId} onSuccess={handleMessageSubmit} />
    </div>
  );
}
