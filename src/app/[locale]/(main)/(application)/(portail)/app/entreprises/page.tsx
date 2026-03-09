import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { Building2 } from "lucide-react";
import { Suspense } from "react";
import { EntreprisesTable } from "./EntreprisesTable";

type SearchParamsType = {
  search?: string;
  role?: string;
  orderBy?: string;
  orderDir?: string;
};

type EntreprisesPageProps = {
  searchParams: Promise<SearchParamsType>;
};

export default async function EntreprisesPage({
  searchParams,
}: EntreprisesPageProps) {
  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }

  const currentUser = session!.user;
  const platformRole = await getUserPlateformeAdhesion(currentUser.id);
  if (!platformRole?.role) {
    redirect({ href: "/auth/unauthorized", locale: "fr" });
  }

  const params = await searchParams;

  return (
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <div className="mb-6 flex flex-shrink-0 items-center gap-2">
        <Building2 className="text-primary size-6" />
        <h1 className="flex-shrink-0 text-2xl font-bold">Entreprises</h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<div>Chargement...</div>}>
          <EntreprisesTable searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
