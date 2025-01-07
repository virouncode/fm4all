import CompanyInfoProvider from "@/context/CompanyInfoProvider";
import NettoyageProvider from "@/context/NettoyageProvider";
import PropreteProvider from "@/context/PropreteProvider";
import ServicesProvider from "@/context/ServicesProvider";
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
              {children}
              <Total />
            </PropreteProvider>
          </NettoyageProvider>
        </ServicesProvider>
      </CompanyInfoProvider>
    </>
  );
}
