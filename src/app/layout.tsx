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
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Didact_Gothic } from "next/font/google";
import "./globals.css";

const didact = Didact_Gothic({
  variable: "--font-didact-sans",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | fm4all",
    default: "Home | fm4all",
  },
  description:
    "Office Management, nettoyage, maintenance règlementaire, machine à café, ... fm4all démocratise le Facility Management pour toutes les tailles d'entreprises. En quelques clics, validez les prestations qui vous conviennent. Cahier des charges, contrats, planification, démarrage, fm4all vous offre un service FM clé en main.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${didact.className} antialiased scroll-smooth`}>
        <GoogleAnalytics
          GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!}
        />
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
      </body>
    </html>
  );
}
