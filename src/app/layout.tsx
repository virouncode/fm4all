import Header from "@/components/header";
import type { Metadata } from "next";
import { Didact_Gothic } from "next/font/google";

import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import ClientProvider from "@/context/ClientProvider";
import DevisProgressProvider from "@/context/DevisProgressProvider";
import HygieneProvider from "@/context/HygieneProvider";
import IncendieProvider from "@/context/IncendieProvider";
import MaintenanceProvider from "@/context/MaintenanceProvider";
import NettoyageProvider from "@/context/NettoyageProvider";
import ServicesProvider from "@/context/ServicesProvider";
import TotalHygieneProvider from "@/context/TotalHygieneProvider";
import TotalIncendieProvider from "@/context/TotalIncendieProvider";
import TotalMaintenanceProvider from "@/context/TotalMaintenanceProvider";
import TotalNettoyageProvider from "@/context/TotalNettoyageProvider";
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
                      <TotalNettoyageProvider>
                        <TotalHygieneProvider>
                          <TotalIncendieProvider>
                            <TotalMaintenanceProvider>
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
                            </TotalMaintenanceProvider>
                          </TotalIncendieProvider>
                        </TotalHygieneProvider>
                      </TotalNettoyageProvider>
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
