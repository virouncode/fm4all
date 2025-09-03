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
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function ApplicationLayout({
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
  setRequestLocale(locale);

  return (
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
                                                              {children}
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
  );
}
