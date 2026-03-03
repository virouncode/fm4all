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
import { archiveSiteAction } from "@/server/actions/sitesActions";
import { SelectSiteType } from "@/zod-schemas/sites.schema";
import { Archive } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SiteArchiveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: SelectSiteType;
  entrepriseId: string;
  onSuccess: () => void;
}

export function SiteArchiveDialog({
  open,
  onOpenChange,
  site,
  entrepriseId,
  onSuccess,
}: SiteArchiveDialogProps) {
  const [archiving, setArchiving] = useState(false);

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const result = await archiveSiteAction({
        siteId: site.id,
        entrepriseId,
      });

      // Gestion d'erreur next-safe-action
      if (result?.serverError) {
        const errorMessage = result.serverError.message;
        if (errorMessage.includes("sous-sites actifs")) {
          toast.error(
            "Impossible d'archiver ce site car il contient des sous-sites actifs. Archivez d'abord les sous-sites.",
          );
        } else {
          toast.error(errorMessage);
        }
        return;
      }

      toast.success("Site archivé avec succès");
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de l'archivage";
      toast.error(errorMessage);
    } finally {
      setArchiving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archiver le site</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir archiver le site &quot;{site.nom}&quot; ?
            <br />
            <br />
            Ce site sera archivé et pourra être restauré ultérieurement. Si ce
            site a des sous-sites actifs, vous devez d&apos;abord les archiver.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={archiving}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleArchive}
            disabled={archiving}
          >
            <Archive className="h-4 w-4" />
            {archiving ? "Archivage..." : "Archiver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
