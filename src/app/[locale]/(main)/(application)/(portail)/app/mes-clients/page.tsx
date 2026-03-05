import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { db } from "@/db";
import { userPrestataireAdhesions } from "@/db/schema/users";
import { and, eq } from "drizzle-orm";
import { MesClientsClient } from "./MesClientsClient";

export default async function MesClientsPage() {
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
    <div className="container mx-auto flex h-full flex-col px-6 py-4">
      <h1 className="mb-6 flex-shrink-0 text-2xl font-bold">Mes clients</h1>
      <div className="flex-1 overflow-hidden">
        <MesClientsClient />
      </div>
    </div>
  );
}
