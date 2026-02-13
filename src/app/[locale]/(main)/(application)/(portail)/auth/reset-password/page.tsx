import BackgroundServer from "@/components/backgrounds/BackgroundServer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import ResetPasswordForm from "./ResetPasswordForm";

type ResetPasswordProps = {
  searchParams: Promise<{
    error: string | null;
    token: string | null;
    type: "activation" | "reset" | null; // ✅ Nouveau paramètre
  }>;
};

export default async function page({ searchParams }: ResetPasswordProps) {
  const { error, token, type } = await searchParams;

  if (error === "invalid_token" || token === null) {
    return (
      <main className="mx-auto h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
        <section className="flex h-full items-center justify-center">
          <BackgroundServer />
          <Card className="z-10 w-sm">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Lien de réinitialisation invalide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-center">
                  Le lien de réinitialisation de mot de passe est invalide ou a
                  expiré.
                </p>
                <div className="flex justify-center">
                  <Link
                    href="/auth/forgot-password"
                    className="text-center underline"
                  >
                    Veuillez réessayer
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  // Déterminer le titre et la description selon le type
  const isActivation = type === "activation";
  const title = isActivation
    ? "Activez votre compte"
    : "Réinitialisation du mot de passe";
  const description = isActivation
    ? "Définissez votre mot de passe pour activer votre compte"
    : "Entrez votre nouveau mot de passe";

  return (
    <main className="mx-auto h-[calc(100vh-4rem)] max-w-7xl px-6 py-4 md:px-20">
      <section className="flex h-full items-center justify-center">
        <BackgroundServer />
        <Card className="z-10 w-sm">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm token={token} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
