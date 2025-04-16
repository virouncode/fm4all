import HeaderClient from "@/components/header-client";

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
