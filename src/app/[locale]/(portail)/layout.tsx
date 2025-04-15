import GoogleAnalytics from "@/components/GoogleAnalytics";
import HeaderPortal from "@/components/header-portal";
import { Toaster } from "@/components/ui/toaster";
import { routing } from "@/i18n/routing";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Didact_Gothic } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  const titleTemplate = "%s | fm4all";
  const title =
    locale === "fr"
      ? "Facility Management à Paris & Île-de-France - Devis en ligne | fm4all"
      : "Facility Management & Office Services in Paris – Instant Quote | fm4all";
  const description =
    locale === "fr"
      ? "fm4all démocratise les services aux entreprises de toutes tailles à Paris & Île-de-France. Comparez les offres de nos prestataires et obtenez un devis en ligne."
      : "fm4all makes business services accessible to companies of all sizes in Paris & Île-de-France. Compare offers from our providers and get an online quote.";
  const canonicalUrl =
    locale === "fr" ? "https://www.fm4all.com/fr" : "https://www.fm4all.com/en";

  // Structure des métadonnées
  return {
    title: {
      template: titleTemplate,
      default: title,
    },
    description: description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        fr: "https://www.fm4all.com/fr",
        en: "https://www.fm4all.com/en",
      },
    },
  };
};

const didact = Didact_Gothic({
  variable: "--font-didact-sans",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default async function PortalLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const messages = await getMessages();
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${didact.className} antialiased scroll-smooth`}>
        <GoogleAnalytics
          GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <HeaderPortal />
            {children}
            <Analytics />
            <SpeedInsights />
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
