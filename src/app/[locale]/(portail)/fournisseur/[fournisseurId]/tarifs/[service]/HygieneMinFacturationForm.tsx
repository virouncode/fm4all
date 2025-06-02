"use client";
import { updateHygieneMinFacturationAction } from "@/actions/hygieneTarifsAction";
import { InputWithLabel } from "@/components/form-inputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import {
  SelectHygieneMinFacturationType,
  updateHygieneMinFacturationSchema,
  UpdateHygieneMinFacturationType,
} from "@/zod-schemas/hygieneMinFacturation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";

type HygieneMinFacturationFormProps = {
  initialTarif: SelectHygieneMinFacturationType;
  title: string;
};

const HygieneMinFacturationForm = ({
  initialTarif,
  title,
}: HygieneMinFacturationFormProps) => {
  const locale = useLocale();
  const tAuth = useTranslations("auth");
  const [modifiedFields, setModifiedFields] = useState<
    Set<keyof SelectHygieneMinFacturationType>
  >(new Set<keyof SelectHygieneMinFacturationType>());
  const lastUpdate = format(
    initialTarif.updatedAt,
    locale === "fr" ? "dd/MM/yyyy à HH:mm" : "yyyy/MM/dd at hh:mm a"
  );
  const defaultValues: UpdateHygieneMinFacturationType = initialTarif;
  const form = useForm<UpdateHygieneMinFacturationType>({
    mode: "onBlur",
    resolver: zodResolver(updateHygieneMinFacturationSchema),
    defaultValues,
  });
  const {
    execute: executeUpdateHygieneMinFacturation,
    isPending: isUpdatingHygieneMinFacturation,
    reset: resetUpdateHygieneMinFacturationAction,
  } = useAction(updateHygieneMinFacturationAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: tAuth("succes"),
        description: data?.message,
      });
      resetUpdateHygieneMinFacturationAction();
      setModifiedFields(new Set());
    },
    onError: ({ error }) => {
      toast({
        variant: "destructive",
        title: tAuth("erreur"),
        description:
          error?.serverError ??
          "Une erreur est survenue lors de la mise à jour des tarifs d'hygiène.",
      });
    },
  });

  const hasUnsavedChanges = modifiedFields.size > 0;

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof SelectHygieneMinFacturationType
  ) => {
    const inputValue = e.target.value;
    const value = inputValue ? parseFloat(inputValue) : 0;

    const hasChanged = initialTarif[field] !== value;

    if (hasChanged) {
      setModifiedFields((prev) => {
        const newSet = new Set(prev);
        newSet.add(field);
        return newSet;
      });
    } else {
      setModifiedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    setModifiedFields(new Set());
  };

  const isFieldModified = (fieldName: string) => {
    return modifiedFields.has(
      fieldName as keyof SelectHygieneMinFacturationType
    );
  };
  const submitForm = async (data: UpdateHygieneMinFacturationType) => {
    executeUpdateHygieneMinFacturation(data);
  };
  return (
    <>
      <div className="flex justify-between mt-14 mb-2 item-center">
        <div className="border-l border-l-gray-500">
          <h2 className="ml-4 text-xl font-bold">{title}</h2>
        </div>
        <p className="text-sm italic text-end">
          Dernière mise à jour : {lastUpdate}
        </p>
      </div>
      <Form {...form}>
        <form
          className="relative space-y-4"
          onSubmit={form.handleSubmit(submitForm)}
        >
          {/* Bouton de sauvegarde et indicateur de modifications */}
          <div className="flex justify-between items-center flex-col gap-4 md:flex-row md:gap-0">
            <div>
              {hasUnsavedChanges ? (
                <div className="text-sm text-amber-600 font-medium">
                  Vous avez des modifications non sauvegardées
                </div>
              ) : (
                <Button
                  disabled={!hasUnsavedChanges}
                  size="lg"
                  className="bg-fm4alldestructive"
                >
                  Publier
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                disabled={!hasUnsavedChanges || isUpdatingHygieneMinFacturation}
                variant="destructive"
                size="lg"
              >
                {isUpdatingHygieneMinFacturation ? (
                  <div className="flex items-center gap-2">
                    <Loader className="animate-spin" />
                    <p>...Sauvegarde</p>
                  </div>
                ) : (
                  "Sauvegarder"
                )}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isUpdatingHygieneMinFacturation}
                variant="outline"
                size="lg"
                type="button"
              >
                Annuler
              </Button>
            </div>
          </div>
          <InputWithLabel<UpdateHygieneMinFacturationType>
            nameInSchema="minFacturation"
            fieldTitle="Minimum annuel de facturation (consommables inclus, € HT/an)"
            type="number"
            step={0.01}
            min={0}
            className={`${isFieldModified("minFacturation") ? "border-amber-500" : ""}`}
            handleChange={(e) => handleInputChange(e, "minFacturation")}
          />
        </form>
      </Form>
    </>
  );
};

export default HygieneMinFacturationForm;
