"use client";

import { useRouter } from "@/i18n/navigation";
import { useDevisProgressStore } from "@/stores/devis/devisProgressStore";
import { useEffect } from "react";

type DevisGuardProps = {
  children: React.ReactNode;
};

const DevisGuard = ({ children }: DevisGuardProps) => {
  const router = useRouter();
  const completedSteps = useDevisProgressStore(
    (s) => s.devisProgress.completedSteps,
  );
  const hasStarted = completedSteps.includes(1);

  useEffect(() => {
    if (!hasStarted) {
      router.replace("/devis/locaux");
    }
  }, [hasStarted, router]);

  if (!hasStarted) return null;

  return <>{children}</>;
};

export default DevisGuard;
