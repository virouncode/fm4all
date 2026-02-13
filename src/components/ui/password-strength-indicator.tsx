"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface PasswordCriteria {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const criteria: PasswordCriteria[] = [
    {
      label: "Au moins 8 caractères",
      met: password.length >= 8,
    },
    {
      label: "Une majuscule (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Une minuscule (a-z)",
      met: /[a-z]/.test(password),
    },
    {
      label: "Un chiffre (0-9)",
      met: /\d/.test(password),
    },
    {
      label: "Un caractère spécial (!@#$...)",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const metCriteriaCount = criteria.filter((c) => c.met).length;
  const strength =
    metCriteriaCount === 0
      ? "empty"
      : metCriteriaCount <= 2
        ? "weak"
        : metCriteriaCount <= 4
          ? "medium"
          : "strong";

  const strengthConfig = {
    empty: {
      label: "",
      color: "bg-gray-200",
      textColor: "text-gray-500",
      width: "w-0",
    },
    weak: {
      label: "Faible",
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-500",
      width: "w-1/3",
    },
    medium: {
      label: "Moyen",
      color: "bg-yellow-500",
      textColor: "text-yellow-600 dark:text-yellow-500",
      width: "w-2/3",
    },
    strong: {
      label: "Fort",
      color: "bg-green-500",
      textColor: "text-green-600 dark:text-green-500",
      width: "w-full",
    },
  };

  const config = strengthConfig[strength];

  return (
    <div className={cn("space-y-3", className)}>
      {/* Barre de progression */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Force du mot de passe</span>
          <span className={cn("font-medium", config.textColor)}>
            {config.label}
          </span>
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full transition-all duration-300",
              config.color,
              config.width,
            )}
          />
        </div>
      </div>

      {/* Checklist des critères */}
      <div className="space-y-1.5">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {criterion.met ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-500" />
            ) : (
              <X className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            )}
            <span
              className={cn(
                "text-muted-foreground",
                criterion.met && "text-foreground font-medium",
              )}
            >
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
