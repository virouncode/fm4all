"use client";

import { updateClientAction } from "@/actions/clientAction";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { normalizeForSubmit } from "@/zod-helpers/normalize";
import {
  SelectClientType,
  UpdateClientFormType,
  updateClientFormSchema,
} from "@/zod-schemas/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type AdminUpdateClientFormProps = {
  client: SelectClientType;
};

const AdminUpdateClientForm = ({ client }: AdminUpdateClientFormProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: UpdateClientFormType = {
    id: client.id,
    nomEntreprise: client.nomEntreprise,
    siret: client.siret ?? "",
  };

  const form = useForm<UpdateClientFormType>({
    mode: "onBlur",
    resolver: zodResolver(updateClientFormSchema),
    defaultValues,
  });

  const { execute: executeUpdateClient, isPending } = useAction(
    updateClientAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast({
            title: "Succès",
            description: data.message,
            variant: "default",
          });
          router.refresh();
        }
      },
      onError: ({ error }) => {
        toast({
          title: "Erreur",
          description: error.serverError ?? "Une erreur est survenue.",
          variant: "destructive",
        });
      },
    },
  );

  const onSubmit = (data: UpdateClientFormType) => {
    const payload = normalizeForSubmit(data, {
      optionalStrings: ["siret"] as const,
    });
    executeUpdateClient(payload);
  };

  const isSubmitDisabled = isPending || !form.formState.isDirty;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldSet>
          <FieldGroup className="gap-4">
            <FieldLegend>Information du client</FieldLegend>
            <div className="grid gap-4 md:grid-cols-2 md:gap-14">
              <RhfInput<UpdateClientFormType>
                name="nomEntreprise"
                label="Nom de l'entreprise"
                requiredMark
                className="w-full md:col-span-1"
              />
              <RhfInput<UpdateClientFormType>
                name="siret"
                label="N° SIRET"
                className="w-full md:col-span-1"
              />
            </div>
          </FieldGroup>
          <FieldSeparator />
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="min-w-32"
            >
              {isPending && <Spinner />}
              Mettre à jour
            </Button>
          </div>
        </FieldSet>
      </form>
    </Form>
  );
};

export default AdminUpdateClientForm;
