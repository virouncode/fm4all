import HeaderAuth from "@/components/header-auth";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <HeaderAuth />
      {children}
    </>
  );
};

export default AuthLayout;
