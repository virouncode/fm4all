import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { db } from "@/db";
import { userPrestataireAdhesions } from "@/db/schema/users";
import { and, eq } from "drizzle-orm";
import { MesSitesClientsClient } from "./MesSitesClientsClient";

export default async function MesSitesClientsPage() {
  const session = await getSession();
  if (!session?.user) redirect({ href: "/auth/login", locale: "fr" });

  const currentUser = session!.user;
  const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst(
    {
      where: and(
        eq(userPrestataireAdhesions.userId, currentUser.id),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    },
  );
  if (!prestataireAdhesion)
    redirect({ href: "/auth/unauthorized", locale: "fr" });

  return (
    <div className="container mx-auto px-6 py-4">
      <h1 className="mb-6 text-2xl font-bold">Mes sites clients</h1>
      <MesSitesClientsClient />
    </div>
  );
}
