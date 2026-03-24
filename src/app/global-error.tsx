"use client"; // Error boundaries must be Client Components
import Error from "next/error";

export default function GlobalError({}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <Error statusCode={500} />
      </body>
    </html>
  );
}
