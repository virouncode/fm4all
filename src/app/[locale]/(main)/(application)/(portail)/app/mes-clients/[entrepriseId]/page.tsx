import { redirect } from "@/i18n/navigation";
import { getSession } from "@/server/auth/get-session";
import {
  getClientAvecDetailsById,
} from "@/server/queries/clientServiceExecutions.query";
import {
  getRelationContactsByRelationId,
} from "@/server/queries/entreprises.query";
import { s3, S3_BUCKET } from "@/server/s3/s3";
import {
  userPrestataireAdhesions,
} from "@/db/schema/users";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { notFound } from "next/navigation";
import { ClientDetailClient } from "./ClientDetailClient";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ entrepriseId: string }>;
}) {
  const resolvedParams = await params;
  const { entrepriseId: clientEntrepriseId } = resolvedParams;

  // 1. Auth
  const session = await getSession();
  if (!session || !session.user) {
    redirect({ href: "/auth/login", locale: "fr" });
  }
  const currentUser = session!.user;

  // 2. Guard: posture prestataire uniquement
  const prestataireAdhesion = await db.query.userPrestataireAdhesions.findFirst(
    {
      where: and(
        eq(userPrestataireAdhesions.userId, currentUser.id),
        eq(userPrestataireAdhesions.statut, "actif"),
      ),
    },
  );
  if (!prestataireAdhesion) {
    redirect({ href: "/auth/unauthorized", locale: "fr" });
  }

  const prestataireEntrepriseId = prestataireAdhesion!.entrepriseId;

  // 3. Récupérer les détails du client
  const client = await getClientAvecDetailsById(
    prestataireEntrepriseId,
    clientEntrepriseId,
  );
  if (!client) {
    notFound();
  }

  // 4. Récupérer les contacts de la relation (side = "client")
  const relationId = client.relationId;
  const initialContacts = relationId
    ? (await getRelationContactsByRelationId(relationId)).filter(
        (c) => c.side === "client",
      )
    : [];

  // 5. Logo présigné
  let logoUrl: string | null = null;
  if (client.logoStorageKey) {
    const readExpiresIn = Number(
      process.env.S3_PRESIGN_READ_EXPIRES_SECONDS ?? 60,
    );
    logoUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: S3_BUCKET!,
        Key: client.logoStorageKey,
        ResponseContentDisposition: "inline",
      }),
      { expiresIn: readExpiresIn },
    );
  }

  if (!relationId) {
    // Client sans relation explicite — page basique sans contacts
    return (
      <ClientDetailClient
        client={client}
        relationId=""
        initialContacts={[]}
        logoUrl={logoUrl}
      />
    );
  }

  return (
    <ClientDetailClient
      client={client}
      relationId={relationId}
      initialContacts={initialContacts}
      logoUrl={logoUrl}
    />
  );
}
