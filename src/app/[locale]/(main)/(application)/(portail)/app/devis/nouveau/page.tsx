import { redirect } from "@/i18n/navigation";
import { db } from "@/db";
import { entrepriseRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/server/auth/get-session";
import { getEntrepriseWithDetailsById } from "@/server/queries/entreprises.query";
import { getUserPrestataireAdhesion } from "@/server/queries/userAdhesions.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { getAllServices, getServicesByPrestataire } from "@/server/queries/services.query";
import { cookies } from "next/headers";
import { DevisNouveauClient } from "./DevisNouveauClient";

export default async function DevisNouveauPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }

  const currentUser = session!.user;

  const cookieStore = await cookies();
  const posture = cookieStore.get("fm4all:postureActive")?.value;

  // Cette page est réservée aux prestataires et à la plateforme
  if (posture !== "prestataire" && posture !== "plateforme") {
    redirect({ href: "/auth/unauthorized", locale: "fr" });
  }

  let emetteurId: string | null = null;

  if (posture === "prestataire") {
    const prestataireAdhesion = await getUserPrestataireAdhesion({
      userId: currentUser.id,
    });
    if (!prestataireAdhesion) {
      redirect({ href: "/auth/unauthorized", locale: "fr" });
    }
    emetteurId = prestataireAdhesion!.entrepriseId;
  } else {
    // plateforme — l'émetteur est toujours FM4ALL
    const plateformeRole = await getUserPlateformeAdhesion(currentUser.id);
    if (!plateformeRole?.role) {
      redirect({ href: "/auth/unauthorized", locale: "fr" });
    }
    const [platformEntrepriseRole] = await db
      .select({ entrepriseId: entrepriseRoles.entrepriseId })
      .from(entrepriseRoles)
      .where(eq(entrepriseRoles.role, "plateforme"))
      .limit(1);
    if (platformEntrepriseRole) {
      emetteurId = platformEntrepriseRole.entrepriseId;
    }
  }

  if (!emetteurId) {
    redirect({ href: "/auth/unauthorized", locale: "fr" });
  }

  const entreprise = await getEntrepriseWithDetailsById(emetteurId!);
  if (!entreprise) {
    redirect({ href: "/auth/unauthorized", locale: "fr" });
  }

  const emetteur = {
    id: entreprise!.id,
    nom: entreprise!.nom,
    siret: entreprise!.siret,
    numeroTva: entreprise!.numeroTva ?? null,
    logoStorageKey: entreprise!.logoStorageKey ?? null,
  };

  const services =
    posture === "prestataire"
      ? await getServicesByPrestataire(emetteurId!)
      : await getAllServices();

  return (
    <DevisNouveauClient
      emetteur={emetteur}
      services={services.map((s) => ({ id: s.id, nom: s.nom }))}
      posture={posture as "prestataire" | "plateforme"}
    />
  );
}
