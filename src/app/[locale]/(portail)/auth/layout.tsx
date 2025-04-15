import HeaderPortal from "@/components/header-portal";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <HeaderPortal />
      {children}
    </>
  );
};

export default AuthLayout;
