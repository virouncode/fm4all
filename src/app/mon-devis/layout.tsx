import CompanyInfoProvider from "@/context/CompanyInfoProvider";
import HygieneProvider from "@/context/HygieneProvider";
import NettoyageProvider from "@/context/NettoyageProvider";
import ServicesProvider from "@/context/ServicesProvider";
import TotalHygieneProvider from "@/context/TotalHygieneProvider";
import TotalNettoyageProvider from "@/context/TotalNettoyageProvider";
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
            <HygieneProvider>
              <TotalNettoyageProvider>
                <TotalHygieneProvider>
                  {children}
                  <Total />
                </TotalHygieneProvider>
              </TotalNettoyageProvider>
            </HygieneProvider>
          </NettoyageProvider>
        </ServicesProvider>
      </CompanyInfoProvider>
    </>
  );
}
