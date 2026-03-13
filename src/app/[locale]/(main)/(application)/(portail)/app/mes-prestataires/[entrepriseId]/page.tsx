import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import {
  getPrestataireAvecDetailsById,
} from "@/server/queries/clientServiceExecutions.query";
import {
  getRelationContactsByRelationId,
} from "@/server/queries/entreprises.query";
import { s3, S3_BUCKET } from "@/server/s3/s3";
import { userClientAdhesions } from "@/db/schema/users";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { notFound } from "next/navigation";
import { PrestataireDetailClient } from "./PrestataireDetailClient";

export default async function PrestataireDetailPage({
  params,
}: {
  params: Promise<{ entrepriseId: string }>;
}) {
  const resolvedParams = await params;
  const { entrepriseId: prestataireEntrepriseId } = resolvedParams;

  // 1. Auth
  const session = await getSession();
  if (!session || !session.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }
  const currentUser = session!.user;

  // 2. Guard: posture client uniquement
  const clientAdhesion = await db.query.userClientAdhesions.findFirst({
    where: and(
      eq(userClientAdhesions.userId, currentUser.id),
      eq(userClientAdhesions.statut, "actif"),
    ),
  });
  if (!clientAdhesion) {
    redirect({ href: "/auth/unauthorized", locale: "fr" });
  }

  const clientEntrepriseId = clientAdhesion!.entrepriseId;

  // 3. Récupérer les détails du prestataire
  const prestataire = await getPrestataireAvecDetailsById(
    clientEntrepriseId,
    prestataireEntrepriseId,
  );
  if (!prestataire) {
    notFound();
  }

  // 4. Récupérer les contacts de la relation (side = "prestataire")
  const relationId = prestataire.relationId;
  const initialContacts = relationId
    ? (await getRelationContactsByRelationId(relationId)).filter(
        (c) => c.side === "prestataire",
      )
    : [];

  // 5. Logo présigné
  let logoUrl: string | null = null;
  if (prestataire.logoStorageKey) {
    const readExpiresIn = Number(
      process.env.S3_PRESIGN_READ_EXPIRES_SECONDS ?? 60,
    );
    logoUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: S3_BUCKET!,
        Key: prestataire.logoStorageKey,
        ResponseContentDisposition: "inline",
      }),
      { expiresIn: readExpiresIn },
    );
  }

  return (
    <PrestataireDetailClient
      prestataire={prestataire}
      relationId={relationId ?? ""}
      initialContacts={initialContacts}
      logoUrl={logoUrl}
    />
  );
}
