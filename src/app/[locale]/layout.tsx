import CookieBanner from "@/components/cookie-baner";
import Footer from "@/components/footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import CafeProvider from "@/context/CafeProvider";
import ClientProvider from "@/context/ClientProvider";
import CommentairesProvider from "@/context/CommentairesProvider";
import DevisProgressProvider from "@/context/DevisProgressProvider";
import FontainesProvider from "@/context/FontainesProvider";
import FoodBeverageProvider from "@/context/FoodBeverageProvider";
import HygieneProvider from "@/context/HygieneProvider";
import IncendieProvider from "@/context/IncendieProvider";
import MaintenanceProvider from "@/context/MaintenanceProvider";
import ManagementProvider from "@/context/ManagementProvider";
import MonDevisProvider from "@/context/MonDevisProvider";
import NettoyageProvider from "@/context/NettoyageProvider";
import OfficeManagerProvider from "@/context/OfficeManagerProvider";
import PersonnalisationProvider from "@/context/PersonnalisationProvider";
import ServicesFm4AllProvider from "@/context/ServicesFm4AllProvider";
import ServicesProvider from "@/context/ServicesProvider";
import SnacksFruitsProvider from "@/context/SnacksFruitsProvider";
import TheProvider from "@/context/TheProvider";
import TotalCafeProvider from "@/context/TotalCafeProvider";
import TotalFontainesProvider from "@/context/TotalFontainesProvider";
import TotalHygieneProvider from "@/context/TotalHygieneProvider";
import TotalIncendieProvider from "@/context/TotalIncendieProvider";
import TotalMaintenanceProvider from "@/context/TotalMaintenanceProvider";
import TotalNettoyageProvider from "@/context/TotalNettoyageProvider";
import TotalOfficeManagerProvider from "@/context/TotalOfficeManagerProvider";
import TotalProvider from "@/context/TotalProvider";
import TotalServicesFm4AllProvider from "@/context/TotalServicesFm4AllProvider";
import TotalSnacksFruitsProvider from "@/context/TotalSnacksFruitsProvider";
import TotalTheProvider from "@/context/TotalTheProvider";
import { routing } from "@/i18n/routing";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Didact_Gothic } from "next/font/google";
import { notFound } from "next/navigation";
import "./globals.css";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale();
  return {
    title: {
      template:
        locale === "fr"
          ? "%s | fm4all Le Facility Management pour tous"
          : "%s | fm4all Facility Management for all",
      default:
        locale === "fr"
          ? "Les services aux entreprises au meilleur prix | fm4all"
          : "Facility management services in Paris at the best price | fm4all",
    },
    description:
      locale === "fr"
        ? "fm4all démocratise les services généraux pour toutes les tailles d'entreprises. Utilisez notre comparateur et émetteur de devis en ligne pour les services aux entreprises."
        : "fm4all democratizes facility management services for businesses in Paris. Use our online comparison tool and quote generator for business services.",
    alternates: {
      canonical:
        locale === "fr"
          ? "https://www.fm4all.com/fr"
          : "https://www.fm4all.com/en",
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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
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
        <NextIntlClientProvider>
          <DevisProgressProvider>
            <ClientProvider>
              <ServicesProvider>
                <PersonnalisationProvider>
                  <MonDevisProvider>
                    <NettoyageProvider>
                      <HygieneProvider>
                        <IncendieProvider>
                          <MaintenanceProvider>
                            <FoodBeverageProvider>
                              <CafeProvider>
                                <TheProvider>
                                  <SnacksFruitsProvider>
                                    <FontainesProvider>
                                      <ManagementProvider>
                                        <OfficeManagerProvider>
                                          <ServicesFm4AllProvider>
                                            <CommentairesProvider>
                                              <TotalProvider>
                                                <TotalNettoyageProvider>
                                                  <TotalHygieneProvider>
                                                    <TotalIncendieProvider>
                                                      <TotalMaintenanceProvider>
                                                        <TotalCafeProvider>
                                                          <TotalTheProvider>
                                                            <TotalSnacksFruitsProvider>
                                                              <TotalFontainesProvider>
                                                                <TotalOfficeManagerProvider>
                                                                  <TotalServicesFm4AllProvider>
                                                                    <ThemeProvider
                                                                      attribute="class"
                                                                      defaultTheme="light"
                                                                      enableSystem
                                                                      disableTransitionOnChange
                                                                    >
                                                                      <Header />
                                                                      {children}
                                                                      <CookieBanner />
                                                                      <Analytics />
                                                                      <SpeedInsights />
                                                                      <Footer />
                                                                      <Toaster />
                                                                    </ThemeProvider>
                                                                  </TotalServicesFm4AllProvider>
                                                                </TotalOfficeManagerProvider>
                                                              </TotalFontainesProvider>
                                                            </TotalSnacksFruitsProvider>
                                                          </TotalTheProvider>
                                                        </TotalCafeProvider>
                                                      </TotalMaintenanceProvider>
                                                    </TotalIncendieProvider>
                                                  </TotalHygieneProvider>
                                                </TotalNettoyageProvider>
                                              </TotalProvider>
                                            </CommentairesProvider>
                                          </ServicesFm4AllProvider>
                                        </OfficeManagerProvider>
                                      </ManagementProvider>
                                    </FontainesProvider>
                                  </SnacksFruitsProvider>
                                </TheProvider>
                              </CafeProvider>
                            </FoodBeverageProvider>
                          </MaintenanceProvider>
                        </IncendieProvider>
                      </HygieneProvider>
                    </NettoyageProvider>
                  </MonDevisProvider>
                </PersonnalisationProvider>
              </ServicesProvider>
            </ClientProvider>
          </DevisProgressProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
