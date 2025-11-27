import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";

type BaseProps = React.JSX.IntrinsicElements["input"];

//S type des données du form
type RhfInputProps<S extends FieldValues> = {
  label?: string;
  name: Path<S>; //clé du champ, Path<S> type union de toutes les clés possibles
  description?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
  inputClassName?: string;
  requiredMark?: boolean;
  ref?: React.Ref<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  withError?: boolean;
} & Omit<
  BaseProps,
  "name" | "defaultValue" | "value" | "onChange" | "onBlur" | "ref"
>;

/** Fusionne la ref RHF et la ref parent (objet ou callback) */
function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as React.RefObject<T | null>).current = value;
}

export function RhfInput<S extends FieldValues>({
  label,
  name,
  description,
  orientation = "vertical",
  className,
  inputClassName,
  requiredMark,
  id: idProp,
  onChange,
  onBlur,
  ref: parentRef,
  withError = true,
  ...props
}: RhfInputProps<S>) {
  const { control } = useFormContext<S>(); //instance du formulaire rhf
  const id = idProp ?? String(name).replace(/\./g, "_"); //Si pas d'id on la crée à partir de name
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <FormField
      control={control} //souscription du champ au formulaire
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;
        const describedBy = cn(descriptionId, hasError ? errorId : undefined);

        return (
          <FormItem
            className={cn(
              "gap-2",
              orientation === "horizontal"
                ? "flex flex-row items-center"
                : "flex flex-col",
              className
            )}
          >
            {/*======================== LABEL =======================*/}
            {label && (
              <FormLabel htmlFor={id} className="text-sm">
                {label}
                {requiredMark && <span aria-hidden="true">*</span>}
              </FormLabel>
            )}
            {/*======================== INPUT =======================*/}
            <FormControl>
              <Input
                id={id}
                {...field} //Passe value, onChange, onBlur, disabled, name et ref à l'input
                {...props} //Le reste des props
                className={inputClassName}
                aria-invalid={hasError || undefined}
                aria-describedby={describedBy || undefined}
                aria-errormessage={hasError ? errorId : undefined}
                aria-required={requiredMark || undefined}
                ref={(node) => {
                  field.ref(node);
                  assignRef(parentRef, node);
                }}
                //Surcharge
                onChange={(e) => {
                  field.onChange(e); //fonction de base de rhf qui met à jour le champ sans manipulation, récupère automatiquement e.target.value ou e.target.checked en fonction du composant ou utilise la valeur telle quelle si on lui en passe une, déclenche la validation (si mode:"onChange"), met à jour dirty/touched et notifie les watchers
                  onChange?.(e); //side effects, manipulation annexes à déclencher au change
                }}
                onBlur={(e) => {
                  field.onBlur(); //marque le champ comme touched, déclenche la validation (so mode:"onBlur")
                  onBlur?.(e); //side effects, manipulation annexes à déclencher au blur
                }}
              />
            </FormControl>
            {/*======================== DESCRIPTION =======================*/}
            {description ? (
              <FormDescription id={descriptionId}>
                {description}
              </FormDescription>
            ) : null}
            {/*======================== ERREUR DE VALIDATION =======================*/}
            {withError && (
              <div className="min-h-[19px]">
                <FormMessage id={errorId} />
              </div>
            )}
          </FormItem>
        );
      }}
    />
  );
}
