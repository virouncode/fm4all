"use client";
import { Button } from "@/components/ui/button";
import { Didact_Gothic } from "next/font/google";
import "./globals.css";

const didact = Didact_Gothic({
  variable: "--font-didact-sans",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.log("Global error", error);

  // Essayer de déterminer la locale à partir de l'URL
  const locale =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[1] === "en"
        ? "en"
        : "fr"
      : "fr"; // Fallback à fr

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${didact.className} antialiased scroll-smooth h-dvh flex items-center justify-center`}
      >
        <div className="flex flex-col gap-10">
          <h2 className="font-bold text-lg text-center">
            {locale === "fr" ? "Erreur globale !" : "Global Error!"}
          </h2>
          <Button onClick={() => reset()} variant="secondary" size="lg">
            {locale === "fr" ? "Réessayer" : "Try Again"}
          </Button>
        </div>
      </body>
    </html>
  );
}
