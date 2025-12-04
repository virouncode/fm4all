import { RhfControlledSelect } from "@/components/rhf/RhfControlledSelect";
import { RhfFileInput } from "@/components/rhf/RhfFileInput";
import { RhfInput } from "@/components/rhf/RhfInput";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { InsertUserFormType, UpdateUserFormType } from "@/zod-schemas/user";
import { useFormContext } from "react-hook-form";

type UserFormProps<TFormValues> = {
  mode: "create" | "edit";
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  clientId?: number;
};

type UserFormValues = InsertUserFormType | UpdateUserFormType;

const UserForm = <TFormValues,>({
  mode,
  onSubmit,
  isSubmitting,
  isSubmitDisabled,
  clientId,
}: UserFormProps<TFormValues>) => {
  const form = useFormContext<UserFormValues>();
  const { setValue } = form;

  return (
    <form onSubmit={onSubmit}>
      <FieldSet>
        <FieldGroup className="gap-2">
          <FieldLegend>Informations générales</FieldLegend>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<UserFormValues>
              name="firstName"
              label="Prénom"
              requiredMark
              className="w-full md:col-span-1"
            />
            <RhfInput<UserFormValues>
              name="lastName"
              label="Nom de famille"
              requiredMark
              className="w-full md:col-span-1"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfInput<UserFormValues>
              name="email"
              label="Email"
              requiredMark
              className="w-full md:col-span-1"
              readOnly={mode === "edit"}
              disabled={mode === "edit"}
            />
            <RhfInput<UserFormValues>
              name="phone"
              label="Numéro de téléphone"
              className="w-full md:col-span-1"
              requiredMark
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-14">
            <RhfControlledSelect<UserFormValues>
              name="role"
              label="Permissions"
              requiredMark
              selectClassName="w-full md:col-span-1"
            >
              <SelectItem value="client_admin">
                Administrateur (lecture/écriture)
              </SelectItem>
              <SelectItem value="client">Utilisateur (lecture)</SelectItem>
            </RhfControlledSelect>
          </div>
        </FieldGroup>
        <FieldGroup className="gap-2">
          <FieldLegend>Avatar (format carré 1:1, max 500 Ko)</FieldLegend>
          <RhfFileInput<UserFormValues>
            name="avatarAttachment"
            folderName={`client-users-avatars/${clientId}`}
            maxSizeBytes={500 * 1024} // 500 KB
            squareMandatory
            className="w-1/2"
            onValueChange={(val) => {
              // ne garder que l'URL dans image
              setValue("avatarAttachment.url", val?.url, {
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
            onClear={() => {
              setValue("avatarAttachment.url", undefined, {
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
            {mode === "create" ? "Créer l'utilisateur" : "Enregistrer"}
          </Button>
        </div>
      </FieldSet>
    </form>
  );
};

export default UserForm;
