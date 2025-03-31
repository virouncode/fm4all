import BackButton from "@/components/back-button";
import { getLocale } from "next-intl/server";
import { Didact_Gothic } from "next/font/google";

const didact = Didact_Gothic({
  variable: "--font-didact-sans",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default async function NotFound() {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${didact.className} antialiased scroll-smooth`}>
        <div className="flex items-center justify-center max-w-80 mx-auto h-dvh">
          <div className="flex flex-col gap-2 mt-4">
            <h2 className="font-bold text-lg text-center">
              {locale === "fr" ? "Page non trouvée !" : "Page not found !"}
            </h2>
            <BackButton
              title="Retour"
              size="lg"
              variant="outline"
              className="text-base"
            />
          </div>
        </div>
      </body>
    </html>
  );
}
