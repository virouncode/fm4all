import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";

// Utilise le type exact du composant (le root d’InputOTP n’est pas un <input/> classique)
type BaseProps = React.ComponentPropsWithoutRef<typeof InputOTP>;
type OTPRef = React.ComponentRef<typeof InputOTP>;

type RhfOTPProps<S extends FieldValues> = {
  label?: string;
  name: Path<S>;
  description?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
  inputClassName?: string;
  requiredMark?: boolean;
  ref?: React.Ref<OTPRef>; // <- ref alignée sur le vrai root d’InputOTP
  onChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLDivElement>; // blur du group, pas d’un input unique
  onComplete?: (value: string) => void;
  length?: number; // <- au lieu de supposer props.maxLength
  onlyDigits?: boolean; // <- filtre de confort
  withError?: boolean;
} & Omit<
  BaseProps,
  | "name"
  | "defaultValue"
  | "value"
  | "onChange"
  | "onBlur"
  | "ref"
  | "render"
  | "maxLength"
>;

/** Fusionne une ref objet/callback */
function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else (ref as React.RefObject<T | null>).current = value;
}

export function RhfOTP<S extends FieldValues>({
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
  onComplete,
  length = 6, // défaut raisonnable
  onlyDigits = true, // par défaut : chiffres
  withError = true,
  ...props
}: RhfOTPProps<S>) {
  const { control, trigger } = useFormContext<S>();
  const id = idProp ?? String(name).replace(/\./g, "_");
  const labelId = label ? `${id}-label` : undefined;
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;
        const describedBy =
          [descriptionId, hasError ? errorId : undefined]
            .filter(Boolean)
            .join(" ") || undefined;

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
            {/* LABEL */}
            {label && (
              <FormLabel id={labelId} className="text-sm">
                {label}
                {requiredMark && (
                  <span aria-hidden="true" className="ml-0.5">
                    *
                  </span>
                )}
              </FormLabel>
            )}

            <FormControl>
              <InputOTP
                id={id}
                // A11y : le root agit comme un groupe d’inputs
                role="group"
                aria-labelledby={labelId}
                aria-describedby={describedBy}
                aria-errormessage={hasError ? errorId : undefined}
                aria-invalid={hasError || undefined}
                aria-required={requiredMark || undefined}
                // Valeur contrôlée RHF (assure une string)
                value={(field.value as string) ?? ""}
                // Refs : RHF n’a pas besoin de ref ici (pas un input unique), on expose juste la parentRef
                ref={(node) => {
                  // ne pas passer field.ref : InputOTP ne cible pas un <input/>
                  assignRef(parentRef, node);
                }}
                // Handlers
                onChange={(v) => {
                  // Option: filtrer les caractères non numériques
                  const next = onlyDigits ? v.replace(/\D+/g, "") : v;
                  field.onChange(next);
                  onChange?.(next);
                }}
                onBlur={(e) => {
                  field.onBlur();
                  onBlur?.(e);
                }}
                onComplete={(v) => {
                  const next = onlyDigits ? v.replace(/\D+/g, "") : v;
                  field.onChange(next);
                  // validation immédiate de ce champ (utile pour passe à l’étape suivante)
                  trigger(name);
                  onComplete?.(next);
                }}
                className={cn(
                  "w-full max-w-xs disabled:opacity-75",
                  // évite des couleurs non standard en disabled; ajoute tes variantes si besoin
                  inputClassName
                )}
                // Props InputOTP
                maxLength={length}
                // Quelques hints UX utiles
                autoComplete="one-time-code"
                inputMode={onlyDigits ? "numeric" : undefined}
                pattern={onlyDigits ? "\\d*" : undefined}
                {...props}
              >
                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  {Array.from({ length }).map((_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </FormControl>

            {/* DESCRIPTION */}
            {description ? (
              <FormDescription id={descriptionId}>
                {description}
              </FormDescription>
            ) : null}

            {/* ERREUR */}
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
