import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { User } from "better-auth";
import { UserCheck, UserX } from "lucide-react";
import { useTranslations } from "next-intl";

import { Dispatch, SetStateAction } from "react";

type UserButtonProps = {
  setIsMobileNavOpen: Dispatch<SetStateAction<boolean>>;
};

const UserButton = ({ setIsMobileNavOpen }: UserButtonProps) => {
  const t = useTranslations("header");
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as User & {
    role: string;
    fournisseurId?: number;
    clientId?: number;
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button
          title={t("connexion")}
          variant="outline"
          className={`hidden min-[500px]:flex justify-center items-center rounded-full ${!user?.image ? "p-2" : ""}`}
          size="icon"
          asChild
        >
          {user ? (
            user.image ? (
              <img
                src={user.image}
                alt="avatar-utilisateur"
                width={32}
                height={32}
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
        {user && user?.role && (
          <DropdownMenuItem asChild onClick={() => setIsMobileNavOpen(false)}>
            <Link
              href={
                user?.role === "admin"
                  ? "/admin/dashboard"
                  : user?.role === "client"
                    ? "/client/dashboard"
                    : "/fournisseur/dashboard"
              }
              className="cursor-default"
            >
              Mon espace
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild onClick={() => setIsMobileNavOpen(false)}>
          {user ? (
            <p onClick={handleSignOut}>Déconnexion</p>
          ) : (
            <Link href="/auth/signin" className="cursor-default">
              Connexion
            </Link>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
