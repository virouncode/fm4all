import BackgroundServer from "@/components/backgrounds/BackgroundServer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { entrepriseInvitations } from "@/db/schema/entreprises";
import { entreprises } from "@/db/schema/entreprises";
import { Link } from "@/i18n/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";
import InscriptionAdminForm from "./InscriptionAdminForm";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function InscriptionAdminPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorCard message="Lien d'invitation manquant ou invalide." />;
  }

  const [invitation] = await db
    .select({
      email: entrepriseInvitations.email,
      entrepriseId: entrepriseInvitations.entrepriseId,
      entrepriseNom: entreprises.nom,
    })
    .from(entrepriseInvitations)
    .innerJoin(
      entreprises,
      eq(entreprises.id, entrepriseInvitations.entrepriseId),
    )
    .where(
      and(
        eq(entrepriseInvitations.token, token),
        isNull(entrepriseInvitations.acceptedAt),
        gt(entrepriseInvitations.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!invitation) {
    return (
      <ErrorCard message="Ce lien d'invitation est invalide ou a expiré. Contactez votre administrateur FM4ALL." />
    );
  }

  return (
    <main className="mx-auto h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
      <section className="flex h-full items-center justify-center">
        <BackgroundServer />
        <Card className="z-10 w-sm">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Créer votre compte
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Vous rejoignez{" "}
              <strong>{invitation.entrepriseNom}</strong> en tant
              qu&apos;administrateur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InscriptionAdminForm
              token={token}
              email={invitation.email}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <main className="mx-auto h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
      <section className="flex h-full items-center justify-center">
        <BackgroundServer />
        <Card className="z-10 w-sm">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Invitation invalide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-center text-sm">{message}</p>
              <div className="flex justify-center">
                <Link href="/auth/login" className="text-center underline">
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
