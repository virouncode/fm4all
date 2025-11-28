import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfDateTimePicker } from "@/components/rhf/RhfDateTimePicker";
import { RhfInput } from "@/components/rhf/RhfInput";
import { RhfTextArea } from "@/components/rhf/RhfTextArea";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { interventionTypeCT } from "@/constants/codeTables";
import { SelectFournisseurType } from "@/zod-schemas/fournisseur";
import {
  ClientUpdateInterventionFormType,
  InsertInterventionType,
} from "@/zod-schemas/intervention";
import { SelectSiteType } from "@/zod-schemas/site";
import { UserRoleType } from "@/zod-schemas/user";
import { useRouter } from "next/navigation";

type InterventionFormProps<TFormValues> = {
  mode: "create" | "edit";
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  clientId: number;
  sites: SelectSiteType[];
  fournisseurs: SelectFournisseurType[];
  userRole: UserRoleType;
  handleAnnuler?: () => void;
  isReadOnly?: boolean;
};

type InterventionFormValues =
  | InsertInterventionType
  | ClientUpdateInterventionFormType;

const InterventionForm = <TFormValues,>({
  mode,
  onSubmit,
  isSubmitting,
  isSubmitDisabled,
  clientId,
  sites,
  fournisseurs,
  userRole,
  handleAnnuler,
  isReadOnly = false,
}: InterventionFormProps<TFormValues>) => {
  const router = useRouter();
  const handleClose = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isReadOnly) {
      router.push(`/client/${clientId}/interventions/mes-interventions`);
    }
  };
  return (
    <form onSubmit={isReadOnly ? handleClose : onSubmit}>
      <FieldSet>
        <FieldGroup className="gap-2">
          {/* Titre + Type */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<InterventionFormValues>
              name="titre"
              label="Titre de l'intervention"
              requiredMark
              className="w-full md:col-span-1"
              disabled={isReadOnly}
            />

            <RhfControlledSelect<InterventionFormValues>
              name="type"
              label="Type d'intervention"
              requiredMark
              className="w-full md:col-span-1"
              selectClassName="w-full"
              disabled={isReadOnly}
            >
              {interventionTypeCT.map((type) => (
                <SelectItem key={type.code} value={type.code}>
                  {type.name}
                </SelectItem>
              ))}
            </RhfControlledSelect>
          </div>

          {/* Site + Prestataire */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfControlledSelect<InterventionFormValues>
              name="siteId"
              label="Site"
              requiredMark
              className="w-full md:col-span-1"
              selectClassName="w-full"
              valueType="number"
              disabled={isReadOnly}
            >
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id.toString()}>
                  {site.nomSite}
                </SelectItem>
              ))}
            </RhfControlledSelect>

            <RhfControlledSelect<InterventionFormValues>
              name="fournisseurId"
              label="Prestataire"
              requiredMark
              className="w-full md:col-span-1"
              selectClassName="w-full"
              valueType="number"
              disabled={isReadOnly || userRole === "fournisseur"}
            >
              {fournisseurs.map((fournisseur) => (
                <SelectItem
                  key={fournisseur.id}
                  value={fournisseur.id.toString()}
                >
                  {fournisseur.nomFournisseur}
                </SelectItem>
              ))}
            </RhfControlledSelect>
          </div>
          {/* Description */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfTextArea<InterventionFormValues>
              name="description"
              label="Description"
              className="w-full md:col-span-2"
              textareaClassName="resize-none h-[200px]"
              disabled={isReadOnly}
            />
          </div>

          {/* Dates début / fin */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfDateTimePicker<InterventionFormValues>
              name="dateDebutPrevue"
              label="Date de début"
              requiredMark
              orientation="vertical"
              buttonClassName="w-3.4"
              className="w-full md:col-span-1"
              timeFormat="24"
              timeDisabled={isReadOnly}
              dateDisabled={isReadOnly}
            />

            <RhfDateTimePicker<InterventionFormValues>
              name="dateFinPrevue"
              label="Date de fin"
              orientation="vertical"
              buttonClassName="w-3.4"
              className="w-full md:col-span-1"
              timeFormat="24"
              timeDisabled={isReadOnly}
              dateDisabled={isReadOnly}
            />
          </div>
        </FieldGroup>

        <div className="flex justify-end gap-4 border-t pt-6">
          {mode === "edit" && handleAnnuler && !isReadOnly && (
            <Button
              type="button"
              className="min-w-32"
              onClick={handleAnnuler}
              variant="destructive"
            >
              Annuler l'intervention
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitDisabled && !isReadOnly}
            className="min-w-32"
          >
            {isSubmitting && <Spinner />}
            {!isReadOnly
              ? mode === "create"
                ? "Programmer l'intervention"
                : "Enregistrer"
              : "Fermer"}
          </Button>
        </div>
      </FieldSet>
    </form>
  );
};

export default InterventionForm;
