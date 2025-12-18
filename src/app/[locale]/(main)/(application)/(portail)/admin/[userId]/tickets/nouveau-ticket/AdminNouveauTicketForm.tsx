"use client";

import { getClientSitesForAdminAction } from "@/actions/sitesActions";
import { insertTicketForAdminAction } from "@/actions/ticketsActions";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import { SelectClientType } from "@/zod-schemas/client";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import { SelectSiteType } from "@/zod-schemas/site";
import {
  insertTicketFormSchema,
  InsertTicketFormType,
} from "@/zod-schemas/ticket";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import TicketForm from "../../../../client/[clientId]/tickets/nouveau-ticket/TicketForm";

type AdminNouveauTicketFormProps = {
  defaultValues: InsertTicketFormType;
  clients: SelectClientType[];
  fournisseurs: SelectFournisseurType[];
};

export default function AdminNouveauTicketForm({
  defaultValues,
  clients,
  fournisseurs,
}: AdminNouveauTicketFormProps) {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [sites, setSites] = useState<SelectSiteType[]>([]);
  const [isLoadingClientData, setIsLoadingClientData] = useState(false);

  const form = useForm<InsertTicketFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(insertTicketFormSchema),
  });

  const {
    formState: { isDirty, isSubmitting },
    reset,
    setValue,
  } = form;

  // Action pour récupérer les sites du client sélectionné
  const { execute: executeGetSites } = useAction(getClientSitesForAdminAction, {
    onSuccess: ({ data }) => {
      if (data) {
        setSites(data);
        // Reset du site sélectionné
        setValue("siteId", "0");
      }
      setIsLoadingClientData(false);
    },
    onError: ({ error }) => {
      const message =
        (typeof error.serverError === "string" && error.serverError) ||
        "Impossible de récupérer les sites du client.";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: message,
      });
      setSites([]);
      setIsLoadingClientData(false);
    },
  });

  // Charger les sites quand le client change (fournisseurs sont tous disponibles)
  const loadClientData = useCallback(
    (clientId: number) => {
      setIsLoadingClientData(true);
      setSites([]);
      setValue("siteId", "0");

      // Récupérer les sites du client
      executeGetSites({
        clientId,
        orderBy: "nomSite",
        orderDir: "asc",
      });
    },
    [executeGetSites, setValue],
  );

  // Quand le client sélectionné change
  useEffect(() => {
    if (selectedClientId) {
      loadClientData(selectedClientId);
    } else {
      setSites([]);
    }
  }, [selectedClientId, loadClientData]);

  // Action pour insérer le ticket
  const { execute: executeInsertTicket, isPending: isSavingTicket } = useAction(
    insertTicketForAdminAction,
    {
      onSuccess: ({ data }) => {
        toast({
          variant: "default",
          title: "Succès",
          description: data.message,
        });
        reset(defaultValues);
        setSelectedClientId(null);
        setSites([]);
      },
      onError: ({ error }) => {
        const message =
          (typeof error.serverError === "string" && error.serverError) ||
          "Impossible de créer le ticket, veuillez réessayer.";

        toast({
          variant: "destructive",
          title: "Erreur",
          description: message,
        });
      },
    },
  );

  const submitForm = (data: InsertTicketFormType) => {
    if (!selectedClientId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un client.",
      });
      return;
    }

    const payload = normalizeForSubmit(data, {
      requiredNumbers: ["siteId", "fournisseurId"] as const,
      optionalStrings: ["description"] as const,
    });

    executeInsertTicket({
      ...payload,
      clientId: selectedClientId,
    });
  };

  const handleClientChange = (value: string) => {
    const clientId = parseInt(value);
    if (clientId > 0) {
      setSelectedClientId(clientId);
    } else {
      setSelectedClientId(null);
      setSites([]);
    }
  };

  const isSubmitDisabled =
    !isDirty ||
    isSubmitting ||
    isSavingTicket ||
    !selectedClientId ||
    isLoadingClientData;

  return (
    <Form {...form}>
      <div className="mb-6 space-y-4">
        {/* Sélecteur de client */}
        <FormField
          name="clientId"
          render={() => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                Client
                <span>*</span>
              </FormLabel>
              <Select
                value={selectedClientId?.toString() || "0"}
                onValueChange={handleClientChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sélectionner un client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.nomEntreprise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Indicateur de chargement */}
        {isLoadingClientData && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Spinner className="h-4 w-4" />
            <span>Chargement des sites...</span>
          </div>
        )}

        {/* Message si pas de sites */}
        {selectedClientId && !isLoadingClientData && sites.length === 0 && (
          <p className="text-destructive text-sm">
            Ce client n&apos;a pas de site enregistré.
          </p>
        )}
      </div>

      {/* Formulaire de ticket - fournisseurs disponibles pour tous les clients */}
      {selectedClientId && !isLoadingClientData && sites.length > 0 && (
        <TicketForm<InsertTicketFormType>
          mode="create"
          onSubmit={form.handleSubmit(submitForm)}
          isSubmitting={isSubmitting}
          isSubmitDisabled={isSubmitDisabled}
          clientId={selectedClientId}
          sites={sites}
          fournisseurs={fournisseurs}
          userRole="admin"
          isDevisTicket={false}
          isReadOnly={false}
        />
      )}
    </Form>
  );
}
