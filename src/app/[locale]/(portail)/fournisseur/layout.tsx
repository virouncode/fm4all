import HeaderFournisseur from "@/components/header/header-fournisseur";

const AdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <HeaderFournisseur />
      {children}
    </>
  );
};

export default AdminLayout;
