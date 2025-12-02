import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { typeBatimentCT, typeOccupationCT } from "@/constants/codeTables";
import { InsertSiteFormType, UpdateSiteFormType } from "@/zod-schemas/site";
import { UserRoleType } from "@/zod-schemas/user";
import { useTranslations } from "next-intl";
import React from "react";

type SiteFormProps<TFormValues> = {
  mode: "create" | "edit";
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  clientId: number;
  userRole: UserRoleType;
};

type SiteFormValues = InsertSiteFormType | UpdateSiteFormType;

const SiteForm = <TFormValues,>({
  mode,
  onSubmit,
  isSubmitting,
  isSubmitDisabled,
  clientId,
  userRole,
}: SiteFormProps<TFormValues>) => {
  const t = useTranslations("DevisPage.locaux.locauxForm");
  return (
    <form onSubmit={onSubmit}>
      <FieldSet>
        <FieldGroup className="gap-2">
          <FieldLegend>Informations générales</FieldLegend>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<SiteFormValues>
              name="nomSite"
              label="Nom du site"
              requiredMark
              className="w-full md:col-span-1"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<SiteFormValues>
              name="adresseLigne1"
              label="Adresse ligne 1"
              requiredMark
              className="w-full md:col-span-1"
            />
            <RhfInput<SiteFormValues>
              name="adresseLigne2"
              label="Adresse ligne 2"
              className="w-full md:col-span-1"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<SiteFormValues>
              name="codePostal"
              label="Code postal"
              requiredMark
              className="w-full md:col-span-1"
            />
            <RhfInput<SiteFormValues>
              name="ville"
              label="Ville"
              requiredMark
              className="w-full md:col-span-1"
            />
          </div>
        </FieldGroup>
        <FieldGroup className="gap-2">
          <FieldLegend>Informations générales</FieldLegend>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<SiteFormValues>
              name="surface"
              label="Surface (m²)"
              requiredMark
              className="w-full md:col-span-1"
            />
            <RhfInput<SiteFormValues>
              name="effectif"
              label="Effectif (personnes)"
              requiredMark
              className="w-full md:col-span-1"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfControlledSelect<SiteFormValues>
              name="typeBatiment"
              label="Type de bâtiment"
              requiredMark
              className="w-full md:col-span-1"
              selectClassName="w-full"
            >
              {typeBatimentCT.map((type) => (
                <SelectItem key={type.code} value={type.code}>
                  {t(type.name)}
                </SelectItem>
              ))}
            </RhfControlledSelect>
            <RhfControlledSelect<SiteFormValues>
              name="typeOccupation"
              label="Type d'occupation"
              requiredMark
              className="w-full md:col-span-1"
              selectClassName="w-full"
            >
              {typeOccupationCT.map((type) => (
                <SelectItem key={type.code} value={type.code}>
                  {t(type.name)}
                </SelectItem>
              ))}
            </RhfControlledSelect>
          </div>
          <div className="grid gap-4">
            <RhfTextArea<SiteFormValues>
              name="commentaires"
              label="Commentaires"
              className="w-full md:col-span-2"
              textareaClassName="resize-none h-[200px]"
            />
          </div>
        </FieldGroup>
        <div className="flex justify-end border-t pt-6">
          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="min-w-32"
          >
            {isSubmitting && <Spinner />}
            {mode === "create" ? "Créer le site" : "Enregistrer"}
          </Button>
        </div>
      </FieldSet>
    </form>
  );
};

export default SiteForm;
