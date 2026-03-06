"use client";

import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { isValidSIRET } from "@/lib/utils/isValidSIRET";
import {
  createOrLinkClientAction,
  findEntrepriseBySiretAction,
} from "@/server/actions/clientServiceExecutionsActions";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CheckCircle2,
  RotateCcw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type SiretState =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "found"; entreprise: { id: string; nom: string; siret: string } }
  | { status: "not_found" }
  | { status: "self" }
  | { status: "error"; message: string };

const addClientFormSchema = z.object({
  nom: z.string().min(1, "Nom de l'entreprise requis"),
  prenomContact: z.string(),
  nomContact: z.string(),
  emailContact: z.string().email("Email invalide").or(z.literal("")),
  phoneContact: z.string(),
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
  const [siretState, setSiretState] = useState<SiretState>({ status: "idle" });
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
      prenomContact: "",
      nomContact: "",
      emailContact: "",
      phoneContact: "",
    },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  useEffect(() => {
    if (open) {
      form.reset({
        nom: "",
        prenomContact: "",
        nomContact: "",
        emailContact: "",
        phoneContact: "",
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
    if (result?.data?.isSelf) {
      setSiretState({ status: "self" });
      return;
    }
    if (result?.data?.entreprise) {
      setSiretState({ status: "found", entreprise: result.data.entreprise });
      form.setValue("nom", result.data.entreprise.nom, {
        shouldValidate: true,
      });
    } else {
      setSiretState({ status: "not_found" });
      form.setValue("nom", "");
    }
  };

  const handleResetSiret = () => {
    setSiretInput("");
    setSiretState({ status: "idle" });
    form.reset({
      nom: "",
      prenomContact: "",
      nomContact: "",
      emailContact: "",
      phoneContact: "",
    });
  };

  const onSubmit = async (data: AddClientFormType) => {
    if (!siretResolved) return;
    setCreating(true);
    const result = await createOrLinkClientAction({
      siret: siretInput,
      nom: data.nom,
      prestataireEntrepriseId,
      prenomContact: data.prenomContact || undefined,
      nomContact: data.nomContact || undefined,
      emailContact: data.emailContact || undefined,
      phoneContact: data.phoneContact || undefined,
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
                        className={`font-mono pr-8${siretResolved ? "bg-muted cursor-default" : ""}`}
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
                      Client non trouvé — renseignez les informations
                      ci-dessous.
                    </p>
                  )}
                </div>

                {/* Nom (après recherche) */}
                {siretResolved && (
                  <RhfInput<AddClientFormType>
                    name="nom"
                    label="Nom de l'entreprise"
                    requiredMark
                    readOnly={siretState.status === "found"}
                    inputClassName={
                      siretState.status === "found" ? "bg-muted" : undefined
                    }
                  />
                )}

                {/* Contact (uniquement si nouveau client) */}
                {siretState.status === "not_found" && (
                  <>
                    <Separator />
                    <p className="text-muted-foreground text-sm">
                      Contact (optionnel)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <RhfInput<AddClientFormType>
                        name="prenomContact"
                        label="Prénom"
                      />
                      <RhfInput<AddClientFormType>
                        name="nomContact"
                        label="Nom"
                      />
                      <RhfInput<AddClientFormType>
                        name="emailContact"
                        label="Email"
                        type="email"
                      />
                      <RhfInput<AddClientFormType>
                        name="phoneContact"
                        label="Téléphone"
                        type="tel"
                      />
                    </div>
                  </>
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
