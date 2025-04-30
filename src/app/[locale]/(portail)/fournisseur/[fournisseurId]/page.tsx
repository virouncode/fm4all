import BackButton from "@/components/buttons/back-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth-session";

const page = async ({
  params,
}: {
  params: Promise<{ fournisseurId: number }>;
}) => {
  const { fournisseurId } = await params;
  const session = await getSession();
  if (session?.user.fournisseurId !== Number(fournisseurId)) {
    return (
      <main className="max-w-7xl h-[calc(100vh-4rem)] mx-auto mb-24 py-4 px-6 md:px-20">
        <section className="flex h-full items-center justify-center">
          <Card className="max-w-md z-20">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl text-red-600">
                Page non autorisée !
              </CardTitle>
              <CardDescription className="text-xs md:text-sm"></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <p>
                  Vous n&apos;êtes pas autorisé à accéder à la page de ce
                  fournisseur.
                </p>
                <BackButton size="lg" title="Retour" />
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  return <div>Dashboard</div>;
};

export default page;
