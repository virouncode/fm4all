import CacheInvalidationListener from "@/components/cache/CacheInvalidationListener";
import { SidebarProvider } from "@/components/ui/sidebar";
import { notFound } from "next/navigation";
import SidebarFournisseur from "../SidebarFournisseur";

const FournisseurLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ fournisseurId: string }>;
}>) => {
  const { fournisseurId } = await params;
  if (!fournisseurId) {
    return notFound();
  }

  return (
    <>
      {/* <HeaderFournisseur /> */}
      <SidebarProvider>
        <SidebarFournisseur fournisseurId={parseInt(fournisseurId)} />
        <CacheInvalidationListener />
        {children}
      </SidebarProvider>
    </>
  );
};

export default FournisseurLayout;
