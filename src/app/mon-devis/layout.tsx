import CompanyInfoProvider from "@/context/CompanyInfoProvider";
import NettoyageProvider from "@/context/NettoyageProvider";
import PropreteProvider from "@/context/PropreteProvider";
import ServicesProvider from "@/context/ServicesProvider";
import TotalNettoyageProvider from "@/context/TotalNettoyageProvider";
import TotalPropreteProvider from "@/context/TotalPropreteProvider";
import Total from "./Total";

export default function MonDevisLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CompanyInfoProvider>
        <ServicesProvider>
          <NettoyageProvider>
            <PropreteProvider>
              <TotalNettoyageProvider>
                <TotalPropreteProvider>
                  {children}
                  <Total />
                </TotalPropreteProvider>
              </TotalNettoyageProvider>
            </PropreteProvider>
          </NettoyageProvider>
        </ServicesProvider>
      </CompanyInfoProvider>
    </>
  );
}
