import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function TerrainNotFound() {
  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="mt-4 flex flex-col gap-6">
        <h2 className="text-center text-lg font-bold text-red-500">
          Lien invalide ou expiré
        </h2>
        <p className="text-center text-sm text-muted-foreground">
          Ce lien terrain n&apos;existe pas, a expiré ou a été révoqué.
        </p>
        <Button asChild size="lg" className="w-full">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}
