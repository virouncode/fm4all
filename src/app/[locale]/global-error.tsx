"use client";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Didact_Gothic } from "next/font/google";
import "./globals.css";

const didact = Didact_Gothic({
  variable: "--font-didact-sans",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Error boundaries must be Client Components

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.log("Global error", error);
  const t = useTranslations("Erreur");

  return (
    // global-error must include html and body tags
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${didact.className} antialiased scroll-smooth h-dvh flex items-center justify-center`}
      >
        <div className="flex flex-col gap-10">
          <h2 className="font-bold text-lg text-center">
            {t("erreur-globale")}
          </h2>
          <Button onClick={() => reset()} variant="secondary" size="lg">
            {t("reessayer")}
          </Button>
        </div>
      </body>
    </html>
  );
}
