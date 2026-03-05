"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/application/appStore";
import type { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";

const POSTURE_STYLES: Record<
  RoleEntrepriseType,
  { badge: string; dot: string; label: string }
> = {
  client: {
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    dot: "bg-blue-500",
    label: "Client",
  },
  prestataire: {
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    dot: "bg-emerald-500",
    label: "Prestataire",
  },
  plateforme: {
    badge:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800",
    dot: "bg-violet-500",
    label: "Plateforme",
  },
};

export function PostureIndicator() {
  const posture = useAppStore((s) => s.postureActive);
  const rolesEntreprise = useAppStore((s) => s.rolesEntreprise);

  if (!posture || rolesEntreprise.length <= 1) return null;

  const config = POSTURE_STYLES[posture];
  if (!config) return null;

  return (
    <div
      className={cn(
        "fixed right-4 top-3 z-40 hidden md:flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm select-none",
        config.badge,
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", config.dot)} />
      {config.label}
    </div>
  );
}
