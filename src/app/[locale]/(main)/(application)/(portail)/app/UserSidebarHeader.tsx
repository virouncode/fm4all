"use client";

import { useRouter } from "@/i18n/navigation";
import { setActivePostureAction } from "@/server/actions/activePostureAction";
import { useAppStore } from "@/stores/application/appStore";
import { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";
import { useTransition } from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/components/ui/sidebar";

const POSTURE_DOT: Record<RoleEntrepriseType, string> = {
  client: "bg-blue-500",
  prestataire: "bg-emerald-500",
  plateforme: "bg-violet-500",
};

function labelPosture(p: RoleEntrepriseType) {
  switch (p) {
    case "client":
      return "Client";
    case "prestataire":
      return "Prestataire";
    case "plateforme":
      return "Plateforme";
    default:
      return p;
  }
}

export default function UserSidebarHeader() {
  const { state } = useSidebar();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const entrepriseNom = useAppStore((s) => s.entreprise?.nom ?? "—");
  const rolesEntreprise = useAppStore((s) => s.rolesEntreprise);
  const postureActive = useAppStore((s) => s.postureActive);
  const setPostureActive = useAppStore((s) => s.setPostureActive);

  if (state === "collapsed") return null;

  // Si pas encore hydraté
  if (!postureActive) {
    return (
      <div className="px-3 py-3">
        <div className="leading-tight font-semibold">{entrepriseNom}</div>
        <div className="text-muted-foreground text-xs">Chargement…</div>
      </div>
    );
  }

  const hasMultiplePostures = rolesEntreprise.length > 1;

  return (
    <div className="px-3 py-3">
      <div className="truncate text-center leading-tight font-semibold">
        {entrepriseNom}
      </div>

      {hasMultiplePostures && (
        <div className="mt-2 flex flex-col gap-2">
          <Label className="text-sm">Posture</Label>
          <Select
            value={postureActive}
            onValueChange={(value) => {
              const next = value as RoleEntrepriseType;

              // 1) UI optimiste
              setPostureActive(next);

              // 2) cookie + redirect tableau de bord (server re-bootstrap)
              startTransition(async () => {
                await setActivePostureAction(next);
                router.push("/app");
              });
            }}
            disabled={isPending}
          >
            <SelectTrigger className="h-9 w-full">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={cn(
                    "size-2 rounded-full shrink-0",
                    POSTURE_DOT[postureActive],
                  )}
                />
                <SelectValue placeholder="Choisir une posture" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {rolesEntreprise.map((r) => (
                <SelectItem key={r} value={r}>
                  {labelPosture(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isPending ? (
            <div className="text-muted-foreground mt-1 text-[11px]">
              Mise à jour…
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
