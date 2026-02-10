"use client";

import { BootstrapPayload, useAppStore } from "@/stores/application/appStore";
import { ReactNode, useRef } from "react";

export function AppProvider({
  bootstrap,
  children,
}: {
  bootstrap: BootstrapPayload;
  children: ReactNode;
}) {
  const hydratedRef = useRef(false);

  if (!hydratedRef.current) {
    //safe: une seule fois, et ça évite l'effet
    useAppStore.getState().hydrate(bootstrap);
    hydratedRef.current = true;
  }

  return <>{children}</>;
}
