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
    <div className="flex items-center justify-center w-44 mx-auto h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-6 w-full">
        <h2 className="font-bold text-lg text-center text-red-500">
          {t("erreur")}
        </h2>
        <p className="text-center">{error.message}</p>
        <div className="flex flex-col gap-4 w-full">
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
