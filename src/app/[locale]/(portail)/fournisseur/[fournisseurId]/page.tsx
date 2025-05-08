import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth-session";
import { getLocale } from "next-intl/server";

const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: number }>;
}) => {
  const { fournisseurId } = await params;
  const session = await getSession();
  const locale = await getLocale();
  if (session?.user.fournisseurId !== Number(fournisseurId)) {
    redirect({ locale, href: "/auth/unauthorized" });
  }

  return <div>Dashboard</div>;
};

export default page;
