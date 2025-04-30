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
    <div className="flex items-center justify-center max-w-prose mx-auto h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-lg text-center">{t("erreur")}</h2>
        <p>{error.message}</p>
        <div className="flex gap-4">
          <Button
            variant="default"
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
            size="lg"
            className="flex-1"
          >
            {t("reessayer")}
          </Button>
          <BackButton
            title={t("retour")}
            size="lg"
            variant="outline"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
