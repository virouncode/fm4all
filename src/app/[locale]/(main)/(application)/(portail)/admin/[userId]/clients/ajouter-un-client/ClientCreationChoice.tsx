"use client";

import { onboardClientAction } from "@/actions/clientAction";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { getProspects } from "@/server/queries_a_classer/prospects/getProspects";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import {
  OnboardClientFormType,
  onboardClientFormSchema,
} from "@/zod-schemas/client.schema";
import {
  ProspectsQueryBackendType,
  SelectProspectType,
} from "@/zod-schemas/prospect";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Search } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ticketsIdLabelMap } from "../../../../client/[clientId]/tickets/mes-tickets/createTicketsColumns";
import ProspectsFiltersForm from "../../prospects/tous-les-prospects/ProspectsFiltersForm";
import ProspectsTable from "../../prospects/tous-les-prospects/ProspectsTable";
import ClientForm from "./ClientForm";

type ClientCreationChoiceProps = {
  userId: string;
  initialData: Awaited<ReturnType<typeof getProspects>>;
  query: ProspectsQueryBackendType;
};

export function ClientCreationChoice({
  userId,
  initialData,
  query,
}: ClientCreationChoiceProps) {
  const router = useRouter();
  const [fromProspect, setFromProspect] = useState(false);
  const [manual, setManual] = useState(false);
  const [prospectChoosen, setProspectChosen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultValues: OnboardClientFormType = {
    client: {
      nomEntreprise: "",
      siret: "",
      prospectId: null,
    },
    sitePrincipal: {
      nomSite: "Site principal",
      adresseLigne1: "",
      adresseLigne2: "",
      codePostal: "",
      ville: "",
      surface: "",
      effectif: "",
      typeBatiment: "bureaux",
      typeOccupation: "plateauComplet",
      commentaires: "",
    },
    userAdmin: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "client_admin",
      avatarAttachment: null,
    },
  };

  const form = useForm<OnboardClientFormType>({
    defaultValues,
    mode: "onTouched",
    resolver: zodResolver(onboardClientFormSchema),
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  const { execute: executeOnboardClient, isPending: isOnboardingClient } =
    useAction(onboardClientAction, {
      onSuccess: ({ data }) => {
        toast({
          variant: "default",
          title: "Succès",
          description: data.message,
        });
        router.push(`/admin/${userId}/clients/tous-les-clients`);
      },

      onError: ({ error }) => {
        const message =
          (typeof error.serverError === "string" && error.serverError) ||
          "Impossible de créer le client, veuillez réessayer.";

        toast({
          variant: "destructive",
          title: "Erreur",
          description: message,
        });
      },
    });

  const handleClickRow = (prospect: SelectProspectType) => {
    setProspectChosen(true);
    form.reset({
      client: {
        nomEntreprise: prospect?.nomEntreprise || "",
        siret: prospect?.siret || "",
        prospectId: prospect?.id || null,
      },
      sitePrincipal: {
        nomSite: "Site principal",
        adresseLigne1: prospect?.adresseLigne1 || "",
        adresseLigne2: prospect?.adresseLigne2 || "",
        codePostal: prospect?.codePostal || "",
        ville: prospect?.ville || "",
        surface: prospect?.surface?.toString() || "",
        effectif: prospect?.effectif?.toString() || "",
        typeBatiment: prospect?.typeBatiment || "bureaux",
        typeOccupation: prospect?.typeOccupation || "plateauComplet",
        commentaires: prospect?.commentaires || "",
      },
      userAdmin: {
        firstName: prospect?.prenomSignataire || prospect?.prenomContact || "",
        lastName: prospect?.nomSignataire || prospect?.nomContact || "",
        email: prospect?.emailSignataire || prospect?.emailContact || "",
        phone: prospect?.phoneContact || "",
        role: "client_admin",
        avatarAttachment: null,
      },
    });
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleClickFromProspect = () => {
    setFromProspect(true);
    setManual(false);
  };

  const handleClickManual = () => {
    setManual(true);
    setFromProspect(false);
    setProspectChosen(false);
    form.reset(defaultValues);
  };

  const submitForm = (data: OnboardClientFormType) => {
    const { client, sitePrincipal, userAdmin } = data;
    const clientPayload = normalizeForSubmit(client, {
      optionalStrings: ["siret"] as const,
    });
    const sitePayload = normalizeForSubmit(sitePrincipal, {
      optionalStrings: ["adresseLigne2", "commentaires"] as const,
      requiredNumbers: ["surface", "effectif"] as const,
    });
    const userPayload = {
      ...userAdmin,
      name: userAdmin.firstName + " " + userAdmin.lastName,
      image: null,
    };
    const payload = {
      client: clientPayload,
      sitePrincipal: sitePayload,
      userAdmin: userPayload,
    };
    executeOnboardClient(payload);
  };

  const isSubmitDisabled =
    isSubmitting || isOnboardingClient || (!isDirty && !prospectChoosen);

  return (
    <div
      className="flex w-full flex-col items-center gap-6 py-10"
      ref={containerRef}
    >
      <p className="text-muted-foreground max-w-prose text-center">
        Choisissez comment créer le nouveau client
      </p>
      <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Option A — À partir d’un prospect */}
        <Card
          className={`hover:bg-muted/50 w-full cursor-pointer overflow-hidden transition ${
            fromProspect ? "ring-primary ring-2" : ""
          }`}
          onClick={handleClickFromProspect}
        >
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <Search className="text-primary h-6 w-6 shrink-0" />
              <CardTitle>Créer à partir d’un prospect</CardTitle>
            </div>
            <CardDescription className="break-words">
              Récupérer automatiquement les informations d’un prospect ayant
              utilisé le comparateur.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Option B — Création manuelle */}

        <Card
          className={`hover:bg-muted/50 w-full cursor-pointer overflow-hidden transition ${
            manual ? "ring-primary ring-2" : ""
          }`}
          onClick={handleClickManual}
        >
          <CardHeader>
            <div className="mb-2 flex items-center gap-3">
              <PlusCircle className="text-primary h-6 w-6 shrink-0" />
              <CardTitle>Créer un client manuellement</CardTitle>
            </div>
            <CardDescription className="break-words">
              Remplir un formulaire vierge pour saisir les informations du
              client.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      {fromProspect && !prospectChoosen && (
        <div className="mt-10 flex min-h-0 w-full flex-1 flex-col overflow-x-hidden">
          <p className="text-muted-foreground mt-6 mb-10 max-w-prose self-center text-center">
            Sélectionnez un prospect dans la liste pour commencer la création
            d’un client pré-rempli
          </p>
          <p className="text-muted-foreground p-4">Recherchez par :</p>
          <div className="border-b p-4">
            <ProspectsFiltersForm initialFilters={query} />
          </div>
          <div className="min-h-0 flex-1 p-4">
            <ProspectsTable
              initialData={initialData}
              initialQuery={query}
              idLabelMap={ticketsIdLabelMap}
              onRowClick={handleClickRow}
            />
          </div>
        </div>
      )}
      {manual || (fromProspect && prospectChoosen) ? (
        <div className="mt-10 w-full max-w-3xl">
          <Form {...form}>
            <ClientForm
              onSubmit={form.handleSubmit(submitForm)}
              isSubmitting={isSubmitting}
              isSubmitDisabled={isSubmitDisabled}
            />
          </Form>
        </div>
      ) : null}
    </div>
  );
}
