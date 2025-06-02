import CacheInvalidationListener from "@/components/cache/CacheInvalidationListener";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarFournisseur from "./SidebarFournisseur";

const FournisseurLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      {/* <HeaderFournisseur /> */}
      <SidebarProvider>
        <SidebarFournisseur />
        <CacheInvalidationListener />
        {children}
      </SidebarProvider>
    </>
  );
};

export default FournisseurLayout;
