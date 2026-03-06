"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { useLocale, useTranslations } from "next-intl";

type UnauthorizedCardProps = {
  type: string | null;
};

const UnauthorizedCard = ({ type }: UnauthorizedCardProps) => {
  const locale = useLocale();
  const t = useTranslations("auth");
  const router = useRouter();
  const {
    data: session, //refetch the session
  } = authClient.useSession();

  const handleSignOut = async () => {
    if (!session) router.push("/auth/login");
    else {
      try {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/auth/login");
              toast({
                title: t("deconnexion-reussie"),
                description: t("vous-avez-ete-deconnecte-avec-succes"),
                variant: "default",
              });
            },
          },
        });
      } catch (err) {
        console.error("Erreur lors de la deconnexion:", err);
      }
    }
  };
  return (
    <Card className="z-20 w-sm">
      <CardHeader>
        <CardTitle className="text-lg text-red-600 md:text-xl">
          {locale === "fr" ? "Page non autorisée !" : "Unauthorized Page!"}
        </CardTitle>
        <CardDescription className="text-base">
          {locale === "fr" ? (
            <span>
              Vous n&apos;avez pas les droits d&apos;accès à cette page .
              Veuillez vous connecter avec le bon compte{" "}
              <strong>{type ?? ""}</strong>
            </span>
          ) : (
            <span>
              You do not have access rights to this page. Please sign in with
              the correct <strong>{type ?? ""}</strong> account
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p
          className="cursor-pointer text-center underline"
          onClick={handleSignOut}
        >
          {locale === "fr" ? "Me connecter" : "Sign in"}
        </p>
      </CardContent>
    </Card>
  );
};

export default UnauthorizedCard;
