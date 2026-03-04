import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import {
  getEntrepriseWithDetailsById,
  getServicesByEntrepriseId,
} from "@/server/queries/entreprises.query";
import { getUserPlateformeAdhesion } from "@/server/queries/userPlateformeAdhesions.query";
import { s3, S3_BUCKET } from "@/server/s3/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { notFound } from "next/navigation";
import { EntrepriseDetailsClient } from "./EntrepriseDetailsClient";

export default async function EntrepriseDetailsPage({
  params,
}: {
  params: Promise<{ entrepriseId: string }>;
}) {
  const resolvedParams = await params;
  const { entrepriseId } = resolvedParams;

  // 1. Auth
  const session = await getSession();
  if (!session || !session.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }

  const currentUser = session!.user;

  // 2. Vérifier rôle plateforme (page réservée posture plateforme)
  const platformRole = await getUserPlateformeAdhesion(currentUser.id);
  if (!platformRole?.role) {
    notFound();
  }

  // 3. Récupérer l'entreprise avec ses détails
  const entreprise = await getEntrepriseWithDetailsById(entrepriseId);
  if (!entreprise) {
    notFound();
  }

  // 4. Charger les services si prestataire
  const services = entreprise.roles.includes("prestataire")
    ? await getServicesByEntrepriseId(entrepriseId)
    : [];

  // 5. Générer l'URL présignée du logo pour le rendu initial (detail page)
  let logoUrl: string | null = null;
  const logoStorageKey = entreprise.logoStorageKey;

  if (logoStorageKey) {
    const readExpiresIn = Number(
      process.env.S3_PRESIGN_READ_EXPIRES_SECONDS ?? 60,
    );
    logoUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: S3_BUCKET!,
        Key: logoStorageKey,
        ResponseContentDisposition: "inline",
      }),
      { expiresIn: readExpiresIn },
    );
  }

  return (
    <EntrepriseDetailsClient
      entreprise={entreprise}
      services={services}
      logoUrl={logoUrl}
      logoStorageKey={logoStorageKey}
    />
  );
}
