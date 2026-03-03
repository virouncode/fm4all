"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTicketAssigneUserAction } from "@/server/actions/ticketsActions";
import { useState } from "react";
import { toast } from "sonner";

type EditableAssigneUserProps = {
  ticketId: string;
  entrepriseId: string;
  currentAssigneUserId: string | null;
  availableUsers: Array<{ id: string; prenom: string; nom: string }>;
  onUpdate: () => void;
};

export function EditableAssigneUser({
  ticketId,
  entrepriseId,
  currentAssigneUserId,
  availableUsers,
  onUpdate,
}: EditableAssigneUserProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (value: string) => {
    // Convertir valeur spéciale → "" pour normalizeForSubmit
    const normalizedValue = value === "none" ? "" : value;

    if (normalizedValue === (currentAssigneUserId || "")) return;

    setIsUpdating(true);

    try {
      const result = await updateTicketAssigneUserAction({
        ticketId,
        entrepriseId,
        assigneUserId: normalizedValue, // "" sera converti en null côté serveur
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.ticket) {
        toast.success("Utilisateur mis à jour");
        onUpdate();
      }
    } catch {
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentAssigneUserId || "none"}
      onValueChange={handleChange}
      disabled={isUpdating || availableUsers.length === 0}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choisir un utilisateur" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="italic text-muted-foreground">Sélectionner un utilisateur</span>
        </SelectItem>
        {availableUsers.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.prenom} {user.nom}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
