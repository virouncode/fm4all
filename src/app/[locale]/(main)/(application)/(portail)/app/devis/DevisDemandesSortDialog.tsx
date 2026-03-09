"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/navigation";
import { ArrowDownAZ, ArrowDownUp, ArrowUpAZ } from "lucide-react";

type DevisDemandesSortDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchParams: Record<string, string | undefined>;
};

const SORT_OPTIONS = [
  { value: "createdAt", label: "Date de création" },
  { value: "updatedAt", label: "Date de modification" },
  { value: "titre", label: "Titre" },
  { value: "statut", label: "Statut" },
  { value: "siteNom", label: "Site" },
  { value: "serviceNom", label: "Service" },
] as const;

export function DevisDemandesSortDialog({
  open,
  onOpenChange,
  searchParams,
}: DevisDemandesSortDialogProps) {
  const router = useRouter();

  const currentOrderBy = searchParams.orderBy ?? "createdAt";
  const currentOrderDir = searchParams.orderDir ?? "desc";

  const handleSortChange = (orderBy: string) => {
    router.replace({
      pathname: "/app/devis",
      query: { ...searchParams, tab: "demandes", orderBy },
    });
  };

  const handleDirectionChange = (orderDir: string) => {
    router.replace({
      pathname: "/app/devis",
      query: { ...searchParams, tab: "demandes", orderDir },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <ArrowDownUp className="text-primary size-6" />
              Trier les demandes
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trier par</label>
            <Select value={currentOrderBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ordre</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={currentOrderDir === "asc" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleDirectionChange("asc")}
              >
                <ArrowUpAZ className="h-4 w-4" />
                Croissant
              </Button>
              <Button
                type="button"
                variant={currentOrderDir === "desc" ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleDirectionChange("desc")}
              >
                <ArrowDownAZ className="h-4 w-4" />
                Décroissant
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
