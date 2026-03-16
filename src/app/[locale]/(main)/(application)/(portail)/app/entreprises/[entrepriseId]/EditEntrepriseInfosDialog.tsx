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
import { Spinner } from "@/components/ui/spinner";
import {
  getSireneDataAction,
  updateEntrepriseSireneFieldsAction,
} from "@/server/actions/entreprisesActions";
import type { SireneDataType } from "@/server/utils/sirene.utils";
import { Building2, Lock, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrepriseId: string;
  currentSiret: string;
  onSuccess: () => void;
};

type SearchStateType =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "found"; data: SireneDataType }
  | { status: "error"; message: string };

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <label className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
        {label}
        <Lock className="h-3 w-3" />
      </label>
      <p className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
        {value || "—"}
      </p>
    </div>
  );
}

export function EditEntrepriseInfosDialog({
  open,
  onOpenChange,
  entrepriseId,
  currentSiret,
  onSuccess,
}: Props) {
  const [searchState, setSearchState] = useState<SearchStateType>({
    status: "idle",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSearchState({ status: "idle" });
  }, [open]);

  const handleSearch = async () => {
    setSearchState({ status: "searching" });
    const result = await getSireneDataAction({ siret: currentSiret });
    if (result?.serverError) {
      setSearchState({ status: "error", message: result.serverError.message });
      return;
    }
    if (result?.data?.sireneData) {
      setSearchState({ status: "found", data: result.data.sireneData });
    }
  };

  const handleSave = async () => {
    if (searchState.status !== "found") return;
    setIsSaving(true);
    const { data } = searchState;
    const result = await updateEntrepriseSireneFieldsAction({
      entrepriseId,
      nom: data.nom,
      adresseLigne1: data.adresseLigne1 || undefined,
      codePostal: data.codePostal || undefined,
      ville: data.ville || undefined,
      formeJuridique: data.formeJuridique || undefined,
      numeroTva: data.numeroTva || undefined,
    });
    setIsSaving(false);
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    toast.success("Informations SIRENE mises à jour");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="max-w-md">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="text-primary h-5 w-5" />
              Mettre à jour depuis l&apos;API SIRENE
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <DialogStyledBody>
          <div className="space-y-4 py-2">
            {/* SIRET affiché + bouton Rechercher */}
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-sm font-medium">SIRET</p>
              <div className="flex items-center gap-2">
                <p className="bg-muted flex-1 rounded-md border px-3 py-2 font-mono text-sm">
                  {currentSiret}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={
                    searchState.status === "searching" ||
                    searchState.status === "found"
                  }
                  onClick={handleSearch}
                >
                  {searchState.status === "searching" ? (
                    <Spinner />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Rechercher
                </Button>
              </div>
              {searchState.status === "error" && (
                <p className="text-destructive text-xs">{searchState.message}</p>
              )}
              {searchState.status === "found" && (
                <p className="text-muted-foreground text-xs">
                  Données récupérées — vérifiez avant d&apos;enregistrer.
                </p>
              )}
            </div>

            {/* Données SIRENE */}
            {searchState.status === "found" && (
              <>
                <ReadOnlyField label="Nom" value={searchState.data.nom} />
                <ReadOnlyField
                  label="Forme juridique"
                  value={searchState.data.formeJuridique}
                />
                <ReadOnlyField
                  label="Adresse"
                  value={[
                    searchState.data.adresseLigne1,
                    searchState.data.adresseLigne2,
                    searchState.data.codePostal && searchState.data.ville
                      ? `${searchState.data.codePostal} ${searchState.data.ville}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
                <ReadOnlyField
                  label="N° TVA"
                  value={searchState.data.numeroTva}
                />
              </>
            )}
          </div>
        </DialogStyledBody>

        <DialogStyledFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button
            type="button"
            disabled={searchState.status !== "found" || isSaving}
            onClick={handleSave}
          >
            {isSaving && <Spinner />}
            Enregistrer
          </Button>
        </DialogStyledFooter>
      </DialogStyledContent>
    </Dialog>
  );
}
