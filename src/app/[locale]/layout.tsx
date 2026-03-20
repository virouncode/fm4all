import GoogleTags from "@/components/analytics/GoogleTags";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmProvider } from "@/context/ConfirmContextProvider";
import { LocaleType, routing } from "@/i18n/routing";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Didact_Gothic, Geist, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "./globals.css";

export const didact = Didact_Gothic({
  variable: "--font-didact-sans",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap",
});

export const geist = Geist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal"],
  variable: "--font-geist",
  display: "swap",
});

export default async function LocalizedLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: LocaleType }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          // IMPORTANT: exécuté au parsing HTML (plus tôt que next/script)
          dangerouslySetInnerHTML={{
            __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        window.gtag = gtag;

        gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          wait_for_update: 500
        });
      `,
          }}
        />

        {/* Preconnect pour les domaines critiques */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
        <link
          rel="preconnect"
          href="https://6njvcatb4pcugmyl.public.blob.vercel-storage.com"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        {/* DNS prefetch pour les analytics */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
      </head>
      <body className={`scroll-smooth font-sans tracking-tight antialiased`}>
        <GoogleTags
          GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!}
        />
        <ConfirmProvider>
          <NextIntlClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <Analytics />
              <SpeedInsights />
              {children}
              <Toaster richColors toastOptions={{}} />
            </ThemeProvider>
          </NextIntlClientProvider>
        </ConfirmProvider>
      </body>
    </html>
  );
}
