"use client";

import { updateVitrerieTarifAction } from "@/actions/vitrerieTarifsAction";
import { InputWithLabel } from "@/components/form-inputs/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import {
  createVitrerieTarifsUpdateSchema,
  SelectVitrerieTarifFournisseurType,
  UpdateVitrerieTarifsType,
} from "@/zod-schemas/nettoyageVitrerie";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useAction } from "next-safe-action/hooks";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";

type VitrerieTarifsUpdateFormProps = {
  initialTarifs: SelectVitrerieTarifFournisseurType;
  title: string;
};

export default function VitrerieTarifsUpdateForm({
  initialTarifs,
  title,
}: VitrerieTarifsUpdateFormProps) {
  const tAuth = useTranslations("auth");
  const [modifiedFields, setModifiedFields] = useState<
    Set<keyof SelectVitrerieTarifFournisseurType>
  >(new Set<keyof SelectVitrerieTarifFournisseurType>());
  const locale = useLocale();

  const lastUpdate = format(
    initialTarifs.updatedAt,
    locale === "fr" ? "dd/MM/yyyy à HH:mm" : "yyyy/MM/dd at hh:mm a"
  );

  const defaultValues: UpdateVitrerieTarifsType = initialTarifs;
  const form = useForm<UpdateVitrerieTarifsType>({
    mode: "onBlur",
    resolver: zodResolver(
      createVitrerieTarifsUpdateSchema({
        cadenceVitres: "Cadence vitres intérieures invalide",
        cadenceCloisons: "Cadence cloisons invalide",
        tauxHoraire: "Taux horaire invalide",
        minFacturation: "Le minimum de facturation doit être supérieur à 0",
        fraisDeplacement:
          "Les frais de déplacement doivent être supérieurs à 0",
      })
    ),
    defaultValues,
  });

  const {
    execute: executeUpdateVitrerieTarif,
    isPending: isUpdatingVitrerieTarif,
    reset: resetUpdateVitrerieTarifAction,
  } = useAction(updateVitrerieTarifAction, {
    onSuccess: ({ data }) => {
      toast({
        variant: "default",
        title: tAuth("succes"),
        description: data?.message,
      });
      resetUpdateVitrerieTarifAction();
      setModifiedFields(new Set());
      window.location.reload();
    },
    onError: ({ error }) => {
      toast({
        variant: "destructive",
        title: tAuth("erreur"),
        description:
          error?.serverError ??
          "Une erreur est survenue lors de la mise à jour des tarifs de vitrerie",
      });
    },
  });

  // Vérifier s'il y a des modifications non sauvegardées
  const hasUnsavedChanges = modifiedFields.size > 0;

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof SelectVitrerieTarifFournisseurType
  ) => {
    const inputValue = e.target.value;
    const value = inputValue ? parseFloat(inputValue) : 0;

    const hasChanged = initialTarifs[field] !== value;

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

  const submitForm = async (data: UpdateVitrerieTarifsType) => {
    executeUpdateVitrerieTarif(data);
  };

  const isFieldModified = (fieldName: string) => {
    return modifiedFields.has(
      fieldName as keyof SelectVitrerieTarifFournisseurType
    );
  };

  if (!initialTarifs) {
    return (
      <div className="text-center p-8">
        Aucun tarif trouvé. Veuillez contacter l&apos;administrateur pour
        configurer vos tarifs.
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between mt-14 mb-2 item-center">
        <div className="border-l border-l-gray-500">
          <h2 className="ml-4 text-xl font-bold">{title}</h2>
        </div>
        <p className="text-sm italic">Dernière mise à jour : {lastUpdate}</p>
      </div>
      <Form {...form}>
        <form
          className="relative space-y-4"
          onSubmit={form.handleSubmit(submitForm)}
        >
          {/* Bouton de sauvegarde et indicateur de modifications */}
          <div className="flex justify-between items-center flex-col gap-4 md:flex-row md:gap-0">
            <div>
              {hasUnsavedChanges && (
                <div className="text-sm text-amber-600 font-medium">
                  Vous avez des modifications non sauvegardées
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                disabled={!hasUnsavedChanges || isUpdatingVitrerieTarif}
                variant="destructive"
                size="lg"
              >
                {isUpdatingVitrerieTarif ? (
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
                disabled={isUpdatingVitrerieTarif}
                variant="outline"
                size="lg"
                type="button"
              >
                Annuler
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 border rounded-md">
            <InputWithLabel
              nameInSchema="cadenceVitres"
              fieldTitle="Cadence vitres intérieures (m2/h)*"
              type="number"
              step={1}
              min={0}
              handleChange={(e) => handleInputChange(e, "cadenceVitres")}
              className={`${isFieldModified("cadenceVitres") ? "border-amber-500" : ""}`}
            />
            <InputWithLabel
              nameInSchema="cadenceCloisons"
              fieldTitle="Cadence cloisons (m2/h)*"
              type="number"
              step={1}
              min={0}
              handleChange={(e) => handleInputChange(e, "cadenceCloisons")}
              className={`${isFieldModified("cadenceCloisons") ? "border-amber-500" : ""}`}
            />
            <InputWithLabel
              nameInSchema="tauxHoraire"
              fieldTitle="Taux horaire (€/h HT)*"
              type="number"
              step={0.01}
              min={0}
              handleChange={(e) => handleInputChange(e, "tauxHoraire")}
              className={`${isFieldModified("tauxHoraire") ? "border-amber-500" : ""}`}
            />
            <InputWithLabel
              nameInSchema="minFacturation"
              fieldTitle="Minimum de facturation (€ HT)"
              type="number"
              step={0.01}
              min={0}
              handleChange={(e) => handleInputChange(e, "minFacturation")}
              className={`${isFieldModified("minFacturation") ? "border-amber-500" : ""}`}
            />
            <InputWithLabel
              nameInSchema="fraisDeplacement"
              fieldTitle="Frais de déplacement (€ HT)"
              type="number"
              step={0.01}
              min={0}
              handleChange={(e) => handleInputChange(e, "fraisDeplacement")}
              className={`${isFieldModified("fraisDeplacement") ? "border-amber-500" : ""}`}
            />
          </div>
        </form>
      </Form>
    </>
  );
}
