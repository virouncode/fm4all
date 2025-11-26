const page = async ({ params }: { params: Promise<{ clientId: number }> }) => {
  // const { clientId } = await params;
  // const session = await getSession();
  // const locale = await getLocale();
  // if (session?.user.clientId !== clientId) {
  //   redirect({ locale, href: "/auth/unauthorized" });
  // }

  return <div>Dashboard</div>;
};

export default page;
