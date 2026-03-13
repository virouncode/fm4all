"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { isValidSIRET } from "@/lib/utils/isValidSIRET";
import {
  createOrLinkClientAction,
  findEntrepriseBySiretAction,
} from "@/server/actions/clientServiceExecutionsActions";
import {
  Building2,
  CheckCircle2,
  Lock,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormState } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { RhfInput } from "@/components/rhf/RhfInput";

type SireneDataType = {
  nom: string;
  formeJuridique: string | null;
  adresseLigne1: string;
  adresseLigne2: string | null;
  codePostal: string;
  ville: string;
  numeroTva: string;
  etatActif: boolean;
};

type SiretStateType =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "found"; entreprise: { id: string; nom: string; siret: string } }
  | { status: "not_found"; sireneData: SireneDataType }
  | { status: "self" }
  | { status: "error"; message: string };

const addClientFormSchema = z.object({
  nom: z.string().min(1, "Nom de l'entreprise requis"),
  adresseLigne1: z.string().optional(),
  adresseLigne2: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
  formeJuridique: z.string().optional(),
  numeroTva: z.string().optional(),
});

type AddClientFormType = z.infer<typeof addClientFormSchema>;

type AjouterClientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestataireEntrepriseId: string;
  onSuccess: () => void;
};

export function AjouterClientDialog({
  open,
  onOpenChange,
  prestataireEntrepriseId,
  onSuccess,
}: AjouterClientDialogProps) {
  const [siretInput, setSiretInput] = useState("");
  const [siretState, setSiretState] = useState<SiretStateType>({ status: "idle" });
  const [creating, setCreating] = useState(false);

  const siretValide = isValidSIRET(siretInput);
  const siretResolved =
    siretState.status === "found" || siretState.status === "not_found";
  const siretBlocked = siretState.status === "self";

  const form = useForm<AddClientFormType>({
    resolver: zodResolver(addClientFormSchema),
    mode: "onTouched",
    defaultValues: {
      nom: "",
      adresseLigne1: "",
      adresseLigne2: "",
      codePostal: "",
      ville: "",
      formeJuridique: "",
      numeroTva: "",
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  useEffect(() => {
    if (open) {
      form.reset({
        nom: "",
        adresseLigne1: "",
        adresseLigne2: "",
        codePostal: "",
        ville: "",
        formeJuridique: "",
        numeroTva: "",
      });
      setSiretInput("");
      setSiretState({ status: "idle" });
    }
  }, [open, form]);

  const handleSearchSiret = async () => {
    setSiretState({ status: "searching" });
    const result = await findEntrepriseBySiretAction({
      siret: siretInput,
      clientEntrepriseId: prestataireEntrepriseId,
    });
    if (result?.serverError) {
      setSiretState({ status: "error", message: result.serverError.message });
      return;
    }

    if (result?.data?.sireneUnavailable) {
      setSiretState({ status: "idle" });
      toast.error(
        "Service INSEE indisponible — impossible de vérifier ce SIRET. Réessayez dans quelques instants.",
      );
      return;
    }

    if (result?.data?.isSelf) {
      setSiretState({ status: "self" });
      return;
    }
    if (result?.data?.entreprise) {
      setSiretState({ status: "found", entreprise: result.data.entreprise });
    } else {
      const sireneData = result?.data?.sireneData as SireneDataType | null;
      if (!sireneData) {
        setSiretState({
          status: "error",
          message: "Impossible de récupérer les données depuis l'API SIRENE.",
        });
        return;
      }
      setSiretState({ status: "not_found", sireneData });
      form.setValue("nom", sireneData.nom, { shouldValidate: true });
      form.setValue("adresseLigne1", sireneData.adresseLigne1 ?? "");
      form.setValue("adresseLigne2", sireneData.adresseLigne2 ?? "");
      form.setValue("codePostal", sireneData.codePostal ?? "");
      form.setValue("ville", sireneData.ville ?? "");
      form.setValue("formeJuridique", sireneData.formeJuridique ?? "");
      form.setValue("numeroTva", sireneData.numeroTva ?? "");
    }
  };

  const handleResetSiret = () => {
    setSiretInput("");
    setSiretState({ status: "idle" });
    form.reset({
      nom: "",
      adresseLigne1: "",
      adresseLigne2: "",
      codePostal: "",
      ville: "",
      formeJuridique: "",
      numeroTva: "",
    });
  };

  const onSubmit = async (data: AddClientFormType) => {
    if (!siretResolved) return;
    setCreating(true);
    const result = await createOrLinkClientAction({
      siret: siretInput,
      nom: data.nom,
      adresseLigne1: data.adresseLigne1 || undefined,
      adresseLigne2: data.adresseLigne2 || undefined,
      codePostal: data.codePostal || undefined,
      ville: data.ville || undefined,
      formeJuridique: data.formeJuridique || undefined,
      numeroTva: data.numeroTva || undefined,
      prestataireEntrepriseId,
    });
    setCreating(false);

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data) {
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Building2 className="text-primary" />
              Ajouter un client
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-6">
              <div className="space-y-4 py-2 pb-4">
                {/* SIRET */}
                <div className="space-y-1.5">
                  <Label className="text-sm">
                    SIRET <span>*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        className={`font-mono pr-8${siretResolved ? " bg-muted cursor-default" : ""}`}
                        placeholder="14 chiffres"
                        maxLength={14}
                        value={siretInput}
                        readOnly={
                          siretState.status === "found" ||
                          siretState.status === "not_found" ||
                          siretState.status === "searching" ||
                          siretState.status === "self"
                        }
                        onChange={(e) => {
                          setSiretInput(e.target.value.replace(/\D/g, ""));
                          setSiretState({ status: "idle" });
                        }}
                      />
                      {siretInput.length > 0 && !siretResolved && (
                        <span className="absolute top-1/2 right-2.5 -translate-y-1/2">
                          {siretValide ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="text-destructive h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                    {siretBlocked || siretResolved ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={handleResetSiret}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Modifier
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        disabled={
                          !siretValide || siretState.status === "searching"
                        }
                        onClick={handleSearchSiret}
                      >
                        {siretState.status === "searching" ? (
                          <Spinner />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                        Rechercher
                      </Button>
                    )}
                  </div>
                  {siretState.status === "error" && (
                    <p className="text-destructive text-xs">
                      {siretState.message}
                    </p>
                  )}
                  {siretState.status === "self" && (
                    <p className="text-destructive text-xs">
                      Votre propre entreprise ne peut pas être un client.
                    </p>
                  )}
                  {siretState.status === "found" && (
                    <p className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Trouvé dans le système : {siretState.entreprise.nom}
                    </p>
                  )}
                  {siretState.status === "not_found" && (
                    <p className="text-muted-foreground text-xs">
                      Données récupérées depuis l&apos;API SIRENE — non
                      modifiables.
                    </p>
                  )}
                </div>

                {/* Nom affiché en lecture seule si déjà en DB */}
                {siretState.status === "found" && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Nom de l&apos;entreprise
                    </p>
                    <p className="text-foreground text-sm">
                      {siretState.entreprise.nom}
                    </p>
                  </div>
                )}

                {/* Champs SIRENE pré-remplis (création uniquement) */}
                {siretState.status === "not_found" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                        Nom de l&apos;entreprise
                        <Lock className="h-3 w-3" />
                      </label>
                      <p className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
                        {siretState.sireneData.nom}
                      </p>
                    </div>

                    {siretState.sireneData.formeJuridique && (
                      <div className="space-y-1">
                        <label className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                          Forme juridique
                          <Lock className="h-3 w-3" />
                        </label>
                        <p className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
                          {siretState.sireneData.formeJuridique}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                        Adresse
                        <Lock className="h-3 w-3" />
                      </label>
                      <p className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
                        {siretState.sireneData.adresseLigne1}
                        {", "}
                        {siretState.sireneData.codePostal}{" "}
                        {siretState.sireneData.ville}
                      </p>
                    </div>

                    <RhfInput<AddClientFormType>
                      name="adresseLigne2"
                      label="Complément d'adresse"
                      placeholder="Bâtiment B, étage 3..."
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="bg-background flex-shrink-0 border-t px-6 pt-4 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || creating}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  !siretResolved || siretBlocked || isSubmitting || creating
                }
              >
                {(isSubmitting || creating) && <Spinner />}
                Confirmer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
