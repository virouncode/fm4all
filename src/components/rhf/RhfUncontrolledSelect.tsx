import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import * as React from "react";
import {
  useFormContext,
  useFormState,
  type FieldError,
  type FieldErrors,
  type FieldValues,
  type Path,
} from "react-hook-form";

type BaseProps = React.JSX.IntrinsicElements["select"];

// S type des données du form
type RhfUncontrolledSelectProps<S extends FieldValues> = {
  label?: string;
  name: Path<S>; // clé du champ, Path<S> type union de toutes les clés possibles
  description?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
  selectClassName?: string;
  requiredMark?: boolean;
  ref?: React.Ref<HTMLSelectElement>;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;
  children?: React.ReactNode; // <NativeOption>...</NativeOption>
  withError?: boolean;
} & Omit<
  BaseProps,
  "name" | "value" | "onChange" | "onBlur" | "ref" | "defaultValue"
>;

/** Fusionne la ref RHF et la ref parent (objet ou callback) */
function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  //Il y a deux ref à assigner: celle de rhf (reg.ref) dont se sert rhf pour focus (entre autres) l'input et celle optionnelle passée en props (parentRef) par l'utilisateur du composant pour manipuler l'input directement si besoin
  //value est le noeud DOM (HTMLSelectElement ici) ou null
  if (!ref) return; //ici ref est la parentRef
  if (typeof ref === "function")
    ref(value); //si c'est une callback on l'appelle avec le noeud
  else (ref as React.RefObject<T | null>).current = value; //sinon on assigne la valeur à la propriété current de l'objet ref
}

/** Accès sûr aux erreurs imbriquées: errors["a.b.0.c"] */
//Le composant n'est pas contrôlé donc on doit lire nous mêmes les erreurs dans formState.errors, or les erreurs rhf sont imbriquées comme les données du formulaire
function getErrorAtPath<S extends FieldValues>(
  errors: FieldErrors<S>,
  path: Path<S>,
): FieldError | undefined {
  // Implémentation runtime simple : navigation par clés "a.b.0.c"
  let cur: unknown = errors as unknown;
  for (const key of String(path).split(".")) {
    //On descend dans l'arborescence des erreurs selon les clés du path
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  // Au dernier niveau, RHF met un FieldError (ou undefined)
  return cur as FieldError | undefined;
}

export function RhfUncontrolledSelect<S extends FieldValues>({
  label,
  name,
  description,
  orientation = "vertical",
  className,
  selectClassName,
  requiredMark,
  id: idProp,
  onChange,
  onBlur,
  ref: parentRef,
  children,
  withError = true,
  ...props
}: RhfUncontrolledSelectProps<S>) {
  const { register } = useFormContext<S>(); // instance du formulaire rhf
  const id = idProp ?? String(name).replace(/\./g, "_"); // Si pas d'id on la crée à partir de name
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-description` : undefined;

  // register fournit onChange, onBlur, name, ref (uncontrolled)
  const reg = register(name); //souscription du champ au formulaire de manière uncontrolled,
  /* renvoie reg:{
    onChange: (event: { ... 2 more }) => Promise<boolean | void>;
    onBlur: (event: { ... 2 more }) => Promise<boolean | void>;
    ref: (instance: any) => void;
    name: Path<S>;
    min?: string | number;
    max?: string | number;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    required?: boolean;
    disabled?: boolean;
} */
  const { errors } = useFormState({ name });
  const fieldError = getErrorAtPath(errors, name);
  const errorMessage: string | undefined = fieldError?.message ?? undefined;
  const hasError = Boolean(errorMessage);
  const describedBy = cn(descriptionId, hasError ? errorId : undefined);

  return (
    <FormItem
      className={cn(
        "gap-2",
        orientation === "horizontal"
          ? "flex flex-row items-center"
          : "flex flex-col",
        className,
      )}
    >
      {/*======================== LABEL =======================*/}
      {label && (
        <FormLabel htmlFor={id} className="text-sm">
          {label}
          {requiredMark && <span aria-hidden="true">*</span>}
        </FormLabel>
      )}

      {/*======================== SELECT =======================*/}
      <FormControl>
        <NativeSelect
          id={id}
          {...props} // Le reste des props de NativeSelect (multiple, disabled, etc.)
          name={reg.name}
          className={selectClassName}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy || undefined}
          aria-errormessage={hasError ? errorId : undefined}
          aria-required={requiredMark || undefined}
          ref={(node) => {
            reg.ref(node); //ref de rhf pour le contrôle du champ
            assignRef(parentRef, node); //ref parent passée en props pour l'utilisateur du composant
          }}
          // Surcharge
          onChange={(e) => {
            reg.onChange(e); // fonction de base de rhf (uncontrolled) qui met à jour le champ et déclenche la validation selon le mode
            onChange?.(e); // side effects, manipulation annexes à déclencher au change
          }}
          onBlur={(e) => {
            reg.onBlur(e); // marque le champ comme touched et (selon le mode) déclenche la validation
            onBlur?.(e); // side effects, manipulation annexes à déclencher au blur
          }}
        >
          {children}
        </NativeSelect>
      </FormControl>

      {/*======================== DESCRIPTION =======================*/}
      {description ? (
        <FormDescription id={descriptionId}>{description}</FormDescription>
      ) : null}

      {/*======================== ERREUR DE VALIDATION =======================*/}
      {withError && (
        <div id={errorId} className="text-destructive min-h-[19px] text-sm">
          {errorMessage ?? null}
        </div>
      )}
    </FormItem>
  );
}
