"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteDocumentAction } from "@/server/actions/documentsActions";
import { SelectDocumentWithTagsType } from "@/zod-schemas/documents.schema";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type DocumentDeleteDialogProps = {
  document: SelectDocumentWithTagsType | null;
  onOpenChange: (open: boolean) => void;
  entrepriseId: string;
  onSuccess: () => void;
};

export function DocumentDeleteDialog({
  document,
  onOpenChange,
  entrepriseId,
  onSuccess,
}: DocumentDeleteDialogProps) {
  const open = !!document;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!document) return;
    setIsDeleting(true);
    try {
      const result = await deleteDocumentAction({
        documentId: document.id,
        entrepriseId,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      toast.success("Document supprimé");
      onSuccess();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="text-destructive size-5" />
            Supprimer le document
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer{" "}
            <strong>{document?.titre || document?.filename}</strong> ?
            <br />
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
