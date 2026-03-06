import { db } from "@/db";
import { userPrestataireAdhesions } from "@/db/schema/users";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import { and, eq } from "drizzle-orm";
import { MapPin } from "lucide-react";
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
      <div className="mb-6 flex items-center gap-2">
        <MapPin className="text-primary size-6" />
        <h1 className="text-2xl font-bold">Sites clients</h1>
      </div>
      <MesSitesClientsClient />
    </div>
  );
}
