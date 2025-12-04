"use client";

import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { typeBatimentCT, typeOccupationCT } from "@/constants/codeTables";
import { OnboardClientFormType } from "@/zod-schemas/client";
import { useTranslations } from "next-intl";

type ClientFormProps = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
};

const ClientForm = ({
  onSubmit,
  isSubmitting,
  isSubmitDisabled,
}: ClientFormProps) => {
  const t = useTranslations("DevisPage.locaux.locauxForm");
  return (
    <form onSubmit={onSubmit}>
      <FieldSet>
        <FieldGroup className="gap-2">
          <FieldLegend>Information du client</FieldLegend>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<OnboardClientFormType>
              name="client.nomEntreprise"
              label="Nom de l'entreprise"
              requiredMark
              className="w-full md:col-span-1"
            />
            <RhfInput<OnboardClientFormType>
              name="client.siret"
              label="N° SIRET"
              className="w-full md:col-span-1"
            />
          </div>
        </FieldGroup>
        <FieldSeparator />
        <FieldGroup className="gap-2">
          <FieldLegend>Site principal</FieldLegend>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<OnboardClientFormType>
              name="sitePrincipal.nomSite"
              label="Nom du site"
              requiredMark
              className="w-full md:col-span-1"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<OnboardClientFormType>
              name="sitePrincipal.adresseLigne1"
              label="Adresse ligne 1"
              requiredMark
              className="w-full md:col-span-1"
            />
            <RhfInput<OnboardClientFormType>
              name="sitePrincipal.adresseLigne2"
              label="Adresse ligne 2"
              className="w-full md:col-span-1"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<OnboardClientFormType>
              name="sitePrincipal.codePostal"
              label="Code postal"
              requiredMark
              className="w-full md:col-span-1"
            />
            <RhfInput<OnboardClientFormType>
              name="sitePrincipal.ville"
              label="Ville"
              requiredMark
              className="w-full md:col-span-1"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<OnboardClientFormType>
              name="sitePrincipal.surface"
              label="Surface (m²)"
              requiredMark
              className="w-full md:col-span-1"
              type="number"
              min={5}
              max={3000}
            />
            <RhfInput<OnboardClientFormType>
              name="sitePrincipal.effectif"
              label="Effectif (nbre de personnes)"
              requiredMark
              className="w-full md:col-span-1"
              type="number"
              min={1}
              max={300}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfControlledSelect<OnboardClientFormType>
              name="sitePrincipal.typeBatiment"
              label="Type de bâtiment"
              requiredMark
              selectClassName="w-full md:col-span-1"
            >
              {typeBatimentCT.map((tb) => (
                <SelectItem key={tb.code} value={tb.code}>
                  {t(tb.name)}
                </SelectItem>
              ))}
            </RhfControlledSelect>
            <RhfControlledSelect<OnboardClientFormType>
              name="sitePrincipal.typeOccupation"
              label="Type d'occupation"
              requiredMark
              selectClassName="w-full md:col-span-1"
            >
              {typeOccupationCT.map((to) => (
                <SelectItem key={to.code} value={to.code}>
                  {t(to.name)}
                </SelectItem>
              ))}
            </RhfControlledSelect>
          </div>
        </FieldGroup>
        <FieldSeparator />
        <FieldGroup className="gap-2">
          <FieldLegend>Administrateur client</FieldLegend>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<OnboardClientFormType>
              name="userAdmin.firstName"
              label="Prénom"
              requiredMark
              className="w-full md:col-span-1"
            />
            <RhfInput<OnboardClientFormType>
              name="userAdmin.lastName"
              label="Nom"
              requiredMark
              className="w-full md:col-span-1"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<OnboardClientFormType>
              name="userAdmin.email"
              label="Email"
              requiredMark
              className="w-full md:col-span-1"
              type="email"
            />
            <RhfInput<OnboardClientFormType>
              name="userAdmin.phone"
              label="N° de tél"
              className="w-full md:col-span-1"
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
            Créer le client
          </Button>
        </div>
      </FieldSet>
    </form>
  );
};

export default ClientForm;
