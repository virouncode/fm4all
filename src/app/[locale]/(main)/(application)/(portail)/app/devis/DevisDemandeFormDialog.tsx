"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfFileInput } from "@/components/rhf/RhfFileInput";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
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
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { getAccessibleSitesAction } from "@/server/actions/sitesActions";
import { getServicesAction } from "@/server/actions/servicesActions";
import {
  insertDevisDemandeAction,
  updateDevisDemandeAction,
} from "@/server/actions/devisDemandesActions";
import type { DevisDemandeAvecDetails } from "@/server/queries/devisDemandes.query";
import { useAppStore } from "@/stores/application/appStore";
import {
  insertDevisDemandeFormSchema,
  type InsertDevisDemandeFormType,
  updateDevisDemandeFormSchema,
  type UpdateDevisDemandeFormType,
} from "@/zod-schemas/devis.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

type DevisDemandeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  demande?: DevisDemandeAvecDetails;
  onSuccess: (demande: DevisDemandeAvecDetails) => void;
};

export function DevisDemandeFormDialog({
  open,
  onOpenChange,
  mode,
  demande,
  onSuccess,
}: DevisDemandeFormDialogProps) {
  const entreprise = useAppStore((state) => state.entreprise);

  const [sites, setSites] = useState<Array<{ id: string; nom: string }>>([]);
  const [services, setServices] = useState<Array<{ id: string; nom: string }>>(
    [],
  );
  const [loadingSites, setLoadingSites] = useState(false);

  const schema =
    mode === "create" ? insertDevisDemandeFormSchema : updateDevisDemandeFormSchema;

  const form = useForm<InsertDevisDemandeFormType | UpdateDevisDemandeFormType>(
    {
      resolver: zodResolver(schema),
      mode: "onTouched",
      defaultValues:
        mode === "edit" && demande
          ? {
              id: demande.id,
              siteId: demande.siteId,
              serviceId: demande.serviceId,
              titre: demande.titre,
              description: demande.description ?? "",
              attachments: [],
            }
          : {
              siteId: "",
              serviceId: "",
              titre: "",
              description: "",
              attachments: [],
            },
    },
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attachments",
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  const attachmentsWatch = form.watch("attachments");
  const hasPendingAttachment = attachmentsWatch?.some(
    (att) => !att || !att.storageKey,
  );

  // Charger les sites accessibles
  useEffect(() => {
    if (!open || !entreprise?.id) return;
    setLoadingSites(true);

    getAccessibleSitesAction({ entrepriseId: entreprise.id })
      .then((result) => {
        if (result?.data) {
          const data = Array.isArray(result.data) ? result.data : [];
          setSites(data.map((s) => ({ id: s.id, nom: s.nom })));
        }
      })
      .catch(() => toast.error("Erreur lors du chargement des sites"))
      .finally(() => setLoadingSites(false));
  }, [open, entreprise?.id]);

  // Charger les services du catalogue
  useEffect(() => {
    if (!open) return;
    getServicesAction()
      .then((result) => {
        if (result?.data?.services) {
          setServices(result.data.services.map((s) => ({ id: s.id, nom: s.nom })));
        }
      })
      .catch(() => toast.error("Erreur lors du chargement des services"));
  }, [open]);

  // Reset du form à l'ouverture
  useEffect(() => {
    if (open) {
      if (mode === "edit" && demande) {
        form.reset({
          id: demande.id,
          siteId: demande.siteId,
          serviceId: demande.serviceId,
          titre: demande.titre,
          description: demande.description ?? "",
          attachments: [],
        });
      } else {
        form.reset({
          siteId: "",
          serviceId: "",
          titre: "",
          description: "",
          attachments: [],
        });
      }
    }
  }, [open, mode, demande, form]);

  const onSubmit = async (
    data: InsertDevisDemandeFormType | UpdateDevisDemandeFormType,
  ) => {
    if (!entreprise?.id) return;

    if (mode === "create") {
      const createData = data as InsertDevisDemandeFormType;
      const result = await insertDevisDemandeAction({
        entrepriseId: entreprise.id,
        siteId: createData.siteId,
        serviceId: createData.serviceId,
        titre: createData.titre,
        description: createData.description ?? "",
        attachments: createData.attachments,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.demande) {
        // Enrichir avec les noms affichés
        const site = sites.find((s) => s.id === result.data!.demande.siteId);
        const service = services.find(
          (s) => s.id === result.data!.demande.serviceId,
        );
        toast.success("Demande créée avec succès");
        onSuccess({
          ...result.data.demande,
          siteNom: site?.nom ?? "",
          serviceNom: service?.nom ?? "",
          createdByPrenom: null,
          createdByNom: null,
          devisCount: 0,
          proprietaireEntrepriseNom: null,
        });
        onOpenChange(false);
      }
    } else {
      const editData = data as UpdateDevisDemandeFormType;
      const result = await updateDevisDemandeAction({
        id: editData.id!,
        entrepriseId: entreprise.id,
        titre: editData.titre,
        description: editData.description ?? "",
        attachments: editData.attachments,
      });

      if (result?.serverError) {
        toast.error(result.serverError.message);
        return;
      }

      if (result?.data?.demande && demande) {
        toast.success("Demande modifiée avec succès");
        onSuccess({
          ...demande,
          ...result.data.demande,
          siteNom: demande.siteNom,
          serviceNom: demande.serviceNom,
          createdByPrenom: demande.createdByPrenom,
          createdByNom: demande.createdByNom,
          devisCount: demande.devisCount,
          proprietaireEntrepriseNom: demande.proprietaireEntrepriseNom,
        });
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogStyledContent className="flex max-h-[90vh] max-w-2xl flex-col">
        <DialogStyledHeader>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <FileText className="text-primary" />
                {mode === "create"
                  ? "Nouvelle demande de devis"
                  : "Modifier la demande"}
              </div>
            </DialogTitle>
          </DialogHeader>
        </DialogStyledHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <DialogStyledBody className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
              {/* Site — désactivé en mode edit */}
              <RhfControlledSelect<
                InsertDevisDemandeFormType | UpdateDevisDemandeFormType
              >
                name="siteId"
                label="Site"
                requiredMark
                placeholder="Sélectionnez un site"
                disabled={
                  mode === "edit" || loadingSites || sites.length === 0
                }
                selectClassName="w-full"
              >
                {sites.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nom}
                  </SelectItem>
                ))}
              </RhfControlledSelect>

              {/* Service — désactivé en mode edit */}
              <RhfControlledSelect<
                InsertDevisDemandeFormType | UpdateDevisDemandeFormType
              >
                name="serviceId"
                label="Service concerné"
                requiredMark
                placeholder="Sélectionnez un service"
                disabled={mode === "edit" || services.length === 0}
                selectClassName="w-full"
              >
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nom}
                  </SelectItem>
                ))}
              </RhfControlledSelect>

              <RhfInput<InsertDevisDemandeFormType | UpdateDevisDemandeFormType>
                name="titre"
                label="Titre"
                requiredMark
                placeholder="Objet de la demande"
              />

              <RhfTextArea<
                InsertDevisDemandeFormType | UpdateDevisDemandeFormType
              >
                name="description"
                label="Description"
                requiredMark
                placeholder="Détails, contraintes, délais souhaités..."
                textareaClassName="h-32"
              />

              {/* Pièces jointes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Pièces jointes <span className="text-muted-foreground font-normal">(max 5 Mo)</span></p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        storageKey: "",
                        filename: "",
                        mimeType: "",
                        sizeBytes: 0,
                      })
                    }
                  >
                    <Paperclip className="mr-1 h-3 w-3" />
                    Ajouter
                  </Button>
                </div>

                {fields.length > 0 && (
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <RhfFileInput<
                        InsertDevisDemandeFormType | UpdateDevisDemandeFormType
                      >
                        key={field.id}
                        name={
                          `attachments.${index}` as
                            | "attachments.0"
                            | `attachments.${number}`
                        }
                        proprietaireEntrepriseId={entreprise?.id ?? ""}
                        categorie="devis_demande"
                        onClear={() => remove(index)}
                        deleteOnClear
                        maxSizeBytes={5 * 1024 * 1024}
                      />
                    ))}
                  </div>
                )}
              </div>
              </div>
            </DialogStyledBody>

            <DialogStyledFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty || hasPendingAttachment}
              >
                {isSubmitting
                  ? mode === "create"
                    ? "Création..."
                    : "Enregistrement..."
                  : mode === "create"
                    ? "Créer la demande"
                    : "Enregistrer"}
              </Button>
            </DialogStyledFooter>
          </form>
        </Form>
      </DialogStyledContent>
    </Dialog>
  );
}
