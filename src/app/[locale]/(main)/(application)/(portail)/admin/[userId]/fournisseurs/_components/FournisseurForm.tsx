"use client";

import { RhfFileInput } from "@/components/rhf/RhfFileInput";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { getAllServices } from "@/server/queries_a_classer/services/getServices";
import {
  OnboardFournisseurFormType,
  UpdateFournisseurForAdminFormType,
} from "@/zod-schemas/fournisseur";
import { useFormContext } from "react-hook-form";

type FournisseurFormValues =
  | OnboardFournisseurFormType
  | UpdateFournisseurForAdminFormType;

type FournisseurFormProps = {
  mode: "create" | "edit";
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  services: Awaited<ReturnType<typeof getAllServices>>;
};

const FournisseurForm = ({
  mode,
  onSubmit,
  isSubmitting,
  isSubmitDisabled,
  services,
}: FournisseurFormProps) => {
  const form = useFormContext<FournisseurFormValues>();
  const { watch, setValue } = form;

  const selectedServices = watch("services");

  const handleServiceToggle = (serviceId: number, checked: boolean) => {
    const currentServices = selectedServices || [];
    if (checked) {
      setValue("services", [...currentServices, serviceId], {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      setValue(
        "services",
        currentServices.filter((id: number) => id !== serviceId),
        { shouldDirty: true, shouldValidate: true },
      );
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <FieldSet>
        <FieldGroup className="gap-2">
          <FieldLegend>Informations de l&apos;entreprise</FieldLegend>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<FournisseurFormValues>
              name="fournisseur.nomFournisseur"
              label="Nom de l'entreprise"
              requiredMark
              className="w-full"
            />
            <RhfInput<FournisseurFormValues>
              name="fournisseur.siret"
              label="SIRET"
              className="w-full"
              requiredMark
              placeholder="12345678901234"
            />
          </div>
        </FieldGroup>

        <FieldGroup className="gap-2">
          <FieldLegend>Contact principal</FieldLegend>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<FournisseurFormValues>
              name="fournisseur.prenomContact"
              label="Prénom"
              requiredMark
              className="w-full"
            />
            <RhfInput<FournisseurFormValues>
              name="fournisseur.nomContact"
              label="Nom"
              requiredMark
              className="w-full"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<FournisseurFormValues>
              name="fournisseur.emailContact"
              label="Email"
              requiredMark
              className="w-full"
              disabled={mode === "edit"}
            />
            <RhfInput<FournisseurFormValues>
              name="fournisseur.phoneContact"
              label="Téléphone"
              requiredMark
              className="w-full"
              placeholder="+33612345678"
            />
          </div>
        </FieldGroup>

        <FieldGroup className="gap-2">
          <FieldLegend>Services proposés</FieldLegend>
          <FormField
            control={form.control}
            name="services"
            render={() => (
              <FormItem>
                <FormLabel className="text-muted-foreground mb-4 text-sm">
                  Sélectionnez au moins un service *
                </FormLabel>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center space-x-2"
                    >
                      <FormControl>
                        <Checkbox
                          checked={selectedServices?.includes(service.id)}
                          onCheckedChange={(checked) =>
                            handleServiceToggle(service.id, checked === true)
                          }
                          id={service.id.toString()}
                        />
                      </FormControl>
                      <Label
                        htmlFor={service.id.toString()}
                        className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {service.titre}
                      </Label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </FieldGroup>

        <FieldGroup className="mt-4 gap-2">
          <FieldLegend>Logo (max 500 Ko)</FieldLegend>
          <RhfFileInput<FournisseurFormValues>
            name="fournisseur.logoAttachment"
            folderName="fournisseurs-logos"
            maxSizeBytes={500 * 1024}
            className="w-1/2"
            onValueChange={(val) => {
              setValue("fournisseur.logoAttachment.url", val?.url, {
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
            onClear={() => {
              setValue("fournisseur.logoAttachment.url", undefined, {
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
          />
        </FieldGroup>

        <div className="flex justify-end border-t pt-6">
          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="min-w-32"
          >
            {isSubmitting && <Spinner />}
            {mode === "create" ? "Créer le fournisseur" : "Enregistrer"}
          </Button>
        </div>
      </FieldSet>
    </form>
  );
};

export default FournisseurForm;
