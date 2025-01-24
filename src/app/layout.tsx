import Header from "@/components/header";
import type { Metadata } from "next";
import { Didact_Gothic } from "next/font/google";

import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import CafeProvider from "@/context/CafeProvider";
import ClientProvider from "@/context/ClientProvider";
import DevisProgressProvider from "@/context/DevisProgressProvider";
import FoodBeverageProvider from "@/context/FoodBeverageProvider";
import HygieneProvider from "@/context/HygieneProvider";
import IncendieProvider from "@/context/IncendieProvider";
import MaintenanceProvider from "@/context/MaintenanceProvider";
import ManagementProvider from "@/context/ManagementProvider";
import NettoyageProvider from "@/context/NettoyageProvider";
import OfficeManagerProvider from "@/context/OfficeManagerProvider";
import ServicesFm4AllProvider from "@/context/ServicesFm4AllProvider";
import ServicesProvider from "@/context/ServicesProvider";
import SnacksFruitsProvider from "@/context/SnacksFruitsProvider";
import TheProvider from "@/context/TheProvider";
import TotalCafeProvider from "@/context/TotalCafeProvider";
import TotalHygieneProvider from "@/context/TotalHygieneProvider";
import TotalIncendieProvider from "@/context/TotalIncendieProvider";
import TotalMaintenanceProvider from "@/context/TotalMaintenanceProvider";
import TotalNettoyageProvider from "@/context/TotalNettoyageProvider";
import TotalOfficeManagerProvider from "@/context/TotalOfficeManagerProvider";
import TotalServicesFm4AllProvider from "@/context/TotalServicesFm4AllProvider";
import TotalSnacksFruitsProvider from "@/context/TotalSnacksFruitsProvider";
import TotalTheProvider from "@/context/TotalTheProvider";
import { ThemeProvider } from "next-themes";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

const didact = Didact_Gothic({
  variable: "--font-didact-sans",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

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
        <DevisProgressProvider>
          <ClientProvider>
            <ServicesProvider>
              <NettoyageProvider>
                <HygieneProvider>
                  <IncendieProvider>
                    <MaintenanceProvider>
                      <FoodBeverageProvider>
                        <CafeProvider>
                          <TheProvider>
                            <SnacksFruitsProvider>
                              <ManagementProvider>
                                <OfficeManagerProvider>
                                  <ServicesFm4AllProvider>
                                    <TotalNettoyageProvider>
                                      <TotalHygieneProvider>
                                        <TotalIncendieProvider>
                                          <TotalMaintenanceProvider>
                                            <TotalCafeProvider>
                                              <TotalTheProvider>
                                                <TotalSnacksFruitsProvider>
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
                                                        <Footer />
                                                        <Toaster />
                                                      </ThemeProvider>
                                                    </TotalServicesFm4AllProvider>
                                                  </TotalOfficeManagerProvider>
                                                </TotalSnacksFruitsProvider>
                                              </TotalTheProvider>
                                            </TotalCafeProvider>
                                          </TotalMaintenanceProvider>
                                        </TotalIncendieProvider>
                                      </TotalHygieneProvider>
                                    </TotalNettoyageProvider>
                                  </ServicesFm4AllProvider>
                                </OfficeManagerProvider>
                              </ManagementProvider>
                            </SnacksFruitsProvider>
                          </TheProvider>
                        </CafeProvider>
                      </FoodBeverageProvider>
                    </MaintenanceProvider>
                  </IncendieProvider>
                </HygieneProvider>
              </NettoyageProvider>
            </ServicesProvider>
          </ClientProvider>
        </DevisProgressProvider>
      </body>
    </html>
  );
}
