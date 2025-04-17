import BackgroundServer from "@/components/BackgroundServer";
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
  }>;
};

export default async function page({ searchParams }: ResetPasswordProps) {
  const { error, token } = await searchParams;

  if (error === "invalid_token" || token === null) {
    return (
      <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto  py-4 px-6 md:px-20">
        <section className="flex items-center justify-center h-full">
          <BackgroundServer />
          <Card className="max-w-md z-10">
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

  return (
    <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto  py-4 px-6 md:px-20">
      <section className="flex items-center justify-center h-full">
        <BackgroundServer />
        <Card className="max-w-md z-10">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Réinitialisation du mot de passe
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Entrez votre nouveau mot de passe
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
