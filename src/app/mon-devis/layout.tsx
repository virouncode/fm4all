import DevisBreadcrumb from "@/components/devis/DevisBreadcrumb";
import ClientProvider from "@/context/ClientProvider";
import HygieneProvider from "@/context/HygieneProvider";
import IncendieProvider from "@/context/IncendieProvider";
import MaintenanceProvider from "@/context/MaintenanceProvider";
import NettoyageProvider from "@/context/NettoyageProvider";
import ServicesProvider from "@/context/ServicesProvider";
import TotalHygieneProvider from "@/context/TotalHygieneProvider";
import TotalIncendieProvider from "@/context/TotalIncendieProvider";
import TotalMaintenanceProvider from "@/context/TotalMaintenanceProvider";
import TotalNettoyageProvider from "@/context/TotalNettoyageProvider";

export default function MonDevisLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
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
                          <main className="max-w-7xl mx-auto pt-4 px-6  pb-10 md:px-20 h-[calc(100vh-4rem)] flex flex-col gap-4">
                            <DevisBreadcrumb />
                            {children}
                          </main>
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
    </>
  );
}
