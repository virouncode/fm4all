"use client";

import { RhfCheckbox } from "@/components/rhf/RhfCheckbox";
import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DialogStyledBody,
  DialogStyledContent,
  DialogStyledFooter,
  DialogStyledHeader,
} from "@/components/ui/dialog-styled";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  getEntrepriseContactsForRelationAction,
  insertEntrepriseContactAndLinkToRelationAction,
  insertRelationContactAction,
} from "@/server/actions/entreprisesActions";
import { phoneNumberSchemaEmpty } from "@/zod-schemas/phone.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
type ContactOptionType = {
  id: string;
  prenom: string;
  nom: string;
  fonction: string | null;
  email: string | null;
  phone: string | null;
};

// Schemas locaux sans .default() (conflit RHF input/output types)
const existingContactFormSchema = z.object({
  contactId: z.uuid("Sélectionnez un contact"),
  role: z.string().optional(),
  estPrincipal: z.boolean(),
});
type ExistingContactFormType = z.infer<typeof existingContactFormSchema>;

const newContactFormSchema = z.object({
  prenom: z.string().min(1, "Prénom obligatoire"),
  nom: z.string().min(1, "Nom obligatoire"),
  email: z.string().email("Email invalide").or(z.literal("")).optional(),
  phone: phoneNumberSchemaEmpty("Numéro de téléphone invalide").optional(),
  fonction: z.string().optional(),
  role: z.string().optional(),
  estPrincipal: z.boolean(),
});
type NewContactFormType = z.infer<typeof newContactFormSchema>;

type AddRelationContactDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  relationId: string;
  targetEntrepriseId: string;
  targetNom: string;
  side: "client" | "prestataire";
  onSuccess: () => void;
};

export function AddRelationContactDialog({
  open,
  onOpenChange,
  relationId,
  targetEntrepriseId,
  targetNom,
  side,
  onSuccess,
}: AddRelationContactDialogProps) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [availableContacts, setAvailableContacts] = useState<
    ContactOptionType[]
  >([]);
  const [totalContactCount, setTotalContactCount] = useState(0);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const existingForm = useForm<ExistingContactFormType>({
    resolver: zodResolver(existingContactFormSchema),
    mode: "onTouched",
    defaultValues: { contactId: "", role: "", estPrincipal: false },
  });

  const newForm = useForm<NewContactFormType>({
    resolver: zodResolver(newContactFormSchema),
    mode: "onTouched",
    defaultValues: {
      prenom: "",
      nom: "",
      email: "",
      phone: "",
      fonction: "",
      role: "",
      estPrincipal: false,
    },
  });

  const existingState = useFormState({ control: existingForm.control });
  const newState = useFormState({ control: newForm.control });

  const isSubmitting =
    mode === "existing" ? existingState.isSubmitting : newState.isSubmitting;

  useEffect(() => {
    if (!open) return;
    setMode("existing");
    existingForm.reset({ contactId: "", role: "", estPrincipal: false });
    newForm.reset({
      prenom: "",
      nom: "",
      email: "",
      phone: "",
      fonction: "",
      role: "",
      estPrincipal: false,
    });

    setTotalContactCount(0);
    setLoadingContacts(true);
    getEntrepriseContactsForRelationAction({ relationId, targetEntrepriseId })
      .then((result) => {
        if (result?.data) {
          setAvailableContacts(result.data.contacts);
          setTotalContactCount(result.data.totalContactCount);
          if (result.data.contacts.length === 0) setMode("new");
        }
      })
      .finally(() => setLoadingContacts(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmitExisting = async (data: ExistingContactFormType) => {
    const result = await insertRelationContactAction({
      relationId,
      contactId: data.contactId,
      side,
      role: data.role || undefined,
      estPrincipal: data.estPrincipal,
    });
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    toast.success("Contact ajouté.");
    onOpenChange(false);
    onSuccess();
  };

  const onSubmitNew = async (data: NewContactFormType) => {
    const result = await insertEntrepriseContactAndLinkToRelationAction({
      relationId,
      targetEntrepriseId,
      side,
      prenom: data.prenom,
      nom: data.nom,
      email: data.email || undefined,
      phone: data.phone || undefined,
      fonction: data.fonction || undefined,
      role: data.role || undefined,
      estPrincipal: data.estPrincipal,
    });
    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }
    toast.success("Contact créé et ajouté.");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !isSubmitting && onOpenChange(v)}>
      <DialogStyledContent className="max-w-md">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="text-primary size-5" />
              Ajouter un contact
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        {/* Sélecteur de mode */}
        <DialogStyledBody className="px-5 py-4">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={mode}
            onValueChange={(v) => v && setMode(v as "existing" | "new")}
            className="self-start"
          >
            <ToggleGroupItem
              value="existing"
              disabled={loadingContacts}
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-3 text-xs"
            >
              Choisir existant
            </ToggleGroupItem>
            <ToggleGroupItem
              value="new"
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-3 text-xs"
            >
              Créer nouveau
            </ToggleGroupItem>
          </ToggleGroup>
        </DialogStyledBody>

        {mode === "existing" ? (
          <Form {...existingForm}>
            <form
              onSubmit={existingForm.handleSubmit(onSubmitExisting)}
              className="space-y-4"
            >
              <DialogStyledBody>
                {loadingContacts ? (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Spinner className="h-4 w-4" />
                    Chargement des contacts…
                  </div>
                ) : availableContacts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    {totalContactCount > 0
                      ? `Tous les contacts de ${targetNom} ont déjà été ajoutés. Vous pouvez en créer un nouveau.`
                      : `${targetNom} n'a pas encore de contacts. Créez-en un nouveau.`}
                  </p>
                ) : (
                  <>
                    <RhfControlledSelect<ExistingContactFormType>
                      name="contactId"
                      label="Contact"
                      requiredMark
                      placeholder="Sélectionnez un contact"
                      selectClassName="w-full"
                    >
                      {availableContacts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.prenom} {c.nom}
                          {c.fonction ? ` — ${c.fonction}` : ""}
                        </SelectItem>
                      ))}
                    </RhfControlledSelect>

                    <RhfInput<ExistingContactFormType>
                      name="role"
                      label="Rôle dans la relation"
                      placeholder="ex: Responsable compte"
                    />

                    <RhfCheckbox<ExistingContactFormType>
                      name="estPrincipal"
                      label="Interlocuteur principal"
                      orientation="horizontal"
                    />
                  </>
                )}
              </DialogStyledBody>
              <DialogStyledFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    loadingContacts ||
                    availableContacts.length === 0
                  }
                >
                  {isSubmitting && <Spinner />}
                  <UserPlus className="h-4 w-4" />
                  Ajouter
                </Button>
              </DialogStyledFooter>
            </form>
          </Form>
        ) : (
          <Form {...newForm}>
            <form
              onSubmit={newForm.handleSubmit(onSubmitNew)}
              className="space-y-4"
            >
              <DialogStyledBody>
                <div className="grid grid-cols-2 gap-3">
                  <RhfInput<NewContactFormType>
                    name="prenom"
                    label="Prénom"
                    requiredMark
                  />
                  <RhfInput<NewContactFormType>
                    name="nom"
                    label="Nom"
                    requiredMark
                  />
                </div>

                <RhfInput<NewContactFormType>
                  name="email"
                  label="Email"
                  type="email"
                />

                <div className="grid grid-cols-2 gap-3">
                  <RhfInput<NewContactFormType>
                    name="phone"
                    label="Téléphone"
                    type="tel"
                  />
                  <RhfInput<NewContactFormType>
                    name="fonction"
                    label="Fonction"
                  />
                </div>

                <Separator />

                <RhfInput<NewContactFormType>
                  name="role"
                  label="Rôle dans la relation"
                  placeholder="ex: Responsable compte"
                />

                <RhfCheckbox<NewContactFormType>
                  name="estPrincipal"
                  label="Interlocuteur principal"
                  orientation="horizontal"
                />
              </DialogStyledBody>
              <DialogStyledFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !newState.isDirty}
                >
                  {isSubmitting && <Spinner />}
                  <UserPlus className="h-4 w-4" />
                  Créer et ajouter
                </Button>
              </DialogStyledFooter>
            </form>
          </Form>
        )}
      </DialogStyledContent>
    </Dialog>
  );
}
