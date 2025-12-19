"use client";

import { updateTicketForAdminAction } from "@/actions/ticketsActions";
import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfFileInput } from "@/components/rhf/RhfFileInput";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  ticketCategorieCT,
  ticketPrioriteCT,
  ticketStatusCT,
  ticketTypeCT,
} from "@/constants/codeTables";
import { toast } from "@/hooks/use-toast";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import {
  AttachmentFieldValue,
  updateTicketFormSchema,
  UpdateTicketFormType,
} from "@/zod-schemas/ticket";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";

type AdminUpdateTicketFormProps = {
  defaultValues: UpdateTicketFormType;
  clientId: number;
  clientName: string;
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
  userId: string;
  isDevisTicket?: boolean;
  redirectUrl?: string;
};

// Type étendu pour le formulaire admin avec clientId
type AdminUpdateTicketFormValues = UpdateTicketFormType & { clientId?: number };

export default function AdminUpdateTicketForm({
  defaultValues,
  clientId,
  clientName,
  sites,
  fournisseurs,
  userId,
  isDevisTicket = false,
  redirectUrl,
}: AdminUpdateTicketFormProps) {
  const router = useRouter();
  const form = useForm<UpdateTicketFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(updateTicketFormSchema),
  });

  const {
    formState: { isDirty, isSubmitting },
    control,
    watch,
  } = form;

  // Tableau d'attachments
  const { fields, append, remove } = useFieldArray({
    control,
    name: "attachments" as const,
  });

  const attachments = watch("attachments") as
    | AttachmentFieldValue[]
    | undefined;

  // On désactive le bouton "Ajouter" si une pièce jointe est en cours (slot sans url)
  const hasPendingAttachment = attachments?.some((att) => !att || !att.url);

  const handleAddAttachment = () => {
    append({
      url: "",
      filename: "",
      mimeType: "",
      size: 0,
    });
  };

  const { execute: executeUpdateTicket, isPending: isSavingTicket } = useAction(
    updateTicketForAdminAction,
    {
      onSuccess: ({ data }) => {
        toast({
          variant: "default",
          title: "Succès",
          description: data?.message ?? "Ticket mis à jour",
        });
        router.push(redirectUrl ?? `/admin/${userId}/tickets/tous-les-tickets`);
      },

      onError: ({ error }) => {
        const message =
          (typeof error.serverError === "string" && error.serverError) ||
          "Impossible de mettre à jour le ticket, veuillez réessayer.";

        toast({
          variant: "destructive",
          title: "Erreur",
          description: message,
        });
      },
    },
  );

  const submitForm = (data: UpdateTicketFormType) => {
    const payload = normalizeForSubmit(data, {
      requiredNumbers: ["siteId", "fournisseurId"] as const,
      optionalStrings: ["description"] as const,
    });
    // Ajouter le clientId au payload
    executeUpdateTicket({ ...payload, clientId });
  };

  const isSubmitDisabled = !isDirty || isSubmitting || isSavingTicket;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitForm)}>
        <FieldSet>
          <FieldGroup className="gap-2">
            {/* Client (disabled - pour info uniquement) */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-14">
              <div className="space-y-2">
                <Label>Client</Label>
                <Input value={clientName} disabled className="bg-muted" />
                <p className="text-muted-foreground text-xs">
                  Le client ne peut pas être modifié
                </p>
              </div>
            </div>

            {/* Titre */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-14">
              <RhfInput<AdminUpdateTicketFormValues>
                name="titre"
                label="Titre"
                requiredMark
                className="w-full md:col-span-2"
              />
            </div>

            {/* Type et Catégorie */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-14">
              {isDevisTicket ? (
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    value={
                      ticketTypeCT.find((t) => t.code === defaultValues.type)
                        ?.name ?? defaultValues.type
                    }
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-muted-foreground text-xs">
                    Le type ne peut pas être modifié pour une demande de devis
                  </p>
                </div>
              ) : (
                <RhfControlledSelect<AdminUpdateTicketFormValues>
                  name="type"
                  label="Type"
                  requiredMark
                  className="w-full md:col-span-1"
                  selectClassName="w-full"
                >
                  {ticketTypeCT.map((type) => (
                    <SelectItem key={type.code} value={type.code}>
                      {type.name}
                    </SelectItem>
                  ))}
                </RhfControlledSelect>
              )}
              {isDevisTicket ? (
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Input
                    value={
                      ticketCategorieCT.find(
                        (c) => c.code === defaultValues.categorie,
                      )?.name ?? defaultValues.categorie
                    }
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-muted-foreground text-xs">
                    La catégorie ne peut pas être modifiée pour une demande de
                    devis
                  </p>
                </div>
              ) : (
                <RhfControlledSelect<AdminUpdateTicketFormValues>
                  name="categorie"
                  label="Catégorie"
                  requiredMark
                  className="w-full md:col-span-1"
                  selectClassName="w-full"
                >
                  {ticketCategorieCT.map((categorie) => (
                    <SelectItem key={categorie.code} value={categorie.code}>
                      {categorie.name}
                    </SelectItem>
                  ))}
                </RhfControlledSelect>
              )}
            </div>

            {/* Priorité et État */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-14">
              <RhfControlledSelect<AdminUpdateTicketFormValues>
                name="priorite"
                label="Priorité"
                requiredMark
                className="w-full md:col-span-1"
                selectClassName="w-full"
              >
                {ticketPrioriteCT.map((priorite) => (
                  <SelectItem key={priorite.code} value={priorite.code}>
                    {priorite.name}
                  </SelectItem>
                ))}
              </RhfControlledSelect>
              <RhfControlledSelect<AdminUpdateTicketFormValues>
                name="status"
                label="État"
                requiredMark
                className="w-full md:col-span-1"
                selectClassName="w-full"
              >
                {ticketStatusCT.map((status) => (
                  <SelectItem key={status.code} value={status.code}>
                    {status.name}
                  </SelectItem>
                ))}
              </RhfControlledSelect>
            </div>

            {/* Site et Prestataire */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-14">
              <RhfControlledSelect<AdminUpdateTicketFormValues>
                name="siteId"
                label="Site"
                requiredMark
                className="w-full md:col-span-1"
                selectClassName="w-full"
              >
                <SelectItem value="0">Sélectionner un site</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id.toString()}>
                    {site.nomSite}
                  </SelectItem>
                ))}
              </RhfControlledSelect>
              <RhfControlledSelect<AdminUpdateTicketFormValues>
                name="fournisseurId"
                label="Prestataire"
                className="w-full md:col-span-1"
                selectClassName="w-full"
                placeholder="Sélectionner un prestataire"
                requiredMark
              >
                <SelectItem value="0">Sélectionner un prestataire</SelectItem>
                {fournisseurs.map((fournisseur) => (
                  <SelectItem
                    key={fournisseur.id}
                    value={fournisseur.id.toString()}
                  >
                    {fournisseur.nomFournisseur}
                  </SelectItem>
                ))}
              </RhfControlledSelect>
            </div>

            {/* Description */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-14">
              <RhfTextArea<AdminUpdateTicketFormValues>
                name="description"
                label="Description"
                className="w-full md:col-span-2"
                textareaClassName="resize-none h-[200px]"
              />
            </div>

            {/* Pièces jointes */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Pièces jointes (Max: 500Ko)
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAttachment}
                  disabled={hasPendingAttachment}
                >
                  Ajouter une pièce jointe
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((fieldItem, index) => (
                  <RhfFileInput<AdminUpdateTicketFormValues>
                    key={fieldItem.id}
                    name={`attachments.${index}`}
                    folderName={`tickets/${clientId}`}
                    onClear={() => remove(index)}
                    className="w-1/2"
                    maxSizeBytes={500 * 1024}
                  />
                ))}

                {fields.length === 0 && (
                  <p className="text-muted-foreground text-xs">
                    Aucune pièce jointe pour ce ticket.
                  </p>
                )}
              </div>
            </div>
          </FieldGroup>

          <div className="flex justify-end border-t pt-6">
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="min-w-32"
            >
              {isSubmitting || isSavingTicket ? <Spinner /> : null}
              Enregistrer
            </Button>
          </div>
        </FieldSet>
      </form>
    </Form>
  );
}
