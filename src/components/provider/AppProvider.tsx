"use client";

import { setActivePostureAction } from "@/server/actions/activePostureAction";
import { BootstrapPayload, useAppStore } from "@/stores/application/appStore";
import { RoleEntrepriseType } from "@/zod-schemas/entreprise.schema";
import { ReactNode, useEffect, useRef } from "react";

export function AppProvider({
  bootstrap,
  cookiePosture,
  children,
}: {
  bootstrap: BootstrapPayload;
  cookiePosture: RoleEntrepriseType | null;
  children: ReactNode;
}) {
  const hydratedRef = useRef(false);

  if (!hydratedRef.current) {
    //safe: une seule fois, et ça évite l'effet
    useAppStore.getState().hydrate(bootstrap);
    hydratedRef.current = true;
  }

  // Si bootstrap a corrigé la posture (cookie stale), resynchroniser le cookie.
  // Ex : rôle retiré en cours de session → cookie "prestataire" mais rôles = ["client"] seulement.
  useEffect(() => {
    if (bootstrap.postureActive !== cookiePosture) {
      setActivePostureAction(bootstrap.postureActive);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
