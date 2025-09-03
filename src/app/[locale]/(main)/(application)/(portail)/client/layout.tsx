import HeaderClient from "@/components/header/header-client";

const ClientLayout = ({
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

export default ClientLayout;
