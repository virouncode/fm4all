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
import { usePathname, useRouter } from "@/i18n/navigation";
import { ArrowDownAZ, ArrowDownUp, ArrowUpAZ } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface TicketsSortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Options de tri disponibles
const SORT_OPTIONS = [
  { value: "lastActivityAt", label: "Dernière activité" },
  { value: "createdAt", label: "Date de création" },
  { value: "priorite", label: "Priorité" },
  { value: "statut", label: "Statut" },
  { value: "titre", label: "Titre" },
  { value: "siteNom", label: "Site" },
  { value: "proprietaireEntrepriseNom", label: "Client" },
  { value: "demandeurEntrepriseNom", label: "Demandeur" },
  { value: "assigneEntrepriseNom", label: "Prestataire" },
] as const;

export function TicketsSortDialog({
  open,
  onOpenChange,
}: TicketsSortDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lire les valeurs actuelles depuis l'URL
  const currentOrderBy = searchParams.get("orderBy") || "lastActivityAt";
  const currentOrderDir = searchParams.get("orderDir") || "desc";

  const handleSortChange = (orderBy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("orderBy", orderBy);
    const query = Object.fromEntries(params.entries());
    // @ts-expect-error - next-intl router typing issue
    router.replace({ pathname, query });
  };

  const handleDirectionChange = (orderDir: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("orderDir", orderDir);
    const query = Object.fromEntries(params.entries());
    // @ts-expect-error - next-intl router typing issue
    router.replace({ pathname, query });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <ArrowDownUp className="text-primary size-6" />
              Trier les tickets
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Trier par */}
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

          {/* Ordre */}
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
