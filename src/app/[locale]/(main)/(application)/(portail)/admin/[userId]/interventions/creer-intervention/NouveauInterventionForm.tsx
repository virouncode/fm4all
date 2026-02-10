"use client";

import { insertInterventionAction } from "@/actions/interventionsActions";
import { getClientSitesForAdminAction } from "@/actions/sitesActions";
import { getClientTicketsForAdminAction } from "@/actions/ticketsActions";
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
import { SelectClientType } from "@/zod-schemas/client.schema";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import {
  insertInterventionFormSchema,
  InsertInterventionFormType,
  InsertInterventionType,
} from "@/zod-schemas/intervention";
import { SelectSiteType } from "@/zod-schemas/site";
import { SelectTicketType } from "@/zod-schemas/ticket";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InterventionForm from "../../../../forms/InterventionForm";

type NouveauInterventionFormProps = {
  defaultValues: InsertInterventionFormType;
  clients: SelectClientType[];
  fournisseurs: SelectFournisseurType[];
};

export default function NouveauInterventionForm({
  defaultValues,
  clients,
  fournisseurs,
}: NouveauInterventionFormProps) {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [sites, setSites] = useState<SelectSiteType[]>([]);
  const [tickets, setTickets] = useState<SelectTicketType[]>([]);
  const [isLoadingClientData, setIsLoadingClientData] = useState(false);

  const form = useForm<InsertInterventionFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(insertInterventionFormSchema),
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
        setValue("siteId", "0");
      }
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
    },
  });

  // Action pour récupérer les tickets du client sélectionné
  const { execute: executeGetTickets } = useAction(
    getClientTicketsForAdminAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          setTickets(data);
          setValue("ticketId", "0");
        }
        setIsLoadingClientData(false);
      },
      onError: ({ error }) => {
        const message =
          (typeof error.serverError === "string" && error.serverError) ||
          "Impossible de récupérer les tickets du client.";
        toast({
          variant: "destructive",
          title: "Erreur",
          description: message,
        });
        setTickets([]);
        setIsLoadingClientData(false);
      },
    },
  );

  // Charger les sites et tickets quand le client change
  const loadClientData = useCallback(
    (clientId: number) => {
      setIsLoadingClientData(true);
      setSites([]);
      setTickets([]);
      setValue("siteId", "0");
      setValue("ticketId", "0");
      setValue("fournisseurId", "0");
      // Récupérer les sites du client
      executeGetSites({
        clientId,
        orderBy: "nomSite",
        orderDir: "asc",
      });

      // Récupérer les tickets du client
      executeGetTickets({ clientId });
    },
    [executeGetSites, executeGetTickets, setValue],
  );

  // Quand le client sélectionné change
  useEffect(() => {
    if (selectedClientId) {
      loadClientData(selectedClientId);
    } else {
      setSites([]);
      setTickets([]);
    }
  }, [selectedClientId, loadClientData]);

  // Action pour insérer l'intervention
  const {
    execute: executeInsertIntervention,
    isPending: isSavingIntervention,
  } = useAction(insertInterventionAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: "Succès",
        description: data.message,
      });
      reset(defaultValues);
      setSelectedClientId(null);
      setSites([]);
      setTickets([]);
    },
    onError: ({ error }) => {
      const message =
        (typeof error.serverError === "string" && error.serverError) ||
        "Impossible de créer l'intervention, veuillez réessayer.";

      toast({
        variant: "destructive",
        title: "Erreur",
        description: message,
      });
    },
  });

  const submitForm = (data: InsertInterventionFormType) => {
    if (!selectedClientId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un client.",
      });
      return;
    }

    const payload = normalizeForSubmit(data, {
      requiredDates: ["dateDebutPrevue"] as const,
      optionalDates: ["dateFinPrevue"] as const,
      requiredNumbers: ["siteId", "fournisseurId", "ticketId"] as const,
      optionalStrings: ["description"] as const,
    });

    executeInsertIntervention({
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
      setTickets([]);
    }
  };

  const isSubmitDisabled =
    !isDirty ||
    isSubmitting ||
    isSavingIntervention ||
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
            <span>Chargement des sites et tickets...</span>
          </div>
        )}

        {/* Message si pas de sites */}
        {selectedClientId && !isLoadingClientData && sites.length === 0 && (
          <p className="text-destructive text-sm">
            Ce client n&apos;a pas de site enregistré.
          </p>
        )}

        {/* Message si pas de tickets */}
        {selectedClientId && !isLoadingClientData && tickets.length === 0 && (
          <p className="text-destructive text-sm">
            Ce client n&apos;a pas de ticket.
          </p>
        )}
      </div>

      {/* Formulaire d'intervention - affiché seulement si client avec sites et tickets */}
      {selectedClientId &&
        !isLoadingClientData &&
        sites.length > 0 &&
        tickets.length > 0 && (
          <InterventionForm<InsertInterventionType>
            mode="create"
            onSubmit={form.handleSubmit(submitForm)}
            isSubmitting={isSubmitting}
            isSubmitDisabled={isSubmitDisabled}
            clientId={selectedClientId}
            tickets={tickets}
            sites={sites}
            fournisseurs={fournisseurs}
            userRole="admin"
          />
        )}
    </Form>
  );
}
