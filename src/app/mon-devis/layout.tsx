import CompanyInfoProvider from "@/context/CompanyInfoProvider";
import HygieneProvider from "@/context/HygieneProvider";
import IncendieProvider from "@/context/IncendieProvider";
import NettoyageProvider from "@/context/NettoyageProvider";
import ServicesProvider from "@/context/ServicesProvider";
import TotalHygieneProvider from "@/context/TotalHygieneProvider";
import TotalNettoyageProvider from "@/context/TotalNettoyageProvider";
import Total from "./Total";
import TotalIncendieProvider from "@/context/TotalIncendieProvider";

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
              <IncendieProvider>
                <TotalNettoyageProvider>
                  <TotalHygieneProvider>
                    <TotalIncendieProvider>
                      {children}
                      <Total />
                    </TotalIncendieProvider>
                  </TotalHygieneProvider>
                </TotalNettoyageProvider>
              </IncendieProvider>
            </HygieneProvider>
          </NettoyageProvider>
        </ServicesProvider>
      </CompanyInfoProvider>
    </>
  );
}
