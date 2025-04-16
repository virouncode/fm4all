import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { User } from "better-auth";
import { UserCheck, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { Dispatch, SetStateAction } from "react";

type UserButtonProps = {
  setIsMobileNavOpen: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

const UserButton = ({ setIsMobileNavOpen, className }: UserButtonProps) => {
  const t = useTranslations("auth");

  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as User & {
    role: string;
    fournisseurId?: number;
    clientId?: number;
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
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
  };
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className={`cursor-pointer`}>
        <Button
          title={t("connexion")}
          variant="outline"
          className={`flex justify-center items-center rounded-full ${!user?.image ? "p-2" : ""} ${className}`}
          size="icon"
          asChild
        >
          {session ? (
            user.image ? (
              <Image
                src={user.image}
                alt="avatar-utilisateur"
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <UserCheck />
            )
          ) : (
            <UserX />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {session && user?.role && (
          <DropdownMenuItem asChild onClick={() => setIsMobileNavOpen(false)}>
            <Link
              href={
                user?.role === "admin"
                  ? "/admin/dashboard"
                  : user?.role === "client"
                    ? "/client/dashboard"
                    : "/fournisseur/dashboard"
              }
              className="cursor-default !text-lg md:text-base"
            >
              {t("mon-espace")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild onClick={() => setIsMobileNavOpen(false)}>
          {session ? (
            <p onClick={handleSignOut}>{t("deconnexion")}</p>
          ) : (
            <Link
              href="/auth/signin"
              className="cursor-default !text-lg md:text-base"
            >
              {t("connexion")}
            </Link>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
