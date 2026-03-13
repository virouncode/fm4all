import BackgroundServer from "@/components/backgrounds/BackgroundServer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import {
  contactsInvitations,
  entrepriseContacts,
  entreprises,
} from "@/db/schema/entreprises";
import { Link } from "@/i18n/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";
import InscriptionContactForm from "./InscriptionContactForm";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function InscriptionPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorCard message="Lien d'invitation manquant ou invalide." />;
  }

  const [invitation] = await db
    .select({
      email: contactsInvitations.email,
      entrepriseNom: entreprises.nom,
      contactPrenom: entrepriseContacts.prenom,
      contactNom: entrepriseContacts.nom,
      contactPhone: entrepriseContacts.phone,
      contactFonction: entrepriseContacts.fonction,
    })
    .from(contactsInvitations)
    .innerJoin(
      entreprises,
      eq(entreprises.id, contactsInvitations.entrepriseId),
    )
    .leftJoin(
      entrepriseContacts,
      eq(entrepriseContacts.id, contactsInvitations.contactId),
    )
    .where(
      and(
        eq(contactsInvitations.token, token),
        isNull(contactsInvitations.acceptedAt),
        gt(contactsInvitations.expiresAt, new Date()),
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
              Vous rejoignez <strong>{invitation.entrepriseNom}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InscriptionContactForm
              token={token}
              email={invitation.email}
              defaultPrenom={invitation.contactPrenom ?? ""}
              defaultNom={invitation.contactNom ?? ""}
              defaultPhone={invitation.contactPhone ?? ""}
              defaultFonction={invitation.contactFonction ?? ""}
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
