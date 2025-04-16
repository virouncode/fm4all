import HeaderAdmin from "@/components/header-admin";

const AdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <HeaderAdmin />
      {children}
    </>
  );
};

export default AdminLayout;
