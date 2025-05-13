import CacheInvalidationListener from "@/components/cache/CacheInvalidationListener";
import HeaderFournisseur from "@/components/header/header-fournisseur";

const FournisseurLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <HeaderFournisseur />
      <CacheInvalidationListener />
      {children}
    </>
  );
};

export default FournisseurLayout;
