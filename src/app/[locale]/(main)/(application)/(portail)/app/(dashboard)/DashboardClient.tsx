"use client";

import { useAppStore } from "@/stores/application/appStore";
import { DashboardClientView } from "./DashboardClientView";
import { DashboardPrestatireView } from "./DashboardPrestatireView";
import { DashboardPlateformeView } from "./DashboardPlateformeView";

export function DashboardClient() {
  const posture = useAppStore((s) => s.postureActive);

  if (posture === "prestataire") return <DashboardPrestatireView />;
  if (posture === "plateforme") return <DashboardPlateformeView />;
  return <DashboardClientView />;
}
