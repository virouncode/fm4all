"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { updateTicketBasicFieldsAction } from "@/server/actions/ticketsActions";
import { FileText, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type EditDescriptionDialogProps = {
  ticketId: string;
  entrepriseId: string;
  currentDescription: string | null;
  onUpdate: () => void;
};

export function EditDescriptionDialog({
  ticketId,
  entrepriseId,
  currentDescription,
  onUpdate,
}: EditDescriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(currentDescription || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpen = () => {
    setDescription(currentDescription || "");
    setOpen(true);
  };

  const handleSubmit = async () => {
    setIsUpdating(true);

    try {
      const result = await updateTicketBasicFieldsAction({
        ticketId,
        entrepriseId,
        description: description || null,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.ticket) {
        toast.success("Description mise à jour");
        setOpen(false);
        onUpdate();
      }
    } catch {
      toast.error("Erreur lors de la mise à jour de la description");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="h-7 gap-2"
      >
        <Pencil className="h-4 w-4" />
        Modifier
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="text-primary h-4 w-4" />
              Modifier la description
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème ou la demande..."
              className="min-h-[200px] resize-none"
              disabled={isUpdating}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isUpdating}>
              {isUpdating ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
