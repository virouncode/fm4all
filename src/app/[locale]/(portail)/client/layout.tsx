import HeaderClient from "@/components/header/header-client";

const AdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <HeaderClient />
      {children}
    </>
  );
};

export default AdminLayout;
