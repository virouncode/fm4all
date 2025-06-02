import CacheInvalidationListener from "@/components/cache/CacheInvalidationListener";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarFournisseur from "../SidebarFournisseur";

const FournisseurLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ fournisseurId: string }>;
}>) => {
  const { fournisseurId } = await params;
  console.log("Fournisseur ID from params:", fournisseurId);

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
