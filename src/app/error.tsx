"use client"; // Error boundaries must be Client Components

import BackButton from "@/components/back-button";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex items-center justify-center max-w-prose mx-auto h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-lg text-center">Erreur !</h2>
        <p className="font-normal text-base text-center">{error.message}</p>
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
            Réessayer
          </Button>
          <BackButton
            title="Retour"
            size="lg"
            variant="outline"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
