"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DialogStyledContent,
  DialogStyledHeader,
  DialogStyledBody,
  DialogStyledFooter,
} from "@/components/ui/dialog-styled";
import { Textarea } from "@/components/ui/textarea";
import { updateDevisDemandeAction } from "@/server/actions/devisDemandesActions";
import { Spinner } from "@/components/ui/spinner";
import { FileText, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type EditDescriptionDemandeDialogProps = {
  demandeId: string;
  entrepriseId: string;
  currentDescription: string | null;
  onUpdate: () => void;
};

export function EditDescriptionDemandeDialog({
  demandeId,
  entrepriseId,
  currentDescription,
  onUpdate,
}: EditDescriptionDemandeDialogProps) {
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
      const result = await updateDevisDemandeAction({
        id: demandeId,
        entrepriseId,
        description: description || "",
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.demande) {
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
      <Button variant="outline" size="sm" onClick={handleOpen} className="h-7 gap-2">
        <Pencil className="h-4 w-4" />
        Modifier
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogStyledContent className="sm:max-w-2xl">
          <DialogStyledHeader>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="text-primary h-4 w-4" />
                Modifier la description
              </DialogTitle>
            </DialogHeader>
          </DialogStyledHeader>

          <DialogStyledBody>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre demande de devis..."
              className="min-h-[200px] resize-none"
              disabled={isUpdating}
            />
          </DialogStyledBody>

          <DialogStyledFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={isUpdating}>
              {isUpdating ? <Spinner className="size-3" /> : <Pencil className="size-3" />}Enregistrer
            </Button>
          </DialogStyledFooter>
        </DialogStyledContent>
      </Dialog>
    </>
  );
}
