"use client";

import { Input } from "@/components/ui/input";
import { updateTicketBasicFieldsAction } from "@/server/actions/ticketsActions";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type EditableTitreProps = {
  ticketId: string;
  entrepriseId: string;
  currentTitre: string;
  onUpdate: () => void;
};

export function EditableTitre({
  ticketId,
  entrepriseId,
  currentTitre,
  onUpdate,
}: EditableTitreProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titre, setTitre] = useState(currentTitre);
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus l'input quand on passe en mode édition
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Placer le curseur à la fin sans sélectionner
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setTitre(currentTitre);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTitre(currentTitre);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!titre.trim()) {
      toast.error("Le titre ne peut pas être vide");
      return;
    }

    if (titre === currentTitre) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateTicketBasicFieldsAction({
        ticketId,
        entrepriseId,
        titre,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.ticket) {
        toast.success("Titre mis à jour");
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update titre:", error);
      toast.error("Erreur lors de la mise à jour du titre");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isUpdating}
          className="text-3xl font-bold tracking-tight h-auto py-1 px-2 border-2 border-primary"
        />
      </div>
    );
  }

  return (
    <button
      onClick={handleStartEdit}
      className="group text-left w-full hover:bg-accent/5 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
    >
      <h1 className="text-3xl font-bold tracking-tight break-words flex items-center gap-2">
        {currentTitre}
        <Pencil className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </h1>
    </button>
  );
}
