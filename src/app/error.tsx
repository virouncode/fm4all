"use client"; // Error boundaries must be Client Components

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
    <div className="flex items-center justify-center max-w-80 mx-auto">
      <div className="flex flex-col gap-2 mt-4">
        <h2>Something went wrong !</h2>
        <p>{error.message}</p>
        <Button
          variant="default"
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          size="default"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
