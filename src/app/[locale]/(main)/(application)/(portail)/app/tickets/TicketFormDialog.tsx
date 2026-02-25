"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfFileInput } from "@/components/rhf/RhfFileInput";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import { getEntreprisesClientesAction, getEntreprisesPrestatairesAction } from "@/server/actions/entreprisesActions";
import { getAccessibleSitesAction } from "@/server/actions/sitesActions";
import { insertTicketAction } from "@/server/actions/ticketsActions";
import { getClientPrestatairesAction } from "@/server/actions/clientServiceExecutions.actions";
import { useAppStore } from "@/stores/application/appStore";
import {
  insertTicketFormSchema,
  type InsertTicketFormType,
  type SelectTicketType,
} from "@/zod-schemas/ticket.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

interface TicketFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (ticket: SelectTicketType) => void;
}

export function TicketFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: TicketFormDialogProps) {
  const entreprise = useAppStore((state) => state.entreprise);
  const posture = useAppStore((state) => state.postureActive);
  const [sites, setSites] = useState<Array<{ id: string; nom: string }>>([]);
  const [clients, setClients] = useState<Array<{ id: string; nom: string }>>(
    [],
  );
  const [selectedClientId, setSelectedClientId] = useState<string>(
    entreprise?.id || "",
  );
  const [loadingSites, setLoadingSites] = useState(false);
  const [prestataires, setPrestataires] = useState<Array<{ id: string; nom: string }>>([]);
  const [loadingPrestataires, setLoadingPrestataires] = useState(false);

  const form = useForm<InsertTicketFormType>({
    resolver: zodResolver(insertTicketFormSchema),
    mode: "onTouched",
    defaultValues: {
      titre: "",
      description: "",
      type: "demande",
      priorite: "normale",
      siteId: "",
      proprietaireEntrepriseId: posture === "plateforme" ? "" : (entreprise?.id || ""),
      assigneEntrepriseId: "",
      attachments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attachments",
  });

  const { isSubmitting, isDirty } = useFormState({ control: form.control });

  // Vérifier si un attachement est en cours d'upload (pas encore de storageKey)
  const attachments = form.watch("attachments");
  const hasPendingAttachment = attachments?.some(
    (att) => !att || !att.storageKey,
  );

  // Charger clients si posture plateforme
  useEffect(() => {
    if (posture !== "plateforme" || !open) return;

    async function loadClients() {
      try {
        const result = await getEntreprisesClientesAction();
        if (result?.data?.clients) {
          setClients(result.data.clients);
        }
      } catch {
        toast.error("Erreur lors du chargement des clients");
      }
    }

    loadClients();
  }, [posture, open]);

  // Charger sites quand le client change OU au montage
  useEffect(() => {
    if (!selectedClientId || !open) return;

    async function loadSites() {
      setLoadingSites(true);
      try {
        // getAccessibleSitesAction gère la posture en interne:
        // - Plateforme: retourne TOUS les sites du client
        // - Client: retourne seulement les sites accessibles selon attributions
        const result = await getAccessibleSitesAction({
          entrepriseId: selectedClientId,
        });

        if (result?.data) {
          const sitesData = Array.isArray(result.data) ? result.data : [];
          setSites(sitesData.map((s) => ({ id: s.id, nom: s.nom })));
        }
      } catch {
        toast.error("Erreur lors du chargement des sites");
      }
      setLoadingSites(false);
    }

    loadSites();
  }, [selectedClientId, open]);

  // Charger prestataires selon posture
  useEffect(() => {
    if (!selectedClientId || !open) return;

    async function loadPrestataires() {
      setLoadingPrestataires(true);
      try {
        let result;
        if (posture === "plateforme") {
          // Tous les prestataires
          result = await getEntreprisesPrestatairesAction();
          if (result?.data?.prestataires) {
            setPrestataires(result.data.prestataires);
          }
        } else {
          // Prestataires du client (via services)
          result = await getClientPrestatairesAction({
            clientEntrepriseId: selectedClientId,
          });
          if (result?.data?.prestataires) {
            setPrestataires(result.data.prestataires);
          }
        }
      } catch {
        toast.error("Erreur lors du chargement des prestataires");
      }
      setLoadingPrestataires(false);
    }

    loadPrestataires();
  }, [posture, selectedClientId, open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const defaultProprietaireId = posture === "plateforme" ? "" : (entreprise?.id || "");
      form.reset({
        titre: "",
        description: "",
        type: "demande",
        priorite: "normale",
        siteId: "",
        proprietaireEntrepriseId: defaultProprietaireId,
        assigneEntrepriseId: "",
        attachments: [],
      });
      setSelectedClientId(posture === "plateforme" ? "" : (entreprise?.id || ""));
    }
  }, [open, form, entreprise?.id, posture]);

  // Ajouter une pièce jointe
  const handleAddAttachment = () => {
    append({
      storageKey: "",
      filename: "",
      mimeType: "",
      sizeBytes: 0,
      previewUrl: "",
    });
  };

  // Quand le client change (posture plateforme)
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    form.setValue("proprietaireEntrepriseId", clientId);
    form.setValue("siteId", ""); // Reset site selection
  };

  const onSubmit = async (data: InsertTicketFormType) => {
    if (!entreprise?.id) return;

    // Déterminer proprietaireEntrepriseId selon posture
    let proprietaireId: string;

    if (posture === "plateforme") {
      proprietaireId = data.proprietaireEntrepriseId || entreprise.id;
    } else {
      // Posture client : proprietaire = demandeur = current entreprise
      proprietaireId = entreprise.id;
    }

    const result = await insertTicketAction({
      titre: data.titre,
      description: data.description,
      type: data.type,
      priorite: data.priorite,
      siteId: data.siteId,
      entrepriseId: entreprise.id, // demandeurEntrepriseId
      proprietaireEntrepriseId: proprietaireId,
      assigneEntrepriseId: data.assigneEntrepriseId || undefined, // Transformer "" en undefined
      attachments: data.attachments, // Pièces jointes
    });

    if (result?.serverError) {
      toast.error(result.serverError.message);
      return;
    }

    if (result?.data?.ticket) {
      toast.success("Ticket créé avec succès");
      onSuccess(result.data.ticket);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Ticket className="text-primary" />
              Nouveau ticket
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            {/* Contenu scrollable */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {/* Si posture plateforme : Select Client */}
              {posture === "plateforme" && (
                <RhfControlledSelect<InsertTicketFormType>
                  name="proprietaireEntrepriseId"
                  label="Client"
                  requiredMark
                  placeholder="Sélectionnez un client"
                  onChange={(value) => handleClientChange(value as string)}
                  selectClassName="w-full"
                >
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nom}
                    </SelectItem>
                  ))}
                </RhfControlledSelect>
              )}

              <RhfControlledSelect<InsertTicketFormType>
                name="siteId"
                label="Site"
                requiredMark
                placeholder="Sélectionnez un site"
                disabled={!selectedClientId || loadingSites || sites.length === 0}
                selectClassName="w-full"
              >
                {sites.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nom}
                  </SelectItem>
                ))}
              </RhfControlledSelect>

              {/* Select Prestataire (si disponibles) */}
              {prestataires.length > 0 && (
                <RhfControlledSelect<InsertTicketFormType>
                  name="assigneEntrepriseId"
                  label="Prestataire (optionnel)"
                  placeholder="Laisser vide pour assignation ultérieure"
                  disabled={loadingPrestataires}
                  selectClassName="w-full"
                >
                  {prestataires.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nom}
                    </SelectItem>
                  ))}
                </RhfControlledSelect>
              )}

              <RhfInput<InsertTicketFormType>
                name="titre"
                label="Titre"
                requiredMark
                placeholder="Résumé du problème ou de la demande"
              />

              <RhfTextArea<InsertTicketFormType>
                name="description"
                label="Description"
                placeholder="Détails supplémentaires..."
                textareaClassName="h-40"
              />

              <div className="grid grid-cols-2 gap-4">
                <RhfControlledSelect<InsertTicketFormType>
                  name="type"
                  label="Type"
                  requiredMark
                  className="col-span-1"
                  selectClassName="w-full"
                >
                  <SelectItem value="incident">Incident</SelectItem>
                  <SelectItem value="demande">Demande</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </RhfControlledSelect>

                <RhfControlledSelect<InsertTicketFormType>
                  name="priorite"
                  label="Priorité"
                  requiredMark
                  className="col-span-1"
                  selectClassName="w-full"
                >
                  <SelectItem value="critique">Critique</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="normale">Normale</SelectItem>
                  <SelectItem value="basse">Basse</SelectItem>
                </RhfControlledSelect>
              </div>

              {/* Section Pièces Jointes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Pièces jointes (max 2 Mo)
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddAttachment}
                    disabled={hasPendingAttachment || !selectedClientId}
                  >
                    Ajouter
                  </Button>
                </div>

                {fields.length > 0 && (
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <RhfFileInput<InsertTicketFormType>
                        key={field.id}
                        name={`attachments.${index}` as const}
                        proprietaireEntrepriseId={selectedClientId || ""}
                        categorie="piece_jointe"
                        onClear={() => remove(index)}
                        deleteOnClear
                        maxSizeBytes={2 * 1024 * 1024} // 2MB
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer sticky */}
            <DialogFooter className="bg-background sticky bottom-0 flex shrink-0 justify-end gap-2 border-t px-6 pt-4 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? "Création..." : "Créer le ticket"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
