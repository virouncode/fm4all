"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";

type UnauthorizedCardProps = {
  type: string | null;
};

const UnauthorizedCard = ({ type }: UnauthorizedCardProps) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/login");
            toast.success("Déconnexion réussie", {
              description: "Vous avez été déconnecté avec succès.",
            });
          },
        },
      });
    } catch {
      // Déconnexion silencieuse
    }
  };

  return (
    <Card className="z-20 w-sm">
      <CardHeader>
        <CardTitle className="text-lg text-red-600 md:text-xl">
          Page non autorisée
        </CardTitle>
        <CardDescription className="text-base">
          Vous n&apos;avez pas les droits d&apos;accès à cette page. Veuillez
          vous connecter avec le bon compte{" "}
          {type ? <strong>{type}</strong> : null}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p
          className="cursor-pointer text-center underline"
          onClick={handleSignOut}
        >
          Me déconnecter
        </p>
      </CardContent>
    </Card>
  );
};

export default UnauthorizedCard;
