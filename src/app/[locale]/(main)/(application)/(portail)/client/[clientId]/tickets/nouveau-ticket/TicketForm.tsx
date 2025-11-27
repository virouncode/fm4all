// src/app/(...)/TicketForm.tsx

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfFileInput } from "@/components/rhf/RhfFileInput";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  ticketCategorieCT,
  ticketPrioriteCT,
  ticketStatusCT,
} from "@/constants/codeTables";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import {
  AttachmentFieldValue,
  InsertTicketFormType,
  UpdateTicketFormType,
} from "@/zod-schemas/ticket";
import { useFieldArray, useFormContext } from "react-hook-form";

type TicketFormProps<TFormValues> = {
  mode: "create" | "edit";
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  clientId: number;
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
};

type TicketFormValues = InsertTicketFormType | UpdateTicketFormType;

const TicketForm = <TFormValues,>({
  mode,
  onSubmit,
  isSubmitting,
  isSubmitDisabled,
  clientId,
  sites,
  fournisseurs,
}: TicketFormProps<TFormValues>) => {
  const form = useFormContext<TicketFormValues>();
  const { control, watch } = form;

  // Tableau d’attachments
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
    // Slot vide, qui sera rempli par RhfFileInput
    append({
      url: "",
      filename: "",
      mimeType: "",
      size: 0,
    } as any);
  };

  return (
    <form onSubmit={onSubmit}>
      <FieldSet>
        <FieldGroup className="gap-2">
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<TicketFormValues>
              name="titre"
              label="Titre"
              requiredMark
              className="w-full md:col-span-1"
            />

            <RhfControlledSelect<TicketFormValues>
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
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfControlledSelect<TicketFormValues>
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
            <RhfControlledSelect<TicketFormValues>
              name="siteId"
              label="Site"
              requiredMark
              className="w-full md:col-span-1"
              selectClassName="w-full"
              valueType="number"
            >
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id.toString()}>
                  {site.nomSite}
                </SelectItem>
              ))}
            </RhfControlledSelect>
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfControlledSelect<TicketFormValues>
              name="fournisseurId"
              label="Fournisseur"
              className="w-full md:col-span-1"
              selectClassName="w-full"
              valueType="number"
              placeholder="Sélectionner un fournisseur"
            >
              <SelectItem value="0">Sélectionner un fournisseur</SelectItem>
              {fournisseurs.map((fournisseur) => (
                <SelectItem
                  key={fournisseur.id}
                  value={fournisseur.id.toString()}
                >
                  {fournisseur.nomFournisseur}
                </SelectItem>
              ))}
            </RhfControlledSelect>
            {mode === "edit" && (
              <RhfControlledSelect<TicketFormValues>
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
            )}
          </div>

          {/* Description */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfTextArea<TicketFormValues>
              name="description"
              label="Description"
              className="w-full md:col-span-2"
              textareaClassName="resize-none h-[200px]"
            />
          </div>

          {/* ================== PIÈCES JOINTES ================== */}
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
                <RhfFileInput<TicketFormValues>
                  key={fieldItem.id}
                  name={`attachments.${index}` as any}
                  folderName={`tickets/${clientId}`}
                  // pas de label pour éviter la répétition
                  onClear={() => remove(index)}
                  className="w-1/2"
                  maxSizeBytes={500 * 1024} // 500 KB
                />
              ))}

              {mode === "edit" && fields.length === 0 && (
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
            {isSubmitting && <Spinner />}
            {mode === "create" ? "Créer le ticket" : "Enregistrer"}
          </Button>
        </div>
      </FieldSet>
    </form>
  );
};

export default TicketForm;
