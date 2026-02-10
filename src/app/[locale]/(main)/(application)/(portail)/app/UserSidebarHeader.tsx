"use client";

import { setActivePostureAction } from "@/server/actions/activePostureAction";
import { useAppStore } from "@/stores/application/appStore";
import { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/components/ui/sidebar";

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

  return (
    <div className="px-3 py-3">
      <div className="truncate text-center leading-tight font-semibold">
        {entrepriseNom}
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <Label className="text-sm">Posture</Label>
        <Select
          value={postureActive}
          onValueChange={(value) => {
            const next = value as RoleEntrepriseType;

            // 1) UI optimiste
            setPostureActive(next);

            // 2) cookie + refresh (server re-bootstrap)
            startTransition(async () => {
              await setActivePostureAction(next);
              router.refresh();
            });
          }}
          disabled={isPending}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Choisir une posture" />
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
    </div>
  );
}
