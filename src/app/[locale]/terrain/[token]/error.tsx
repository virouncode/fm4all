"use client"; // Error boundaries must be Client Components

import BackButton from "@/components/buttons/back-button";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
  const t = useTranslations("Erreur");

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-44 items-center justify-center">
      <div className="flex w-full flex-col gap-6">
        <h2 className="text-center text-lg font-bold text-red-500">
          {t("erreur")}
        </h2>
        <p className="text-center text-muted-foreground text-sm">
          Lien invalide, expiré ou intervention introuvable.
        </p>
        <div className="flex w-full flex-col gap-4">
          <Button
            variant="default"
            onClick={() => reset()}
            size="lg"
            className="w-full"
          >
            {t("reessayer")}
          </Button>
          <BackButton title={t("retour")} size="lg" />
        </div>
      </div>
    </div>
  );
}
